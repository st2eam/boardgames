import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";
import type { Card, Suit } from "./cards";
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
  seats?: { id: string; folded?: boolean }[];
};

type Aggression = "jam" | "pot" | "value" | "call" | "check" | "fold";

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

/** Deterministic 0..1 mix from seat + cards (no Math.random). */
function mixUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function mixSeed(id: string, hole: Card[], board: Card[], street: string): string {
  return [id, street, ...hole.map((c) => c.id), ...board.map((c) => c.id)].join(
    "|",
  );
}

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
    // Fat value / pressure — pot-ish or larger
    target = streetBet + toCall + Math.max(pot + toCall, bb * 5);
  } else {
    // ~2/3–3/4 pot
    target =
      streetBet +
      toCall +
      Math.max(Math.floor((pot + toCall) * 0.72), bb * 3);
  }
  return Math.min(maxTo, Math.max(minTo, Math.floor(target)));
}

function activeCount(view: View): number {
  const seats = view.seats ?? [];
  if (!seats.length) return 2;
  return Math.max(2, seats.filter((s) => !s.folded).length);
}

/** Equity needed to break even on a call: toCall / (pot + toCall). */
function callPrice(toCall: number, pot: number): number {
  if (toCall <= 0) return 0;
  return toCall / (pot + toCall);
}

function hasFlushDraw(hole: Card[], board: Card[]): boolean {
  if (board.length < 3 || board.length > 4) return false;
  const suits = new Map<Suit, number>();
  for (const c of [...hole, ...board]) {
    suits.set(c.suit, (suits.get(c.suit) ?? 0) + 1);
  }
  for (const [suit, n] of suits) {
    if (n === 4 && hole.some((c) => c.suit === suit)) return true;
  }
  return false;
}

function hasOpenEndedStraightDraw(hole: Card[], board: Card[]): boolean {
  if (board.length < 3 || board.length > 4) return false;
  const ranks = [...new Set([...hole, ...board].map((c) => Number(c.rank)))];
  if (ranks.includes(14)) ranks.push(1);
  const uniq = [...new Set(ranks)].sort((a, b) => a - b);
  for (let i = 0; i < uniq.length; i++) {
    const start = uniq[i]!;
    const needed = [start, start + 1, start + 2, start + 3];
    if (!needed.every((r) => uniq.includes(r))) continue;
    if (
      hole.some(
        (c) =>
          needed.includes(c.rank) || (c.rank === 14 && needed.includes(1)),
      )
    ) {
      return true;
    }
  }
  return false;
}

function boardFlushPossible(board: Card[]): boolean {
  const suits = new Map<string, number>();
  for (const c of board) suits.set(c.suit, (suits.get(c.suit) ?? 0) + 1);
  return [...suits.values()].some((n) => n >= 3);
}

/**
 * Loose-aggressive + pot-odds: premiums smash; speculative hands enter
 * when the price is right; trash can pressure cheap pots.
 */
function preflopPlan(
  hole: Card[],
  toCall: number,
  bb: number,
  pot: number,
  mix: number,
  multiway: boolean,
): Aggression {
  if (hole.length < 2) return toCall > 0 ? "fold" : "check";
  const [a, b] = [...hole].sort((x, y) => y.rank - x.rank);
  const hi = a!.rank;
  const lo = b!.rank;
  const pair = hi === lo;
  const suited = a!.suit === b!.suit;
  const gap = hi - lo;
  const price = callPrice(toCall, pot);

  // Premiums — smash
  if (pair && hi >= 12) return toCall > bb * 12 ? "jam" : "pot"; // QQ+
  if (hi === 14 && lo === 13) return toCall > bb * 14 ? "jam" : "pot"; // AK
  if (hi === 14 && lo === 12) return "pot"; // AQ
  if (pair && hi >= 10) {
    if (toCall === 0) return "pot";
    if (price <= 0.4) return mix < 0.55 ? "pot" : "call";
    return price <= 0.5 ? "call" : "jam";
  }
  if (hi === 14 && lo >= 11) {
    if (toCall === 0) return "value";
    if (price <= 0.38) return mix < 0.4 ? "pot" : "call";
    return price <= 0.48 ? "call" : "fold";
  }

  // Open / steal when checked to — wider than TAG
  if (toCall === 0) {
    if (pair) return "value";
    if (suited && hi === 14) return "value"; // any Axs
    if (suited && hi >= 10 && lo >= 8) return "value";
    if (suited && gap <= 2 && hi >= 7) return "value";
    if (!suited && hi >= 12 && lo >= 10) return "value";
    if (!multiway && mix < 0.28 && hi >= 10) return "value"; // light steal
    return "check";
  }

  // Facing a bet — enter when pot odds are decent, sometimes re-raise
  if (pair && hi >= 5 && price <= 0.4) {
    return mix < 0.22 ? "value" : "call";
  }
  if (suited && hi === 14 && price <= 0.38) {
    return mix < 0.2 ? "value" : "call";
  }
  if (suited && gap <= 2 && hi >= 8 && price <= 0.35) {
    return mix < 0.18 ? "value" : "call";
  }
  if (hi >= 12 && lo >= 10 && price <= 0.32) return "call";
  // Cheap pot: trash can peel or poke a raise
  if (price <= 0.18) return mix < 0.35 ? "value" : "call";
  if (price <= 0.25 && mix < 0.2) return "call";
  return "fold";
}

