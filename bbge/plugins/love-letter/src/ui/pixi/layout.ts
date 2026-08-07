import { CARD_H, CARD_W } from "./cardFactory";

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Vertical bands so seats / table / hand do not collide. */
export function layoutBands(size: Size) {
  // Avatar (~44) + name + face-down cards (~CARD_H) need a deep top strip
  const opponentBand = Math.max(168, Math.round(size.height * 0.28));
  const handBand = CARD_H + 28;
  return {
    opponentBand,
    handBand,
    tableTop: opponentBand + 4,
    tableBottom: size.height - handBand,
  };
}

/** Oval table center and radii — sits between opponent strip and hand. */
export function tableGeom(size: Size) {
  const { tableTop, tableBottom } = layoutBands(size);
  const midH = Math.max(120, tableBottom - tableTop);
  const cx = size.width / 2;
  const cy = tableTop + midH * 0.48;
  const rx = Math.min(size.width * 0.36, 240);
  const ry = Math.min(midH * 0.38, 120);
  return {
    cx,
    cy,
    rx,
    ry,
    // Deck left of center so it does not sit under chancellor fan
    deck: { x: cx - 56, y: cy } as Point,
    discard: { x: cx + 70, y: cy } as Point,
  };
}

/**
 * Opponent seats in a top strip (not on the felt oval).
 * Keeps avatars clear of the table and of each other.
 */
export function opponentSeatPositions(size: Size, count: number): Point[] {
  if (count <= 0) return [];
  const y = 36;
  const margin = Math.max(56, CARD_W * 0.9);
  const usable = Math.max(80, size.width - margin * 2);
  if (count === 1) return [{ x: size.width / 2, y }];
  return Array.from({ length: count }, (_, i) => ({
    x: margin + (usable * i) / (count - 1),
    y,
  }));
}

/** Scale used for opponent face-down cards in the Pixi arena. */
export const OPP_CARD_SCALE = 0.62;

/** Face-down cards sit under each opponent avatar (not on top of it). */
export function opponentHandPositions(
  seat: Point,
  handCount: number,
): Array<Point & { rotation: number }> {
  const n = Math.min(handCount, 2);
  if (n <= 0) return [];
  // Avatar center + name line + half scaled card + gap
  const y = seat.y + 28 + 14 + (CARD_H * OPP_CARD_SCALE) / 2 + 10;
  const spread = 22;
  const start = seat.x - ((n - 1) * spread) / 2;
  return Array.from({ length: n }, (_, i) => ({
    x: start + i * spread,
    y,
    rotation: (i - (n - 1) / 2) * 0.08,
  }));
}

/** Fan hand cards in the bottom band of the canvas. */
export function handFanPositions(
  size: Size,
  count: number,
): Array<Point & { rotation: number }> {
  const { handBand } = layoutBands(size);
  const baseY = size.height - handBand / 2 + 4;
  const cx = size.width / 2;
  if (count <= 0) return [];
  const spread = Math.min(58, Math.max(40, 140 / Math.max(count, 1)));
  const startX = cx - ((count - 1) * spread) / 2;
  const out: Array<Point & { rotation: number }> = [];
  for (let i = 0; i < count; i++) {
    const mid = (count - 1) / 2;
    const rot = (i - mid) * 0.05;
    out.push({
      x: startX + i * spread,
      y: baseY,
      rotation: rot,
    });
  }
  return out;
}

export function chancellorFanPositions(size: Size, count: number): Point[] {
  const { cx, cy } = tableGeom(size);
  const spread = CARD_W + 12;
  const start = cx - ((count - 1) * spread) / 2;
  return Array.from({ length: count }, (_, i) => ({
    x: start + i * spread,
    y: cy + 8,
  }));
}
