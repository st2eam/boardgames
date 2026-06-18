import { TILE_COUNT, isNumbered } from "./tiles";

/**
 * Check if a hand (represented as tile counts) forms a valid winning hand.
 * Standard win: 4 sets (sequence or triplet) + 1 pair.
 * Also checks: Seven Pairs, Thirteen Orphans.
 */
export function isWinningHand(hand: number[]): boolean {
  return checkStandard(hand) || checkSevenPairs(hand) || checkThirteenOrphans(hand);
}

function checkSevenPairs(hand: number[]): boolean {
  let pairs = 0;
  for (let i = 0; i < TILE_COUNT; i++) {
    if (hand[i] === 2) pairs++;
    else if (hand[i] !== 0) return false;
  }
  return pairs === 7;
}

const TERMINAL_HONOR_IDS = [0,8,9,17,18,26,27,28,29,30,31,32,33];

function checkThirteenOrphans(hand: number[]): boolean {
  let pairFound = false;
  for (const id of TERMINAL_HONOR_IDS) {
    if (hand[id] === 0) return false;
    if (hand[id] === 2) {
      if (pairFound) return false;
      pairFound = true;
    } else if (hand[id] !== 1) return false;
  }
  for (let i = 0; i < TILE_COUNT; i++) {
    if (!TERMINAL_HONOR_IDS.includes(i) && hand[i] !== 0) return false;
  }
  return true;
}

function checkStandard(hand: number[]): boolean {
  const total = hand.reduce((a, b) => a + b, 0);
  if (total % 3 !== 2) return false;
  const setsNeeded = (total - 2) / 3;

  const h = [...hand];
  for (let i = 0; i < TILE_COUNT; i++) {
    if (h[i] >= 2) {
      h[i] -= 2;
      if (removeSets(h, setsNeeded)) return true;
      h[i] += 2;
    }
  }
  return false;
}

function removeSets(hand: number[], setsNeeded: number): boolean {
  if (setsNeeded === 0) {
    return hand.every((c) => c === 0);
  }

  for (let i = 0; i < TILE_COUNT; i++) {
    if (hand[i] > 0) {
      // Try triplet
      if (hand[i] >= 3) {
        hand[i] -= 3;
        if (removeSets(hand, setsNeeded - 1)) return true;
        hand[i] += 3;
      }
      // Try sequence (only for numbered tiles)
      if (isNumbered(i)) {
        const suitStart = Math.floor(i / 9) * 9;
        const posInSuit = i - suitStart;
        if (posInSuit <= 6 && hand[i + 1] > 0 && hand[i + 2] > 0) {
          hand[i]--;
          hand[i + 1]--;
          hand[i + 2]--;
          if (removeSets(hand, setsNeeded - 1)) return true;
          hand[i]++;
          hand[i + 1]++;
          hand[i + 2]++;
        }
      }
      return false;
    }
  }
  return setsNeeded === 0;
}
