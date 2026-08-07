import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";
import type { Card } from "./cards";
import { bestHandScore } from "./handEval";

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
  currentBet?: number;
};

function asCards(list: VCard[] | undefined): Card[] {
  const out: Card[] = [];
  for (const c of list ?? []) {
    if (c.rank == null || !c.suit) continue;
    out.push({
      id: c.id,
      rank: c.rank as Card["rank"],
      suit: c.suit as Card["suit"],
    });
  }
  return out;
}

/** How hard to press: jam > pot > value. */
type Aggression = "jam" | "pot" | "value" | "call" | "check" | "fold";

function raiseTarget(view: View, style: "jam" | "pot" | "value"): number {
  const streetBet = view.you?.streetBet ?? 0;
  const stack = view.you?.stack ?? 0;
  const maxTo = streetBet + stack;
  const minTo = Math.min(
    maxTo,
    view.minRaiseTo ?? (view.bigBlind ?? 2) * 2,
  );
  const pot = view.potTotal ?? 0;
  const toCall = view.you?.toCall ?? 0;
  const bb = view.bigBlind ?? 2;

  let target: number;
  if (style === "jam") {
    target = maxTo;
  } else if (style === "pot") {
    // Pot-sized bet/raise after calling any outstanding amount.
    target = streetBet + toCall + Math.max(pot + toCall, bb * 6);
  } else {
    target = streetBet + toCall + Math.max(Math.floor(pot * 0.66), bb * 4);
  }
  return Math.min(maxTo, Math.max(minTo, Math.floor(target)));
}

function preflopPlan(hole: Card[], toCall: number, bb: number): Aggression {
  if (hole.length < 2) return toCall > 0 ? "fold" : "check";
  const [a, b] = [...hole].sort((x, y) => y.rank - x.rank);
  const hi = a!.rank;
  const lo = b!.rank;
  const pair = hi === lo;
  const suited = a!.suit === b!.suit;
  const gap = hi - lo;

  // Premium: always press
  if (pair && hi >= 10) return "pot";
  if (hi === 14 && lo >= 12) return "pot"; // AK AQ
  if (hi === 14 && lo === 11 && suited) return "pot"; // AJs
  if (pair && hi >= 7) return toCall === 0 ? "value" : toCall <= bb * 6 ? "call" : "fold";

  // Strong speculative / broadway
  if (hi === 14 && lo >= 10) return toCall === 0 ? "value" : toCall <= bb * 4 ? "call" : "fold";
  if (suited && gap <= 2 && hi >= 10) {
    return toCall === 0 ? "value" : toCall <= bb * 3 ? "call" : "fold";
  }
  if (pair) return toCall === 0 ? "check" : toCall <= bb * 3 ? "call" : "fold";

  if (toCall === 0) return "check";
  if (toCall <= bb * 2 && (hi >= 12 || suited)) return "call";
  return "fold";
}

function postflopPlan(category: number, toCall: number, pot: number): Aggression {
  // Monster: never slow-play forever — jam or pot.
  if (category >= 5) return toCall > 0 ? "jam" : "pot"; // flush+
  if (category >= 3) return toCall > 0 ? "pot" : "pot"; // trips / straight
  if (category >= 2) {
    // Two pair — value bet; raise vs small bets
    if (toCall === 0) return "value";
    if (toCall <= pot) return "pot";
    return "call";
  }
  if (category >= 1) {
    if (toCall === 0) return "value";
    if (toCall <= Math.max(pot * 0.5, 1)) return "call";
    return "fold";
  }
  // Air
  if (toCall === 0) return "check";
  if (toCall <= pot * 0.15) return "call";
  return "fold";
}

function act(
  id: PlayerId,
  view: View,
  plan: Aggression,
): Action {
  const legal = view.legal ?? [];
  const has = (t: string) => legal.some((a) => a.type === t);

  if (plan === "jam" || plan === "pot" || plan === "value") {
    if (has("raise")) {
      const toAmount = raiseTarget(
        view,
        plan === "value" ? "value" : plan === "pot" ? "pot" : "jam",
      );
      return {
        type: "raise",
        playerId: id,
        payload: { toAmount },
      };
    }
    if (has("call")) {
      return { type: "call", playerId: id, payload: {} };
    }
    if (has("check")) {
      return { type: "check", playerId: id, payload: {} };
    }
  }

  if (plan === "call") {
    if (has("call")) return { type: "call", playerId: id, payload: {} };
    if (has("check")) return { type: "check", playerId: id, payload: {} };
  }

  if (plan === "check") {
    if (has("check")) return { type: "check", playerId: id, payload: {} };
    if (has("call") && (view.you?.toCall ?? 0) <= (view.bigBlind ?? 2) * 2) {
      return { type: "call", playerId: id, payload: {} };
    }
  }

  if (has("fold")) return { type: "fold", playerId: id, payload: {} };
  if (has("check")) return { type: "check", playerId: id, payload: {} };
  if (has("call")) return { type: "call", playerId: id, payload: {} };
  throw new Error("no legal holdem action");
}

/**
 * Aggressive cash-game mock: value-bets made hands hard.
 * Flush+ never open-checks when a raise is legal.
 */
export function createAggressiveHoldemSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const hole = asCards(view.you?.hole);
      const board = asCards(view.board);
      const toCall = view.you?.toCall ?? 0;
      const bb = view.bigBlind ?? 2;
      const pot = view.potTotal ?? 0;

      let plan: Aggression;
      let note: string;

      if (board.length >= 3 && hole.length === 2) {
        const { category } = bestHandScore([...hole, ...board]);
        plan = postflopPlan(category, toCall, pot);
        note = `本地启发式：牌力 ${category} → ${plan}`;
      } else {
        plan = preflopPlan(hole, toCall, bb);
        note = `本地启发式：翻前 → ${plan}`;
      }

      // Monster hands must press — never voluntarily check with flush+.
      if (
        board.length >= 3 &&
        hole.length === 2 &&
        bestHandScore([...hole, ...board]).category >= 5 &&
        (view.legal ?? []).some((a) => a.type === "raise")
      ) {
        plan = toCall > 0 ? "jam" : "pot";
        note = `本地启发式：强牌施压 → ${plan}`;
      }

      progress(note);
      return { action: act(id, view, plan) };
    },
  };
}
