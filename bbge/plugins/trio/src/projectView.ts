import type { PlayerId } from "@bbge/core";
import { legalTrioActions } from "./rules";
import type { TrioState } from "./state";

export function projectTrioView(state: TrioState, viewerId: PlayerId | null) {
  const you = viewerId
    ? state.players.find((p) => p.id === viewerId) ?? null
    : null;

  const revealedCenter = new Set(
    state.turnReveals
      .filter((r) => r.source === "center")
      .map((r) => r.slotIndex),
  );

  return {
    phase: state.phase,
    mode: state.mode,
    currentPlayerId: state.turnOrder[state.currentIndex] ?? null,
    winners: state.winners,
    matchOver: state.matchOver,
    pendingResolution: state.pendingResolution,
    turnReveals: state.turnReveals.map((r) =>
      r.source === "center"
        ? {
            source: "center" as const,
            slotIndex: r.slotIndex,
            value: r.card.value,
            cardId: r.card.id,
          }
        : {
            source: "hand" as const,
            ownerId: r.ownerId,
            end: r.end,
            value: r.card.value,
            cardId: r.card.id,
          },
    ),
    center: state.center.map((c, i) => {
      if (!c) return { empty: true as const };
      if (revealedCenter.has(i)) {
        return {
          empty: false as const,
          faceUp: true as const,
          value: c.value,
          cardId: c.id,
          slotIndex: i,
        };
      }
      return {
        empty: false as const,
        faceUp: false as const,
        slotIndex: i,
      };
    }),
    you: you
      ? {
          id: you.id,
          hand: you.hand.map((c) => ({
            id: c.id,
            value: c.value,
          })),
          trios: you.trios.slice(),
        }
      : null,
    seats: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      handCount: p.hand.length,
      trios: p.trios.slice(),
      isYou: p.id === viewerId,
      // Own extremes known to owner; others only see backs + count
      lowValue: p.id === viewerId && p.hand.length ? p.hand[0]!.value : null,
      highValue:
        p.id === viewerId && p.hand.length
          ? p.hand[p.hand.length - 1]!.value
          : null,
    })),
    legal: viewerId ? legalTrioActions(state, viewerId) : [],
  };
}
