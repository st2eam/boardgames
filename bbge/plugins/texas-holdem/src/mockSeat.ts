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
    target = streetBet + toCall + Math.max(pot + toCall, bb * 5);
  } else {
    // ~2/3 pot — common TAG / GTO-ish c-bet size
    target = streetBet + toCall + Math.max(Math.floor((pot + toCall) * 0.66), bb * 3);
  }
  return Math.min(maxTo, Math.max(minTo, Math.floor(target)));
}

function activeCount(view: View): number {
  const seats = view.seats ?? [];
  if (!seats.length) return 2;
  return Math.max(2, seats.filter((s) => !s.folded).length);
}

function hasFlushDraw(hole: Card[], board: Card[]): boolean {
  if (board.length < 3 || board.length > 4) return false;
  const suits = new Map<Suit, number>();
  for (const c of [...hole, ...board]) {
    suits.set(c.suit, (suits.get(c.suit) ?? 0) + 1);
  }
  // Exactly 4 to a suit with at least one hole card in that suit
  for (const [suit, n] of suits) {
    if (n === 4 && hole.some((c) => c.suit === suit)) return true;
  }
  return false;
}

function hasOpenEndedStraightDraw(hole: Card[], board: Card[]): boolean {
  if (board.length < 3 || board.length > 4) return false;
  const ranks = [...new Set([...hole, ...board].map((c) => Number(c.rank)))];
  // Wheel: treat Ace as 1 as well
  if (ranks.includes(14)) ranks.push(1);
  const uniq = [...new Set(ranks)].sort((a, b) => a - b);
  for (let i = 0; i < uniq.length; i++) {
    const start = uniq[i]!;
    const needed = [start, start + 1, start + 2, start + 3];
    if (!needed.every((r) => uniq.includes(r))) continue;
    // 4 ranks in a 4-span → OESD-ish; require a hole card participates
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

function preflopPlan(
  hole: Card[],
  toCall: number,
  bb: number,
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

  // Premiums — open / 3-bet for value
  if (pair && hi >= 12) return toCall > bb * 8 ? "jam" : "pot"; // QQ+
  if (hi === 14 && lo === 13) return toCall > bb * 10 ? "jam" : "pot"; // AK
  if (hi === 14 && lo === 12 && suited) return "pot"; // AQs
  if (pair && hi >= 9) {
    if (toCall === 0) return "value";
    if (toCall <= bb * 8) return mix < 0.35 ? "pot" : "call"; // occasional 3-bet
    return "fold";
  }
  if (hi === 14 && lo >= 11) {
    if (toCall === 0) return "value";
    if (toCall <= bb * 6) return mix < 0.25 ? "pot" : "call";
    return "fold";
  }

  // TAG open range: suited broadway, medium pairs, suited connectors
  if (toCall === 0) {
    if (pair && hi >= 5) return "value";
    if (suited && hi === 14 && lo >= 9) return "value"; // A9s+
    if (suited && hi >= 12 && lo >= 10) return "value"; // KQs KJs QJs
    if (suited && gap <= 2 && hi >= 9 && hi <= 12) return "value"; // T9s–QTs
    // Light steal bluff open ~18% of remaining trash in heads-up-ish
    if (!multiway && mix < 0.18 && hi >= 11) return "value";
    return "check";
  }

  // Facing a raise — tighten up
  if (pair && hi >= 6 && toCall <= bb * 5) return "call";
  if (suited && hi === 14 && lo >= 10 && toCall <= bb * 4) return "call";
  if (suited && gap <= 1 && hi >= 10 && toCall <= bb * 3) return "call";
  // Occasional flat/3-bet bluff with Axs
  if (suited && hi === 14 && lo <= 9 && toCall <= bb * 3 && mix < 0.12) {
    return mix < 0.04 ? "pot" : "call";
  }
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

  // Nutty value — mostly bet; rare trap with boats+ when checked to
  if (category >= 6) {
    if (toCall === 0 && mix < 0.12) return "check"; // rare slow-play
    if (toCall > 0) return spr < 2 || toCall > pot ? "jam" : "pot";
    return spr < 1.5 ? "jam" : "pot";
  }
  if (category >= 5) {
    // Flush: almost always value-bet; don't check-down
    if (toCall === 0) return mix < 0.2 ? "value" : "pot";
    // Raise vs bets for value; call huge overbets sometimes
    if (toCall > pot * 1.5 && mix < 0.35) return "call";
    return spr < 2 ? "jam" : "pot";
  }
  if (category >= 3) {
    if (toCall === 0) return "value";
    if (toCall <= pot) return mix < 0.55 ? "pot" : "call";
    return toCall <= pot * 1.2 ? "call" : "fold";
  }
  if (category >= 2) {
    if (toCall === 0) return "value";
    if (toCall <= pot * 0.75) return mix < 0.4 ? "value" : "call";
    if (toCall <= pot) return "call";
    return "fold";
  }
  if (category >= 1) {
    // One pair — TAG: c-bet dry-ish, fold to heat
    if (toCall === 0) {
      if (street === "river") return mix < 0.55 ? "value" : "check";
      return mix < 0.7 ? "value" : "check";
    }
    if (toCall <= Math.max(pot * 0.35, bb * 2)) return "call";
    if (toCall <= pot * 0.55 && mix < 0.3) return "call";
    return "fold";
  }

  // Air — fold to aggression; selective bluffs / semi-bluffs
  if (toCall > 0) {
    if (draw && toCall <= pot * 0.45 && street !== "river") {
      return mix < 0.4 ? "value" : "call"; // semi-bluff raise or peel
    }
    if (toCall <= pot * 0.12 && mix < 0.15) return "call"; // rare float
    return "fold";
  }

  // Checked to us with air
  if (draw && street !== "river") {
    return mix < 0.55 ? "value" : "check"; // semi-bluff
  }
  if (street === "river") {
    // Blocker / scare-card bluffs ~25–30%
    const hasAce = hole.some((c) => c.rank === 14);
    const flushBoard = boardFlushPossible(board);
    const blocker = hasAce || (flushBoard && hole.some((c) => board.some((b) => b.suit === c.suit)));
    if (blocker && mix < 0.3) return "value";
    if (!blocker && mix < 0.16) return "value";
    return "check";
  }
  // Flop/turn pure air: small probe bluff sometimes
  if (mix < 0.22) return "value";
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
 * Tight-aggressive / GTO-flavoured mock:
 * value-bets strong made hands, folds junk to heat, mixes in
 * semi-bluffs and selective river bluffs (deterministic mix).
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
      const street = view.street ?? (board.length >= 5 ? "river" : board.length === 4 ? "turn" : board.length === 3 ? "flop" : "preflop");
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
        note = `TAG启发式：${street} 牌力${category} mix=${unit.toFixed(2)} → ${plan}`;
      } else {
        plan = preflopPlan(hole, toCall, bb, unit, multiway);
        note = `TAG启发式：翻前 mix=${unit.toFixed(2)} → ${plan}`;
      }

      progress(note);
      const action = act(id, view, plan);
      // Casual Chinese table talk (action JSON types stay English).
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
