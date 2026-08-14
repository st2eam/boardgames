import type { PlayerId } from "@bbge/core";
import { tilePoints } from "./cards";
import { legalRummikubActions } from "./rules";
import type { RummikubState } from "./state";

function tile(t: {
  id: string;
  color: string | null;
  number: number | null;
  joker: boolean;
}) {
  return { id: t.id, color: t.color, number: t.number, joker: t.joker };
}

export function projectRummikubView(
  state: RummikubState,
  viewerId: PlayerId | null,
) {
  const you = viewerId
    ? state.players.find((p) => p.id === viewerId) ?? null
    : null;

  return {
    phase: state.phase,
    currentPlayerId: state.turnOrder[state.currentIndex] ?? null,
    winners: state.winners,
    matchOver: state.matchOver,
    round: state.round,
    poolCount: state.pool.length,
    endReason: state.endReason,
    table: state.table.map((s) => ({
      id: s.id,
      tiles: s.tiles.map(tile),
    })),
    you: you
      ? {
          id: you.id,
          rack: you.rack.map(tile),
          initialMeldDone: you.initialMeldDone,
          score: you.score,
          rackPoints: you.rack.reduce((s, t) => s + tilePoints(t), 0),
        }
      : null,
    seats: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      rackCount: p.rack.length,
      score: p.score,
      initialMeldDone: p.initialMeldDone,
      isYou: p.id === viewerId,
    })),
    legal: viewerId ? legalRummikubActions(state, viewerId) : [],
  };
}
