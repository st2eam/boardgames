import { produce } from "immer";
import type { ApplyContext, Event, PlayerId } from "@bbge/core";
import {
  abilityKind,
  buildCaboDeck,
  sumSlots,
  type CaboCard,
} from "./cards";
import type {
  CaboAction,
  CaboConfig,
  CaboPlayer,
  CaboSlot,
  CaboState,
} from "./state";

const DEFAULT_TARGET = 100;
const RESET_TO = 50;
const SETUP_PEEKS = 2;
const SLOTS_PER_PLAYER = 4;

function player(state: CaboState, id: PlayerId): CaboPlayer {
  const p = state.players.find((x) => x.id === id);
  if (!p) throw new Error(`unknown player ${id}`);
  return p;
}

function currentId(state: CaboState): PlayerId {
  return state.turnOrder[state.currentIndex]!;
}

function allSetupDone(state: CaboState): boolean {
  return state.players.every((p) => state.setupPeeks[p.id]?.length === SETUP_PEEKS);
}

function isKamikaze(slots: CaboSlot[]): boolean {
  if (slots.length !== SLOTS_PER_PLAYER) return false;
  const vals = slots.map((s) => s.card.value).sort((a, b) => a - b);
  return vals.join(",") === "12,12,13,13";
}

function computeRoundScores(state: CaboState): Record<string, number> {
  const out: Record<string, number> = {};

  if (state.caboCallerId) {
    for (const p of state.players) {
      if (isKamikaze(p.slots)) {
        for (const q of state.players) {
          out[q.id] = q.id === p.id ? 0 : 50;
        }
        return out;
      }
    }
  }

  const sums = Object.fromEntries(
    state.players.map((p) => [p.id, sumSlots(p.slots)]),
  );
  const min = Math.min(...Object.values(sums));

  for (const p of state.players) {
    const sum = sums[p.id]!;
    if (p.id === state.caboCallerId) {
      out[p.id] = sum <= min ? 0 : sum + 10;
    } else {
      out[p.id] = sum;
    }
  }
  return out;
}

function matchOverAfterRound(state: CaboState): boolean {
  return state.players.some((p) => {
    if (p.cumulativeScore < state.targetScore) return false;
    if (p.cumulativeScore === state.targetScore && !p.scoreResetUsed) {
      return false;
    }
    return true;
  });
}

function pickWinners(state: CaboState, roundScores: Record<string, number>): PlayerId[] {
  const minCum = Math.min(...state.players.map((p) => p.cumulativeScore));
  const tied = state.players.filter((p) => p.cumulativeScore === minCum);
  if (tied.length === 1) return [tied[0]!.id];
  let best = tied[0]!;
  for (const p of tied.slice(1)) {
    if ((roundScores[p.id] ?? Infinity) < (roundScores[best.id] ?? Infinity)) {
      best = p;
    }
  }
  return [best.id];
}

function finishRound(state: CaboState, events: Event[], reason: string): void {
  for (const p of state.players) {
    for (const s of p.slots) s.faceUp = true;
  }

  const roundScores = computeRoundScores(state);
  state.roundScores = roundScores;

  for (const p of state.players) {
    const gained = roundScores[p.id] ?? 0;
    p.cumulativeScore += gained;
    if (
      p.cumulativeScore === state.targetScore &&
      !p.scoreResetUsed
    ) {
      p.cumulativeScore = RESET_TO;
      p.scoreResetUsed = true;
      events.push({
        type: "cabo/scoreReset",
        payload: { playerId: p.id, to: RESET_TO },
      });
    }
    events.push({
      type: "cabo/roundScored",
      payload: {
        playerId: p.id,
        round: roundScores[p.id],
        cumulative: p.cumulativeScore,
      },
    });
  }

  state.phase = "finished";
  state.pendingDraw = null;
  state.pendingAbility = null;
  state.pendingModal = null;
  state.finalTurnQueue = [];

  if (matchOverAfterRound(state)) {
    state.matchOver = true;
    state.winners = pickWinners(state, roundScores);
    events.push({
      type: "cabo/matchEnded",
      payload: {
        winners: state.winners,
        scores: Object.fromEntries(
          state.players.map((p) => [p.id, p.cumulativeScore]),
        ),
        reason,
      },
    });
  } else {
    state.winners = [];
    events.push({
      type: "cabo/roundEnded",
      payload: { reason, roundScores },
    });
  }
}

