import { produce } from "immer";
import type { ApplyContext, Event, PlayerId } from "@bbge/core";
import { buildDeck, type Card } from "./cards";
import { bestHandScore, compareScores } from "./handEval";
import { buildPots } from "./pots";
import type {
  HoldemAction,
  HoldemConfig,
  HoldemPlayer,
  HoldemState,
  Street,
} from "./state";

function normalizeStakes(cfg: HoldemConfig): {
  smallBlind: number;
  bigBlind: number;
  startingStack: number;
} {
  const sb = Math.max(1, Math.floor(cfg.smallBlind ?? 1));
  let bb = Math.max(sb * 2, Math.floor(cfg.bigBlind ?? sb * 2));
  if (bb < sb * 2) bb = sb * 2;
  let stack = Math.floor(cfg.startingStack ?? bb * 100);
  const minStack = bb * 20;
  if (stack < minStack) stack = minStack;
  if (stack > 100_000) stack = 100_000;
  return { smallBlind: sb, bigBlind: bb, startingStack: stack };
}

function alive(p: HoldemPlayer): boolean {
  return !p.folded;
}

function canAct(p: HoldemPlayer): boolean {
  return !p.folded && !p.allIn && p.stack > 0;
}

function activePlayers(state: HoldemState): HoldemPlayer[] {
  return state.players.filter(alive);
}

function nextIndex(state: HoldemState, from: number): number {
  const n = state.players.length;
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n;
    if (canAct(state.players[idx]!)) return idx;
  }
  return from;
}

function firstToActPreflop(state: HoldemState): number {
  const n = state.players.length;
  if (n === 2) {
    // HU: BTN/SB acts first preflop
    return state.buttonIndex;
  }
  // UTG = left of BB
  const bbIdx = (state.buttonIndex + 2) % n;
  return nextIndex(state, bbIdx);
}

function firstToActPostflop(state: HoldemState): number {
  // Left of button
  return nextIndex(state, state.buttonIndex);
}

function commit(
  p: HoldemPlayer,
  amount: number,
): number {
  const pay = Math.min(amount, p.stack);
  p.stack -= pay;
  p.streetBet += pay;
  p.handBet += pay;
  if (p.stack === 0) p.allIn = true;
  return pay;
}

function bettingClosed(state: HoldemState): boolean {
  const contenders = state.players.filter((p) => !p.folded);
  if (contenders.length <= 1) return true;
  const actors = contenders.filter((p) => !p.allIn);
  if (actors.length === 0) return true;
  for (const p of actors) {
    if (p.streetBet < state.currentBet) return false;
    if (!p.acted) return false;
  }
  return true;
}

function resetStreetBets(state: HoldemState): void {
  for (const p of state.players) {
    p.streetBet = 0;
    p.acted = false;
  }
  state.currentBet = 0;
  state.minRaiseTo = state.bigBlind;
}

function dealBoard(state: HoldemState, count: number, events: Event[]): void {
  if (state.deck.length > 0) {
    state.burns.push(state.deck.shift()!);
  }
  const dealt: Card[] = [];
  for (let i = 0; i < count; i++) {
    const c = state.deck.shift();
    if (c) {
      state.board.push(c);
      dealt.push(c);
    }
  }
  events.push({
    type: "holdem/boardDealt",
    payload: {
      street: state.street,
      cards: dealt.map((c) => ({ id: c.id, rank: c.rank, suit: c.suit })),
    },
  });
}

function advanceStreet(state: HoldemState, events: Event[]): void {
  const order: Street[] = ["preflop", "flop", "turn", "river"];
  const idx = order.indexOf(state.street);
  if (idx < 0 || idx >= order.length - 1) {
    showdown(state, events);
    return;
  }
  state.street = order[idx + 1]!;
  resetStreetBets(state);
  if (state.street === "flop") dealBoard(state, 3, events);
  else dealBoard(state, 1, events);

  const actors = state.players.filter(canAct);
  if (actors.length <= 1) {
    // Run out board if needed then showdown
    while (state.street !== "river") {
      const ni = order.indexOf(state.street);
      state.street = order[ni + 1]!;
      if (state.street === "flop") dealBoard(state, 3, events);
      else dealBoard(state, 1, events);
    }
    showdown(state, events);
    return;
  }
  state.toActIndex = firstToActPostflop(state);
  events.push({
    type: "holdem/street",
    payload: { street: state.street, toAct: state.players[state.toActIndex]!.id },
  });
}

