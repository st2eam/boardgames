import { produce } from "immer";
import type { ApplyContext, Event, PlayerId } from "@bbge/core";
import {
  buildNimmtDeck,
  bullheadsOfCards,
  type NimmtCard,
} from "./cards";
import {
  BUFFALO_ID,
  buffaloSpecialCount,
  buildBuffaloSpecialDeck,
  maxPlayersForMode,
  minPlayersForMode,
  normalizeNimmtMode,
  type BuffaloSpecialKind,
  type NimmtMode,
} from "./modes";
import {
  bestRowIndex,
  flipDigits,
  initFanMarkers,
  isRowStopped,
  jumpCow,
  moveMountainMarker,
  moveParityMarker,
  rowCapacity,
  rowSlots,
} from "./placement";
import type {
  NimmtAction,
  NimmtConfig,
  NimmtPlayer,
  NimmtState,
  ResolveItem,
  RowMods,
} from "./state";

const HAND_SIZE = 10;
const DEFAULT_TARGET = 66;

function emptyRowMods(): RowMods[] {
  return [0, 1, 2, 3].map(() => ({ take7: false, stopped: false }));
}

function takeRowCards(
  state: NimmtState,
  playerId: PlayerId,
  rowIndex: number,
): number {
  const row = state.rows[rowIndex]!;
  const heads = bullheadsOfCards(row);
  if (playerId === BUFFALO_ID || state.mode === "buffalo") {
    if (playerId === BUFFALO_ID) {
      state.buffaloTaken.push(...row);
    } else {
      state.teamTaken.push(...row);
    }
  } else {
    const p = state.players.find((x) => x.id === playerId)!;
    p.taken.push(...row);
  }
  return heads;
}

function afterTookRow(state: NimmtState, rowIndex: number): void {
  if (state.rowMods[rowIndex]?.take7) {
    state.rowMods[rowIndex]!.take7 = false;
  }
  if (state.mode === "fan-even-odd") moveParityMarker(state);
  if (state.mode === "fan-mountain") moveMountainMarker(state);
}

function placeOnRow(
  state: NimmtState,
  playerId: PlayerId,
  card: NimmtCard,
  rowIndex: number,
  placeValue: number,
  events: Event[],
): void {
  const cap = rowCapacity(state, rowIndex);
  const slots = rowSlots(state, rowIndex);

  if (slots >= cap) {
    // Taking the row: numbers only; cow jumps afterward
    const hadCow = state.jumpingCowRow === rowIndex;
    const heads = takeRowCards(state, playerId, rowIndex);
    state.rows[rowIndex] = [{ ...card }];
    afterTookRow(state, rowIndex);
    events.push({
      type: "sixNimmt/tookRow",
      payload: {
        playerId,
        rowIndex,
        bullheads: heads,
        reason: "sixth",
        placeValue,
      },
    });
    if (hadCow) {
      jumpCow(state, rowIndex);
      // If cow lands on a full row, taker must take that too
      cascadeCowOverflow(state, playerId, events);
    }
    return;
  }

  state.rows[rowIndex]!.push({ ...card });
  events.push({
    type: "sixNimmt/placed",
    payload: {
      playerId,
      rowIndex,
      cardId: card.id,
      value: card.value,
      placeValue,
    },
  });

  if (state.jumpingCowRow === rowIndex) {
    jumpCow(state, rowIndex);
    cascadeCowOverflow(state, playerId, events);
  }
}