function advanceSetupTurn(state: CaboState): void {
  const n = state.turnOrder.length;
  for (let i = 1; i <= n; i++) {
    const idx = (state.currentIndex + i) % n;
    const id = state.turnOrder[idx]!;
    if (!state.setupPeeks[id]?.length) {
      state.currentIndex = idx;
      return;
    }
  }
}

function advancePlayingTurn(state: CaboState): void {
  state.currentIndex = (state.currentIndex + 1) % state.turnOrder.length;
}

function buildFinalTurnQueue(state: CaboState, callerId: PlayerId): PlayerId[] {
  const callerIdx = state.turnOrder.indexOf(callerId);
  const queue: PlayerId[] = [];
  for (let i = 1; i < state.turnOrder.length; i++) {
    const id = state.turnOrder[(callerIdx + i) % state.turnOrder.length]!;
    if (id !== callerId) queue.push(id);
  }
  return queue;
}

function endTurn(state: CaboState, events: Event[]): void {
  if (state.pendingDraw || state.pendingAbility || state.pendingModal) return;

  if (state.phase === "caboFinalTurns") {
    if (state.finalTurnQueue[0] === currentId(state)) {
      state.finalTurnQueue.shift();
    }
    if (state.finalTurnQueue.length === 0) {
      finishRound(state, events, "cabo");
      return;
    }
    state.currentIndex = state.turnOrder.indexOf(state.finalTurnQueue[0]!);
    return;
  }

  if (state.deck.length === 0) {
    finishRound(state, events, "deck_empty");
    return;
  }

  advancePlayingTurn(state);
}

function applySwap(
  draft: CaboState,
  actorId: PlayerId,
  slotIndices: number[],
  events: Event[],
  ctx: ApplyContext,
): void {
  const me = player(draft, actorId);
  const draw = draft.pendingDraw!;
  const indices = [...new Set(slotIndices)].sort((a, b) => a - b);

  if (indices.length === 0) throw new Error("no slots");

  for (const i of indices) {
    const slot = me.slots[i];
    if (!slot) throw new Error("bad slot");
    if (!slot.faceUp && draw.source === "discard") {
      /* ok */
    } else if (!slot.faceUp) {
      /* ok */
    } else if (draw.source === "discard") {
      throw new Error("discard swap needs face-down");
    }
  }

  // Bezier 2e: cards taken from the discard pile stay face up in tableau.
  const stayFaceUp = draw.source === "discard";

  if (indices.length === 1) {
    const i = indices[0]!;
    const old = me.slots[i]!;
    draft.discard.push(old.card);
    me.slots[i] = { card: draw.card, faceUp: stayFaceUp };
    draft.pendingDraw = null;
    events.push({
      type: "cabo/swapped",
      payload: {
        playerId: actorId,
        slotIndices: indices,
        success: true,
        discarded: [old.card.value],
        faceUp: stayFaceUp,
      },
    });
    endTurn(draft, events);
    return;
  }

  const revealed = indices.map((i) => me.slots[i]!);
  const values = revealed.map((s) => s.card.value);
  const allSame = values.every((v) => v === values[0]);

  if (allSame) {
    for (let j = indices.length - 1; j >= 0; j--) {
      const i = indices[j]!;
      draft.discard.push(me.slots[i]!.card);
      me.slots.splice(i, 1);
    }
    const insertAt = Math.min(...indices);
    me.slots.splice(insertAt, 0, { card: draw.card, faceUp: stayFaceUp });
    draft.pendingDraw = null;
    events.push({
      type: "cabo/swapped",
      payload: {
        playerId: actorId,
        slotIndices: indices,
        success: true,
        discarded: values,
        faceUp: stayFaceUp,
      },
    });
    endTurn(draft, events);
    return;
  }

  for (const i of indices) {
    me.slots[i]!.faceUp = true;
  }
  me.slots.push({ card: draw.card, faceUp: stayFaceUp });
  draft.pendingDraw = null;

  if (indices.length >= 3 && draft.deck.length > 0) {
    const extra = draft.deck.shift()!;
    me.slots.push({ card: extra, faceUp: false });
    events.push({
      type: "cabo/extraDraw",
      payload: { playerId: actorId, value: extra.value },
    });
  }

  events.push({
    type: "cabo/swapped",
    payload: {
      playerId: actorId,
      slotIndices: indices,
      success: false,
      revealed: values,
    },
  });
  endTurn(draft, events);
}