function clearStreetCommitments(state: HoldemState): void {
  for (const p of state.players) {
    p.streetBet = 0;
    p.handBet = 0;
    p.acted = false;
  }
}

function awardFoldWin(state: HoldemState, events: Event[]): void {
  const winner = activePlayers(state)[0]!;
  const pot = state.players.reduce((s, p) => s + p.handBet, 0);
  winner.stack += pot;
  clearStreetCommitments(state);
  state.phase = "finished";
  state.winners = [winner.id];
  state.pots = [{ amount: pot, eligible: [winner.id] }];
  events.push({
    type: "holdem/handEnded",
    payload: {
      reason: "fold",
      winners: [winner.id],
      pot,
    },
  });
}

function showdown(state: HoldemState, events: Event[]): void {
  // Finish board to 5 if short
  while (state.board.length < 5 && state.deck.length > 0) {
    if (state.board.length === 0) {
      state.street = "flop";
      dealBoard(state, 3, events);
    } else {
      state.street = state.board.length === 3 ? "turn" : "river";
      dealBoard(state, 1, events);
    }
  }

  const contrib: Record<string, number> = {};
  const folded = new Set<string>();
  for (const p of state.players) {
    contrib[p.id] = p.handBet;
    if (p.folded) folded.add(p.id);
  }
  const pots = buildPots(contrib, folded);
  state.pots = pots;

  const show: NonNullable<HoldemState["showdown"]> = [];
  const winners = new Set<PlayerId>();

  for (const pot of pots) {
    let bestScore: number[] | null = null;
    const potWinners: PlayerId[] = [];
    for (const id of pot.eligible) {
      const p = state.players.find((x) => x.id === id)!;
      if (p.folded) continue;
      const { score } = bestHandScore([...p.hole, ...state.board]);
      if (!show.some((s) => s.playerId === id)) {
        show.push({ playerId: id, score, hole: p.hole.slice() });
      }
      if (bestScore === null || compareScores(score, bestScore) > 0) {
        bestScore = score;
        potWinners.length = 0;
        potWinners.push(id);
      } else if (compareScores(score, bestScore) === 0) {
        potWinners.push(id);
      }
    }
    const share = Math.floor(pot.amount / potWinners.length);
    let rem = pot.amount - share * potWinners.length;
    for (const id of potWinners) {
      const p = state.players.find((x) => x.id === id)!;
      p.stack += share + (rem > 0 ? 1 : 0);
      if (rem > 0) rem -= 1;
      winners.add(id);
    }
  }

  state.showdown = show;
  clearStreetCommitments(state);
  state.phase = "finished";
  state.winners = [...winners];
  events.push({
    type: "holdem/handEnded",
    payload: {
      reason: "showdown",
      winners: state.winners,
      pots,
      showdown: show.map((s) => ({
        playerId: s.playerId,
        score: s.score,
      })),
    },
  });
}

function afterAction(state: HoldemState, events: Event[]): void {
  if (activePlayers(state).length <= 1) {
    awardFoldWin(state, events);
    return;
  }
  if (!bettingClosed(state)) {
    state.toActIndex = nextIndex(state, state.toActIndex);
    return;
  }
  // Street complete
  if (state.street === "river") {
    showdown(state, events);
  } else {
    advanceStreet(state, events);
  }
}

function nextFundedIndex(state: HoldemState, from: number): number {
  const n = state.players.length;
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n;
    if (state.players[idx]!.stack > 0) return idx;
  }
  return from;
}

/** Deal holes, post blinds, set toAct — shared by create + next hand. Deck must already be shuffled. */
function dealAndPostBlinds(state: HoldemState): void {
  const n = state.players.length;
  const funded = state.players.filter((p) => p.stack > 0);
  if (funded.length < 2) {
    state.phase = "finished";
    return;
  }

  for (const p of state.players) {
    p.hole = [];
    p.folded = p.stack <= 0;
    p.allIn = false;
    p.streetBet = 0;
    p.handBet = 0;
    p.acted = false;
  }

  state.board = [];
  state.burns = [];
  state.pots = [];
  state.winners = [];
  state.showdown = undefined;
  state.lastAction = undefined;
  state.street = "preflop";
  state.phase = "playing";
  state.minRaiseTo = state.bigBlind;

  for (let r = 0; r < 2; r++) {
    for (let i = 1; i <= n; i++) {
      const idx = (state.buttonIndex + i) % n;
      const p = state.players[idx]!;
      if (p.stack <= 0) continue;
      const c = state.deck.shift();
      if (c) p.hole.push(c);
    }
  }

  const fundedCount = funded.length;
  const sbIdx =
    fundedCount === 2
      ? state.buttonIndex
      : nextFundedIndex(state, state.buttonIndex);
  const bbIdx = nextFundedIndex(state, sbIdx);

  commit(state.players[sbIdx]!, state.smallBlind);
  commit(state.players[bbIdx]!, state.bigBlind);
  state.currentBet = state.players[bbIdx]!.streetBet;
  state.minRaiseTo = state.currentBet + state.bigBlind;
  state.players[sbIdx]!.acted = false;
  state.players[bbIdx]!.acted = false;
  state.toActIndex = firstToActPreflop(state);
}

