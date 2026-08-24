import { produce } from "immer";
import type { ApplyContext, Event, PlayerId, VictoryResult } from "@bbge/core";
import {
  activeFace,
  buildUnoDeck,
  canStackDraw,
  cardPoints,
  facesMatch,
  type UnoCard,
  type UnoColor,
  type UnoFace,
} from "./cards";
import { maxPlayersForUnoEdition, normalizeUnoEdition } from "./editions";
import type {
  UnoAction,
  UnoConfig,
  UnoPlayer,
  UnoState,
} from "./state";

const HAND_SIZE = 7;
const DEFAULT_TARGET = 500;
const MERCY_LIMIT = 25;

function player(state: UnoState, id: PlayerId): UnoPlayer {
  const p = state.players.find((x) => x.id === id);
  if (!p) throw new Error(`unknown player ${id}`);
  return p;
}

function alive(state: UnoState): UnoPlayer[] {
  return state.players.filter((p) => !p.eliminated);
}

function currentId(state: UnoState): PlayerId {
  return state.turnOrder[state.currentIndex]!;
}

function topDiscard(state: UnoState): UnoCard {
  return state.discard[state.discard.length - 1]!;
}

function topFace(state: UnoState): UnoFace {
  return activeFace(topDiscard(state), state.side);
}

function nextIndex(state: UnoState, from = state.currentIndex, steps = 1): number {
  const n = state.turnOrder.length;
  let i = from;
  let left = steps;
  while (left > 0) {
    i = (i + state.direction + n) % n;
    const id = state.turnOrder[i]!;
    if (!player(state, id).eliminated) left--;
  }
  return i;
}

function advanceTurn(state: UnoState, steps = 1): void {
  state.currentIndex = nextIndex(state, state.currentIndex, steps);
  state.phase = "playing";
  state.pending = null;
}

function reshuffleIfNeeded(state: UnoState, ctx: ApplyContext): void {
  if (state.deck.length > 0) return;
  if (state.discard.length <= 1 && state.mercyPile.length === 0) return;
  const top = state.discard.pop()!;
  const rest = [...state.discard, ...state.mercyPile];
  state.mercyPile = [];
  state.discard = [top];
  state.deck = ctx.rng.shuffle(rest);
}

function drawOne(state: UnoState, ctx: ApplyContext): UnoCard | null {
  reshuffleIfNeeded(state, ctx);
  return state.deck.pop() ?? null;
}

function giveCards(
  state: UnoState,
  id: PlayerId,
  count: number,
  ctx: ApplyContext,
  events: Event[],
): number {
  let got = 0;
  const p = player(state, id);
  for (let i = 0; i < count; i++) {
    const c = drawOne(state, ctx);
    if (!c) break;
    p.hand.push(c);
    got++;
  }
  if (got) {
    events.push({
      type: "cards/drawn",
      payload: { playerId: id, count: got },
    });
  }
  checkMercy(state, id, events);
  return got;
}

function checkMercy(state: UnoState, id: PlayerId, events: Event[]): void {
  if (state.edition !== "no-mercy") return;
  const p = player(state, id);
  if (p.eliminated) return;
  if (p.hand.length < MERCY_LIMIT) return;
  p.eliminated = true;
  state.mercyPile.push(...p.hand);
  p.hand = [];
  events.push({ type: "player/eliminated", payload: { playerId: id } });
  const survivors = alive(state);
  if (survivors.length === 1) {
    finishRound(state, events, "mercy", survivors[0]!.id);
  }
}

function handScore(state: UnoState, p: UnoPlayer): number {
  return p.hand.reduce(
    (s, c) => s + cardPoints(activeFace(c, state.side), state.edition),
    0,
  );
}

function finishRound(
  state: UnoState,
  events: Event[],
  reason: string,
  winnerId: PlayerId,
): void {
  const winner = player(state, winnerId);
  let gained = 0;
  for (const p of state.players) {
    if (p.id === winnerId || p.eliminated) continue;
    gained += handScore(state, p);
  }
  winner.score += gained;
  state.winners = [winnerId];
  state.phase = "finished";
  state.pending = null;
  state.matchOver = winner.score >= state.targetScore;
  events.push({
    type: "round/ended",
    payload: {
      reason,
      winnerId,
      gained,
      scores: Object.fromEntries(state.players.map((p) => [p.id, p.score])),
      matchOver: state.matchOver,
    },
  });
}

