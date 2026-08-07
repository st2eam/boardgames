/** Full Game ranks (site rules): Spy 0 … Princess 9 */
export type CardRank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Card {
  id: string;
  rank: CardRank;
}

export const RANK_NAME: Record<CardRank, { en: string; zh: string }> = {
  0: { en: "Spy", zh: "间谍" },
  1: { en: "Guard", zh: "守卫" },
  2: { en: "Priest", zh: "神父" },
  3: { en: "Baron", zh: "男爵" },
  4: { en: "Handmaid", zh: "侍女" },
  5: { en: "Prince", zh: "王子" },
  6: { en: "Chancellor", zh: "大臣" },
  7: { en: "King", zh: "国王" },
  8: { en: "Countess", zh: "伯爵夫人" },
  9: { en: "Princess", zh: "公主" },
};

/** Build the 21-card Full Game deck with stable ids before shuffle. */
export function buildFullDeck(): Card[] {
  const counts: Record<CardRank, number> = {
    0: 2,
    1: 6,
    2: 2,
    3: 2,
    4: 2,
    5: 2,
    6: 2,
    7: 1,
    8: 1,
    9: 1,
  };
  const cards: Card[] = [];
  let n = 0;
  for (const rank of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as CardRank[]) {
    for (let i = 0; i < counts[rank]; i++) {
      cards.push({ id: `c${n++}`, rank });
    }
  }
  return cards;
}

export function mustPlayCountess(hand: Card[]): boolean {
  const ranks = hand.map((c) => c.rank);
  return ranks.includes(8) && (ranks.includes(7) || ranks.includes(5));
}
