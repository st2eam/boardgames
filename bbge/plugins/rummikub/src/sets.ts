import type { RummikubTile } from "./cards";

export type SetKind = "group" | "run";

/** Classify a tile list as a candidate group or run (null if neither). */
export function classify(tiles: RummikubTile[]): SetKind | null {
  const nonJokers = tiles.filter((t) => !t.joker);
  if (nonJokers.length === 0) return null;
  const colors = new Set(nonJokers.map((t) => t.color));
  const numbers = new Set(nonJokers.map((t) => t.number));

  if (colors.size === 1 && numbers.size === nonJokers.length) return "run";
  if (numbers.size === 1 && colors.size === nonJokers.length) return "group";
  return null;
}

/**
 * A group is 3–4 tiles sharing one number with distinct colors (jokers wild).
 * A run is 3+ same-color tiles whose numbers (plus joker fills) are consecutive.
 */
export function isValidSet(tiles: RummikubTile[]): boolean {
  const kind = classify(tiles);
  if (!kind) return false;

  if (kind === "group") {
    return tiles.length >= 3 && tiles.length <= 4;
  }

  // run
  if (tiles.length < 3) return false;
  const nonJokers = tiles.filter((t) => !t.joker);
  const nums = nonJokers.map((t) => t.number!).sort((a, b) => a - b);
  const min = nums[0]!;
  const max = nums[nums.length - 1]!;
  if (min < 1 || max > 13) return false;
  const span = max - min + 1;
  return span <= tiles.length; // gaps must be fillable by jokers
}

/** Sum of face values; jokers resolve to the value they represent. */
export function setPoints(tiles: RummikubTile[]): number {
  const kind = classify(tiles);
  if (kind === "group") {
    const n = tiles.find((t) => !t.joker)?.number ?? 0;
    return tiles.reduce((s, t) => s + (t.joker ? n : (t.number ?? 0)), 0);
  }
  const nonJokers = tiles
    .filter((t) => !t.joker)
    .map((t) => t.number!)
    .sort((a, b) => a - b);
  let sum = nonJokers.reduce((a, b) => a + b, 0);
  const jokerCount = tiles.length - nonJokers.length;
  if (jokerCount === 0) return sum;
  const min = nonJokers[0]!;
  const max = nonJokers[nonJokers.length - 1]!;
  const present = new Set(nonJokers);
  let left = jokerCount;
  for (let v = min + 1; v < max && left > 0; v++) {
    if (!present.has(v)) {
      sum += v;
      left--;
    }
  }
  return sum;
}
