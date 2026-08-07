import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "./ai-seat";

type VCard = { id: string; rank?: number; suit?: string };

type View = {
  currentPlayerId?: string | null;
  phase?: string;
  street?: string;
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

function mixUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/**
 * Fallback TAG-ish mock. Prefer plugin `createAggressiveHoldemSeat` in play.
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
      const street = view.street ?? "preflop";
      const mix = mixUnit(
        [id, street, ...hole.map((c) => c.id), ...board.map((c) => c.id)].join(
          "|",
        ),
      );

      const strong = looksStrong(hole, board);
      const draw = looksDraw(hole, board);
      const air = !strong && !draw && !looksPair(hole, board);

      const raise = (style: "pot" | "jam" | "value") => {
        let target =
          style === "jam"
            ? maxTo
            : style === "pot"
              ? streetBet + toCall + Math.max(pot + toCall, bb * 5)
              : streetBet + toCall + Math.max(Math.floor((pot + toCall) * 0.66), bb * 3);
        target = Math.min(maxTo, Math.max(minTo, Math.floor(target)));
        return {
          action: {
            type: "raise",
            playerId: id,
            payload: { toAmount: target },
          } as Action,
        };
      };

      if (strong && has("raise")) {
        progress("TAG启发式：价值加压");
        return raise(toCall > pot ? "jam" : toCall > 0 ? "pot" : mix < 0.3 ? "value" : "pot");
      }

      if (has("raise") && toCall === 0 && looksPair(hole, board)) {
        progress("TAG启发式：持续下注");
        return raise("value");
      }

      if (has("raise") && toCall === 0 && (draw || (air && street === "river" && mix < 0.22))) {
        progress(draw ? "TAG启发式：半诈唬" : "TAG启发式：河流诈唬");
        return raise("value");
      }

      if (has("raise") && toCall > 0 && toCall <= pot * 0.5 && (strong || draw) && mix < 0.45) {
        progress("TAG启发式：加注");
        return raise("value");
      }

      if (has("call") && toCall > 0 && toCall <= pot * 0.35 && (strong || looksPair(hole, board) || draw)) {
        progress("TAG启发式：跟注");
        return { action: { type: "call", playerId: id, payload: {} } as Action };
      }

      if (has("check")) {
        progress("TAG启发式：过牌");
        return { action: { type: "check", playerId: id, payload: {} } as Action };
      }
      if (has("fold")) {
        progress("TAG启发式：弃牌");
        return { action: { type: "fold", playerId: id, payload: {} } as Action };
      }
      if (has("call")) {
        return { action: { type: "call", playerId: id, payload: {} } as Action };
      }
      throw new Error("no legal holdem action");
    },
  };
}

function looksStrong(hole: VCard[], board: VCard[]): boolean {
  if (board.length < 3) return false;
  const all = [...hole, ...board].filter((c) => c.rank != null && c.suit);
  const bySuit = new Map<string, number>();
  const byRank = new Map<number, number>();
  for (const c of all) {
    bySuit.set(c.suit!, (bySuit.get(c.suit!) ?? 0) + 1);
    byRank.set(c.rank!, (byRank.get(c.rank!) ?? 0) + 1);
  }
  if ([...bySuit.values()].some((n) => n >= 5)) return true;
  if ([...byRank.values()].some((n) => n >= 3)) return true;
  return [...byRank.values()].filter((n) => n >= 2).length >= 2;
}

function looksPair(hole: VCard[], board: VCard[]): boolean {
  if (looksStrong(hole, board)) return true;
  if (board.length === 0 && hole.length === 2) {
    const [a, b] = hole;
    if (a?.rank != null && a.rank === b?.rank) return a.rank >= 7;
    const hi = Math.max(a?.rank ?? 0, b?.rank ?? 0);
    const lo = Math.min(a?.rank ?? 0, b?.rank ?? 0);
    return hi >= 13 && lo >= 11;
  }
  const ranks = [...hole, ...board]
    .map((c) => c.rank)
    .filter((r): r is number => r != null);
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  return [...counts.values()].some((n) => n >= 2);
}

function looksDraw(hole: VCard[], board: VCard[]): boolean {
  if (board.length < 3 || board.length > 4) return false;
  const suits = new Map<string, number>();
  for (const c of [...hole, ...board]) {
    if (!c.suit) continue;
    suits.set(c.suit, (suits.get(c.suit) ?? 0) + 1);
  }
  return [...suits.entries()].some(
    ([suit, n]) => n === 4 && hole.some((c) => c.suit === suit),
  );
}
