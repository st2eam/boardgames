import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "./ai-seat";

type VCard = { id: string; rank?: number; suit?: string };

type View = {
  currentPlayerId?: string | null;
  phase?: string;
  you?: {
    id: string;
    toCall?: number;
    stack?: number;
    streetBet?: number;
    hole?: VCard[];
  } | null;
  board?: VCard[];
  legal?: { type: string; toAmount?: number; callAmount?: number }[];
  bigBlind?: number;
  minRaiseTo?: number;
  potTotal?: number;
};

/**
 * Fallback mock used outside the plugin wire-up.
 * Prefer `createAggressiveHoldemSeat` from the texas-holdem plugin in play.
 *
 * Still biased aggressive: never open-check when holding a flush-or-better
 * shape on a 3+ board if raise is legal (suit-count heuristic).
 */
export function createMockTexasHoldemSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = view.legal ?? [];
      const has = (t: string) => legal.some((a) => a.type === t);
      const toCall = view.you?.toCall ?? 0;
      const stack = view.you?.stack ?? 0;
      const streetBet = view.you?.streetBet ?? 0;
      const bb = view.bigBlind ?? 2;
      const pot = view.potTotal ?? 0;
      const maxTo = streetBet + stack;
      const minTo = Math.min(maxTo, view.minRaiseTo ?? bb * 2);

      const hole = view.you?.hole ?? [];
      const board = view.board ?? [];
      const strongMade = looksLikeFlushOrBetter(hole, board);

      const raise = (style: "pot" | "jam" | "value") => {
        let target =
          style === "jam"
            ? maxTo
            : style === "pot"
              ? streetBet + toCall + Math.max(pot + toCall, bb * 6)
              : streetBet + toCall + Math.max(Math.floor(pot * 0.66), bb * 4);
        target = Math.min(maxTo, Math.max(minTo, Math.floor(target)));
        return {
          action: {
            type: "raise",
            playerId: id,
            payload: { toAmount: target },
          } as Action,
        };
      };

      if (strongMade && has("raise")) {
        progress("本地启发式：强牌加压");
        return raise(toCall > 0 ? "jam" : "pot");
      }

      // Checked to us with anything playable — stab the pot instead of auto-check.
      if (has("raise") && toCall === 0 && (strongMade || looksLikePairOrBetter(hole, board))) {
        progress("本地启发式：价值下注");
        return raise(strongMade ? "pot" : "value");
      }

      if (has("raise") && toCall > 0 && toCall <= pot && looksLikePairOrBetter(hole, board)) {
        progress("本地启发式：加注");
        return raise("value");
      }

      if (has("check") && !strongMade && toCall === 0 && !looksLikePairOrBetter(hole, board)) {
        progress("本地启发式：过牌");
        return {
          action: { type: "check", playerId: id, payload: {} } as Action,
        };
      }
      if (has("call") && toCall <= bb * 4) {
        progress("本地启发式：跟注");
        return {
          action: { type: "call", playerId: id, payload: {} } as Action,
        };
      }
      if (has("check")) {
        progress("本地启发式：过牌");
        return {
          action: { type: "check", playerId: id, payload: {} } as Action,
        };
      }
      if (has("fold")) {
        progress("本地启发式：弃牌");
        return {
          action: { type: "fold", playerId: id, payload: {} } as Action,
        };
      }
      if (has("call")) {
        return {
          action: { type: "call", playerId: id, payload: {} } as Action,
        };
      }
      throw new Error("no legal holdem action");
    },
  };
}

function looksLikeFlushOrBetter(hole: VCard[], board: VCard[]): boolean {
  if (board.length < 3) return false;
  const all = [...hole, ...board].filter((c) => c.rank != null && c.suit);
  const bySuit = new Map<string, number>();
  const byRank = new Map<number, number>();
  for (const c of all) {
    bySuit.set(c.suit!, (bySuit.get(c.suit!) ?? 0) + 1);
    byRank.set(c.rank!, (byRank.get(c.rank!) ?? 0) + 1);
  }
  if ([...bySuit.values()].some((n) => n >= 5)) return true;
  if ([...byRank.values()].some((n) => n >= 3)) return true; // trips+
  const pairs = [...byRank.values()].filter((n) => n >= 2).length;
  return pairs >= 2; // two pair / boat-ish
}

function looksLikePairOrBetter(hole: VCard[], board: VCard[]): boolean {
  if (looksLikeFlushOrBetter(hole, board)) return true;
  const ranks = [...hole, ...board]
    .map((c) => c.rank)
    .filter((r): r is number => r != null);
  if (board.length === 0 && hole.length === 2) {
    const [a, b] = hole;
    if (a?.rank != null && a.rank === b?.rank) return a.rank >= 8;
    const hi = Math.max(a?.rank ?? 0, b?.rank ?? 0);
    const lo = Math.min(a?.rank ?? 0, b?.rank ?? 0);
    return hi === 14 && lo >= 11;
  }
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  return [...counts.values()].some((n) => n >= 2);
}
