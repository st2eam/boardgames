import type { PlayerId } from "@bbge/core";
import { bullheads, bullheadsOfCards } from "./cards";
import { BUFFALO_ID } from "./modes";
import { flipDigits } from "./placement";
import { currentActorId, legalActions } from "./rules";
import type { NimmtState } from "./state";

function pubCard(c: { id: string; value: number }) {
  return { id: c.id, value: c.value, bullheads: bullheads(c.value) };
}

export function projectNimmtView(
  state: NimmtState,
  viewerId: PlayerId | null,
) {
  const you = viewerId
    ? state.players.find((p) => p.id === viewerId)
    : null;

  return {
    phase: state.phase,
    mode: state.mode,
    round: state.round,
    trick: state.trick,
    targetScore: state.targetScore,
    currentPlayerId: currentActorId(state),
    winners: state.winners,
    buffaloWon: state.buffaloWon,
    rows: state.rows.map((row) => row.map(pubCard)),
    rowMods: state.rowMods,
    parityMarker: state.parityMarker,
    mountain: state.mountain,
    jumpingCowRow: state.jumpingCowRow,
    draftPool:
      state.phase === "drafting"
        ? state.draftPool.map(pubCard)
        : null,
    draftTurn: state.draftTurn,
    revealed: state.revealed
      ? state.revealed.map((r) => ({
          playerId: r.playerId,
          card: pubCard(r.card),
          placeValue: r.placeValue,
          usedFlip: Boolean(r.usedFlip),
          isBuffalo: r.playerId === BUFFALO_ID,
          pending:
            state.phase === "resolving" || state.phase === "chooseRow"
              ? state.resolveQueue.some((q) => q.card.id === r.card.id) ||
                state.pending?.card.id === r.card.id
              : false,
          placingNext:
            state.resolveQueue[0]?.card.id === r.card.id ||
            state.pending?.card.id === r.card.id,
        }))
      : null,
    resolveRemaining: state.resolveQueue.length,
    pending: state.pending
      ? {
          type: state.pending.type,
          playerId: state.pending.playerId,
          card: pubCard(state.pending.card),
          placeValue: state.pending.placeValue,
        }
      : null,
    buffalo: state.mode === "buffalo"
      ? {
          handCount: state.buffaloHand.length,
          revealed: state.buffaloRevealed
            ? pubCard(state.buffaloRevealed)
            : null,
          takenBullheads: bullheadsOfCards(state.buffaloTaken),
          teamBullheads: bullheadsOfCards(state.teamTaken),
          faceUpSpecials: state.faceUpSpecials,
          specialDeckCount: state.specialDeck.length,
        }
      : null,
    legal: viewerId ? legalActions(state, viewerId) : [],
    you: you
      ? {
          id: you.id,
          hand: you.hand.map((c) => ({
            ...pubCard(c),
            flipTo: flipDigits(c.value),
          })),
          taken: you.taken.map(pubCard),
          takenBullheads: bullheadsOfCards(you.taken),
          score: you.score,
          hasPlayed: Boolean(state.selections[you.id]),
          selectedCardId: state.selections[you.id]?.card.id ?? null,
          selectedFlip: Boolean(state.selections[you.id]?.useFlip),
          hasFlipToken: you.hasFlipToken,
        }
      : null,
    seats: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      handCount: p.hand.length,
      takenBullheads:
        state.mode === "buffalo"
          ? bullheadsOfCards(state.teamTaken)
          : bullheadsOfCards(p.taken),
      hasPlayed: Boolean(state.selections[p.id]),
      isYou: p.id === viewerId,
      hasFlipToken: p.hasFlipToken,
    })),
  };
}
