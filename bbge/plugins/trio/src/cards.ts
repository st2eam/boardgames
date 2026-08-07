export type TrioCard = {
  id: string;
  value: number; // 1–12
};

/** 36 cards: 1–12 × 3 */
export function buildTrioDeck(): TrioCard[] {
  const deck: TrioCard[] = [];
  for (let v = 1; v <= 12; v++) {
    for (let i = 0; i < 3; i++) {
      deck.push({ id: `trio-${v}-${i}`, value: v });
    }
  }
  return deck;
}

export function sortHand(hand: TrioCard[]): TrioCard[] {
  return hand.slice().sort((a, b) => a.value - b.value || a.id.localeCompare(b.id));
}
