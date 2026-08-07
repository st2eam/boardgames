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

/**
 * Human-like 6 nimmt! seat: avoid 5th-card traps, tight fits,
 * dump dangerous bullheads when forced, hold control highs.
 */
export function createMockSixNimmtSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = view.legal ?? [];

      if (view.phase === "specials") {
        progress("策略：开始放置");
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
          // Prefer flexible mids, punish heavy bullheads / extremes
          let score = 10 - card.bullheads * 3;
          score -= Math.abs(card.value - 55) * 0.03;
          if (card.value >= 100) score -= 4;
          if (card.value <= 10) score -= 1;
          if (score > bestScore) {
            bestScore = score;
            bestId = card.id;
          }
        }
        if (!bestId) throw new Error("no draft pick");
        progress("策略：选灵活中牌");
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
        let bestScore = Infinity;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i] ?? [];
          // Fewest heads, then shortest row (less future risk signal)
          const score = rowHeads(row) * 10 + row.length;
          if (score < bestScore) {
            bestScore = score;
            best = i;
          }
        }
        progress(`策略：收牛最少行 ${best + 1}`);
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
      const handSize = hand.length;

      let bestId = plays[0]?.cardId;
      let bestFlip = false;
      let bestScore = -Infinity;
      for (const a of plays) {
        const card = hand.find((c) => c.id === a.cardId);
        if (!card) continue;
        const value = a.flip && card.flipTo != null ? card.flipTo : card.value;
        let score = 0;
        const fits = rows
          .map((r, i) => ({
            i,
            end: rowEnd(r),
            len: r.length,
            heads: rowHeads(r),
          }))
          .filter((r) => value > r.end);

        if (fits.length === 0) {
          // Will choose a row — heavily punish own bullheads
          score = -80 - card.bullheads * 6;
          // Prefer forcing a take with a low card if hand is large
          if (handSize >= 6) score += 5;
        } else {
          const best = fits.reduce((p, c) => {
            const gapP = value - p.end;
            const gapC = value - c.end;
            if (c.len >= 5) return p;
            if (p.len >= 5) return c;
            // Prefer smallest gap; avoid 5th slot (len===4)
            const penP = (p.len >= 4 ? 100 : 0) + gapP + p.heads * 0.2;
            const penC = (c.len >= 4 ? 100 : 0) + gapC + c.heads * 0.2;
            return penC < penP ? c : p;
          });
          const gap = value - best.end;
          score = 40 - gap;
          if (best.len >= 4) score -= 55; // avoid completing the row
          if (best.len === 3 && gap <= 3) score -= 8; // leave bait carefully
          score -= card.bullheads * 1.5;
          // Keep very high control cards longer when many cards remain
          if (value >= 90 && handSize >= 5) score -= 12;
          if (value >= 80 && handSize >= 7) score -= 6;
        }
        if (a.flip) {
          // Only flip when it clearly improves fit / avoids take
          score += fits.length ? 4 : 10;
        }
        if (score > bestScore) {
          bestScore = score;
          bestId = card.id;
          bestFlip = Boolean(a.flip);
        }
      }

      if (!bestId) throw new Error("no legal six-nimmt action");
      progress("策略：安全贴牌 / 躲第五张");
      return {
        action: {
          type: "playCard",
          playerId: id,
          payload: { cardId: bestId, flip: bestFlip || undefined },
        } as Action,
      };
    },
  };
}