export function createCaboState(
  config: CaboConfig,
  ctx: ApplyContext,
): CaboState {
  const ids = config.playerIds;
  if (ids.length < 2 || ids.length > 4) {
    throw new Error("CABO supports 2–4 players");
  }

  const deck = ctx.rng.shuffle(buildCaboDeck());
  const players: CaboPlayer[] = ids.map((id) => ({
    id,
    name: config.playerNames[id] ?? id,
    slots: [],
    cumulativeScore: 0,
    scoreResetUsed: false,
    knownSlots: [],
  }));

  for (let r = 0; r < SLOTS_PER_PLAYER; r++) {
    for (const p of players) {
      const c = deck.shift();
      if (c) p.slots.push({ card: c, faceUp: false });
    }
  }

  const discardTop = deck.shift();
  const discard = discardTop ? [discardTop] : [];

  const state: CaboState = {
    schemaVersion: 1,
    pluginId: "cabo",
    seed: config.seed ?? "cabo",
    phase: "setupPeek",
    players,
    turnOrder: ids.slice(),
    currentIndex: 0,
    deck,
    discard,
    pendingDraw: null,
    pendingAbility: null,
    pendingModal: null,
    caboCallerId: null,
    finalTurnQueue: [],
    round: 1,
    targetScore: Math.max(1, Math.floor(config.targetScore ?? DEFAULT_TARGET)),
    winners: [],
    matchOver: false,
    roundScores: null,
    setupPeeks: Object.fromEntries(ids.map((id) => [id, null])),
  };

  return state;
}

export function continueCaboMatch(
  prev: CaboState,
  ctx: ApplyContext,
): CaboState {
  const resetMatch = prev.matchOver;
  const ids = prev.turnOrder.slice();
  const deck = ctx.rng.shuffle(buildCaboDeck());
  const players: CaboPlayer[] = ids.map((id) => {
    const old = prev.players.find((p) => p.id === id)!;
    return {
      id,
      name: old.name,
      slots: [],
      cumulativeScore: resetMatch ? 0 : old.cumulativeScore,
      scoreResetUsed: resetMatch ? false : old.scoreResetUsed,
      knownSlots: [],
    };
  });

  for (let r = 0; r < SLOTS_PER_PLAYER; r++) {
    for (const p of players) {
      const c = deck.shift();
      if (c) p.slots.push({ card: c, faceUp: false });
    }
  }

  const discardTop = deck.shift();
  const startIndex = resetMatch
    ? 0
    : (prev.currentIndex + 1) % ids.length;

  return {
    schemaVersion: 1,
    pluginId: "cabo",
    seed: `${prev.seed}-${ctx.rng.int(0, 1_000_000)}`,
    phase: "setupPeek",
    players,
    turnOrder: ids,
    currentIndex: startIndex,
    deck,
    discard: discardTop ? [discardTop] : [],
    pendingDraw: null,
    pendingAbility: null,
    pendingModal: null,
    caboCallerId: null,
    finalTurnQueue: [],
    round: resetMatch ? 1 : prev.round + 1,
    targetScore: prev.targetScore,
    winners: [],
    matchOver: false,
    roundScores: null,
    setupPeeks: Object.fromEntries(ids.map((id) => [id, null])),
  };
}

export function currentActorId(state: CaboState): PlayerId | null {
  if (state.phase === "finished") return null;
  if (state.pendingModal) return state.pendingModal.playerId;
  if (state.phase === "setupPeek") {
    for (const id of state.turnOrder) {
      if (!state.setupPeeks[id]?.length) return id;
    }
    return state.turnOrder[0] ?? null;
  }
  if (state.pendingAbility) return currentId(state);
  if (state.pendingDraw) return currentId(state);
  if (state.phase === "caboFinalTurns") {
    return state.finalTurnQueue[0] ?? null;
  }
  return currentId(state);
}