function maybeUnoVulnerable(
  state: UnoState,
  id: PlayerId,
  saidUno: boolean | undefined,
  events: Event[],
): void {
  const p = player(state, id);
  if (p.hand.length === 1) {
    if (saidUno || state.saidUno[id]) {
      state.unoVulnerableId = null;
      state.saidUno[id] = true;
      events.push({ type: "uno/called", payload: { playerId: id } });
    } else {
      state.unoVulnerableId = id;
      state.saidUno[id] = false;
    }
  } else if (p.hand.length === 0) {
    state.unoVulnerableId = null;
  } else {
    state.saidUno[id] = false;
  }
}

function isWildKind(kind: UnoFace["kind"]): boolean {
  return (
    kind === "wild" ||
    kind === "wildDraw" ||
    kind === "wildSwapHands" ||
    kind === "wildShuffleHands" ||
    kind === "wildDrawColor" ||
    kind === "wildRoulette" ||
    kind === "wildReverseDraw"
  );
}

function needsColorChoice(face: UnoFace): boolean {
  return isWildKind(face.kind);
}

function applyPlayedCard(
  state: UnoState,
  actorId: PlayerId,
  card: UnoCard,
  face: UnoFace,
  chosenColor: UnoColor | undefined,
  targetPlayerId: PlayerId | undefined,
  ctx: ApplyContext,
  events: Event[],
): void {
  state.discard.push(card);
  state.lastPlayedBy = actorId;

  if (face.color) state.currentColor = face.color;
  else if (chosenColor) state.currentColor = chosenColor;

  events.push({
    type: "card/played",
    payload: {
      playerId: actorId,
      cardId: card.id,
      face: { ...face },
      color: state.currentColor,
    },
  });

  // Empty hand → win (except pending effects that still need resolution)
  if (player(state, actorId).hand.length === 0) {
    // Last-card wilds that require targets: treat as simple wild if no target needed for win
    if (
      face.kind === "wildSwapHands" ||
      face.kind === "wildShuffleHands" ||
      (state.edition === "no-mercy" && face.kind === "number" && face.number === 7)
    ) {
      // Official: last card swap/shuffle counts as win without effect
      finishRound(state, events, "empty-hand", actorId);
      return;
    }
    finishRound(state, events, "empty-hand", actorId);
    return;
  }

  const twoPlayer = alive(state).length === 2;

  switch (face.kind) {
    case "number": {
      if (state.edition === "no-mercy" && face.number === 0) {
        // Pass all hands in direction
        const ids = state.turnOrder.filter((id) => !player(state, id).eliminated);
        const hands = ids.map((id) => player(state, id).hand);
        for (let i = 0; i < ids.length; i++) {
          const dest =
            state.direction === 1
              ? ids[(i + 1) % ids.length]!
              : ids[(i - 1 + ids.length) % ids.length]!;
          player(state, dest).hand = hands[i]!;
        }
        events.push({ type: "hands/rotated", payload: { direction: state.direction } });
        advanceTurn(state, 1);
        return;
      }
      if (state.edition === "no-mercy" && face.number === 7) {
        state.phase = "chooseTarget";
        state.pending = {
          type: "chooseTarget",
          playerId: actorId,
          cardId: card.id,
          purpose: "sevenSwap",
        };
        return;
      }
      advanceTurn(state, 1);
      return;
    }
    case "skip": {
      if (twoPlayer) {
        // Classic 2p: skip → play again (stay)
        state.phase = "playing";
        state.pending = null;
        return;
      }
      advanceTurn(state, 2);
      return;
    }
    case "skipAll": {
      // Others skip — same player acts again
      state.phase = "playing";
      state.pending = null;
      return;
    }
    case "reverse": {
      state.direction = state.direction === 1 ? -1 : 1;
      events.push({ type: "direction/reversed", payload: { direction: state.direction } });
      if (twoPlayer) {
        state.phase = "playing";
        state.pending = null;
        return;
      }
      advanceTurn(state, 1);
      return;
    }
    case "draw": {
      const n = face.drawN ?? 2;
      if (state.edition === "no-mercy") {
        const victimIdx = nextIndex(state, state.currentIndex, 1);
        const victimId = state.turnOrder[victimIdx]!;
        state.phase = "stackResponse";
        state.pending = {
          type: "stackResponse",
          playerId: victimId,
          amount: n,
        };
        state.currentIndex = victimIdx;
        return;
      }
      const victimId = state.turnOrder[nextIndex(state, state.currentIndex, 1)]!;
      giveCards(state, victimId, n, ctx, events);
      advanceTurn(state, 2);
      return;
    }
    case "flip": {
      state.side = state.side === "light" ? "dark" : "light";
      // Discard top already flipped via side; color stays if still valid
      const tf = topFace(state);
      if (tf.color) state.currentColor = tf.color;
      events.push({ type: "board/flipped", payload: { side: state.side } });
      advanceTurn(state, 1);
      return;
    }
    case "discardAll": {
      const p = player(state, actorId);
      const color = face.color!;
      const kept: UnoCard[] = [];
      for (const c of p.hand) {
        const f = activeFace(c, state.side);
        if (f.color === color) state.discard.push(c);
        else kept.push(c);
      }
      p.hand = kept;
      if (p.hand.length === 0) {
        finishRound(state, events, "empty-hand", actorId);
        return;
      }
      advanceTurn(state, 1);
      return;
    }
    case "wild": {
      if (!chosenColor) {
        state.phase = "chooseColor";
        state.pending = { type: "chooseColor", playerId: actorId, cardId: card.id };
        return;
      }
      state.currentColor = chosenColor;
      advanceTurn(state, 1);
      return;
    }
    case "wildDraw": {
      const n = face.drawN ?? 4;
      if (!chosenColor) {
        state.phase = "chooseColor";
        state.pending = { type: "chooseColor", playerId: actorId, cardId: card.id };
        return;
      }
      state.currentColor = chosenColor;
      if (state.edition === "classic" && n === 4) {
        const victimIdx = nextIndex(state, state.currentIndex, 1);
        const victimId = state.turnOrder[victimIdx]!;
        state.phase = "challenge";
        state.pending = {
          type: "challenge",
          playerId: victimId,
          offenderId: actorId,
          chosenColor,
        };
        state.currentIndex = victimIdx;
        return;
      }
      if (state.edition === "no-mercy") {
        const victimIdx = nextIndex(state, state.currentIndex, 1);
        const victimId = state.turnOrder[victimIdx]!;
        state.phase = "stackResponse";
        state.pending = {
          type: "stackResponse",
          playerId: victimId,
          amount: n,
        };
        state.currentIndex = victimIdx;
        return;
      }
      // Flip wild draw 2 / etc.
      const victimId = state.turnOrder[nextIndex(state, state.currentIndex, 1)]!;
      giveCards(state, victimId, n, ctx, events);
      advanceTurn(state, 2);
      return;
    }
    case "wildDrawColor":
    case "wildRoulette": {
      if (!chosenColor) {
        state.phase = "chooseColor";
        state.pending = { type: "chooseColor", playerId: actorId, cardId: card.id };
        return;
      }
      state.currentColor = chosenColor;
      const victimId = state.turnOrder[nextIndex(state, state.currentIndex, 1)]!;
      // Draw until color
      let guard = 0;
      while (guard++ < 80) {
        const c = drawOne(state, ctx);
        if (!c) break;
        player(state, victimId).hand.push(c);
        const f = activeFace(c, state.side);
        if (f.color === chosenColor) break;
      }
      events.push({
        type: "cards/drawnUntilColor",
        payload: { playerId: victimId, color: chosenColor },
      });
      checkMercy(state, victimId, events);
      if (state.phase === "finished") return;
      advanceTurn(state, 2);
      return;
    }
    case "wildReverseDraw": {
      if (!chosenColor) {
        state.phase = "chooseColor";
        state.pending = { type: "chooseColor", playerId: actorId, cardId: card.id };
        return;
      }
      state.currentColor = chosenColor;
      state.direction = state.direction === 1 ? -1 : 1;
      const n = face.drawN ?? 4;
      if (state.edition === "no-mercy") {
        const victimIdx = nextIndex(state, state.currentIndex, 1);
        const victimId = state.turnOrder[victimIdx]!;
        state.phase = "stackResponse";
        state.pending = {
          type: "stackResponse",
          playerId: victimId,
          amount: n,
        };
        state.currentIndex = victimIdx;
        return;
      }
      const victimId = state.turnOrder[nextIndex(state, state.currentIndex, 1)]!;
      giveCards(state, victimId, n, ctx, events);
      advanceTurn(state, 2);
      return;
    }
    case "wildSwapHands": {
      if (!chosenColor) {
        state.phase = "chooseColor";
        state.pending = { type: "chooseColor", playerId: actorId, cardId: card.id };
        return;
      }
      state.currentColor = chosenColor;
      state.phase = "chooseTarget";
      state.pending = {
        type: "chooseTarget",
        playerId: actorId,
        cardId: card.id,
        purpose: "swapHands",
      };
      return;
    }
    case "wildShuffleHands": {
      if (!chosenColor) {
        state.phase = "chooseColor";
        state.pending = { type: "chooseColor", playerId: actorId, cardId: card.id };
        return;
      }
      state.currentColor = chosenColor;
      const ids = state.turnOrder.filter((id) => !player(state, id).eliminated);
      const pool = ctx.rng.shuffle(ids.flatMap((id) => player(state, id).hand));
      for (const id of ids) player(state, id).hand = [];
      let i = 0;
      const start = ids.indexOf(actorId);
      while (pool.length) {
        const id = ids[(start + 1 + i) % ids.length]!;
        player(state, id).hand.push(pool.pop()!);
        i++;
      }
      events.push({ type: "hands/shuffled", payload: {} });
      advanceTurn(state, 1);
      return;
    }
    default:
      advanceTurn(state, 1);
  }
}

