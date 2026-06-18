export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
export const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

export const SUIT_COLORS: Record<Suit, string> = {
  spades: "text-stone-900",
  hearts: "text-red-600",
  diamonds: "text-red-600",
  clubs: "text-stone-900",
};

export function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (rank === "K" || rank === "Q" || rank === "J") return 10;
  return parseInt(rank);
}

export function handValue(cards: Card[]): { total: number; isSoft: boolean } {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    const v = cardValue(card.rank);
    total += v;
    if (card.rank === "A") aces++;
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  const isSoft = aces > 0 && total <= 21;
  return { total, isSoft };
}

export function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return cardValue(cards[0].rank) === cardValue(cards[1].rank);
}

export function randomCard(): Card {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rank, suit };
}
