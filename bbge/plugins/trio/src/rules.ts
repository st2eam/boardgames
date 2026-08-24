import { produce } from "immer";
import type { ApplyContext, Event, PlayerId, VictoryResult } from "@bbge/core";
import { buildTrioDeck, sortHand, type TrioCard } from "./cards";
import {
  dealCounts,
  hasConnectedPair,
  normalizeTrioMode,
} from "./editions";
import type {
  TrioAction,
  TrioConfig,
  TrioPlayer,
  TrioState,
  TurnReveal,
} from "./state";

function player(state: TrioState, id: PlayerId): TrioPlayer {
  const p = state.players.find((x) => x.id === id);
  if (!p) throw new Error(`unknown player ${id}`);
  return p;
}

function currentId(state: TrioState): PlayerId {
  return state.turnOrder[state.currentIndex]!;
}

function advanceTurn(state: TrioState): void {
  state.currentIndex = (state.currentIndex + 1) % state.turnOrder.length;
  state.turnReveals = [];
}

function targetValue(reveals: TurnReveal[]): number | null {
  if (!reveals.length) return null;
  return reveals[0]!.card.value;
}

function checkWin(state: TrioState, actorId: PlayerId): boolean {
  const trios = player(state, actorId).trios;
  if (trios.includes(7)) return true;
  if (state.mode === "simple") return trios.length >= 3;
  return hasConnectedPair(trios);
}

function finishGame(state: TrioState, winnerId: PlayerId, events: Event[]): void {
  state.phase = "finished";
  state.winners = [winnerId];
  state.matchOver = true;
  state.turnReveals = [];
  events.push({
    type: "match/ended",
    payload: {
      winnerId,
      trios: Object.fromEntries(
        state.players.map((p) => [p.id, p.trios.slice()]),
      ),
    },
  });
}

function bustTurn(state: TrioState, events: Event[]): void {
  for (const r of state.turnReveals) {
    if (r.source === "center") {
      // already still in center slot — just leave face-down (view uses turnReveals)
    } else {
      const owner = player(state, r.ownerId);
      owner.hand.push(r.card);
      owner.hand = sortHand(owner.hand);
    }
  }
  events.push({
    type: "turn/bust",
    payload: {
      playerId: currentId(state),
      values: state.turnReveals.map((r) => r.card.value),
    },
  });
  advanceTurn(state);
}

function succeedTrio(
  state: TrioState,
  value: number,
  events: Event[],
): void {
  const actor = currentId(state);
  for (const r of state.turnReveals) {
    if (r.source === "center") {
      state.center[r.slotIndex] = null;
    }
    // hand cards already removed when revealed
  }
  player(state, actor).trios.push(value);
  events.push({
    type: "trio/collected",
    payload: { playerId: actor, value },
  });
  if (checkWin(state, actor)) {
    finishGame(state, actor, events);
    return;
  }
  advanceTurn(state);
}

function afterReveal(state: TrioState, events: Event[]): void {
  const reveals = state.turnReveals;
  const values = reveals.map((r) => r.card.value);
  const first = values[0]!;
  const last = values[values.length - 1]!;

  if (values.length >= 2 && last !== first) {
    bustTurn(state, events);
    return;
  }

  if (values.length === 3 && values.every((v) => v === first)) {
    succeedTrio(state, first, events);
  }
}

export function createTrioState(config: TrioConfig, ctx: ApplyContext): TrioState {
  const mode = normalizeTrioMode(config.edition);
  const n = config.playerIds.length;
  if (n < 3 || n > 6) throw new Error("TRIO needs 3–6 players");
  const { hand: handN, center: centerN } = dealCounts(n);

  const deck = ctx.rng.shuffle(buildTrioDeck());
  const players: TrioPlayer[] = config.playerIds.map((id) => ({
    id,
    name: config.playerNames[id] ?? id,
    hand: [],
    trios: [],
  }));

  for (let i = 0; i < handN; i++) {
    for (const p of players) {
      const c = deck.pop();
      if (c) p.hand.push(c);
    }
  }
  for (const p of players) p.hand = sortHand(p.hand);

  const center: (TrioCard | null)[] = [];
  for (let i = 0; i < centerN; i++) {
    center.push(deck.pop() ?? null);
  }

  return {
    schemaVersion: 1,
    pluginId: "trio",
    mode,
    seed: config.seed ?? "trio",
    phase: "playing",
    players,
    turnOrder: config.playerIds.slice(),
    currentIndex: 0,
    center,
    turnReveals: [],
    winners: [],
    matchOver: false,
  };
}

