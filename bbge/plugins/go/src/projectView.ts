import type { PlayerId } from "@bbge/core";
import { boardToAscii, coordLabel } from "./board";
import { legalActions } from "./rules";
import type { GoState } from "./state";

export function projectGoView(state: GoState, viewerId: PlayerId | null) {
  const you = viewerId
    ? state.players.find((p) => p.id === viewerId) ?? null
    : null;
  const current = state.players[state.toActIndex] ?? null;
  const stones: Record<string, "black" | "white"> = {};
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      const cell = state.board[r]![c];
      if (cell) stones[`${r},${c}`] = cell;
    }
  }

  return {
    phase: state.phase,
    edition: state.edition,
    size: state.size,
    komi: state.komi,
    currentPlayerId: current?.id ?? null,
    toActColor: current?.color ?? null,
    consecutivePasses: state.consecutivePasses,
    ko: state.ko,
    lastMove: state.lastMove,
    lastMoveLabel: state.lastMove
      ? coordLabel(state.lastMove, state.size)
      : null,
    winners: state.winners,
    scores: state.scores,
    endReason: state.endReason,
    stones,
    boardAscii: boardToAscii(state.board),
    legal: viewerId ? legalActions(state, viewerId) : [],
    you: you
      ? {
          id: you.id,
          color: you.color,
          captures: you.captures,
          resigned: you.resigned,
        }
      : null,
    seats: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      captures: p.captures,
      resigned: p.resigned,
    })),
  };
}