function resolveColorThenContinue(
  state: UnoState,
  color: UnoColor,
  ctx: ApplyContext,
  events: Event[],
): void {
  const pending = state.pending;
  if (!pending || pending.type !== "chooseColor") return;
  state.currentColor = color;
  const card = state.discard[state.discard.length - 1]!;
  const face = activeFace(card, state.side);
  // Re-apply effect now that color is known (card already on discard)
  state.pending = null;
  state.phase = "playing";

  if (face.kind === "wild") {
    advanceTurn(state, 1);
    return;
  }
  if (face.kind === "wildDraw") {
    const n = face.drawN ?? 4;
    if (state.edition === "classic" && n === 4) {
      const victimIdx = nextIndex(state, state.currentIndex, 1);
      const victimId = state.turnOrder[victimIdx]!;
      state.phase = "challenge";
      state.pending = {
        type: "challenge",
        playerId: victimId,
        offenderId: pending.playerId,
        chosenColor: color,
      };
      state.currentIndex = victimIdx;
      return;
    }
    if (state.edition === "no-mercy") {
      const victimIdx = nextIndex(state, state.currentIndex, 1);
      const victimId = state.turnOrder[victimIdx]!;
      state.phase = "stackResponse";
      state.pending = { type: "stackResponse", playerId: victimId, amount: n };
      state.currentIndex = victimIdx;
      return;
    }
    const victimId = state.turnOrder[nextIndex(state, state.currentIndex, 1)]!;
    giveCards(state, victimId, n, ctx, events);
    advanceTurn(state, 2);
    return;
  }
  if (face.kind === "wildDrawColor" || face.kind === "wildRoulette") {
    const victimId = state.turnOrder[nextIndex(state, state.currentIndex, 1)]!;
    let guard = 0;
    while (guard++ < 80) {
      const c = drawOne(state, ctx);
      if (!c) break;
      player(state, victimId).hand.push(c);
      if (activeFace(c, state.side).color === color) break;
    }
    checkMercy(state, victimId, events);
    if (state.winners.length) return;
    advanceTurn(state, 2);
    return;
  }
  if (face.kind === "wildReverseDraw") {
    state.direction = state.direction === 1 ? -1 : 1;
    const n = face.drawN ?? 4;
    if (state.edition === "no-mercy") {
      const victimIdx = nextIndex(state, state.currentIndex, 1);
      const victimId = state.turnOrder[victimIdx]!;
      state.phase = "stackResponse";
      state.pending = { type: "stackResponse", playerId: victimId, amount: n };
      state.currentIndex = victimIdx;
      return;
    }
    const victimId = state.turnOrder[nextIndex(state, state.currentIndex, 1)]!;
    giveCards(state, victimId, n, ctx, events);
    advanceTurn(state, 2);
    return;
  }
  if (face.kind === "wildSwapHands") {
    state.phase = "chooseTarget";
    state.pending = {
      type: "chooseTarget",
      playerId: pending.playerId,
      cardId: pending.cardId,
      purpose: "swapHands",
    };
    return;
  }
  if (face.kind === "wildShuffleHands") {
    const ids = state.turnOrder.filter((id) => !player(state, id).eliminated);
    const pool = ctx.rng.shuffle(ids.flatMap((id) => player(state, id).hand));
    for (const id of ids) player(state, id).hand = [];
    let i = 0;
    const start = ids.indexOf(pending.playerId);
    while (pool.length) {
      const id = ids[(start + 1 + i) % ids.length]!;
      player(state, id).hand.push(pool.pop()!);
      i++;
    }
    events.push({ type: "hands/shuffled", payload: {} });
    advanceTurn(state, 1);
    return;
  }
  // No Mercy stack after wild color chosen while stacking
  const carry = (state as UnoState & { _stackCarry?: number })._stackCarry;
  if (typeof carry === "number") {
    delete (state as UnoState & { _stackCarry?: number })._stackCarry;
    const victimIdx = nextIndex(state, state.currentIndex, 1);
    const victimId = state.turnOrder[victimIdx]!;
    state.phase = "stackResponse";
    state.pending = {
      type: "stackResponse",
      playerId: victimId,
      amount: carry,
    };
    state.currentIndex = victimIdx;
    return;
  }
  advanceTurn(state, 1);
}