export function legalActions(
  state: CaboState,
  playerId: PlayerId,
): Omit<CaboAction, "clientActionId">[] {
  const actor = currentActorId(state);
  if (actor !== playerId) return [];

  if (state.pendingModal?.playerId === playerId) {
    return [{ type: "acknowledgeModal", playerId, payload: {} }];
  }

  if (state.phase === "setupPeek") {
    return [
      {
        type: "setupPeek",
        playerId,
        payload: { slotIndices: [] },
      },
    ];
  }

  if (state.pendingAbility) {
    const kind = state.pendingAbility.kind;
    const acts: Omit<CaboAction, "clientActionId">[] = [
      { type: "skipAbility", playerId, payload: {} },
    ];
    const me = player(state, playerId);
    if (kind === "peek") {
      for (let i = 0; i < me.slots.length; i++) {
        if (!me.slots[i]!.faceUp) {
          acts.push({
            type: "resolveAbilityPeek",
            playerId,
            payload: { slotIndex: i },
          });
        }
      }
    } else if (kind === "spy") {
      for (const other of state.players) {
        if (other.id === playerId) continue;
        for (let i = 0; i < other.slots.length; i++) {
          if (!other.slots[i]!.faceUp) {
            acts.push({
              type: "resolveAbilitySpy",
              playerId,
              payload: { targetPlayerId: other.id, slotIndex: i },
            });
          }
        }
      }
    } else if (kind === "swap") {
      for (let oi = 0; oi < me.slots.length; oi++) {
        for (const other of state.players) {
          if (other.id === playerId) continue;
          for (let ti = 0; ti < other.slots.length; ti++) {
            acts.push({
              type: "resolveAbilitySwap",
              playerId,
              payload: {
                ownSlotIndex: oi,
                targetPlayerId: other.id,
                targetSlotIndex: ti,
              },
            });
          }
        }
      }
    }
    return acts;
  }

  if (state.pendingDraw) {
    const me = player(state, playerId);
    const faceDown = me.slots
      .map((s, i) => (!s.faceUp ? i : -1))
      .filter((i) => i >= 0);
    const acts: Omit<CaboAction, "clientActionId">[] = [];
    // Discard-pile takes must replace a face-down card (cannot re-discard).
    if (state.pendingDraw.source === "deck") {
      acts.push({
        type: "discardDrawn",
        playerId,
        payload: {},
      });
      const ak = abilityKind(state.pendingDraw.card.value);
      if (ak) {
        acts.push({
          type: "discardDrawn",
          playerId,
          payload: { useAbility: true },
        });
      }
    }
    if (faceDown.length > 0) {
      acts.push({
        type: "swapWithDrawn",
        playerId,
        payload: { slotIndices: faceDown.slice(0, 1) },
      });
      if (faceDown.length >= 2) {
        acts.push({
          type: "swapWithDrawn",
          playerId,
          payload: { slotIndices: faceDown.slice(0, 2) },
        });
      }
    }
    return acts;
  }

  if (state.phase !== "playing" && state.phase !== "caboFinalTurns") {
    return [];
  }

  const acts: Omit<CaboAction, "clientActionId">[] = [];
  if (state.deck.length > 0) {
    acts.push({ type: "drawDeck", playerId, payload: {} });
  }
  if (state.discard.length > 0) {
    acts.push({ type: "drawDiscard", playerId, payload: {} });
  }
  if (!state.caboCallerId && state.phase === "playing") {
    acts.push({ type: "callCabo", playerId, payload: {} });
  }
  return acts;
}

