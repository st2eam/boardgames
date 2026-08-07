export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Oval table center and radii. */
export function tableGeom(size: Size) {
  const cx = size.width / 2;
  const cy = size.height * 0.42;
  return {
    cx,
    cy,
    rx: Math.min(size.width * 0.42, 280),
    ry: Math.min(size.height * 0.28, 160),
    deck: { x: cx, y: cy } as Point,
    discard: { x: cx + 90, y: cy } as Point,
  };
}

/** Opponent seats along the upper arc (excludes self at bottom). */
export function opponentSeatPositions(
  size: Size,
  count: number,
): Point[] {
  const { cx, cy, rx, ry } = tableGeom(size);
  if (count <= 0) return [];
  const start = Math.PI * 1.15;
  const end = Math.PI * 1.85;
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const a = start + (end - start) * t;
    pts.push({
      x: cx + Math.cos(a) * rx,
      y: cy + Math.sin(a) * ry * 0.85,
    });
  }
  return pts;
}

/** Fan hand cards along bottom. */
export function handFanPositions(
  size: Size,
  count: number,
): Array<Point & { rotation: number }> {
  const baseY = size.height - 70;
  const cx = size.width / 2;
  if (count <= 0) return [];
  const spread = Math.min(48, 160 / Math.max(count, 1));
  const startX = cx - ((count - 1) * spread) / 2;
  const out: Array<Point & { rotation: number }> = [];
  for (let i = 0; i < count; i++) {
    const mid = (count - 1) / 2;
    const rot = (i - mid) * 0.06;
    out.push({
      x: startX + i * spread,
      y: baseY,
      rotation: rot,
    });
  }
  return out;
}

export function chancellorFanPositions(
  size: Size,
  count: number,
): Point[] {
  const { cx, cy } = tableGeom(size);
  const spread = 86;
  const start = cx - ((count - 1) * spread) / 2;
  return Array.from({ length: count }, (_, i) => ({
    x: start + i * spread,
    y: cy,
  }));
}
