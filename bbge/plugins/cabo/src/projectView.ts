import type { PlayerId } from "@bbge/core";
import { sumSlots } from "./cards";
import { currentActorId, legalActions } from "./rules";
import type { CaboSlot, CaboState } from "./state";

function pubSlot(
  slot: CaboSlot,
  slotIndex: number,
  viewerId: PlayerId | null,
  ownerId: PlayerId,
  state: CaboState,
  roundReveal: boolean,
) {
  const isOwner = viewerId === ownerId;
  const known =
    isOwner && state.players.find((p) => p.id === ownerId)?.knownSlots.includes(slotIndex);
  const showFace =
    roundReveal ||
    slot.faceUp ||
    (isOwner && known) ||
    (state.pendingModal?.playerId === viewerId &&
      state.pendingModal.type === "peekOwn" &&
      state.pendingModal.slotIndex === slotIndex &&
      isOwner) ||
    (state.pendingModal?.playerId === viewerId &&
      state.pendingModal.type === "spyOther" &&
      state.pendingModal.targetPlayerId === ownerId &&
      state.pendingModal.slotIndex === slotIndex);

  return {
    slotIndex,
    value: showFace ? slot.card.value : null,
    faceUp: slot.faceUp || roundReveal,
    cardId: showFace ? slot.card.id : null,
    knownToYou: Boolean(isOwner && known),
  };
}

export function projectCaboView(state: CaboState, viewerId: PlayerId | null) {
  const roundReveal = state.phase === "finished";
  const you = viewerId
    ? state.players.find((p) => p.id === viewerId)
    : null;
  const actor = currentActorId(state);

  return {
    phase: state.phase,
    round: state.round,
    targetScore: state.targetScore,
    matchOver: state.matchOver,
    currentPlayerId: actor,
    caboCallerId: state.caboCallerId,
    finalTurnQueue: state.finalTurnQueue,
    winners: state.winners,
    deckCount: state.deck.length,
    discardTop: state.discard.length
      ? state.discard[state.discard.length - 1]!.value
      : null,
    discardCount: state.discard.length,
    pendingDraw:
      state.pendingDraw && viewerId === actor
        ? {
            source: state.pendingDraw.source,
            value: state.pendingDraw.card.value,
            cardId: state.pendingDraw.card.id,
          }
        : state.pendingDraw
          ? { source: state.pendingDraw.source, value: null, cardId: null }
          : null,
    pendingAbility: state.pendingAbility,
    pendingModal:
      state.pendingModal?.playerId === viewerId
        ? {
            type: state.pendingModal.type,
            slotIndex: state.pendingModal.slotIndex,
            targetPlayerId: state.pendingModal.targetPlayerId,
            value: state.pendingModal.value,
          }
        : state.pendingModal
          ? { type: state.pendingModal.type, waiting: true }
          : null,
    roundScores: state.roundScores,
    setupPeeksDone: viewerId
      ? Boolean(state.setupPeeks[viewerId]?.length)
      : false,
    legal: viewerId ? legalActions(state, viewerId) : [],
    you: you
      ? {
          id: you.id,
          cumulativeScore: you.cumulativeScore,
          scoreResetUsed: you.scoreResetUsed,
          tableauSum: sumSlots(you.slots),
          slots: you.slots.map((s, i) =>
            pubSlot(s, i, viewerId, you.id, state, roundReveal),
          ),
        }
      : null,
    seats: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      cumulativeScore: p.cumulativeScore,
      scoreResetUsed: p.scoreResetUsed,
      slotCount: p.slots.length,
      tableauSum: roundReveal ? sumSlots(p.slots) : null,
      isYou: p.id === viewerId,
      isCaller: p.id === state.caboCallerId,
      needsFinalTurn: state.finalTurnQueue.includes(p.id),
      slots: p.slots.map((s, i) =>
        pubSlot(s, i, viewerId, p.id, state, roundReveal),
      ),
    })),
  };
}
