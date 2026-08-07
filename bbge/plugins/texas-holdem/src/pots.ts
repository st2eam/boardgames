import type { PlayerId } from "@bbge/core";

export type Pot = {
  amount: number;
  /** Eligible player ids (not folded when pot formed; may be all-in) */
  eligible: PlayerId[];
};

/**
 * Build main + side pots from per-player contributions this hand
 * and fold flags. Classic “layer” algorithm.
 */
export function buildPots(
  contributions: Record<string, number>,
  folded: Set<string>,
): Pot[] {
  const levels = [
    ...new Set(
      Object.values(contributions).filter((v) => v > 0),
    ),
  ].sort((a, b) => a - b);
  if (levels.length === 0) return [];

  const pots: Pot[] = [];
  let prev = 0;
  for (const level of levels) {
    const layer = level - prev;
    if (layer <= 0) continue;
    const eligible = Object.keys(contributions).filter(
      (id) => (contributions[id] ?? 0) >= level && !folded.has(id),
    );
    // Chips from everyone who put at least `level` (including folded)
    const payers = Object.keys(contributions).filter(
      (id) => (contributions[id] ?? 0) >= level,
    );
    const amount = layer * payers.length;
    if (amount > 0 && eligible.length > 0) {
      pots.push({ amount, eligible });
    } else if (amount > 0 && eligible.length === 0) {
      // All contributors folded at this layer — rare; attach to previous pot
      if (pots.length) pots[pots.length - 1]!.amount += amount;
    }
    prev = level;
  }
  return pots;
}
