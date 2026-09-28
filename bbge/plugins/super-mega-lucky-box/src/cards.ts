import rawCards from "./cards.json";

export type Reward =
  | { kind: "number"; value: number }
  | { kind: "wild" }
  | { kind: "lightning"; count: 1 | 2 }
  | { kind: "star" }
  | { kind: "moon" }
  | { kind: "none" };

export interface LuckyBoxCard {
  id: string;
  /** Nine row-major values in the 3 × 3 grid. */
  grid: number[];
  rows: Reward[];
  columns: Reward[];
}

/** Physical card faces numbered 1–60. Runtime games only shuffle this fixed deck. */
export const LUCKY_BOX_CARDS = rawCards as LuckyBoxCard[];

export function validateLuckyBoxDeck(cards = LUCKY_BOX_CARDS): string[] {
  const issues: string[] = [];
  if (cards.length !== 60) issues.push("deck must contain 60 cards");
  const ids = new Set<string>();
  const faces = new Set<string>();
  const gridCounts = Array(10).fill(0) as number[];
  const numberRewardCounts = Array(10).fill(0) as number[];
  let emptyRewards = 0;

  for (const [index, card] of cards.entries()) {
    if (card.id !== `box-${String(index + 1).padStart(2, "0")}`) {
      issues.push("unexpected physical card number: " + card.id);
    }
    if (ids.has(card.id)) issues.push("duplicate card id: " + card.id);
    ids.add(card.id);
    if (
      card.grid.length !== 9 ||
      card.grid.some((n) => !Number.isInteger(n) || n < 1 || n > 9)
    ) {
      issues.push("invalid grid: " + card.id);
    } else {
      for (const n of card.grid) gridCounts[n] += 1;
      for (let row = 0; row < 3; row++) {
        const band = card.grid.slice(row * 3, row * 3 + 3).sort().join("");
        if (!["123", "456", "789"].includes(band)) {
          issues.push("invalid physical number row: " + card.id);
        }
      }
    }
    if (card.rows.length !== 3 || card.columns.length !== 3) {
      issues.push("each card needs three row and column positions: " + card.id);
      continue;
    }

    for (const reward of [...card.rows, ...card.columns]) {
      if (reward.kind === "number") {
        if (!Number.isInteger(reward.value) || reward.value < 1 || reward.value > 9) {
          issues.push("invalid number reward: " + card.id);
        } else {
          numberRewardCounts[reward.value] += 1;
        }
      } else if (reward.kind === "lightning") {
        if (reward.count !== 1 && reward.count !== 2) {
          issues.push("invalid lightning reward: " + card.id);
        }
      } else if (reward.kind === "none") {
        emptyRewards += 1;
      } else if (reward.kind !== "wild" && reward.kind !== "star" && reward.kind !== "moon") {
        issues.push("invalid reward kind: " + card.id);
      }
    }
    const face = JSON.stringify([card.grid, card.rows, card.columns]);
    if (faces.has(face)) issues.push("duplicate card face: " + card.id);
    faces.add(face);
  }

  if (gridCounts.slice(1).some((count) => count !== 60)) {
    issues.push("each grid value must appear 60 times across the physical deck");
  }
  if (numberRewardCounts.slice(1).some((count) => count !== 17)) {
    issues.push("each number reward must appear 17 times across the physical deck");
  }
  if (emptyRewards !== 8) {
    issues.push("the physical deck must have eight empty reward positions");
  }
  return issues;
}