function offenderHadColor(
  state: UnoState,
  offenderId: PlayerId,
  color: UnoColor,
): boolean {
  // At challenge time offender's hand is current; we check remaining cards —
  // note: WD4 already discarded. Approximate: any remaining card of that color.
  return player(state, offenderId).hand.some(
    (c) => activeFace(c, state.side).color === color,
  );
}

export function createUnoState(config: UnoConfig, ctx: ApplyContext): UnoState {
  const edition = normalizeUnoEdition(config.edition);
  const maxP = maxPlayersForUnoEdition(edition);
  if (config.playerIds.length < 2 || config.playerIds.length > maxP) {
    throw new Error(`UNO ${edition} needs 2–${maxP} players`);
  }

  let deck = ctx.rng.shuffle(buildUnoDeck(edition));
  const players: UnoPlayer[] = config.playerIds.map((id) => ({
    id,
    name: config.playerNames[id] ?? id,
    hand: [],
    score: 0,
    eliminated: false,
  }));

  for (let i = 0; i < HAND_SIZE; i++) {
    for (const p of players) {
      const c = deck.pop();
      if (c) p.hand.push(c);
    }
  }

  // Start discard: avoid WD4 on classic; reshuffle if needed
  let start: UnoCard | undefined;
  for (let tries = 0; tries < 30; tries++) {
    start = deck.pop();
    if (!start) break;
    const f = activeFace(start, "light");
    if (edition === "classic" && f.kind === "wildDraw") {
      deck = ctx.rng.shuffle([start, ...deck]);
      continue;
    }
    break;
  }
  if (!start) throw new Error("empty deck");

  const side = "light" as const;
  const startFace = activeFace(start, side);
  const currentColor: UnoColor = startFace.color ?? "red";
  const currentIndex = 0;
  const direction: 1 | -1 = 1;
  const events: Event[] = [];

  const state: UnoState = {
    schemaVersion: 1,
    pluginId: "uno",
    edition,
    seed: config.seed ?? "uno",
    phase: "playing",
    players,
    turnOrder: config.playerIds.slice(),
    currentIndex,
    direction,
    deck,
    discard: [start],
    currentColor,
    side,
    pending: null,
    unoVulnerableId: null,
    saidUno: {},
    winners: [],
    matchOver: false,
    round: 1,
    targetScore: config.targetScore ?? DEFAULT_TARGET,
    mercyPile: [],
    lastPlayedBy: null,
  };

  // Apply opening card effects lightly
  if (startFace.kind === "skip") {
    state.currentIndex = nextIndex(state, 0, 1);
  } else if (startFace.kind === "reverse") {
    state.direction = -1;
    if (players.length === 2) state.currentIndex = nextIndex(state, 0, 1);
  } else if (startFace.kind === "draw") {
    const victim = state.turnOrder[0]!;
    giveCards(state, victim, startFace.drawN ?? 2, ctx, events);
    state.currentIndex = nextIndex(state, 0, 1);
  } else if (startFace.kind === "wild") {
    state.phase = "chooseColor";
    state.pending = {
      type: "chooseColor",
      playerId: state.turnOrder[0]!,
      cardId: start.id,
    };
  } else if (startFace.color) {
    state.currentColor = startFace.color;
  }

  return state;
}

