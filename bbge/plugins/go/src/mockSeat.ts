import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";
import { tryPlay, keyOf } from "./board";
import type { GoCell, GoColor, GoCoord } from "./state";

type Legal =
  | { type: "play"; row: number; col: number }
  | { type: "pass" }
  | { type: "resign" };

type View = {
  phase?: string;
  size?: number;
  currentPlayerId?: string | null;
  toActColor?: string | null;
  consecutivePasses?: number;
  ko?: { row: number; col: number } | null;
  you?: { id: string; color: string; captures: number } | null;
  seats?: { id: string; color: string; captures: number }[];
  legal?: Legal[];
  lastMove?: { row: number; col: number } | null;
  stones?: Record<string, "black" | "white">;
};

function boardFromStones(
  size: number,
  stones: Record<string, "black" | "white"> | undefined,
): GoCell[][] {
  const board: GoCell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
  for (const [k, color] of Object.entries(stones ?? {})) {
    const [rs, cs] = k.split(",");
    const r = Number(rs);
    const c = Number(cs);
    if (r >= 0 && r < size && c >= 0 && c < size) board[r]![c] = color;
  }
  return board;
}

function emptyCount(board: GoCell[][]): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell === null) n++;
  return n;
}

/**
 * Club-strength heuristic: capture when available, fight locally,
 * prefer side/corner frameworks early, pass when the board is quiet.
 */
export function createStrategicGoSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const plays = (view.legal ?? []).filter((a) => a.type === "play") as {
        type: "play";
        row: number;
        col: number;
      }[];

      if (view.phase === "finished" || !plays.length) {
        progress("策略：停着");
        return {
          action: { type: "pass", playerId: id, payload: {} } as Action,
        };
      }

      const size = view.size ?? 9;
      const color = (view.you?.color ?? view.toActColor ?? "black") as GoColor;
      const board = boardFromStones(size, view.stones);
      const empties = emptyCount(board);
      const mid = (size - 1) / 2;
      const last = view.lastMove;
      const ko = view.ko ?? null;

      let best = plays[0]!;
      let bestScore = -Infinity;

      for (const m of plays) {
        const at: GoCoord = { row: m.row, col: m.col };
        const result = tryPlay(board, at, color, ko);
        if (!result) continue;
        let score = 0;

        // Captures are gold
        score += result.captured.length * 30;

        // Keep own group breathing — prefer more liberties after
        // (tryPlay already forbids suicide)
        const selfKey = keyOf(at);
        void selfKey;
        // Local response to last move
        if (last) {
          const d = Math.abs(m.row - last.row) + Math.abs(m.col - last.col);
          if (d === 1) score += 18;
          else if (d === 2) score += 10;
          else if (d <= 3) score += 4;
        }

        // Opening: corners / sides over center dump
        const edgeDist = Math.min(m.row, m.col, size - 1 - m.row, size - 1 - m.col);
        if (empties > size * size * 0.7) {
          if (edgeDist === 2 || edgeDist === 3) score += 12; // 3-3 / 4-4-ish
          if (edgeDist === 0) score -= 8; // first-line early is soft
          const distMid = Math.abs(m.row - mid) + Math.abs(m.col - mid);
          score += Math.max(0, 4 - Math.abs(distMid - size * 0.55));
        } else {
          // Middlegame: stay near action + a bit of center
          const distMid = Math.abs(m.row - mid) + Math.abs(m.col - mid);
          score += Math.max(0, size - distMid) * 0.3;
        }

        // Tiny deterministic jitter
        score += ((m.row * 17 + m.col * 31 + empties) % 11) * 0.05;

        if (score > bestScore) {
          bestScore = score;
          best = m;
        }
      }

      // Pass when opponent already passed and no juicy capture / local fight
      const bestIsCapture = (() => {
        const r = tryPlay(
          board,
          { row: best.row, col: best.col },
          color,
          ko,
        );
        return (r?.captured.length ?? 0) > 0;
      })();
      if (
        (view.consecutivePasses ?? 0) >= 1 &&
        !bestIsCapture &&
        bestScore < 12 &&
        empties < size * size * 0.25
      ) {
        progress("策略：局面已定，停着");
        return {
          action: { type: "pass", playerId: id, payload: {} } as Action,
        };
      }

      progress(
        bestIsCapture
          ? `策略：提子 ${best.row},${best.col}`
          : `策略：落子 ${best.row},${best.col}`,
      );
      return {
        action: {
          type: "play",
          playerId: id,
          payload: { row: best.row, col: best.col },
        } as Action,
      };
    },
  };
}
