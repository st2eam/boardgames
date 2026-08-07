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
  consecutivePasses?: number;
  you?: { id: string; color: string; captures: number } | null;
  legal?: Legal[];
  lastMove?: { row: number; col: number } | null;
  stones?: Record<string, "black" | "white">;
};

/**
 * Fallback Go seat (no board engine import). Prefer plugin
 * `createStrategicGoSeat` in play.
 */
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
        progress("策略：停着");
        return {
          action: { type: "pass", playerId: id, payload: {} } as Action,
        };
      }

      const size = view.size ?? 9;
      const mid = (size - 1) / 2;
      const last = view.lastMove;
      const color = view.you?.color ?? view.toActColor ?? "black";
      const opp = color === "black" ? "white" : "black";
      const stones = view.stones ?? {};

      let best = legal[0]!;
      let bestScore = -Infinity;

      for (const m of legal) {
        let score = 0;
        if (last) {
          const d = Math.abs(m.row - last.row) + Math.abs(m.col - last.col);
          score += Math.max(0, 8 - d) * 3;
        }
        // Adjacent to opponent stone ≈ fight / atari pressure proxy
        for (const [dr, dc] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ] as const) {
          if (stones[`${m.row + dr},${m.col + dc}`] === opp) score += 8;
          if (stones[`${m.row + dr},${m.col + dc}`] === color) score += 2;
        }
        const edge = Math.min(m.row, m.col, size - 1 - m.row, size - 1 - m.col);
        if (edge === 2 || edge === 3) score += 6;
        const distMid = Math.abs(m.row - mid) + Math.abs(m.col - mid);
        score += Math.max(0, size - distMid) * 0.4;
        score += ((m.row * 17 + m.col * 31) % 7) * 0.01;
        if (score > bestScore) {
          bestScore = score;
          best = m;
        }
      }

      if (
        (view.consecutivePasses ?? 0) >= 1 &&
        legal.length < size &&
        bestScore < 10
      ) {
        progress("策略：停着");
        return {
          action: { type: "pass", playerId: id, payload: {} } as Action,
        };
      }

      progress(`策略：落子 ${best.row},${best.col}`);
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
