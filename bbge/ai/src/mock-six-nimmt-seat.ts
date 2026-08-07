import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "./ai-seat";

type View = {
  phase?: string;
  mode?: string;
  currentPlayerId?: string | null;
  draftTurn?: string | null;
  draftPool?: { id: string; value: number; bullheads: number }[] | null;
  rows?: { value: number; bullheads: number }[][];
  pending?: { playerId: string; card: { value: number } } | null;
  you?: {
    id: string;
    hand?: {
      id: string;
      value: number;
      bullheads: number;
      flipTo?: number | null;
    }[];
    hasPlayed?: boolean;
    hasFlipToken?: boolean;
  } | null;
  legal?: {
    type: string;
    cardId?: string;
    rowIndex?: number;
    kind?: string;
    faceIndex?: number;
    flip?: boolean;
  }[];
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

      if (view.phase === "specials") {
        progress("本地启发式：开始放置");
        return {
          action: {
            type: "beginPlace",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      if (view.phase === "drafting") {
        const picks = legal.filter((a) => a.type === "draftPick" && a.cardId);
        const pool = view.draftPool ?? [];
        let bestId = picks[0]?.cardId;
        let bestScore = -Infinity;
        for (const a of picks) {
          const card = pool.find((c) => c.id === a.cardId);
          if (!card) continue;
          const score = -card.bullheads - Math.abs(card.value - 52) * 0.02;
          if (score > bestScore) {
            bestScore = score;
            bestId = card.id;
          }
        }
        if (!bestId) throw new Error("no draft pick");
        progress("本地启发式：选牌");
        return {
          action: {
            type: "draftPick",
            playerId: id,
            payload: { cardId: bestId },
          } as Action,
        };
      }

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
      let bestFlip = false;
      let bestScore = -Infinity;
      for (const a of plays) {
        const card = hand.find((c) => c.id === a.cardId);
        if (!card) continue;
        const value = a.flip && card.flipTo != null ? card.flipTo : card.value;
        let score = 0;
        const fits = rows
          .map((r, i) => ({ i, end: rowEnd(r), len: r.length }))
          .filter((r) => value > r.end);
        if (fits.length === 0) {
          score = -50 - card.bullheads;
        } else {
          const best = fits.reduce((p, c) =>
            value - c.end < value - p.end ? c : p,
          );
          score = 20 - (value - best.end);
          if (best.len >= 4) score -= 30;
          score -= card.bullheads;
        }
        score -= Math.abs(value - 52) * 0.02;
        if (a.flip) score += 2; // slight preference when it helps
        if (score > bestScore) {
          bestScore = score;
          bestId = card.id;
          bestFlip = Boolean(a.flip);
        }
      }

      if (!bestId) throw new Error("no legal six-nimmt action");
      progress("本地启发式：出牌");
      return {
        action: {
          type: "playCard",
          playerId: id,
          payload: { cardId: bestId, flip: bestFlip || undefined },
        } as Action,
        speak: undefined,
      };
    },
  };
}
