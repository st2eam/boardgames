import { produce } from "immer";
import type { ApplyContext, Event, PlayerId, VictoryResult } from "@bbge/core";
import {
  buildRummikubDeck,
  sortHand,
  sortSet,
  tilePoints,
  type RummikubTile,
} from "./cards";
import { isValidSet, setPoints } from "./sets";
import type {
  RummikubAction,
  RummikubConfig,
  RummikubPlayer,
  RummikubState,
} from "./state";

function player(state: RummikubState, id: PlayerId): RummikubPlayer {
  const p = state.players.find((x) => x.id === id);
  if (!p) throw new Error(`unknown player ${id}`);
  return p;
}

function currentId(state: RummikubState): PlayerId {
  return state.turnOrder[state.currentIndex]!;
}

function advanceTurn(state: RummikubState): void {
  state.currentIndex = (state.currentIndex + 1) % state.turnOrder.length;
  state.meldThisTurn = 0;
  for (const p of state.players) p.drewThisTurn = false;
}

function finishEmptyRack(
  state: RummikubState,
  winnerId: PlayerId,
  events: Event[],
): void {
  state.phase = "finished";
  state.winners = [winnerId];
  state.matchOver = true;
  state.endReason = "emptyRack";
  let total = 0;
  for (const p of state.players) {
    if (p.id === winnerId) continue;
    const pts = p.rack.reduce((s, t) => s + tilePoints(t), 0);
    total += pts;
    p.score += -pts;
  }
  player(state, winnerId).score += total;
  events.push({
    type: "rummikub/emptyRack",
    payload: { winnerId, scores: Object.fromEntries(state.players.map((p) => [p.id, p.score])) },
  });
}

function finishDepleted(state: RummikubState, events: Event[]): void {
  state.phase = "finished";
  state.matchOver = true;
  state.endReason = "depleted";
  const totals = state.players.map((p) => ({
    id: p.id,
    total: p.rack.reduce((s, t) => s + tilePoints(t), 0),
  }));
  const winner = totals.reduce((a, b) => (b.total < a.total ? b : a));
  state.winners = [winner.id];
  for (const p of state.players) {
    if (p.id === winner.id) continue;
    const t = totals.find((x) => x.id === p.id)!.total;
    p.score += -t;
    player(state, winner.id).score += t - winner.total;
  }
  events.push({
    type: "rummikub/depleted",
    payload: {
      winnerId: winner.id,
      totals: Object.fromEntries(totals.map((t) => [t.id, t.total])),
      scores: Object.fromEntries(state.players.map((p) => [p.id, p.score])),
    },
  });
}

export function createRummikubState(
  config: RummikubConfig,
  ctx: ApplyContext,
): RummikubState {
  const n = config.playerIds.length;
  if (n < 2 || n > 4) throw new Error("Rummikub needs 2–4 players");

  const deck = ctx.rng.shuffle(buildRummikubDeck());
  const players: RummikubPlayer[] = config.playerIds.map((id) => ({
    id,
    name: config.playerNames[id] ?? id,
    rack: [],
    initialMeldDone: false,
    score: 0,
    drewThisTurn: false,
  }));

  for (let i = 0; i < 14; i++) {
    for (const p of players) {
      const t = deck.pop();
      if (t) p.rack.push(t);
    }
  }
  for (const p of players) p.rack = sortHand(p.rack);

  return {
    schemaVersion: 1,
    pluginId: "rummikub",
    seed: config.seed ?? "rummikub",
    phase: "playing",
    players,
    turnOrder: config.playerIds.slice(),
    currentIndex: 0,
    pool: deck,
    table: [],
    setSeq: 0,
    winners: [],
    matchOver: false,
    round: 1,
    endReason: null,
    meldThisTurn: 0,
  };
}