/** If cow jumps onto a row already at capacity, take that row. */
function cascadeCowOverflow(
  state: NimmtState,
  playerId: PlayerId,
  events: Event[],
): void {
  const cow = state.jumpingCowRow;
  if (cow == null) return;
  const cap = rowCapacity(state, cow);
  if (rowSlots(state, cow) <= cap) return;

  // Row is over capacity because cow arrived — take number cards; highest becomes starter? Rules: "The card that was the highest in that row becomes the new first card"
  const row = state.rows[cow]!;
  if (row.length === 0) return;
  const highest = row.reduce((a, b) => (a.value >= b.value ? a : b));
  const taken = row.filter((c) => c.id !== highest.id);
  const heads = bullheadsOfCards(taken);
  if (state.mode === "buffalo") {
    if (playerId === BUFFALO_ID) state.buffaloTaken.push(...taken);
    else state.teamTaken.push(...taken);
  } else {
    const p = state.players.find((x) => x.id === playerId);
    if (p) p.taken.push(...taken);
  }
  state.rows[cow] = [highest];
  afterTookRow(state, cow);
  events.push({
    type: "sixNimmt/tookRow",
    payload: {
      playerId,
      rowIndex: cow,
      bullheads: heads,
      reason: "cowJump",
    },
  });
  jumpCow(state, cow);
  cascadeCowOverflow(state, playerId, events);
}

function buffaloChooseRowIndex(state: NimmtState): number {
  let best = 0;
  let bestH = Infinity;
  let bestEnd = -Infinity;
  for (let i = 0; i < 4; i++) {
    if (isRowStopped(state, i)) continue;
    const h = bullheadsOfCards(state.rows[i]!);
    const end = state.rows[i]!.length
      ? state.rows[i]![state.rows[i]!.length - 1]!.value
      : -1;
    if (h < bestH || (h === bestH && end > bestEnd)) {
      bestH = h;
      bestEnd = end;
      best = i;
    }
  }
  return best;
}

/** @returns false if card is too low (needs chooseRow) */
function placeCard(
  state: NimmtState,
  playerId: PlayerId,
  card: NimmtCard,
  placeValue: number,
  events: Event[],
  forcedRow?: number,
): boolean {
  if (forcedRow != null) {
    const hadCow = state.jumpingCowRow === forcedRow;
    const heads = takeRowCards(state, playerId, forcedRow);
    state.rows[forcedRow] = [{ ...card }];
    afterTookRow(state, forcedRow);
    events.push({
      type: "sixNimmt/tookRow",
      payload: {
        playerId,
        rowIndex: forcedRow,
        bullheads: heads,
        reason: "tooLow",
        placeValue,
      },
    });
    if (hadCow) {
      jumpCow(state, forcedRow);
      cascadeCowOverflow(state, playerId, events);
    }
    return true;
  }

  // All unlocked rows stopped / no attach → too low
  const idx = bestRowIndex(state, placeValue);
  if (idx == null) return false;
  placeOnRow(state, playerId, card, idx, placeValue, events);
  return true;
}

function refillFaceUp(state: NimmtState): void {
  for (let i = 0; i < state.faceUpSpecials.length; i++) {
    if (state.faceUpSpecials[i] == null && state.specialDeck.length > 0) {
      state.faceUpSpecials[i] = state.specialDeck.shift()!;
    }
  }
}

function dealClassicRound(
  state: NimmtState,
  events: Event[],
  shuffled: NimmtCard[],
): void {
  state.deck = shuffled;
  for (const p of state.players) {
    p.hand = [];
    p.taken = [];
    if (state.mode === "fan-flippin") p.hasFlipToken = true;
  }
  state.rows = [[], [], [], []];
  state.selections = Object.fromEntries(
    state.players.map((p) => [p.id, null]),
  );
  state.resolveQueue = [];
  state.revealed = null;
  state.pending = null;
  state.rowMods = emptyRowMods();
  state.buffaloHand = [];
  state.buffaloRevealed = null;
  state.teamTaken = [];
  state.buffaloTaken = [];
  state.round += 1;
  state.trick = 1;
  state.buffaloWon = null;

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
  initFanMarkers(state);
  state.phase = "selecting";
  events.push({
    type: "sixNimmt/roundDealt",
    payload: { round: state.round, mode: state.mode },
  });
}

