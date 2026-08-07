import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "./ai-seat";

type Legal =
  | { type: "play"; row: number; col: number }
  | { type: "pass" }
  | { type: "resign" };

type View = {
  phase?: string;
  size?: number;
  currentPlayerId?: string | null;
  toActColor?: string | null;
  you?: { id: string; color: string; captures: number } | null;
  seats?: { id: string; color: string; captures: number }[];
  legal?: Legal[];
  lastMove?: { row: number; col: number } | null;
};

/** Prefer near last move / center; occasionally pass when board is dense. */
export function createMockGoSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = (view.legal ?? []).filter((a) => a.type === "play") as {
        type: "play";
        row: number;
        col: number;
      }[];

      if (view.phase === "finished" || !legal.length) {
        progress("本地启发式：停着");
        return {
          action: { type: "pass", playerId: id, payload: {} } as Action,
        };
      }

      const size = view.size ?? 9;
      const mid = (size - 1) / 2;
      const last = view.lastMove;
      let best = legal[0]!;
      let bestScore = -Infinity;

      for (const m of legal) {
        let score = 0;
        // Prefer nearer to last move (local fights)
        if (last) {
          const d = Math.abs(m.row - last.row) + Math.abs(m.col - last.col);
          score += Math.max(0, 8 - d) * 3;
        }
        // Mild center preference early
        const distMid =
          Math.abs(m.row - mid) + Math.abs(m.col - mid);
        score += Math.max(0, size - distMid);
        // Tiny jitter for variety (deterministic-ish from coords)
        score += ((m.row * 17 + m.col * 31) % 7) * 0.01;
        if (score > bestScore) {
          bestScore = score;
          best = m;
        }
      }

      // Pass only when almost no plays left (teaching autopilot)
      if (legal.length <= 2 && legal.length < size * size * 0.05) {
        progress("本地启发式：停着");
        return {
          action: { type: "pass", playerId: id, payload: {} } as Action,
        };
      }

      progress(`本地启发式：落子 ${best.row},${best.col}`);
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
