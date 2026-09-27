import rawCards from "./cards.json";

export type Reward =
  | { kind: "number"; value: number }
  | { kind: "wild" }
  | { kind: "lightning"; count: 1 | 2 }
  | { kind: "star" }
  | { kind: "moon" };

export interface LuckyBoxCard {
  id: string;
  /** Nine row-major values in the 3 × 3 grid. */
  grid: number[];
  rows: Reward[];
  columns: Reward[];
}

/** Fixed original card faces. Runtime games only shuffle this committed data. */
export const LUCKY_BOX_CARDS = rawCards as LuckyBoxCard[];

export function validateLuckyBoxDeck(cards = LUCKY_BOX_CARDS): string[] {
  const issues: string[] = [];
  if (cards.length !== 60) issues.push("deck must contain 60 cards");
  const ids = new Set<string>();
  const faces = new Set<string>();
  const gridCounts = Array(10).fill(0) as number[];
  const numberRewardCounts = Array(10).fill(0) as number[];
  const lightningCounts = { 1: 0, 2: 0 };
  const positions: Record<string, number[]> = {
    row0: Array(5).fill(0),
    row1: Array(5).fill(0),
    row2: Array(5).fill(0),
    col0: Array(5).fill(0),
    col1: Array(5).fill(0),
    col2: Array(5).fill(0),
  };

  for (const card of cards) {
    if (ids.has(card.id)) issues.push("duplicate card id: " + card.id);
    ids.add(card.id);
    if (
      card.grid.length !== 9 ||
      card.grid.some((n) => !Number.isInteger(n) || n < 1 || n > 9)
    ) {
      issues.push("invalid grid: " + card.id);
    } else {
      for (const n of card.grid) gridCounts[n] += 1;
    }
    if (card.rows.length !== 3 || card.columns.length !== 3) {
      issues.push("each card needs three row and column rewards: " + card.id);
      continue;
    }

    const bonuses = [...card.rows, ...card.columns];
    const kindCounts = {
      number: 0,
      wild: 0,
      lightning: 0,
      star: 0,
      moon: 0,
    };
    for (const reward of bonuses) {
      kindCounts[reward.kind] += 1;
      if (reward.kind === "number") {
        if (!Number.isInteger(reward.value) || reward.value < 1 || reward.value > 9) {
          issues.push("invalid number reward: " + card.id);
        } else {
          numberRewardCounts[reward.value] += 1;
        }
      } else if (reward.kind === "lightning") {
        lightningCounts[reward.count] += 1;
      }
    }
    if (
      kindCounts.number !== 2 ||
      kindCounts.wild !== 1 ||
      kindCounts.lightning !== 1 ||
      kindCounts.star !== 1 ||
      kindCounts.moon !== 1
    ) {
      issues.push("invalid reward mix: " + card.id);
    }
    const face = JSON.stringify([card.grid, card.rows, card.columns]);
    if (faces.has(face)) issues.push("duplicate card face: " + card.id);
    faces.add(face);
    [...card.rows, ...card.columns].forEach((reward, i) => {
      positions[["row0", "row1", "row2", "col0", "col1", "col2"][i]!]![
        reward.kind === "number"
          ? 0
          : reward.kind === "wild"
            ? 1
            : reward.kind === "lightning"
              ? 2
              : reward.kind === "star"
                ? 3
                : 4
      ] += 1;
    });
  }

  if (new Set(gridCounts.slice(1)).size !== 1) {
    issues.push("grid values must be balanced across the deck");
  }
  if (Math.max(...numberRewardCounts.slice(1)) - Math.min(...numberRewardCounts.slice(1)) > 1) {
    issues.push("number rewards must be balanced across the deck");
  }
  if (lightningCounts[1] !== 30 || lightningCounts[2] !== 30) {
    issues.push("one- and two-lightning rewards must each appear 30 times");
  }
  for (const counts of Object.values(positions)) {
    if (counts[0] !== 20 || counts.slice(1).some((count) => count !== 10)) {
      issues.push("reward kinds must be balanced across line positions");
      break;
    }
  }
  return issues;
}