export function continueRummikubMatch(
  state: RummikubState,
  ctx: ApplyContext,
): { state: RummikubState; events: Event[] } {
  const events: Event[] = [{ type: "match/restarted", payload: {} }];
  const names = Object.fromEntries(state.players.map((p) => [p.id, p.name]));
  const next = createRummikubState(
    {
      playerIds: state.turnOrder.slice(),
      playerNames: names,
      seed: `${state.seed}-r${ctx.rng.int(1, 1e9)}`,
    },
    ctx,
  );
  next.round = state.round + 1;
  // Carry scores forward across rounds.
  next.players.forEach((p) => {
    const prev = state.players.find((x) => x.id === p.id);
    if (prev) p.score = prev.score;
  });
  return { state: next, events };
}

function newSetMoves(
  state: RummikubState,
  actor: RummikubPlayer,
): RummikubAction[] {
  const out: RummikubAction[] = [];
  const rack = actor.rack;

  // Runs by color.
  const byColor = new Map<string, RummikubTile[]>();
  for (const t of rack) {
    if (t.joker || t.color == null) continue;
    const list = byColor.get(t.color) ?? [];
    list.push(t);
    byColor.set(t.color, list);
  }
  const jokers = rack.filter((t) => t.joker);
  for (const group of byColor.values()) {
    group.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]!.number!;
        const b = group[j]!.number!;
        if (b - a + 1 < 3) continue;
        const picked = group.slice(i, j + 1).filter((t) => t.number! >= a && t.number! <= b);
        const need = b - a + 1 - picked.length;
        if (need > jokers.length) continue;
        const candidate = picked.concat(jokers.slice(0, need));
        if (!isValidSet(candidate)) continue;
        const points = setPoints(candidate);
        if (!actor.initialMeldDone && state.meldThisTurn + points < 30) continue;
        out.push({
          type: "playNewSet",
          playerId: actor.id,
          payload: { tileIds: candidate.map((t) => t.id) },
        });
      }
    }
  }

  // Groups.
  const byNumber = new Map<number, RummikubTile[]>();
  for (const t of rack) {
    if (t.joker || t.number == null) continue;
    const list = byNumber.get(t.number) ?? [];
    list.push(t);
    byNumber.set(t.number, list);
  }
  for (const group of byNumber.values()) {
    for (let size = 3; size <= 4; size++) {
      const picked = group.slice(0, size);
      const need = size - picked.length;
      if (need > jokers.length) continue;
      const candidate = picked.concat(jokers.slice(0, need));
      if (!isValidSet(candidate)) continue;
      const points = setPoints(candidate);
      if (!actor.initialMeldDone && state.meldThisTurn + points < 30) continue;
      out.push({
        type: "playNewSet",
        playerId: actor.id,
        payload: { tileIds: candidate.map((t) => t.id) },
      });
    }
  }

  return out;
}

function extendMoves(
  state: RummikubState,
  actor: RummikubPlayer,
): RummikubAction[] {
  const out: RummikubAction[] = [];
  if (!actor.initialMeldDone) return out;
  for (const set of state.table) {
    for (const t of actor.rack) {
      if (isValidSet([...set.tiles, t])) {
        out.push({
          type: "extendSet",
          playerId: actor.id,
          payload: { targetSetId: set.id, tileIds: [t.id] },
        });
      }
    }
  }
  return out;
}

export function legalRummikubActions(
  state: RummikubState,
  playerId: PlayerId,
): RummikubAction[] {
  if (state.phase !== "playing") return [];
  if (currentId(state) !== playerId) return [];
  const actor = player(state, playerId);

  const out: RummikubAction[] = [];
  if (state.pool.length > 0 && !actor.drewThisTurn) {
    out.push({ type: "drawTile", playerId, payload: {} });
  }
  out.push(...newSetMoves(state, actor));
  out.push(...extendMoves(state, actor));

  if (
    !out.some((a) => a.type === "passTurn") &&
    (actor.drewThisTurn || state.pool.length === 0)
  ) {
    out.push({ type: "passTurn", playerId, payload: {} });
  }

  return out;
}

