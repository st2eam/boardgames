import { produce } from "immer";
import type { ApplyContext, Event, PlayerId, VictoryResult } from "@bbge/core";
import {
  buildRummikubDeck,
  sortHand,
  tilePoints,
} from "./cards";
import {
  assignSetIds,
  candidateCommitActions,
  evaluateCommit,
} from "./commit";
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
  next.players.forEach((p) => {
    const prev = state.players.find((x) => x.id === p.id);
    if (prev) p.score = prev.score;
  });
  return { state: next, events };
}

export function legalRummikubActions(
  state: RummikubState,
  playerId: PlayerId,
): RummikubAction[] {
  if (state.phase !== "playing") return [];
  if (currentId(state) !== playerId) return [];
  const actor = player(state, playerId);

  const out: RummikubAction[] = [];
  if (state.pool.length > 0) {
    out.push({ type: "drawTile", playerId, payload: {} });
  }
  out.push(
    ...candidateCommitActions(
      state.table,
      actor.rack,
      actor.initialMeldDone,
      playerId,
    ),
  );
  if (state.pool.length === 0) {
    out.push({ type: "passTurn", playerId, payload: {} });
  }
  return out;
}

export function validateRummikubAction(
  state: RummikubState,
  action: RummikubAction,
): true | { error: string } {
  if (state.phase !== "playing") return { error: "illegal action" };
  if (currentId(state) !== action.playerId) return { error: "illegal action" };
  const actor = player(state, action.playerId);

  if (action.type === "drawTile") {
    return state.pool.length > 0 ? true : { error: "illegal action" };
  }
  if (action.type === "passTurn") {
    return state.pool.length === 0 ? true : { error: "illegal action" };
  }
  if (action.type === "commitTurn") {
    const result = evaluateCommit({
      table: state.table,
      rack: actor.rack,
      initialMeldDone: actor.initialMeldDone,
      groups: action.payload.groups,
    });
    return result.ok ? true : { error: result.error };
  }
  return { error: "illegal action" };
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
      events.push({
        type: "rummikub/drew",
        payload: { playerId: actor.id, count: 1 },
      });
      advanceTurn(draft);
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

    if (action.type === "commitTurn") {
      const result = evaluateCommit({
        table: draft.table,
        rack: actor.rack,
        initialMeldDone: actor.initialMeldDone,
        groups: action.payload.groups,
      });
      if (!result.ok) return;

      actor.rack = sortHand(result.remainingRack);
      draft.table = assignSetIds(draft.table, result.groups, () => `s${draft.setSeq++}`);
      if (!actor.initialMeldDone) actor.initialMeldDone = true;

      events.push({
        type: "rummikub/played",
        payload: {
          playerId: actor.id,
          setIds: draft.table.map((s) => s.id),
          points: result.points,
          tileCount: result.playedCount,
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
