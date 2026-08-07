import type { PlayerId } from "@bbge/core";
import { activeFace, faceLabel, type UnoColor } from "./cards";
import { legalUnoActions } from "./rules";
import type { UnoState } from "./state";

function publicCard(card: { id: string }, state: UnoState, zh: boolean) {
  const face = activeFace(card as never, state.side);
  return {
    id: card.id,
    color: face.color,
    kind: face.kind,
    number: face.number ?? null,
    drawN: face.drawN ?? null,
    label: faceLabel(face, zh),
  };
}

export function projectUnoView(state: UnoState, viewerId: PlayerId | null) {
  const zh = true;
  const top = state.discard[state.discard.length - 1]!;
  const you = viewerId
    ? state.players.find((p) => p.id === viewerId) ?? null
    : null;

  return {
    phase: state.phase,
    edition: state.edition,
    side: state.side,
    currentPlayerId: state.turnOrder[state.currentIndex] ?? null,
    currentColor: state.currentColor as UnoColor,
    direction: state.direction,
    deckCount: state.deck.length,
    discardTop: publicCard(top, state, zh),
    pending: state.pending
      ? {
          type: state.pending.type,
          playerId: state.pending.playerId,
          amount:
            state.pending.type === "stackResponse"
              ? state.pending.amount
              : undefined,
          purpose:
            state.pending.type === "chooseTarget"
              ? state.pending.purpose
              : undefined,
        }
      : null,
    unoVulnerableId: state.unoVulnerableId,
    winners: state.winners,
    matchOver: state.matchOver,
    round: state.round,
    targetScore: state.targetScore,
    drawnCard:
      state.pending?.type === "drawnDecision" &&
      state.pending.playerId === viewerId
        ? publicCard(state.pending.card, state, zh)
        : null,
    you: you
      ? {
          id: you.id,
          hand: you.hand.map((c) => publicCard(c, state, zh)),
          score: you.score,
          eliminated: you.eliminated,
          saidUno: Boolean(state.saidUno[you.id]),
        }
      : null,
    seats: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      handCount: p.hand.length,
      score: p.score,
      eliminated: p.eliminated,
      isYou: p.id === viewerId,
    })),
    legal: viewerId ? legalUnoActions(state, viewerId) : [],
  };
}
