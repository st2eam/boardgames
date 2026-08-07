import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "./ai-seat";

type View = {
  phase?: string;
  currentPlayerId?: string | null;
  rows?: { value: number; bullheads: number }[][];
  pending?: { playerId: string; card: { value: number } } | null;
  you?: {
    id: string;
    hand?: { id: string; value: number; bullheads: number }[];
    hasPlayed?: boolean;
  } | null;
  legal?: { type: string; cardId?: string; rowIndex?: number }[];
};

function rowEnd(row: { value: number }[]): number {
  return row[row.length - 1]!.value;
}

function rowHeads(row: { bullheads: number }[]): number {
  return row.reduce((s, c) => s + c.bullheads, 0);
}

/** Prefer mid cards that fit without taking; too-low → cheapest row. */
export function createMockSixNimmtSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = view.legal ?? [];

      if (view.phase === "chooseRow") {
        const rows = view.rows ?? [];
        let best = 0;
        let bestH = Infinity;
        for (let i = 0; i < rows.length; i++) {
          const h = rowHeads(rows[i] ?? []);
          if (h < bestH) {
            bestH = h;
            best = i;
          }
        }
        progress(`本地启发式：收牛头最少行 ${best + 1}`);
        return {
          action: {
            type: "chooseRow",
            playerId: id,
            payload: { rowIndex: best },
          } as Action,
        };
      }

      const plays = legal.filter((a) => a.type === "playCard" && a.cardId);
      const hand = view.you?.hand ?? [];
      const rows = view.rows ?? [];

      let bestId = plays[0]?.cardId;
      let bestScore = -Infinity;
      for (const a of plays) {
        const card = hand.find((c) => c.id === a.cardId);
        if (!card) continue;
        let score = 0;
        const fits = rows
          .map((r, i) => ({ i, end: rowEnd(r), len: r.length }))
          .filter((r) => card.value > r.end);
        if (fits.length === 0) {
          score = -50 - card.bullheads; // avoid too-low if possible
        } else {
          fits.sort((a, b) => a.end - b.end);
          // min diff among fits: actually min (value-end)
          fits.sort(
            (a, b) => card.value - a.end - (card.value - b.end),
          );
          const best = fits.reduce((p, c) =>
            card.value - c.end < card.value - p.end ? c : p,
          );
          score = 20 - (card.value - best.end);
          if (best.len >= 4) score -= 30; // about to take
          score -= card.bullheads; // slightly prefer low bullhead cards when taking risk
        }
        // Prefer medium values
        score -= Math.abs(card.value - 52) * 0.02;
        if (score > bestScore) {
          bestScore = score;
          bestId = card.id;
        }
      }

      if (!bestId) throw new Error("no legal six-nimmt action");
      progress("本地启发式：出牌");
      return {
        action: {
          type: "playCard",
          playerId: id,
          payload: { cardId: bestId },
        } as Action,
        speak: undefined,
      };
    },
  };
}
