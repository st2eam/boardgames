import { produce } from "immer";
import type { ApplyContext, Event, PlayerId } from "@bbge/core";
import {
  buildNimmtDeck,
  bullheadsOfCards,
  type NimmtCard,
} from "./cards";
import type {
  NimmtAction,
  NimmtConfig,
  NimmtPlayer,
  NimmtState,
  ResolveItem,
} from "./state";

const ROW_MAX = 5;
const HAND_SIZE = 10;
const DEFAULT_TARGET = 66;

function rowEnd(row: NimmtCard[]): number {
  return row[row.length - 1]!.value;
}

/** Rows where card can be placed (strictly greater than end). */
export function fittingRows(rows: NimmtCard[][], value: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (value > rowEnd(rows[i]!)) out.push(i);
  }
  return out;
}

/** Index of fitting row with minimal (value - end). */
export function bestRowIndex(
  rows: NimmtCard[][],
  value: number,
): number | null {
  const fits = fittingRows(rows, value);
  if (fits.length === 0) return null;
  let best = fits[0]!;
  let bestDiff = value - rowEnd(rows[best]!);
  for (const i of fits.slice(1)) {
    const d = value - rowEnd(rows[i]!);
    if (d < bestDiff) {
      best = i;
      bestDiff = d;
    }
  }
  return best;
}

function takeRow(
  state: NimmtState,
  playerId: PlayerId,
  rowIndex: number,
): number {
  const row = state.rows[rowIndex]!;
  const heads = bullheadsOfCards(row);
  const p = state.players.find((x) => x.id === playerId)!;
  p.taken.push(...row);
  return heads;
}

function placeOnRow(
  state: NimmtState,
  playerId: PlayerId,
  card: NimmtCard,
  rowIndex: number,
  events: Event[],
): void {
  const row = state.rows[rowIndex]!;
  if (row.length >= ROW_MAX) {
    const heads = takeRow(state, playerId, rowIndex);
    state.rows[rowIndex] = [card];
    events.push({
      type: "sixNimmt/tookRow",
      payload: { playerId, rowIndex, bullheads: heads, reason: "sixth" },
    });
  } else {
    row.push(card);
    events.push({
      type: "sixNimmt/placed",
      payload: {
        playerId,
        rowIndex,
        cardId: card.id,
        value: card.value,
      },
    });
  }
}

/** @returns false if card is too low (needs chooseRow) */
function placeCard(
  state: NimmtState,
  playerId: PlayerId,
  card: NimmtCard,
  events: Event[],
  forcedRow?: number,
): boolean {
  if (forcedRow != null) {
    const heads = takeRow(state, playerId, forcedRow);
    state.rows[forcedRow] = [card];
    events.push({
      type: "sixNimmt/tookRow",
      payload: {
        playerId,
        rowIndex: forcedRow,
        bullheads: heads,
        reason: "tooLow",
      },
    });
    return true;
  }
  const idx = bestRowIndex(state.rows, card.value);
  if (idx == null) return false;
  placeOnRow(state, playerId, card, idx, events);
  return true;
}

function dealRound(
  state: NimmtState,
  events: Event[],
  shuffled: NimmtCard[],
): void {
  state.deck = shuffled;
  for (const p of state.players) {
    p.hand = [];
    p.taken = [];
  }
  state.rows = [[], [], [], []];
  state.selections = Object.fromEntries(
    state.players.map((p) => [p.id, null]),
  );
  state.resolveQueue = [];
  state.revealed = null;
  state.pending = null;
  state.round += 1;
  state.trick = 1;

  for (let i = 0; i < HAND_SIZE; i++) {
    for (const p of state.players) {
      const c = state.deck.shift();
      if (c) p.hand.push(c);
    }
  }
  for (let r = 0; r < 4; r++) {
    const c = state.deck.shift();
    if (c) state.rows[r] = [c];
  }
  for (const p of state.players) {
    p.hand.sort((a, b) => a.value - b.value);
  }
  state.phase = "selecting";
  events.push({
    type: "sixNimmt/roundDealt",
    payload: { round: state.round },
  });
}

