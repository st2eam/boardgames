export type NimmtCard = {
  id: string;
  value: number;
};

/** Bullheads (negative points) for a card value 1–104. */
export function bullheads(value: number): number {
  if (value === 55) return 7;
  if (value >= 11 && value <= 99 && value % 11 === 0) return 5;
  if (value % 10 === 0) return 3;
  if (value % 5 === 0) return 2;
  return 1;
}

export function bullheadsOfCards(cards: NimmtCard[]): number {
  return cards.reduce((s, c) => s + bullheads(c.value), 0);
}

export function buildNimmtDeck(): NimmtCard[] {
  return Array.from({ length: 104 }, (_, i) => {
    const value = i + 1;
    return { id: `n${value}`, value };
  });
}
