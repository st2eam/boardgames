export type Suit = "c" | "d" | "h" | "s";
/** 2–14 (T=10 … A=14) */
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export const SUITS: Suit[] = ["c", "d", "h", "s"];
export const RANKS: Rank[] = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
];

export function rankLabel(rank: Rank): string {
  if (rank <= 9) return String(rank);
  const face: Record<10 | 11 | 12 | 13 | 14, string> = {
    10: "T",
    11: "J",
    12: "Q",
    13: "K",
    14: "A",
  };
  return face[rank as 10 | 11 | 12 | 13 | 14];
}

export function cardCode(c: Card): string {
  return `${rankLabel(c.rank)}${c.suit}`;
}

/** Art file: `As.png`, `Th.png`, … under public/images/bbge/texas-holdem/ */
export function artFileForCard(c: Card): string {
  return `${rankLabel(c.rank)}${c.suit}.png`;
}

export function buildDeck(): Card[] {
  const cards: Card[] = [];
  let n = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ id: `c${n++}`, rank, suit });
    }
  }
  return cards;
}