function afterTrickResolved(
  state: NimmtState,
  events: Event[],
  shuffleFn: () => NimmtCard[],
): void {
  const handsLeft = state.players.some((p) => p.hand.length > 0);
  if (handsLeft) {
    state.phase = "selecting";
    state.trick += 1;
    state.revealed = null;
    for (const id of Object.keys(state.selections)) {
      state.selections[id] = null;
    }
    events.push({
      type: "sixNimmt/trickReady",
      payload: { trick: state.trick },
    });
    return;
  }

  for (const p of state.players) {
    const add = bullheadsOfCards(p.taken);
    p.score += add;
    events.push({
      type: "sixNimmt/roundScored",
      payload: { playerId: p.id, gained: add, total: p.score },
    });
    p.taken = [];
  }

  const hit = state.players.some((p) => p.score >= state.targetScore);
  if (hit) {
    state.phase = "finished";
    const min = Math.min(...state.players.map((p) => p.score));
    state.winners = state.players
      .filter((p) => p.score === min)
      .map((p) => p.id);
    events.push({
      type: "sixNimmt/matchEnded",
      payload: {
        winners: state.winners,
        scores: Object.fromEntries(
          state.players.map((p) => [p.id, p.score]),
        ),
      },
    });
    return;
  }

  dealRound(state, events, shuffleFn());
}

function processQueue(
  state: NimmtState,
  events: Event[],
  shuffleFn: () => NimmtCard[],
): void {
  while (state.resolveQueue.length > 0) {
    const next = state.resolveQueue[0]!;
    const ok = placeCard(state, next.playerId, next.card, events);
    if (!ok) {
      state.pending = {
        type: "chooseRow",
        playerId: next.playerId,
        card: next.card,
      };
      state.phase = "chooseRow";
      events.push({
        type: "sixNimmt/needChooseRow",
        payload: { playerId: next.playerId, cardId: next.card.id },
      });
      return;
    }
    state.resolveQueue.shift();
  }
  state.pending = null;
  afterTrickResolved(state, events, shuffleFn);
}

function beginResolve(
  state: NimmtState,
  events: Event[],
  shuffleFn: () => NimmtCard[],
): void {
  const items: ResolveItem[] = state.players.map((p) => ({
    playerId: p.id,
    card: state.selections[p.id]!,
  }));
  items.sort((a, b) => a.card.value - b.card.value);
  state.revealed = items.map((x) => ({
    playerId: x.playerId,
    card: { ...x.card },
  }));
  for (const p of state.players) {
    const sel = state.selections[p.id]!;
    p.hand = p.hand.filter((c) => c.id !== sel.id);
    state.selections[p.id] = null;
  }
  state.resolveQueue = items;
  events.push({
    type: "sixNimmt/revealed",
    payload: {
      cards: items.map((i) => ({
        playerId: i.playerId,
        cardId: i.card.id,
        value: i.card.value,
      })),
    },
  });
  processQueue(state, events, shuffleFn);
}

export function createNimmtState(
  config: NimmtConfig,
  ctx: ApplyContext,
): NimmtState {
  const ids = config.playerIds;
  if (ids.length < 2 || ids.length > 10) {
    throw new Error("6 nimmt! supports 2–10 players");
  }
  const players: NimmtPlayer[] = ids.map((id) => ({
    id,
    name: config.playerNames[id] ?? id,
    hand: [],
    taken: [],
    score: 0,
  }));
  const state: NimmtState = {
    schemaVersion: 1,
    pluginId: "six-nimmt",
    seed: config.seed ?? "six-nimmt",
    phase: "selecting",
    players,
    rows: [[], [], [], []],
    deck: [],
    selections: Object.fromEntries(ids.map((id) => [id, null])),
    resolveQueue: [],
    revealed: null,
    pending: null,
    round: 0,
    trick: 0,
    winners: [],
    targetScore: Math.max(1, Math.floor(config.targetScore ?? DEFAULT_TARGET)),
  };
  const events: Event[] = [];
  dealRound(state, events, ctx.rng.shuffle(buildNimmtDeck()));
  return state;
}