function dealBuffaloRound(
  state: NimmtState,
  events: Event[],
  shuffled: NimmtCard[],
): void {
  state.deck = shuffled;
  for (const p of state.players) {
    p.hand = [];
    p.taken = [];
    p.hasFlipToken = false;
  }
  state.rows = [[], [], [], []];
  state.selections = Object.fromEntries(
    state.players.map((p) => [p.id, null]),
  );
  state.resolveQueue = [];
  state.revealed = null;
  state.pending = null;
  state.rowMods = emptyRowMods();
  state.teamTaken = [];
  state.buffaloTaken = [];
  state.buffaloRevealed = null;
  state.round = 1;
  state.trick = 1;
  state.buffaloWon = null;

  for (let i = 0; i < HAND_SIZE; i++) {
    for (const p of state.players) {
      const c = state.deck.shift();
      if (c) p.hand.push(c);
    }
  }
  state.buffaloHand = [];
  for (let i = 0; i < HAND_SIZE; i++) {
    const c = state.deck.shift();
    if (c) state.buffaloHand.push(c);
  }
  for (let r = 0; r < 4; r++) {
    const c = state.deck.shift();
    if (c) state.rows[r] = [c];
  }
  for (const p of state.players) {
    p.hand.sort((a, b) => a.value - b.value);
  }

  const nSpecial = buffaloSpecialCount(state.players.length);
  const specials = buildBuffaloSpecialDeck();
  // Deterministic slice from shuffled deck order via seed already used; reshuffle specials with remaining deck rng — caller shuffled numbers; we rotate specials by seed hash
  const rot = state.seed.length % specials.length;
  const rotated = [
    ...specials.slice(rot),
    ...specials.slice(0, rot),
  ];
  state.specialDeck = rotated.slice(0, nSpecial);
  state.faceUpSpecials =
    nSpecial === 0 ? [] : [null, null].map(() => null);
  refillFaceUp(state);

  state.phase = "selecting";
  events.push({
    type: "sixNimmt/roundDealt",
    payload: { round: state.round, mode: state.mode },
  });
}

function startProDraft(
  state: NimmtState,
  events: Event[],
  shuffled: NimmtCard[],
): void {
  const n = state.players.length;
  const need = n * HAND_SIZE + 4;
  state.draftPool = shuffled.slice(0, need);
  state.deck = shuffled.slice(need);
  for (const p of state.players) {
    p.hand = [];
    p.taken = [];
    p.hasFlipToken = false;
  }
  state.rows = [[], [], [], []];
  state.selections = Object.fromEntries(
    state.players.map((p) => [p.id, null]),
  );
  state.round = 1;
  state.trick = 0;
  state.draftTurn = state.players[0]!.id;
  state.phase = "drafting";
  events.push({
    type: "sixNimmt/draftStarted",
    payload: { poolSize: state.draftPool.length },
  });
}

