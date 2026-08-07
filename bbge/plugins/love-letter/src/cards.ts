/** Full Game ranks (site rules): Spy 0 … Princess 9 */
export type CardRank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** Playable editions of the Love Letter plugin */
export type LoveLetterEdition = "classic" | "full" | "expansion";

/**
 * Stable role for effects / art (independent of edition rank numbers).
 * Classic (2–4): ranks 1–8, no spy/chancellor.
 * Full Game (2–6): ranks 0–9 including spy + chancellor.
 * Expansion (2–8): full 21 + 16 extra role cards (shared ranks).
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
  | "princess"
  | "bishop"
  | "dowagerQueen"
  | "constable"
  | "count"
  | "sycophant"
  | "baroness"
  | "cardinal"
  | "jester"
  | "assassin";

export interface Card {
  id: string;
  rank: CardRank;
  role: CardRole;
}

export const ROLE_NAME: Record<CardRole, { en: string; zh: string }> = {
  spy: { en: "Spy", zh: "间谍" },
  guard: { en: "Guard", zh: "守卫" },
  priest: { en: "Priest", zh: "神父" },
  baron: { en: "Baron", zh: "男爵" },
  handmaid: { en: "Handmaid", zh: "侍女" },
  prince: { en: "Prince", zh: "王子" },
  chancellor: { en: "Chancellor", zh: "大臣" },
  king: { en: "King", zh: "国王" },
  countess: { en: "Countess", zh: "伯爵夫人" },
  princess: { en: "Princess", zh: "公主" },
  bishop: { en: "Bishop", zh: "主教" },
  dowagerQueen: { en: "Dowager Queen", zh: "太后" },
  constable: { en: "Constable", zh: "警官" },
  count: { en: "Count", zh: "伯爵" },
  sycophant: { en: "Sycophant", zh: "谄媚者" },
  baroness: { en: "Baroness", zh: "女男爵" },
  cardinal: { en: "Cardinal", zh: "红衣主教" },
  jester: { en: "Jester", zh: "小丑" },
  assassin: { en: "Assassin", zh: "刺客" },
};

export const RANK_NAME_FULL: Record<CardRank, { en: string; zh: string }> = {
  0: ROLE_NAME.spy,
  1: ROLE_NAME.guard,
  2: ROLE_NAME.priest,
  3: ROLE_NAME.baron,
  4: ROLE_NAME.handmaid,
  5: ROLE_NAME.prince,
  6: ROLE_NAME.chancellor,
  7: ROLE_NAME.king,
  8: ROLE_NAME.countess,
  9: ROLE_NAME.princess,
};

/** Classic (2–4) display names by rank */
export const RANK_NAME_CLASSIC: Record<number, { en: string; zh: string }> = {
  1: ROLE_NAME.guard,
  2: ROLE_NAME.priest,
  3: ROLE_NAME.baron,
  4: ROLE_NAME.handmaid,
  5: ROLE_NAME.prince,
  6: ROLE_NAME.king,
  7: ROLE_NAME.countess,
  8: ROLE_NAME.princess,
};

/** @deprecated use rankName(edition, rank) */
export const RANK_NAME = RANK_NAME_FULL;

/** @deprecated use RANK_NAME_CLASSIC */
export const RANK_NAME_PREMIUM = RANK_NAME_CLASSIC;

export function rankName(
  edition: LoveLetterEdition,
  rank: number,
  role?: CardRole,
): { en: string; zh: string } {
  if (role && ROLE_NAME[role]) return ROLE_NAME[role];
  if (edition === "classic") {
    return RANK_NAME_CLASSIC[rank] ?? { en: String(rank), zh: String(rank) };
  }
  return RANK_NAME_FULL[rank as CardRank] ?? { en: String(rank), zh: String(rank) };
}

export function normalizeEdition(v: unknown): LoveLetterEdition {
  if (v === "premium" || v === "classic") return "classic";
  if (v === "expansion") return "expansion";
  return "full";
}

export function maxPlayersForEdition(edition: LoveLetterEdition): number {
  if (edition === "classic") return 4;
  if (edition === "expansion") return 8;
  return 6;
}

export function minPlayersForEdition(_edition: LoveLetterEdition): number {
  return 2;
}

/** Rank → role mapping for classic edition only; full/expansion cards carry role at build time. */
export function roleOf(edition: LoveLetterEdition, rank: number): CardRole | null {
  if (edition !== "classic") return null;
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

const ART_FILE_BY_ROLE: Record<CardRole, string> = {
  spy: "0-spy.png",
  guard: "1-guard.png",
  priest: "2-priest.png",
  baron: "3-baron.png",
  handmaid: "4-handmaid.png",
  prince: "5-prince.png",
  chancellor: "6-chancellor.png",
  king: "7-king.png",
  countess: "8-countess.png",
  princess: "9-princess.png",
  bishop: "9-bishop.png",
  dowagerQueen: "7-dowager-queen.png",
  constable: "6-constable.png",
  count: "5-count.png",
  sycophant: "4-sycophant.png",
  baroness: "3-baroness.png",
  cardinal: "2-cardinal.png",
  jester: "0-jester.png",
  assassin: "0-assassin.png",
};

/** Art filenames follow role (public/images/bbge/love-letter). */
export function artFileForRole(role: CardRole): string {
  return ART_FILE_BY_ROLE[role];
}

/** @deprecated use artFileForRole */
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
    bishop: 9,
    dowagerQueen: 7,
    constable: 6,
    count: 5,
    sycophant: 4,
    baroness: 3,
    cardinal: 2,
    jester: 0,
    assassin: 0,
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
  const fullRoles: Record<CardRank, CardRole> = {
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
  const cards: Card[] = [];
  let n = 0;
  for (const rank of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as CardRank[]) {
    for (let i = 0; i < counts[rank]; i++) {
      cards.push({ id: `c${n++}`, rank, role: fullRoles[rank] });
    }
  }
  return cards;
}

/** Classic deck (2–4 players): 16 cards, Princess = 8. */
export function buildClassicDeck(): Card[] {
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
      const role = roleOf("classic", rank)!;
      cards.push({ id: `c${n++}`, rank: rank as CardRank, role });
    }
  }
  return cards;
}

/** @deprecated use buildClassicDeck */
export const buildPremiumClassicDeck = buildClassicDeck;

/** Expansion deck: full 21 + 16 expansion role cards = 37. */
export function buildExpansionDeck(): Card[] {
  const deck = buildFullDeck();
  let n = deck.length;
  const add = (rank: CardRank, role: CardRole, count: number) => {
    for (let i = 0; i < count; i++) {
      deck.push({ id: `c${n++}`, rank, role });
    }
  };
  add(9, "bishop", 1);
  add(7, "dowagerQueen", 1);
  add(6, "constable", 1);
  add(5, "count", 2);
  add(4, "sycophant", 2);
  add(3, "baroness", 2);
  add(2, "cardinal", 2);
  add(1, "guard", 3);
  add(0, "jester", 1);
  add(0, "assassin", 1);
  return deck;
}

export function buildDeck(edition: LoveLetterEdition): Card[] {
  if (edition === "classic") return buildClassicDeck();
  if (edition === "expansion") return buildExpansionDeck();
  return buildFullDeck();
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
  return edition === "classic" ? 8 : 9;
}

export function heartTargetForPlayers(playerCount: number): number {
  if (playerCount === 2) return 7;
  if (playerCount === 3) return 5;
  return 4;
}
