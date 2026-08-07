import type { PlayerId } from "@bbge/core";
import { bullheads, bullheadsOfCards } from "./cards";
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
    round: state.round,
    trick: state.trick,
    targetScore: state.targetScore,
    currentPlayerId: currentActorId(state),
    winners: state.winners,
    rows: state.rows.map((row) => row.map(pubCard)),
    revealed: state.revealed
      ? state.revealed.map((r) => ({
          playerId: r.playerId,
          card: pubCard(r.card),
        }))
      : null,
    pending: state.pending
      ? {
          type: state.pending.type,
          playerId: state.pending.playerId,
          card: pubCard(state.pending.card),
        }
      : null,
    legal: viewerId ? legalActions(state, viewerId) : [],
    you: you
      ? {
          id: you.id,
          hand: you.hand.map(pubCard),
          taken: you.taken.map(pubCard),
          takenBullheads: bullheadsOfCards(you.taken),
          score: you.score,
          hasPlayed: Boolean(state.selections[you.id]),
          selectedCardId: state.selections[you.id]?.id ?? null,
        }
      : null,
    seats: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      handCount: p.hand.length,
      takenBullheads: bullheadsOfCards(p.taken),
      hasPlayed: Boolean(state.selections[p.id]),
      isYou: p.id === viewerId,
    })),
  };
}
