import { TILE_COUNT } from "./tiles";
import { isWinningHand } from "./winCheck";
import { isTenpai, findWaits } from "./tenpai";

/**
 * Generate a random tenpai hand of the given size.
 * handSize must be 3n+1 (e.g. 4, 7, 10, 13) for standard winning forms.
 * Returns tile counts array (length 34).
 */
export function generateTenpaiHand(handSize: number): number[] {
  const maxAttempts = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const hand = tryGenerateTenpai(handSize);
    if (hand && findWaits(hand).length > 0) {
      return hand;
    }
  }

  // Guaranteed simple fallback
  return guaranteedTenpai(handSize);
}

function tryGenerateTenpai(handSize: number): number[] | null {
  const completeSize = handSize + 1; // 3n+2 = winning hand
  const hand = buildRandomWinningHand(completeSize);
  if (!hand) return null;

  // Remove one tile to create tenpai
  const candidates: number[] = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    if (hand[i] > 0) candidates.push(i);
  }
  shuffle(candidates);

  for (const tileId of candidates) {
    hand[tileId]--;
    if (isTenpai(hand)) {
      return hand;
    }
    hand[tileId]++;
  }
  return null;
}

function buildRandomWinningHand(size: number): number[] | null {
  if (size % 3 !== 2) return null;

  const hand = new Array(TILE_COUNT).fill(0);
  const setsNeeded = (size - 2) / 3;

  // Pick a random pair
  const pairTile = randTileId();
  hand[pairTile] = 2;

  for (let i = 0; i < setsNeeded; i++) {
    const added = addRandomSet(hand);
    if (!added) return null;
  }

  // Validate
  const total = hand.reduce((a, b) => a + b, 0);
  if (total !== size) return null;
  if (!hand.every((c) => c >= 0 && c <= 4)) return null;
  if (!isWinningHand(hand)) return null;

  return hand;
}

function addRandomSet(hand: number[]): boolean {
  if (Math.random() < 0.6) {
    // Try sequence
    const suit = Math.floor(Math.random() * 3);
    const start = Math.floor(Math.random() * 7);
    const base = suit * 9 + start;
    if (hand[base] < 4 && hand[base + 1] < 4 && hand[base + 2] < 4) {
      hand[base]++;
      hand[base + 1]++;
      hand[base + 2]++;
      return true;
    }
  }
  // Try triplet
  const t = randTileId();
  if (hand[t] + 3 <= 4) {
    hand[t] += 3;
    return true;
  }
  // Try any valid sequence
  for (let suit = 0; suit < 3; suit++) {
    for (let start = 0; start < 7; start++) {
      const base = suit * 9 + start;
      if (hand[base] < 4 && hand[base + 1] < 4 && hand[base + 2] < 4) {
        hand[base]++;
        hand[base + 1]++;
        hand[base + 2]++;
        return true;
      }
    }
  }
  // Try any valid triplet
  for (let i = 0; i < TILE_COUNT; i++) {
    if (hand[i] + 3 <= 4) {
      hand[i] += 3;
      return true;
    }
  }
  return false;
}

function guaranteedTenpai(handSize: number): number[] {
  const hand = new Array(TILE_COUNT).fill(0);

  // Build (handSize-1)/3 complete sets + 1 single tile for pair wait
  const setsNeeded = Math.floor((handSize - 1) / 3);

  for (let i = 0; i < setsNeeded; i++) {
    // Use sequential suits to avoid conflicts
    const suit = i % 3;
    const start = (i * 2) % 7;
    const base = suit * 9 + start;
    hand[base]++;
    hand[base + 1]++;
    hand[base + 2]++;
  }

  // Add a single tile (pair wait): picking a tile not already at 4
  for (let i = 27; i < TILE_COUNT; i++) {
    if (hand[i] < 4) {
      hand[i]++;
      break;
    }
  }

  // Verify it's actually tenpai; if not, use simplest possible
  if (!isTenpai(hand)) {
    hand.fill(0);
    // 123m + East (waits for East pair)
    hand[0] = 1; hand[1] = 1; hand[2] = 1;
    hand[27] = 1;
  }

  return hand;
}

function randTileId(): number {
  return Math.floor(Math.random() * TILE_COUNT);
}

function shuffle(arr: number[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