function postflopPlan(opts: {
  category: number;
  toCall: number;
  pot: number;
  bb: number;
  mix: number;
  street: string;
  hole: Card[];
  board: Card[];
  stack: number;
}): Aggression {
  const {
    category,
    toCall,
    pot,
    bb,
    mix,
    street,
    hole,
    board,
    stack,
  } = opts;
  const spr = pot > 0 ? stack / pot : 99;
  const fd = hasFlushDraw(hole, board);
  const oesd = hasOpenEndedStraightDraw(hole, board);
  const draw = fd || oesd;
  const price = callPrice(toCall, pot);

  // Strong made hands — bet/raise hard, almost never check down
  if (category >= 6) {
    if (toCall === 0 && mix < 0.06) return "check"; // rare trap
    if (toCall > 0) return spr < 2.5 || toCall > pot * 0.8 ? "jam" : "pot";
    return spr < 2 ? "jam" : "pot";
  }
  if (category >= 5) {
    if (toCall === 0) return mix < 0.12 ? "value" : "pot";
    if (toCall > pot * 2 && mix < 0.25) return "call";
    return spr < 2.5 ? "jam" : "pot";
  }
  if (category >= 3) {
    if (toCall === 0) return mix < 0.25 ? "value" : "pot";
    if (price <= 0.55) return mix < 0.65 ? "pot" : "call";
    return price <= 0.65 ? "call" : "fold";
  }
  if (category >= 2) {
    if (toCall === 0) return "value";
    if (price <= 0.4) return mix < 0.45 ? "value" : "call";
    if (price <= 0.5) return "call";
    return "fold";
  }
  if (category >= 1) {
    // One pair — value bet; call wider on price
    if (toCall === 0) {
      if (street === "river") return mix < 0.7 ? "value" : "check";
      return mix < 0.82 ? "value" : "check";
    }
    if (price <= 0.35) return mix < 0.3 ? "value" : "call";
    if (price <= 0.45) return "call";
    return "fold";
  }

  // No made hand — pot-odds peel / pressure when cheap
  if (toCall > 0) {
    if (draw && street !== "river") {
      if (price <= 0.42) return mix < 0.45 ? "value" : "call"; // semi-bluff or peel
      if (price <= 0.5) return "call";
      return "fold";
    }
    // Pure air: call or raise only when price is good
    if (price <= 0.16) return mix < 0.4 ? "value" : "call";
    if (price <= 0.22 && mix < 0.25) return "call";
    return "fold";
  }

  // Checked to with air / draws
  if (draw && street !== "river") {
    return mix < 0.65 ? "value" : "check";
  }
  if (street === "river") {
    const hasAce = hole.some((c) => c.rank === 14);
    const flushBoard = boardFlushPossible(board);
    const blocker =
      hasAce ||
      (flushBoard &&
        hole.some((c) => board.some((b) => b.suit === c.suit)));
    if (blocker && mix < 0.35) return "value";
    if (!blocker && mix < 0.2) return "value";
    return "check";
  }
  if (mix < 0.3) return "value";
  return "check";
}

function act(id: PlayerId, view: View, plan: Aggression): Action {
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
    if (has("call")) return { type: "call", playerId: id, payload: {} };
    if (has("check")) return { type: "check", playerId: id, payload: {} };
  }

  if (plan === "call") {
    if (has("call")) return { type: "call", playerId: id, payload: {} };
    if (has("check")) return { type: "check", playerId: id, payload: {} };
  }

  if (plan === "check") {
    if (has("check")) return { type: "check", playerId: id, payload: {} };
    if (has("call") && (view.you?.toCall ?? 0) <= (view.bigBlind ?? 2)) {
      return { type: "call", playerId: id, payload: {} };
    }
  }

  if (has("fold")) return { type: "fold", playerId: id, payload: {} };
  if (has("check")) return { type: "check", playerId: id, payload: {} };
  if (has("call")) return { type: "call", playerId: id, payload: {} };
  throw new Error("no legal holdem action");
}

/**
 * Aggressive pot-odds mock: smash strong hands; with air/draws, call or
 * raise when the price is right (not a tight TAG).
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
      const street =
        view.street ??
        (board.length >= 5
          ? "river"
          : board.length === 4
            ? "turn"
            : board.length === 3
              ? "flop"
              : "preflop");
      const unit = mixUnit(mixSeed(id, hole, board, street));
      const multiway = activeCount(view) > 2;

      let plan: Aggression;
      let note: string;

      if (board.length >= 3 && hole.length === 2) {
        const { category } = bestHandScore([...hole, ...board]);
        plan = postflopPlan({
          category,
          toCall,
          pot,
          bb,
          mix: unit,
          street,
          hole,
          board,
          stack: view.you?.stack ?? 0,
        });
        note = `激进启发式：${street} 牌力${category} 价=${callPrice(toCall, pot).toFixed(2)} → ${plan}`;
      } else {
        plan = preflopPlan(hole, toCall, bb, pot, unit, multiway);
        note = `激进启发式：翻前 价=${callPrice(toCall, pot).toFixed(2)} → ${plan}`;
      }

      progress(note);
      const action = act(id, view, plan);
      const speakByPlan: Record<Aggression, string> = {
        fold: "不要了",
        check: "过",
        call: "跟",
        value: "再加一点",
        pot: "加压",
        jam: "全下",
      };
      return { action, speak: speakByPlan[plan] };
    },
  };
}
