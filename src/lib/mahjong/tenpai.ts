import { TILE_COUNT } from "./tiles";
import { isWinningHand } from "./winCheck";

/**
 * Given a hand of tiles (as counts array, summing to 13 or 7 or 4 etc.),
 * find all tile IDs that would complete a winning hand.
 */
export function findWaits(hand: number[]): number[] {
  const waits: number[] = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    if (hand[i] >= 4) continue; // no more copies available
    hand[i]++;
    if (isWinningHand(hand)) {
      waits.push(i);
    }
    hand[i]--;
  }
  return waits;
}

/**
 * Check if a hand is in tenpai (waiting) state.
 */
export function isTenpai(hand: number[]): boolean {
  return findWaits(hand).length > 0;
}