export function continueUnoMatch(
  state: UnoState,
  ctx: ApplyContext,
): { state: UnoState; events: Event[] } {
  const events: Event[] = [];
  const next = produce(state, (draft) => {
    draft.round += 1;
    draft.phase = "playing";
    draft.winners = [];
    draft.pending = null;
    draft.unoVulnerableId = null;
    draft.saidUno = {};
    draft.mercyPile = [];
    draft.side = "light";
    draft.direction = 1;
    draft.lastPlayedBy = null;
    for (const p of draft.players) {
      p.hand = [];
      p.eliminated = false;
    }
    const deck = ctx.rng.shuffle(buildUnoDeck(draft.edition));
    for (let i = 0; i < HAND_SIZE; i++) {
      for (const p of draft.players) {
        const c = deck.pop();
        if (c) p.hand.push(c);
      }
    }
    const start = deck.pop()!;
    draft.deck = deck;
    draft.discard = [start];
    const f = activeFace(start, "light");
    draft.currentColor = f.color ?? "red";
    draft.currentIndex = 0;
    events.push({ type: "round/started", payload: { round: draft.round } });
  });
  return { state: next, events };
}

export function legalUnoActions(state: UnoState, playerId: PlayerId): UnoAction[] {
  const stub = (type: UnoAction["type"], payload: Record<string, unknown> = {}) =>
    ({ type, playerId, payload }) as UnoAction;

  if (state.phase === "finished") return [];

  if (state.pending?.type === "chooseColor" && state.pending.playerId === playerId) {
    return (["red", "yellow", "green", "blue"] as UnoColor[]).map((color) =>
      stub("chooseColor", { color }),
    );
  }
  if (state.pending?.type === "chooseTarget" && state.pending.playerId === playerId) {
    return alive(state)
      .filter((p) => p.id !== playerId)
      .map((p) => stub("chooseTarget", { targetPlayerId: p.id }));
  }
  if (state.pending?.type === "challenge" && state.pending.playerId === playerId) {
    return [stub("challengeWildDraw"), stub("acceptWildDraw")];
  }
  if (state.pending?.type === "drawnDecision" && state.pending.playerId === playerId) {
    const card = state.pending.card;
    const face = activeFace(card, state.side);
    const canPlay = facesMatch(face, topFace(state), state.currentColor);
    const out: UnoAction[] = [stub("keepDrawn")];
    if (canPlay) out.unshift(stub("playDrawn", {}));
    return out;
  }
  if (state.pending?.type === "stackResponse" && state.pending.playerId === playerId) {
    const amount = state.pending.amount;
    const out: UnoAction[] = [stub("takeStack")];
    for (const c of player(state, playerId).hand) {
      const f = activeFace(c, state.side);
      if (canStackDraw(f, amount)) {
        out.push(
          stub("playCard", {
            cardId: c.id,
            saidUno: player(state, playerId).hand.length === 2,
          }),
        );
      }
    }
    return out;
  }

  if (state.phase !== "playing") return [];
  if (currentId(state) !== playerId) {
    // Others may catch UNO
    if (state.unoVulnerableId && state.unoVulnerableId !== playerId) {
      return [
        stub("catchUno", { targetPlayerId: state.unoVulnerableId }),
      ];
    }
    return [];
  }

  const p = player(state, playerId);
  const out: UnoAction[] = [stub("drawCard")];
  if (p.hand.length === 1) out.push(stub("callUno"));
  for (const c of p.hand) {
    const f = activeFace(c, state.side);
    if (facesMatch(f, topFace(state), state.currentColor)) {
      out.push(
        stub("playCard", {
          cardId: c.id,
          saidUno: p.hand.length === 2,
          chosenColor: needsColorChoice(f) ? "red" : undefined,
        }),
      );
    }
  }
  if (state.unoVulnerableId && state.unoVulnerableId !== playerId) {
    out.push(stub("catchUno", { targetPlayerId: state.unoVulnerableId }));
  }
  return out;
}