export function validateRummikubAction(
  state: RummikubState,
  action: RummikubAction,
): true | { error: string } {
  const legal = legalRummikubActions(state, action.playerId);
  const ok = legal.some((a) => {
    if (a.type !== action.type) return false;
    if (action.type === "playNewSet") {
      return (
        a.type === "playNewSet" &&
        a.payload.tileIds.length === action.payload.tileIds.length &&
        action.payload.tileIds.every((id) => a.payload.tileIds.includes(id))
      );
    }
    if (action.type === "extendSet") {
      return (
        a.type === "extendSet" &&
        a.payload.targetSetId === action.payload.targetSetId &&
        a.payload.tileIds.length === action.payload.tileIds.length &&
        action.payload.tileIds.every((id) => a.payload.tileIds.includes(id))
      );
    }
    return true;
  });
  return ok ? true : { error: "illegal action" };
}

export function applyRummikubAction(
  state: RummikubState,
  action: RummikubAction,
  _ctx: ApplyContext,
): { state: RummikubState; events: Event[] } {
  const events: Event[] = [];
  const next = produce(state, (draft) => {
    const actor = player(draft, action.playerId);

    if (action.type === "drawTile") {
      const t = draft.pool.pop();
      if (!t) return;
      actor.rack.push(t);
      actor.rack = sortHand(actor.rack);
      actor.drewThisTurn = true;
      events.push({
        type: "rummikub/drew",
        payload: { playerId: actor.id, count: 1 },
      });
      return;
    }

    if (action.type === "passTurn") {
      if (draft.pool.length === 0) {
        finishDepleted(draft, events);
        return;
      }
      events.push({
        type: "turn/passed",
        payload: { playerId: actor.id },
      });
      advanceTurn(draft);
      return;
    }

    if (action.type === "playNewSet") {
      const ids = new Set(action.payload.tileIds);
      const tiles = actor.rack.filter((t) => ids.has(t.id));
      if (tiles.length !== ids.size) return;
      if (!isValidSet(tiles)) return;
      const points = setPoints(tiles);
      if (!actor.initialMeldDone && draft.meldThisTurn + points < 30) return;

      actor.rack = actor.rack.filter((t) => !ids.has(t.id));
      draft.table.push({ id: `s${draft.setSeq++}`, tiles: sortSet(tiles) });
      draft.meldThisTurn += points;
      if (!actor.initialMeldDone && draft.meldThisTurn >= 30) {
        actor.initialMeldDone = true;
      }
      events.push({
        type: "rummikub/played",
        payload: {
          playerId: actor.id,
          setIds: [`s${draft.setSeq - 1}`],
          points,
          tileCount: tiles.length,
        },
      });

      if (actor.rack.length === 0) {
        finishEmptyRack(draft, actor.id, events);
        return;
      }
      advanceTurn(draft);
      return;
    }

    if (action.type === "extendSet") {
      if (!actor.initialMeldDone) return;
      const set = draft.table.find((s) => s.id === action.payload.targetSetId);
      if (!set) return;
      const ids = new Set(action.payload.tileIds);
      const tiles = actor.rack.filter((t) => ids.has(t.id));
      if (tiles.length !== ids.size) return;
      if (!isValidSet([...set.tiles, ...tiles])) return;

      actor.rack = actor.rack.filter((t) => !ids.has(t.id));
      set.tiles = sortSet([...set.tiles, ...tiles]);
      events.push({
        type: "rummikub/played",
        payload: {
          playerId: actor.id,
          setIds: [set.id],
          points: setPoints(tiles),
          tileCount: tiles.length,
        },
      });

      if (actor.rack.length === 0) {
        finishEmptyRack(draft, actor.id, events);
        return;
      }
      advanceTurn(draft);
    }
  });
  return { state: next, events };
}

export function checkRummikubVictory(
  state: RummikubState,
): VictoryResult | null {
  if (state.phase !== "finished" || !state.winners.length) return null;
  return { kind: "winner", winners: state.winners, reason: state.endReason ?? "rummikub" };
}