function finishProDraft(state: NimmtState, events: Event[]): void {
  const left = state.draftPool.splice(0, 4);
  state.rows = left.map((c) => [c]);
  state.draftPool = [];
  state.draftTurn = null;
  state.trick = 1;
  for (const p of state.players) {
    p.hand.sort((a, b) => a.value - b.value);
  }
  state.phase = "selecting";
  events.push({
    type: "sixNimmt/roundDealt",
    payload: { round: state.round, mode: state.mode },
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
    state.buffaloRevealed = null;
    for (const id of Object.keys(state.selections)) {
      state.selections[id] = null;
    }
    events.push({
      type: "sixNimmt/trickReady",
      payload: { trick: state.trick },
    });
    return;
  }

  if (state.mode === "buffalo") {
    let team = bullheadsOfCards(state.teamTaken);
    const buffalo = bullheadsOfCards(state.buffaloTaken);
    if (state.players.length <= 2) team *= 2;
    const won = team < buffalo;
    state.buffaloWon = won;
    state.phase = "finished";
    state.winners = won ? state.players.map((p) => p.id) : [];
    events.push({
      type: "sixNimmt/buffaloEnded",
      payload: { team, buffalo, won, doubled: state.players.length <= 2 },
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
    if (state.mode === "fan-flippin") {
      // Unused flip discarded at round end
      p.hasFlipToken = false;
    }
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

  if (state.mode === "pro") {
    startProDraft(state, events, shuffleFn());
  } else {
    dealClassicRound(state, events, shuffleFn());
  }
}

function processQueue(
  state: NimmtState,
  events: Event[],
  shuffleFn: () => NimmtCard[],
): void {
  while (state.resolveQueue.length > 0) {
    const next = state.resolveQueue[0]!;
    const ok = placeCard(
      state,
      next.playerId,
      next.card,
      next.placeValue,
      events,
    );
    if (!ok) {
      if (next.playerId === BUFFALO_ID) {
        const ri = buffaloChooseRowIndex(state);
        placeCard(
          state,
          next.playerId,
          next.card,
          next.placeValue,
          events,
          ri,
        );
        state.resolveQueue.shift();
        continue;
      }
      state.pending = {
        type: "chooseRow",
        playerId: next.playerId,
        card: next.card,
        placeValue: next.placeValue,
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

function buildResolveItems(state: NimmtState): ResolveItem[] {
  const items: ResolveItem[] = state.players.map((p) => {
    const sel = state.selections[p.id]!;
    let placeValue = sel.card.value;
    let usedFlip = false;
    if (sel.useFlip) {
      const flipped = flipDigits(sel.card.value);
      if (flipped != null) {
        placeValue = flipped;
        usedFlip = true;
      }
    }
    return {
      playerId: p.id,
      card: { ...sel.card },
      placeValue,
      usedFlip,
    };
  });

  if (state.mode === "buffalo" && state.buffaloRevealed) {
    items.push({
      playerId: BUFFALO_ID,
      card: { ...state.buffaloRevealed },
      placeValue: state.buffaloRevealed.value,
    });
  }

  // Ascending by placeValue; on ties, flip users go first
  items.sort((a, b) => {
    if (a.placeValue !== b.placeValue) return a.placeValue - b.placeValue;
    if (a.usedFlip && !b.usedFlip) return -1;
    if (!a.usedFlip && b.usedFlip) return 1;
    return 0;
  });
  return items;
}

function beginReveal(
  state: NimmtState,
  events: Event[],
  shuffleFn: () => NimmtCard[],
): void {
  if (state.mode === "buffalo") {
    const top = state.buffaloHand.shift();
    state.buffaloRevealed = top ?? null;
  }

  const items = buildResolveItems(state);
  state.revealed = items.map((x) => ({ ...x, card: { ...x.card } }));

  for (const p of state.players) {
    const sel = state.selections[p.id]!;
    p.hand = p.hand.filter((c) => c.id !== sel.card.id);
    if (sel.useFlip) p.hasFlipToken = false;
    state.selections[p.id] = null;
  }

  events.push({
    type: "sixNimmt/revealed",
    payload: {
      cards: items.map((i) => ({
        playerId: i.playerId,
        cardId: i.card.id,
        value: i.card.value,
        placeValue: i.placeValue,
        usedFlip: Boolean(i.usedFlip),
      })),
    },
  });

  if (state.mode === "buffalo" && state.faceUpSpecials.some((x) => x)) {
    state.resolveQueue = items;
    state.phase = "specials";
    events.push({ type: "sixNimmt/specialsOpen", payload: {} });
    return;
  }

  state.resolveQueue = items;
  processQueue(state, events, shuffleFn);
}

function applySpecial(
  state: NimmtState,
  action: Extract<NimmtAction, { type: "useSpecial" }>,
  events: Event[],
): string | null {
  const { kind, faceIndex } = action.payload;
  if (state.phase !== "specials") return "not in specials";
  if (faceIndex < 0 || faceIndex >= state.faceUpSpecials.length) {
    return "bad face index";
  }
  if (state.faceUpSpecials[faceIndex] !== kind) return "special mismatch";

  const consume = () => {
    state.faceUpSpecials[faceIndex] = null;
    refillFaceUp(state);
    events.push({
      type: "sixNimmt/specialUsed",
      payload: { playerId: action.playerId, ...action.payload, kind },
    });
  };

  if (kind === "take7") {
    const ri = action.payload.rowIndex;
    if (ri == null || ri < 0 || ri > 3) return "need row";
    if (state.rowMods[ri]!.stopped) return "row stopped";
    state.rowMods[ri]!.take7 = true;
    consume();
    return null;
  }

  if (kind === "stop") {
    const ri = action.payload.rowIndex;
    if (ri == null || ri < 0 || ri > 3) return "need row";
    state.rowMods[ri]!.stopped = true;
    consume();
    return null;
  }

  if (kind === "replace") {
    const tid = action.payload.targetPlayerId;
    if (!tid || tid === BUFFALO_ID) return "bad target";
    const item = state.resolveQueue.find((x) => x.playerId === tid);
    const p = state.players.find((x) => x.id === tid);
    if (!item || !p) return "bad target";
    // Return card to hand; they must have another card — pick lowest other for auto if no cardId
    const newId = action.payload.cardId;
    const nextCard = newId
      ? p.hand.find((c) => c.id === newId)
      : p.hand.find((c) => c.id !== item.card.id) ?? p.hand[0];
    if (!nextCard) return "no replacement card";
    p.hand = p.hand.filter((c) => c.id !== nextCard.id);
    p.hand.push(item.card);
    p.hand.sort((a, b) => a.value - b.value);
    item.card = { ...nextCard };
    item.placeValue = nextCard.value;
    item.usedFlip = false;
    // Order of others unchanged — re-sort only this relative? Rules: new card has no effect on existing order
    consume();
    return null;
  }

  if (kind === "insert") {
    const tid = action.payload.targetPlayerId;
    const ri = action.payload.rowIndex;
    const insertAt = action.payload.insertAt ?? 0;
    if (!tid || tid === BUFFALO_ID || ri == null) return "bad insert";
    const qIdx = state.resolveQueue.findIndex((x) => x.playerId === tid);
    if (qIdx < 0) return "not in queue";
    const item = state.resolveQueue[qIdx]!;
    if (isRowStopped(state, ri)) return "row stopped";
    const row = state.rows[ri]!;
    // Must keep ascending if inserted
    const nextRow = [...row];
    nextRow.splice(Math.max(0, Math.min(insertAt, nextRow.length)), 0, {
      ...item.card,
    });
    for (let i = 1; i < nextRow.length; i++) {
      if (nextRow[i]!.value <= nextRow[i - 1]!.value) return "not ascending";
    }
    const cap = rowCapacity(state, ri);
    const slotsAfter =
      nextRow.length + (state.jumpingCowRow === ri ? 1 : 0);
    if (slotsAfter > cap) {
      // take row; last card becomes new first
      const last = nextRow[nextRow.length - 1]!;
      const taken = nextRow.slice(0, -1);
      const heads = bullheadsOfCards(taken);
      state.teamTaken.push(...taken);
      state.rows[ri] = [last];
      afterTookRow(state, ri);
      events.push({
        type: "sixNimmt/tookRow",
        payload: {
          playerId: tid,
          rowIndex: ri,
          bullheads: heads,
          reason: "insertFull",
        },
      });
    } else {
      state.rows[ri] = nextRow;
    }
    state.resolveQueue.splice(qIdx, 1);
    consume();
    return null;
  }

  if (kind === "push") {
    const from = action.payload.fromRowIndex;
    const to = action.payload.toRowIndex;
    const cardId = action.payload.cardId;
    const insertAt = action.payload.insertAt ?? 0;
    if (from == null || to == null || !cardId) return "bad push";
    if (isRowStopped(state, from) || isRowStopped(state, to)) {
      return "row stopped";
    }
    const fromRow = state.rows[from]!;
    const ci = fromRow.findIndex((c) => c.id === cardId);
    if (ci < 0) return "card not in row";
    const [card] = fromRow.splice(ci, 1);
    if (!card) return "card missing";
    if (fromRow.length === 0) {
      // empty row — next placed card must go there (flag via stopped? use take7 false; store empty)
      // Rules: next played number card must go in empty row — track via special empty marker
      // Simplified: leave empty; placement prefers empty rows when present
    }
    const toRow = [...state.rows[to]!];
    toRow.splice(Math.max(0, Math.min(insertAt, toRow.length)), 0, card);
    for (let i = 1; i < toRow.length; i++) {
      if (toRow[i]!.value <= toRow[i - 1]!.value) {
        fromRow.splice(ci, 0, card); // revert
        return "not ascending";
      }
    }
    const cap = rowCapacity(state, to);
    const slots =
      toRow.length + (state.jumpingCowRow === to ? 1 : 0);
    if (slots > cap) {
      const last = toRow[toRow.length - 1]!;
      const taken = toRow.slice(0, -1);
      state.teamTaken.push(...taken);
      state.rows[to] = [last];
      afterTookRow(state, to);
      events.push({
        type: "sixNimmt/tookRow",
        payload: {
          playerId: action.playerId,
          rowIndex: to,
          bullheads: bullheadsOfCards(taken),
          reason: "pushFull",
        },
      });
    } else {
      state.rows[to] = toRow;
    }
    consume();
    return null;
  }

  if (kind === "first" || kind === "last") {
    const tid = action.payload.targetPlayerId;
    if (!tid || tid === BUFFALO_ID) return "bad target";
    const qIdx = state.resolveQueue.findIndex((x) => x.playerId === tid);
    if (qIdx < 0) return "not in queue";
    const [item] = state.resolveQueue.splice(qIdx, 1);
    if (!item) return "missing";
    if (kind === "first") state.resolveQueue.unshift(item);
    else state.resolveQueue.push(item);
    consume();
    return null;
  }

  if (kind === "sort") {
    const order = action.payload.order;
    if (!order?.length) return "need order";
    const map = new Map(state.resolveQueue.map((x) => [x.playerId, x]));
    if (order.length !== state.resolveQueue.length) return "bad order len";
    const nextQ: ResolveItem[] = [];
    for (const id of order) {
      const item = map.get(id);
      if (!item) return "bad order id";
      nextQ.push(item);
      map.delete(id);
    }
    if (map.size) return "order incomplete";
    state.resolveQueue = nextQ;
    consume();
    return null;
  }

  return "unknown special";
}

export function createNimmtState(
  config: NimmtConfig,
  ctx: ApplyContext,
): NimmtState {
  const mode = normalizeNimmtMode(config.mode ?? config.edition);
  const ids = config.playerIds;
  const minP = minPlayersForMode(mode);
  const maxP = maxPlayersForMode(mode);
  if (ids.length < minP || ids.length > maxP) {
    throw new Error(
      `6 nimmt! (${mode}) supports ${minP}–${maxP} players`,
    );
  }

  const players: NimmtPlayer[] = ids.map((id) => ({
    id,
    name: config.playerNames[id] ?? id,
    hand: [],
    taken: [],
    score: 0,
    hasFlipToken: mode === "fan-flippin",
  }));

  const state: NimmtState = {
    schemaVersion: 1,
    pluginId: "six-nimmt",
    seed: config.seed ?? "six-nimmt",
    mode,
    phase: "selecting",
    players,
    rows: [[], [], [], []],
    deck: [],
    draftPool: [],
    draftTurn: null,
    selections: Object.fromEntries(ids.map((id) => [id, null])),
    resolveQueue: [],
    revealed: null,
    pending: null,
    round: 0,
    trick: 0,
    winners: [],
    targetScore: Math.max(1, Math.floor(config.targetScore ?? DEFAULT_TARGET)),
    parityMarker: null,
    mountain: null,
    jumpingCowRow: null,
    buffaloHand: [],
    buffaloRevealed: null,
    teamTaken: [],
    buffaloTaken: [],
    specialDeck: [],
    faceUpSpecials: [],
    rowMods: emptyRowMods(),
    buffaloWon: null,
  };

  const events: Event[] = [];
  const shuffled = ctx.rng.shuffle(buildNimmtDeck());
  if (mode === "pro") {
    startProDraft(state, events, shuffled);
  } else if (mode === "buffalo") {
    dealBuffaloRound(state, events, shuffled);
  } else {
    dealClassicRound(state, events, shuffled);
  }
  return state;
}

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
      mode: prev.mode,
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

  if (action.type === "draftPick") {
    if (state.phase !== "drafting") return { error: "not drafting" };
    if (state.draftTurn !== me.id) return { error: "not your draft" };
    if (!state.draftPool.some((c) => c.id === action.payload.cardId)) {
      return { error: "card not in pool" };
    }
    return true;
  }

  if (action.type === "playCard") {
    if (state.phase !== "selecting") return { error: "not selecting" };
    if (state.selections[me.id]) return { error: "already played" };
    const card = me.hand.find((c) => c.id === action.payload.cardId);
    if (!card) return { error: "card not in hand" };
    if (action.payload.flip) {
      if (state.mode !== "fan-flippin") return { error: "no flip mode" };
      if (!me.hasFlipToken) return { error: "no flip token" };
      if (flipDigits(card.value) == null) return { error: "cannot flip" };
    }
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
    if (isRowStopped(state, ri)) return { error: "row stopped" };
    return true;
  }

  if (action.type === "beginPlace") {
    if (state.phase !== "specials") return { error: "not specials" };
    return true;
  }

  if (action.type === "removeStop") {
    if (state.phase !== "specials" && state.phase !== "selecting") {
      return { error: "cannot remove stop" };
    }
    const ri = action.payload.rowIndex;
    if (!state.rowMods[ri]?.stopped) return { error: "not stopped" };
    return true;
  }

  if (action.type === "useSpecial") {
    if (state.phase !== "specials") return { error: "not specials" };
    const { kind, faceIndex } = action.payload;
    if (state.faceUpSpecials[faceIndex] !== kind) {
      return { error: "special not available" };
    }
    if (
      (kind === "take7" || kind === "stop") &&
      (action.payload.rowIndex == null ||
        action.payload.rowIndex < 0 ||
        action.payload.rowIndex > 3)
    ) {
      return { error: "need row" };
    }
    if (
      (kind === "replace" ||
        kind === "insert" ||
        kind === "first" ||
        kind === "last") &&
      (!action.payload.targetPlayerId ||
        action.payload.targetPlayerId === BUFFALO_ID)
    ) {
      return { error: "need team target" };
    }
    if (kind === "sort" && !action.payload.order?.length) {
      return { error: "need order" };
    }
    if (
      kind === "push" &&
      (action.payload.fromRowIndex == null ||
        action.payload.toRowIndex == null ||
        !action.payload.cardId)
    ) {
      return { error: "need push params" };
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

  let next: NimmtState;
  try {
    next = produce(state, (draft) => {
    if (action.type === "draftPick") {
      const me = draft.players.find((p) => p.id === action.playerId)!;
      const idx = draft.draftPool.findIndex(
        (c) => c.id === action.payload.cardId,
      );
      const [card] = draft.draftPool.splice(idx, 1);
      if (card) me.hand.push(card);
      events.push({
        type: "sixNimmt/draftPicked",
        payload: { playerId: me.id, cardId: card!.id, value: card!.value },
      });
      const allFull = draft.players.every((p) => p.hand.length >= HAND_SIZE);
      if (allFull) {
        finishProDraft(draft, events);
      } else {
        const order = draft.players.map((p) => p.id);
        const i = order.indexOf(me.id);
        draft.draftTurn = order[(i + 1) % order.length]!;
      }
      return;
    }

    if (action.type === "playCard") {
      const me = draft.players.find((p) => p.id === action.playerId)!;
      const card = me.hand.find((c) => c.id === action.payload.cardId)!;
      draft.selections[me.id] = {
        card: { ...card },
        useFlip: Boolean(action.payload.flip),
      };
      events.push({
        type: "sixNimmt/cardPlayed",
        payload: {
          playerId: me.id,
          flip: Boolean(action.payload.flip),
        },
      });
      const allIn = draft.players.every((p) => draft.selections[p.id] != null);
      if (allIn) beginReveal(draft, events, shuffleFn);
      return;
    }

    if (action.type === "chooseRow") {
      const pending = draft.pending!;
      placeCard(
        draft,
        pending.playerId,
        pending.card,
        pending.placeValue,
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
      return;
    }

    if (action.type === "beginPlace") {
      draft.phase = "selecting"; // temp; processQueue sets real phase
      events.push({
        type: "sixNimmt/beginPlace",
        payload: { playerId: action.playerId },
      });
      processQueue(draft, events, shuffleFn);
      return;
    }

    if (action.type === "removeStop") {
      draft.rowMods[action.payload.rowIndex]!.stopped = false;
      events.push({
        type: "sixNimmt/stopRemoved",
        payload: {
          playerId: action.playerId,
          rowIndex: action.payload.rowIndex,
        },
      });
      return;
    }

    if (action.type === "useSpecial") {
      const err = applySpecial(draft, action, events);
      if (err) throw new Error(`special: ${err}`);
    }
  });
  } catch {
    return { state, events: [] };
  }

  return { state: next, events };
}

export function checkNimmtVictory(state: NimmtState) {
  if (state.phase !== "finished") return null;
  if (state.mode === "buffalo") {
    return {
      kind: "winner" as const,
      winners: state.winners,
      reason: state.buffaloWon ? "beat_buffalo" : "buffalo_won",
    };
  }
  return {
    kind: "winner" as const,
    winners: state.winners,
    reason: "lowest_bullheads",
  };
}

export function legalActions(state: NimmtState, playerId: PlayerId) {
  if (state.phase === "drafting" && state.draftTurn === playerId) {
    return state.draftPool.map((c) => ({
      type: "draftPick" as const,
      cardId: c.id,
    }));
  }

  if (state.phase === "chooseRow" && state.pending?.playerId === playerId) {
    return [0, 1, 2, 3]
      .filter((rowIndex) => !isRowStopped(state, rowIndex))
      .map((rowIndex) => ({
        type: "chooseRow" as const,
        rowIndex,
      }));
  }

  if (state.phase === "specials") {
    const acts: {
      type: string;
      kind?: BuffaloSpecialKind;
      faceIndex?: number;
      rowIndex?: number;
    }[] = [{ type: "beginPlace" }];
    state.faceUpSpecials.forEach((kind, faceIndex) => {
      if (!kind) return;
      if (kind === "take7" || kind === "stop") {
        for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
          acts.push({ type: "useSpecial", kind, faceIndex, rowIndex });
        }
      } else {
        acts.push({ type: "useSpecial", kind, faceIndex });
      }
    });
    for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
      if (state.rowMods[rowIndex]?.stopped) {
        acts.push({ type: "removeStop", rowIndex } as never);
      }
    }
    return acts;
  }

  if (state.phase !== "selecting") return [];
  if (state.selections[playerId]) return [];
  const me = state.players.find((p) => p.id === playerId);
  if (!me) return [];
  const out: {
    type: "playCard";
    cardId: string;
    flip?: boolean;
  }[] = [];
  for (const c of me.hand) {
    out.push({ type: "playCard", cardId: c.id });
    if (
      state.mode === "fan-flippin" &&
      me.hasFlipToken &&
      flipDigits(c.value) != null
    ) {
      out.push({ type: "playCard", cardId: c.id, flip: true });
    }
  }
  return out;
}

export function currentActorId(state: NimmtState): PlayerId | null {
  if (state.phase === "drafting") return state.draftTurn;
  if (state.phase === "chooseRow" && state.pending) {
    return state.pending.playerId;
  }
  if (state.phase === "specials") {
    // Any player may act; prefer first without having "priority"
    return state.players[0]?.id ?? null;
  }
  if (state.phase === "selecting") {
    for (const p of state.players) {
      if (!state.selections[p.id]) return p.id;
    }
  }
  return null;
}

export type { NimmtMode };