export function validateUnoAction(
  state: UnoState,
  action: UnoAction,
): true | { error: string } {
  const legal = legalUnoActions(state, action.playerId);
  const ok = legal.some((a) => {
    if (a.type !== action.type) return false;
    if (action.type === "playCard" || action.type === "playDrawn") {
      if (action.type === "playCard") {
        return (
          a.type === "playCard" &&
          a.payload.cardId === action.payload.cardId
        );
      }
      return true;
    }
    if (action.type === "chooseColor") {
      return (
        a.type === "chooseColor" && a.payload.color === action.payload.color
      );
    }
    if (action.type === "chooseTarget") {
      return (
        a.type === "chooseTarget" &&
        a.payload.targetPlayerId === action.payload.targetPlayerId
      );
    }
    if (action.type === "catchUno") {
      return (
        a.type === "catchUno" &&
        a.payload.targetPlayerId === action.payload.targetPlayerId
      );
    }
    return true;
  });
  return ok ? true : { error: "illegal action" };
}

export function applyUnoAction(
  state: UnoState,
  action: UnoAction,
  ctx: ApplyContext,
): { state: UnoState; events: Event[] } {
  const events: Event[] = [];
  const next = produce(state, (draft) => {
    switch (action.type) {
      case "callUno": {
        draft.saidUno[action.playerId] = true;
        if (draft.unoVulnerableId === action.playerId) {
          draft.unoVulnerableId = null;
        }
        events.push({ type: "uno/called", payload: { playerId: action.playerId } });
        break;
      }
      case "catchUno": {
        const target = action.payload.targetPlayerId;
        if (draft.unoVulnerableId !== target) break;
        const penalty = draft.edition === "no-mercy" ? 4 : 2;
        giveCards(draft, target, penalty, ctx, events);
        draft.unoVulnerableId = null;
        events.push({
          type: "uno/caught",
          payload: { by: action.playerId, target, penalty },
        });
        break;
      }
      case "chooseColor": {
        resolveColorThenContinue(draft, action.payload.color, ctx, events);
        break;
      }
      case "chooseTarget": {
        const pending = draft.pending;
        if (!pending || pending.type !== "chooseTarget") break;
        const a = player(draft, pending.playerId);
        const b = player(draft, action.payload.targetPlayerId);
        const tmp = a.hand;
        a.hand = b.hand;
        b.hand = tmp;
        events.push({
          type: "hands/swapped",
          payload: {
            a: pending.playerId,
            b: action.payload.targetPlayerId,
          },
        });
        draft.pending = null;
        advanceTurn(draft, 1);
        break;
      }
      case "challengeWildDraw": {
        const pending = draft.pending;
        if (!pending || pending.type !== "challenge") break;
        const had = offenderHadColor(
          draft,
          pending.offenderId,
          pending.chosenColor,
        );
        if (had) {
          giveCards(draft, pending.offenderId, 4, ctx, events);
          events.push({
            type: "challenge/failed",
            payload: { offenderId: pending.offenderId },
          });
          draft.currentIndex = draft.turnOrder.indexOf(pending.playerId);
          draft.phase = "playing";
          draft.pending = null;
        } else {
          giveCards(draft, pending.playerId, 6, ctx, events);
          events.push({
            type: "challenge/success",
            payload: { victimId: pending.playerId },
          });
          advanceTurn(draft, 1);
        }
        break;
      }
      case "acceptWildDraw": {
        const pending = draft.pending;
        if (!pending || pending.type !== "challenge") break;
        giveCards(draft, pending.playerId, 4, ctx, events);
        advanceTurn(draft, 1);
        break;
      }
      case "drawCard": {
        if (draft.unoVulnerableId && draft.unoVulnerableId !== action.playerId) {
          draft.unoVulnerableId = null;
        }
        const c = drawOne(draft, ctx);
        if (!c) break;
        const face = activeFace(c, draft.side);
        const can = facesMatch(face, topFace(draft), draft.currentColor);
        if (can) {
          draft.phase = "drawnDecision";
          draft.pending = {
            type: "drawnDecision",
            playerId: action.playerId,
            card: c,
          };
        } else {
          player(draft, action.playerId).hand.push(c);
          checkMercy(draft, action.playerId, events);
          if (draft.phase !== "finished") advanceTurn(draft, 1);
        }
        events.push({
          type: "card/drew",
          payload: { playerId: action.playerId, playable: can },
        });
        break;
      }
      case "keepDrawn": {
        const pending = draft.pending;
        if (!pending || pending.type !== "drawnDecision") break;
        player(draft, action.playerId).hand.push(pending.card);
        checkMercy(draft, action.playerId, events);
        if (draft.phase !== "finished") advanceTurn(draft, 1);
        break;
      }
      case "playDrawn": {
        const pending = draft.pending;
        if (!pending || pending.type !== "drawnDecision") break;
        const card = pending.card;
        const face = activeFace(card, draft.side);
        draft.pending = null;
        draft.phase = "playing";
        maybeUnoVulnerable(
          draft,
          action.playerId,
          action.payload.saidUno,
          events,
        );
        // hand doesn't contain card yet
        applyPlayedCard(
          draft,
          action.playerId,
          card,
          face,
          action.payload.chosenColor,
          action.payload.targetPlayerId,
          ctx,
          events,
        );
        break;
      }
      case "takeStack": {
        const pending = draft.pending;
        if (!pending || pending.type !== "stackResponse") break;
        giveCards(draft, action.playerId, pending.amount, ctx, events);
        if (draft.phase !== "finished") advanceTurn(draft, 1);
        break;
      }
      case "playCard": {
        if (draft.pending?.type === "stackResponse") {
          const amount = draft.pending.amount;
          const p = player(draft, action.playerId);
          const idx = p.hand.findIndex((c) => c.id === action.payload.cardId);
          if (idx < 0) break;
          const card = p.hand.splice(idx, 1)[0]!;
          const face = activeFace(card, draft.side);
          if (!canStackDraw(face, amount)) {
            p.hand.splice(idx, 0, card);
            break;
          }
          draft.discard.push(card);
          const add = face.drawN ?? 0;
          const nextVictimIdx = nextIndex(draft, draft.currentIndex, 1);
          const nextVictim = draft.turnOrder[nextVictimIdx]!;
          if (face.kind === "wildReverseDraw") {
            draft.direction = draft.direction === 1 ? -1 : 1;
          }
          if (needsColorChoice(face) && !action.payload.chosenColor) {
            draft.phase = "chooseColor";
            draft.pending = {
              type: "chooseColor",
              playerId: action.playerId,
              cardId: card.id,
            };
            // stash stack amount on color resolve via discard top drawN + prior
            // simplify: set stack after color
            (draft as UnoState & { _stackCarry?: number })._stackCarry =
              amount + add;
            break;
          }
          if (action.payload.chosenColor) {
            draft.currentColor = action.payload.chosenColor;
          } else if (face.color) {
            draft.currentColor = face.color;
          }
          maybeUnoVulnerable(
            draft,
            action.playerId,
            action.payload.saidUno,
            events,
          );
          if (p.hand.length === 0) {
            finishRound(draft, events, "empty-hand", action.playerId);
            break;
          }
          draft.phase = "stackResponse";
          draft.pending = {
            type: "stackResponse",
            playerId: nextVictim,
            amount: amount + add,
          };
          draft.currentIndex = nextVictimIdx;
          events.push({
            type: "stack/added",
            payload: { playerId: action.playerId, amount: amount + add },
          });
          break;
        }

        if (draft.unoVulnerableId && draft.unoVulnerableId !== action.playerId) {
          draft.unoVulnerableId = null;
        }
        const p = player(draft, action.playerId);
        const idx = p.hand.findIndex((c) => c.id === action.payload.cardId);
        if (idx < 0) break;
        const card = p.hand[idx]!;
        const face = activeFace(card, draft.side);
        if (!facesMatch(face, topFace(draft), draft.currentColor)) break;
        p.hand.splice(idx, 1);
        maybeUnoVulnerable(
          draft,
          action.playerId,
          action.payload.saidUno,
          events,
        );
        applyPlayedCard(
          draft,
          action.playerId,
          card,
          face,
          action.payload.chosenColor,
          action.payload.targetPlayerId,
          ctx,
          events,
        );
        break;
      }
      default:
        break;
    }
  });
  return { state: next, events };
}

export function checkUnoVictory(state: UnoState): VictoryResult | null {
  if (state.phase !== "finished") return null;
  if (!state.winners.length) return null;
  return {
    kind: "winner",
    winners: state.winners,
    reason: state.matchOver ? "match" : "round",
  };
}
