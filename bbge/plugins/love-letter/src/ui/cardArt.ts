import { artRankForRole, type CardRole } from "../cards";

const RANK_FILES: Record<number, string> = {
  0: "0-spy.png",
  1: "1-guard.png",
  2: "2-priest.png",
  3: "3-baron.png",
  4: "4-handmaid.png",
  5: "5-prince.png",
  6: "6-chancellor.png",
  7: "7-king.png",
  8: "8-countess.png",
  9: "9-princess.png",
};

function basePath(): string {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/boardgames")
  ) {
    return "/boardgames";
  }
  return "";
}

/** Prefer role so Premium ranks still use Full Game art files. */
export function cardFaceUrl(rank: number, role?: string): string {
  const artRank =
    role && artRankForRole(role as CardRole) != null
      ? artRankForRole(role as CardRole)
      : rank;
  const file = RANK_FILES[artRank] ?? RANK_FILES[1]!;
  return `${basePath()}/images/bbge/love-letter/${file}`;
}

export function cardBackUrl(): string {
  return `${basePath()}/images/bbge/love-letter/back.png`;
}

export function cardLabel(
  c: { rank: number; name?: { en: string; zh: string } },
  locale: string,
): string {
  return c.name?.[locale === "zh" ? "zh" : "en"] ?? String(c.rank);
}