export function validateCaboAction(
  state: CaboState,
  action: CaboAction,
): true | { error: string } {
  const me = state.players.find((p) => p.id === action.playerId);
  if (!me) return { error: "unknown player" };

  const legal = legalActions(state, action.playerId);
  if (legal.length === 0) return { error: "not your turn" };

  if (action.type === "setupPeek") {
    if (state.phase !== "setupPeek") return { error: "not setup" };
    const idx = action.payload.slotIndices;
    if (idx.length !== SETUP_PEEKS) return { error: "pick two slots" };
    if (new Set(idx).size !== SETUP_PEEKS) return { error: "distinct slots" };
    for (const i of idx) {
      if (i < 0 || i >= me.slots.length) return { error: "bad slot" };
    }
    if (state.setupPeeks[action.playerId]) return { error: "already peeked" };
    return true;
  }

  if (action.type === "acknowledgeModal") {
    if (!state.pendingModal || state.pendingModal.playerId !== action.playerId) {
      return { error: "no modal" };
    }
    return true;
  }

  if (action.type === "drawDeck") {
    if (state.pendingDraw) return { error: "resolve draw first" };
    if (!state.deck.length) return { error: "empty deck" };
    return true;
  }

  if (action.type === "drawDiscard") {
    if (state.pendingDraw) return { error: "resolve draw first" };
    if (!state.discard.length) return { error: "empty discard" };
    return true;
  }

  if (action.type === "callCabo") {
    if (state.caboCallerId) return { error: "cabo already called" };
    if (state.phase !== "playing") return { error: "cannot call now" };
    return true;
  }

  if (action.type === "discardDrawn") {
    if (!state.pendingDraw) return { error: "no drawn card" };
    if (state.pendingDraw.source !== "deck") {
      return { error: "must swap discard take" };
    }
    if (action.payload.useAbility) {
      const ak = abilityKind(state.pendingDraw.card.value);
      if (!ak) return { error: "no ability" };
    }
    return true;
  }

  if (action.type === "swapWithDrawn") {
    if (!state.pendingDraw) return { error: "no drawn card" };
    const idx = action.payload.slotIndices;
    if (idx.length === 0) return { error: "need slots" };
    for (const i of idx) {
      if (i < 0 || i >= me.slots.length) return { error: "bad slot" };
      if (!me.slots[i]!.faceUp) continue;
      if (state.pendingDraw.source === "discard") {
        return { error: "must swap face-down" };
      }
    }
    return true;
  }

  if (action.type === "skipAbility") {
    if (!state.pendingAbility) return { error: "no ability" };
    return true;
  }

  if (action.type === "resolveAbilityPeek") {
    if (state.pendingAbility?.kind !== "peek") return { error: "not peek" };
    const i = action.payload.slotIndex;
    if (i < 0 || i >= me.slots.length || me.slots[i]!.faceUp) {
      return { error: "bad slot" };
    }
    return true;
  }

  if (action.type === "resolveAbilitySpy") {
    if (state.pendingAbility?.kind !== "spy") return { error: "not spy" };
    const other = state.players.find((p) => p.id === action.payload.targetPlayerId);
    if (!other || other.id === action.playerId) return { error: "bad target" };
    const i = action.payload.slotIndex;
    if (i < 0 || i >= other.slots.length || other.slots[i]!.faceUp) {
      return { error: "bad slot" };
    }
    return true;
  }

  if (action.type === "resolveAbilitySwap") {
    if (state.pendingAbility?.kind !== "swap") return { error: "not swap" };
    const other = state.players.find(
      (p) => p.id === action.payload.targetPlayerId,
    );
    if (!other || other.id === action.playerId) return { error: "bad target" };
    const { ownSlotIndex, targetSlotIndex } = action.payload;
    if (ownSlotIndex < 0 || ownSlotIndex >= me.slots.length) {
      return { error: "bad own slot" };
    }
    if (targetSlotIndex < 0 || targetSlotIndex >= other.slots.length) {
      return { error: "bad target slot" };
    }
    return true;
  }

  return { error: "unknown action" };
}