export function createHoldemState(
  config: HoldemConfig,
  ctx: ApplyContext,
): HoldemState {
  const ids = config.playerIds;
  if (ids.length < 2 || ids.length > 9) {
    throw new Error("Texas Hold'em supports 2–9 players");
  }
  const { smallBlind, bigBlind, startingStack } = normalizeStakes(config);
  const seed = config.seed ?? "texas-holdem";
  const deck = ctx.rng.shuffle(buildDeck());
  const buttonIndex = ctx.rng.int(0, ids.length - 1);

  const players: HoldemPlayer[] = ids.map((id) => ({
    id,
    name: config.playerNames[id] ?? id,
    stack: startingStack,
    hole: [],
    folded: false,
    allIn: false,
    streetBet: 0,
    handBet: 0,
    acted: false,
  }));

  const state: HoldemState = {
    schemaVersion: 1,
    pluginId: "texas-holdem",
    seed,
    phase: "playing",
    street: "preflop",
    smallBlind,
    bigBlind,
    startingStack,
    players,
    buttonIndex,
    deck,
    board: [],
    burns: [],
    currentBet: 0,
    minRaiseTo: bigBlind,
    toActIndex: 0,
    pots: [],
    winners: [],
    handNumber: 1,
  };

  dealAndPostBlinds(state);
  return state;
}

/**
 * Same room / seats / stacks → rotate button → new hand.
 * Keeps the cash session alive until the host dissolves the room.
 */
export function continueHoldemMatch(
  prev: HoldemState,
  ctx: ApplyContext,
): HoldemState {
  const funded = prev.players.filter((p) => p.stack > 0);
  if (funded.length < 2) {
    throw new Error("not enough players with chips for another hand");
  }
  const n = prev.players.length;
  let buttonIndex = (prev.buttonIndex + 1) % n;
  for (let i = 0; i < n; i++) {
    if (prev.players[buttonIndex]!.stack > 0) break;
    buttonIndex = (buttonIndex + 1) % n;
  }

  // Only chips (and identity) carry over — every other seat flag resets.
  const state: HoldemState = {
    schemaVersion: 1,
    pluginId: "texas-holdem",
    seed: prev.seed,
    phase: "playing",
    street: "preflop",
    smallBlind: prev.smallBlind,
    bigBlind: prev.bigBlind,
    startingStack: prev.startingStack,
    buttonIndex,
    deck: ctx.rng.shuffle(buildDeck()),
    board: [],
    burns: [],
    currentBet: 0,
    minRaiseTo: prev.bigBlind,
    toActIndex: 0,
    pots: [],
    winners: [],
    handNumber: (prev.handNumber ?? 1) + 1,
    showdown: undefined,
    lastAction: undefined,
    players: prev.players.map((p) => ({
      id: p.id,
      name: p.name,
      stack: p.stack,
      hole: [],
      folded: false,
      allIn: false,
      streetBet: 0,
      handBet: 0,
      acted: false,
    })),
  };
  dealAndPostBlinds(state);
  if (state.phase !== "playing") {
    throw new Error("not enough players with chips for another hand");
  }
  return state;
}

