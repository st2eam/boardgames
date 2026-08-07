/** Full Game ranks (site rules): Spy 0 … Princess 9 */
export type CardRank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** Playable editions of the Love Letter plugin */
export type LoveLetterEdition = "full" | "premium";

/**
 * Stable role for effects / art (independent of edition rank numbers).
 * Premium classic (2–4): ranks 1–8, no spy/chancellor.
 * Full Game (2–6): ranks 0–9 including spy + chancellor.
 */
export type CardRole =
  | "spy"
  | "guard"
  | "priest"
  | "baron"
  | "handmaid"
  | "prince"
  | "chancellor"
  | "king"
  | "countess"
  | "princess";

export interface Card {
  id: string;
  rank: CardRank;
  role: CardRole;
}

export const RANK_NAME_FULL: Record<CardRank, { en: string; zh: string }> = {
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

/** Premium classic (2–4) display names by rank */
export const RANK_NAME_PREMIUM: Record<number, { en: string; zh: string }> = {
  1: { en: "Guard", zh: "守卫" },
  2: { en: "Priest", zh: "神父" },
  3: { en: "Baron", zh: "男爵" },
  4: { en: "Handmaid", zh: "侍女" },
  5: { en: "Prince", zh: "王子" },
  6: { en: "King", zh: "国王" },
  7: { en: "Countess", zh: "伯爵夫人" },
  8: { en: "Princess", zh: "公主" },
};

/** @deprecated use rankName(edition, rank) */
export const RANK_NAME = RANK_NAME_FULL;

export function rankName(
  edition: LoveLetterEdition,
  rank: number,
): { en: string; zh: string } {
  if (edition === "premium") {
    return RANK_NAME_PREMIUM[rank] ?? { en: String(rank), zh: String(rank) };
  }
  return RANK_NAME_FULL[rank as CardRank] ?? { en: String(rank), zh: String(rank) };
}

export function normalizeEdition(v: unknown): LoveLetterEdition {
  return v === "premium" ? "premium" : "full";
}

export function maxPlayersForEdition(edition: LoveLetterEdition): number {
  return edition === "premium" ? 4 : 6;
}

export function minPlayersForEdition(_edition: LoveLetterEdition): number {
  return 2;
}

export function roleOf(edition: LoveLetterEdition, rank: number): CardRole | null {
  if (edition === "premium") {
    const m: Record<number, CardRole> = {
      1: "guard",
      2: "priest",
      3: "baron",
      4: "handmaid",
      5: "prince",
      6: "king",
      7: "countess",
      8: "princess",
    };
    return m[rank] ?? null;
  }
  const m: Record<number, CardRole> = {
    0: "spy",
    1: "guard",
    2: "priest",
    3: "baron",
    4: "handmaid",
    5: "prince",
    6: "chancellor",
    7: "king",
    8: "countess",
    9: "princess",
  };
  return m[rank] ?? null;
}

/** Art filenames follow Full Game numbering (public/images/bbge/love-letter). */
export function artRankForRole(role: CardRole): number {
  const m: Record<CardRole, number> = {
    spy: 0,
    guard: 1,
    priest: 2,
    baron: 3,
    handmaid: 4,
    prince: 5,
    chancellor: 6,
    king: 7,
    countess: 8,
    princess: 9,
  };
  return m[role];
}

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
      const role = roleOf("full", rank)!;
      cards.push({ id: `c${n++}`, rank, role });
    }
  }
  return cards;
}

/**
 * Premium Edition classic deck (2–4 players): 16 cards, Princess = 8.
 * (5–8 / 32-card expansion is out of scope for this play slice.)
 */
export function buildPremiumClassicDeck(): Card[] {
  const counts: Record<number, number> = {
    1: 5,
    2: 2,
    3: 2,
    4: 2,
    5: 2,
    6: 1,
    7: 1,
    8: 1,
  };
  const cards: Card[] = [];
  let n = 0;
  for (const rank of [1, 2, 3, 4, 5, 6, 7, 8]) {
    for (let i = 0; i < counts[rank]!; i++) {
      const role = roleOf("premium", rank)!;
      cards.push({ id: `c${n++}`, rank: rank as CardRank, role });
    }
  }
  return cards;
}

export function buildDeck(edition: LoveLetterEdition): Card[] {
  return edition === "premium" ? buildPremiumClassicDeck() : buildFullDeck();
}

export function mustPlayCountess(
  hand: Card[],
  edition: LoveLetterEdition = "full",
): boolean {
  const roles = hand.map((c) => c.role ?? roleOf(edition, c.rank)!);
  return (
    roles.includes("countess") &&
    (roles.includes("king") || roles.includes("prince"))
  );
}

export function maxGuessRank(edition: LoveLetterEdition): number {
  return edition === "premium" ? 8 : 9;
}