export function continueTrioMatch(
  state: TrioState,
  ctx: ApplyContext,
): { state: TrioState; events: Event[] } {
  const events: Event[] = [
    { type: "match/restarted", payload: { mode: state.mode } },
  ];
  const names = Object.fromEntries(state.players.map((p) => [p.id, p.name]));
  const next = createTrioState(
    {
      playerIds: state.turnOrder.slice(),
      playerNames: names,
      seed: `${state.seed}-r${ctx.rng.int(1, 1e9)}`,
      edition: state.mode,
    },
    ctx,
  );
  return { state: next, events };
}

export function legalTrioActions(
  state: TrioState,
  playerId: PlayerId,
): TrioAction[] {
  if (state.phase !== "playing") return [];
  if (currentId(state) !== playerId) return [];

  const out: TrioAction[] = [];
  const expected = targetValue(state.turnReveals);

  state.center.forEach((c, slotIndex) => {
    if (!c) return;
    // already revealed this turn?
    if (state.turnReveals.some(
      (r) => r.source === "center" && r.slotIndex === slotIndex,
    )) {
      return;
    }
    out.push({
      type: "revealCenter",
      playerId,
      payload: { slotIndex },
    });
  });

  for (const p of state.players) {
    if (!p.hand.length) continue;
    for (const end of ["low", "high"] as const) {
      out.push({
        type: "revealExtreme",
        playerId,
        payload: { targetPlayerId: p.id, end },
      });
    }
  }

  // Filter: if we already have a target value, still allow all reveals
  // (bust handled on apply). Optional: soft-filter known mismatches for AI only.
  void expected;
  return out;
}

export function validateTrioAction(
  state: TrioState,
  action: TrioAction,
): true | { error: string } {
  const legal = legalTrioActions(state, action.playerId);
  const ok = legal.some((a) => {
    if (a.type !== action.type) return false;
    if (action.type === "revealCenter") {
      return (
        a.type === "revealCenter" &&
        a.payload.slotIndex === action.payload.slotIndex
      );
    }
    return (
      a.type === "revealExtreme" &&
      a.payload.targetPlayerId === action.payload.targetPlayerId &&
      a.payload.end === action.payload.end
    );
  });
  return ok ? true : { error: "illegal action" };
}

export function applyTrioAction(
  state: TrioState,
  action: TrioAction,
  _ctx: ApplyContext,
): { state: TrioState; events: Event[] } {
  const events: Event[] = [];
  const next = produce(state, (draft) => {
    if (action.type === "revealCenter") {
      const idx = action.payload.slotIndex;
      const card = draft.center[idx];
      if (!card) return;
      if (
        draft.turnReveals.some(
          (r) => r.source === "center" && r.slotIndex === idx,
        )
      ) {
        return;
      }
      draft.turnReveals.push({ source: "center", slotIndex: idx, card });
      events.push({
        type: "card/revealed",
        payload: {
          playerId: action.playerId,
          source: "center",
          slotIndex: idx,
          value: card.value,
        },
      });
      afterReveal(draft, events);
      return;
    }

    if (action.type === "revealExtreme") {
      const owner = player(draft, action.payload.targetPlayerId);
      if (!owner.hand.length) return;
      const end = action.payload.end;
      const card =
        end === "low" ? owner.hand[0]! : owner.hand[owner.hand.length - 1]!;
      // remove from hand for the turn
      if (end === "low") owner.hand.shift();
      else owner.hand.pop();
      draft.turnReveals.push({
        source: "hand",
        ownerId: owner.id,
        end,
        card,
      });
      events.push({
        type: "card/revealed",
        payload: {
          playerId: action.playerId,
          source: "hand",
          ownerId: owner.id,
          end,
          value: card.value,
        },
      });
      afterReveal(draft, events);
    }
  });
  return { state: next, events };
}

export function checkTrioVictory(state: TrioState): VictoryResult | null {
  if (state.phase !== "finished" || !state.winners.length) return null;
  return { kind: "winner", winners: state.winners, reason: "trios" };
}