/** Rematch: same seats, scores reset, new shuffle. */
export function continueNimmtMatch(
  prev: NimmtState,
  ctx: ApplyContext,
): NimmtState {
  return createNimmtState(
    {
      playerIds: prev.players.map((p) => p.id),
      playerNames: Object.fromEntries(
        prev.players.map((p) => [p.id, p.name]),
      ),
      seed: `${prev.seed}-${ctx.rng.int(0, 1_000_000)}`,
      targetScore: prev.targetScore,
    },
    ctx,
  );
}

export function validateNimmtAction(
  state: NimmtState,
  action: NimmtAction,
): true | { error: string } {
  const me = state.players.find((p) => p.id === action.playerId);
  if (!me) return { error: "unknown player" };

  if (action.type === "playCard") {
    if (state.phase !== "selecting") return { error: "not selecting" };
    if (state.selections[me.id]) return { error: "already played" };
    const card = me.hand.find((c) => c.id === action.payload.cardId);
    if (!card) return { error: "card not in hand" };
    return true;
  }

  if (action.type === "chooseRow") {
    if (state.phase !== "chooseRow" || !state.pending) {
      return { error: "not choosing row" };
    }
    if (state.pending.playerId !== me.id) return { error: "not your choose" };
    const ri = action.payload.rowIndex;
    if (!Number.isInteger(ri) || ri < 0 || ri > 3) {
      return { error: "bad row" };
    }
    return true;
  }

  return { error: "unknown action" };
}

export function applyNimmtAction(
  state: NimmtState,
  action: NimmtAction,
  ctx: ApplyContext,
): { state: NimmtState; events: Event[] } {
  const events: Event[] = [];
  const shuffleFn = () => ctx.rng.shuffle(buildNimmtDeck());

  const next = produce(state, (draft) => {
    if (action.type === "playCard") {
      const me = draft.players.find((p) => p.id === action.playerId)!;
      const card = me.hand.find((c) => c.id === action.payload.cardId)!;
      draft.selections[me.id] = { ...card };
      events.push({
        type: "sixNimmt/cardPlayed",
        payload: { playerId: me.id },
      });
      const allIn = draft.players.every((p) => draft.selections[p.id] != null);
      if (allIn) beginResolve(draft, events, shuffleFn);
      return;
    }

    if (action.type === "chooseRow") {
      const pending = draft.pending!;
      placeCard(
        draft,
        pending.playerId,
        pending.card,
        events,
        action.payload.rowIndex,
      );
      draft.resolveQueue.shift();
      draft.pending = null;
      events.push({
        type: "sixNimmt/choseRow",
        payload: {
          playerId: pending.playerId,
          rowIndex: action.payload.rowIndex,
        },
      });
      processQueue(draft, events, shuffleFn);
    }
  });

  return { state: next, events };
}

export function checkNimmtVictory(state: NimmtState) {
  if (state.phase !== "finished") return null;
  return {
    kind: "winner" as const,
    winners: state.winners,
    reason: "lowest_bullheads",
  };
}

export function legalActions(state: NimmtState, playerId: PlayerId) {
  if (state.phase === "chooseRow" && state.pending?.playerId === playerId) {
    return [0, 1, 2, 3].map((rowIndex) => ({
      type: "chooseRow" as const,
      rowIndex,
    }));
  }
  if (state.phase !== "selecting") return [];
  if (state.selections[playerId]) return [];
  const me = state.players.find((p) => p.id === playerId);
  if (!me) return [];
  return me.hand.map((c) => ({
    type: "playCard" as const,
    cardId: c.id,
  }));
}

/** Who should act next (for AI loop / hotseat). */
export function currentActorId(state: NimmtState): PlayerId | null {
  if (state.phase === "chooseRow" && state.pending) {
    return state.pending.playerId;
  }
  if (state.phase === "selecting") {
    for (const p of state.players) {
      if (!state.selections[p.id]) return p.id;
    }
  }
  return null;
}