export function applyCaboAction(
  state: CaboState,
  action: CaboAction,
  ctx: ApplyContext,
): { state: CaboState; events: Event[] } {
  const events: Event[] = [];
  let next: CaboState;
  try {
    next = produce(state, (draft) => {
      if (action.type === "setupPeek") {
        const idx = action.payload.slotIndices;
        if (idx.length !== SETUP_PEEKS) throw new Error("need two slots");
        draft.setupPeeks[action.playerId] = idx;
        const me = player(draft, action.playerId);
        const values = idx.map((i) => me.slots[i]!.card.value);
        for (const i of idx) {
          if (!me.knownSlots.includes(i)) me.knownSlots.push(i);
        }
        draft.pendingModal = {
          type: "setupPeek",
          playerId: action.playerId,
          slotIndices: idx,
          values,
        };
        events.push({
          type: "cabo/setupPeeked",
          payload: { playerId: action.playerId, slotIndices: idx },
        });
        return;
      }

      if (action.type === "drawDeck") {
        const card = draft.deck.shift()!;
        draft.pendingDraw = { source: "deck", card };
        events.push({
          type: "cabo/drewDeck",
          payload: { playerId: action.playerId, value: card.value },
        });
        if (draft.deck.length === 0) {
          events.push({ type: "cabo/deckEmpty", payload: {} });
        }
        return;
      }

      if (action.type === "drawDiscard") {
        const card = draft.discard.pop()!;
        draft.pendingDraw = { source: "discard", card };
        events.push({
          type: "cabo/drewDiscard",
          payload: { playerId: action.playerId, value: card.value },
        });
        return;
      }

      if (action.type === "discardDrawn") {
        const draw = draft.pendingDraw!;
        draft.discard.push(draw.card);
        draft.pendingDraw = null;
        events.push({
          type: "cabo/discarded",
          payload: {
            playerId: action.playerId,
            value: draw.card.value,
            fromDeck: draw.source === "deck",
          },
        });
        if (action.payload.useAbility) {
          const kind = abilityKind(draw.card.value)!;
          draft.pendingAbility = { kind };
          events.push({
            type: "cabo/abilityOffered",
            payload: { playerId: action.playerId, kind },
          });
          return;
        }
        endTurn(draft, events);
        return;
      }

      if (action.type === "swapWithDrawn") {
        applySwap(draft, action.playerId, action.payload.slotIndices, events, ctx);
        return;
      }

      if (action.type === "skipAbility") {
        draft.pendingAbility = null;
        events.push({
          type: "cabo/abilitySkipped",
          payload: { playerId: action.playerId },
        });
        endTurn(draft, events);
        return;
      }

      if (action.type === "resolveAbilityPeek") {
        const me = player(draft, action.playerId);
        const i = action.payload.slotIndex;
        const val = me.slots[i]!.card.value;
        if (!me.knownSlots.includes(i)) me.knownSlots.push(i);
        draft.pendingAbility = null;
        draft.pendingModal = {
          type: "peekOwn",
          playerId: action.playerId,
          slotIndex: i,
          value: val,
        };
        events.push({
          type: "cabo/peeked",
          payload: { playerId: action.playerId, slotIndex: i, value: val },
        });
        return;
      }

      if (action.type === "resolveAbilitySpy") {
        const other = player(draft, action.payload.targetPlayerId);
        const i = action.payload.slotIndex;
        const val = other.slots[i]!.card.value;
        draft.pendingAbility = null;
        draft.pendingModal = {
          type: "spyOther",
          playerId: action.playerId,
          targetPlayerId: other.id,
          slotIndex: i,
          value: val,
        };
        events.push({
          type: "cabo/spied",
          payload: {
            playerId: action.playerId,
            targetPlayerId: other.id,
            slotIndex: i,
            value: val,
          },
        });
        return;
      }

      if (action.type === "resolveAbilitySwap") {
        const me = player(draft, action.playerId);
        const other = player(draft, action.payload.targetPlayerId);
        const { ownSlotIndex, targetSlotIndex } = action.payload;
        const mine = me.slots[ownSlotIndex]!.card;
        const theirs = other.slots[targetSlotIndex]!.card;
        me.slots[ownSlotIndex]!.card = theirs;
        other.slots[targetSlotIndex]!.card = mine;
        draft.pendingAbility = null;
        events.push({
          type: "cabo/blindSwapped",
          payload: {
            playerId: action.playerId,
            targetPlayerId: other.id,
            ownSlotIndex,
            targetSlotIndex,
          },
        });
        endTurn(draft, events);
        return;
      }

      if (action.type === "acknowledgeModal") {
        const modalType = draft.pendingModal?.type;
        draft.pendingModal = null;
        events.push({
          type: "cabo/modalAcked",
          payload: { playerId: action.playerId, modalType },
        });
        if (modalType === "setupPeek") {
          if (allSetupDone(draft)) {
            draft.phase = "playing";
            events.push({
              type: "cabo/roundStarted",
              payload: { round: draft.round },
            });
          } else {
            advanceSetupTurn(draft);
          }
          return;
        }
        endTurn(draft, events);
        return;
      }

      if (action.type === "callCabo") {
        draft.caboCallerId = action.playerId;
        draft.phase = "caboFinalTurns";
        draft.finalTurnQueue = buildFinalTurnQueue(draft, action.playerId);
        events.push({
          type: "cabo/called",
          payload: { playerId: action.playerId },
        });
        if (draft.finalTurnQueue.length === 0) {
          finishRound(draft, events, "cabo");
        } else {
          draft.currentIndex = draft.turnOrder.indexOf(
            draft.finalTurnQueue[0]!,
          );
        }
        return;
      }
    });
  } catch {
    return { state, events: [] };
  }

  return { state: next, events };
}

export function checkCaboVictory(state: CaboState) {
  if (state.phase !== "finished") return null;
  if (!state.matchOver) {
    return {
      kind: "ranking" as const,
      winners: [],
      reason: "round_end",
    };
  }
  return {
    kind: "winner" as const,
    winners: state.winners,
    reason: "lowest_cumulative",
  };
}

export { computeRoundScores, isKamikaze };