export function validateHoldemAction(
  state: HoldemState,
  action: HoldemAction,
): true | { error: string; code?: string } {
  if (state.phase !== "playing") return { error: "hand finished" };
  const me = state.players.find((p) => p.id === action.playerId);
  if (!me) return { error: "unknown player" };
  if (state.players[state.toActIndex]?.id !== action.playerId) {
    return { error: "not your turn" };
  }
  if (!canAct(me)) return { error: "cannot act" };

  const toCall = state.currentBet - me.streetBet;

  if (action.type === "fold") return true;
  if (action.type === "check") {
    if (toCall > 0) return { error: "cannot check facing a bet" };
    return true;
  }
  if (action.type === "call") {
    if (toCall <= 0) return { error: "nothing to call" };
    return true;
  }
  if (action.type === "raise") {
    const toAmount = action.payload.toAmount;
    if (!Number.isFinite(toAmount) || toAmount !== Math.floor(toAmount)) {
      return { error: "invalid raise amount" };
    }
    // All-in for less than min raise is allowed if putting all chips
    const maxTo = me.streetBet + me.stack;
    if (toAmount > maxTo) return { error: "not enough chips" };
    if (toAmount <= state.currentBet && toAmount < maxTo) {
      return { error: "raise must exceed current bet" };
    }
    if (toAmount < state.minRaiseTo && toAmount < maxTo) {
      return { error: `min raise to ${state.minRaiseTo}` };
    }
    return true;
  }
  return { error: "unknown action" };
}

export function applyHoldemAction(
  state: HoldemState,
  action: HoldemAction,
  _ctx: ApplyContext,
): { state: HoldemState; events: Event[] } {
  const events: Event[] = [];
  const next = produce(state, (draft) => {
    const me = draft.players.find((p) => p.id === action.playerId)!;
    const toCall = draft.currentBet - me.streetBet;

    if (action.type === "fold") {
      me.folded = true;
      me.acted = true;
      draft.lastAction = { playerId: me.id, type: "fold" };
      events.push({
        type: "holdem/fold",
        payload: { playerId: me.id },
      });
      afterAction(draft, events);
      return;
    }

    if (action.type === "check") {
      me.acted = true;
      draft.lastAction = { playerId: me.id, type: "check" };
      events.push({
        type: "holdem/check",
        payload: { playerId: me.id },
      });
      afterAction(draft, events);
      return;
    }

    if (action.type === "call") {
      const paid = commit(me, toCall);
      me.acted = true;
      const allIn = me.allIn;
      draft.lastAction = {
        playerId: me.id,
        type: allIn ? "allin" : "call",
        amount: paid,
      };
      events.push({
        type: "holdem/call",
        payload: { playerId: me.id, amount: paid, allIn },
      });
      afterAction(draft, events);
      return;
    }

    if (action.type === "raise") {
      const toAmount = action.payload.toAmount;
      const need = toAmount - me.streetBet;
      const paid = commit(me, need);
      const raiseSize = me.streetBet - draft.currentBet;
      if (me.streetBet > draft.currentBet) {
        draft.minRaiseTo = me.streetBet + Math.max(raiseSize, draft.bigBlind);
        draft.currentBet = me.streetBet;
        // Re-open action for others
        for (const p of draft.players) {
          if (p.id !== me.id && canAct(p)) p.acted = false;
        }
      }
      me.acted = true;
      const allIn = me.allIn;
      draft.lastAction = {
        playerId: me.id,
        type: allIn ? "allin" : "raise",
        amount: me.streetBet,
      };
      events.push({
        type: "holdem/raise",
        payload: {
          playerId: me.id,
          toAmount: me.streetBet,
          paid,
          allIn,
        },
      });
      afterAction(draft, events);
    }
  });

  return { state: next, events };
}

export function checkHoldemVictory(state: HoldemState) {
  if (state.phase !== "finished") return null;
  return {
    kind: "winner" as const,
    winners: state.winners,
    reason: "hand_over",
  };
}

/** Legal action helpers for UI / AI */
export function legalActions(state: HoldemState, playerId: PlayerId) {
  if (state.phase !== "playing") return [];
  if (state.players[state.toActIndex]?.id !== playerId) return [];
  const me = state.players.find((p) => p.id === playerId);
  if (!me || !canAct(me)) return [];
  const toCall = state.currentBet - me.streetBet;
  const out: { type: string; toAmount?: number; callAmount?: number }[] = [
    { type: "fold" },
  ];
  if (toCall <= 0) out.push({ type: "check" });
  else out.push({ type: "call", callAmount: Math.min(toCall, me.stack) });
  const maxTo = me.streetBet + me.stack;
  if (maxTo > state.currentBet) {
    const minTo = Math.min(state.minRaiseTo, maxTo);
    out.push({ type: "raise", toAmount: minTo });
  }
  return out;
}
