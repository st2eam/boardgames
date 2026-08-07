import type { Card, Rank } from "./cards";

/** Higher category wins. */
export type HandCategory =
  | 0 // high card
  | 1 // pair
  | 2 // two pair
  | 3 // trips
  | 4 // straight
  | 5 // flush
  | 6 // full house
  | 7 // quads
  | 8; // straight flush

/** Lexicographic score: [category, …kickers high→low] */
export type HandScore = number[];

export const CATEGORY_NAME: Record<
  HandCategory,
  { en: string; zh: string }
> = {
  0: { en: "High Card", zh: "高牌" },
  1: { en: "One Pair", zh: "一对" },
  2: { en: "Two Pair", zh: "两对" },
  3: { en: "Three of a Kind", zh: "三条" },
  4: { en: "Straight", zh: "顺子" },
  5: { en: "Flush", zh: "同花" },
  6: { en: "Full House", zh: "葫芦" },
  7: { en: "Four of a Kind", zh: "四条" },
  8: { en: "Straight Flush", zh: "同花顺" },
};

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [head, ...tail] = arr;
  if (head === undefined) return [];
  const withHead = combinations(tail, k - 1).map((c) => [head, ...c]);
  const without = combinations(tail, k);
  return [...withHead, ...without];
}

function straightHigh(ranks: Rank[]): number | null {
  const uniq = [...new Set(ranks)].sort((a, b) => b - a);
  // Wheel A-2-3-4-5
  if (
    uniq.includes(14) &&
    uniq.includes(5) &&
    uniq.includes(4) &&
    uniq.includes(3) &&
    uniq.includes(2)
  ) {
    return 5;
  }
  for (let i = 0; i <= uniq.length - 5; i++) {
    const slice = uniq.slice(i, i + 5);
    if (slice[0]! - slice[4]! === 4) return slice[0]!;
  }
  return null;
}

/** Score a exact 5-card hand. */
export function scoreFive(cards: Card[]): HandScore {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const flush = suits.every((s) => s === suits[0]);
  const sHigh = straightHigh(ranks as Rank[]);

  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  const groups = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  if (flush && sHigh != null) return [8, sHigh];
  if (groups[0]?.[1] === 4) {
    const quad = groups[0][0];
    const kicker = groups.find((g) => g[0] !== quad)![0];
    return [7, quad, kicker];
  }
  if (groups[0]?.[1] === 3 && groups[1]?.[1] === 2) {
    return [6, groups[0][0], groups[1][0]];
  }
  if (flush) return [5, ...ranks];
  if (sHigh != null) return [4, sHigh];
  if (groups[0]?.[1] === 3) {
    const trip = groups[0][0];
    const kickers = groups.filter((g) => g[0] !== trip).map((g) => g[0]);
    return [3, trip, ...kickers];
  }
  if (groups[0]?.[1] === 2 && groups[1]?.[1] === 2) {
    const hi = Math.max(groups[0][0], groups[1][0]);
    const lo = Math.min(groups[0][0], groups[1][0]);
    const kicker = groups.find((g) => g[1] === 1)![0];
    return [2, hi, lo, kicker];
  }
  if (groups[0]?.[1] === 2) {
    const pair = groups[0][0];
    const kickers = groups.filter((g) => g[0] !== pair).map((g) => g[0]);
    return [1, pair, ...kickers];
  }
  return [0, ...ranks];
}

export function compareScores(a: HandScore, b: HandScore): number {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** Best 5-card score from 5–7 cards. */
export function bestHandScore(cards: Card[]): {
  score: HandScore;
  category: HandCategory;
  bestFive: Card[];
} {
  if (cards.length < 5) {
    throw new Error("need at least 5 cards");
  }
  const combos =
    cards.length === 5 ? [cards] : combinations(cards, 5);
  let best = scoreFive(combos[0]!);
  let bestFive = combos[0]!;
  for (let i = 1; i < combos.length; i++) {
    const five = combos[i]!;
    const sc = scoreFive(five);
    if (compareScores(sc, best) > 0) {
      best = sc;
      bestFive = five;
    }
  }
  return {
    score: best,
    category: best[0] as HandCategory,
    bestFive,
  };
}
