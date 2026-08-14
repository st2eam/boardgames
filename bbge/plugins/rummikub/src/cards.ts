export type RummikubColor = "black" | "red" | "blue" | "orange";

export type RummikubTile = {
  id: string;
  color: RummikubColor | null;
  number: number | null;
  joker: boolean;
};

export const COLORS: RummikubColor[] = ["black", "red", "blue", "orange"];

const COLOR_ORDER: Record<RummikubColor, number> = {
  black: 0,
  red: 1,
  blue: 2,
  orange: 3,
};

/** 106 tiles: 1–13 × 4 colors × 2 copies = 104 + 2 jokers. */
export function buildRummikubDeck(): RummikubTile[] {
  const deck: RummikubTile[] = [];
  let n = 0;
  for (let v = 1; v <= 13; v++) {
    for (const color of COLORS) {
      for (let copy = 0; copy < 2; copy++) {
        deck.push({ id: `t-${n++}`, color, number: v, joker: false });
      }
    }
  }
  for (let i = 0; i < 2; i++) {
    deck.push({ id: `t-${n++}`, color: null, number: null, joker: true });
  }
  return deck;
}

/** Rack ordering: number asc, then color, jokers last. */
export function sortHand(hand: RummikubTile[]): RummikubTile[] {
  return hand.slice().sort((a, b) => {
    if (a.joker && b.joker) return a.id.localeCompare(b.id);
    if (a.joker) return 1;
    if (b.joker) return -1;
    const cn = (a.number ?? 0) - (b.number ?? 0);
    if (cn !== 0) return cn;
    const cc = COLOR_ORDER[a.color!] - COLOR_ORDER[b.color!];
    if (cc !== 0) return cc;
    return a.id.localeCompare(b.id);
  });
}

/** Display ordering for a table set (numbers asc, jokers last). */
export function sortSet(tiles: RummikubTile[]): RummikubTile[] {
  return tiles.slice().sort((a, b) => {
    if (a.joker && b.joker) return a.id.localeCompare(b.id);
    if (a.joker) return 1;
    if (b.joker) return -1;
    const cn = (a.number ?? 0) - (b.number ?? 0);
    if (cn !== 0) return cn;
    const cc = COLOR_ORDER[a.color!] - COLOR_ORDER[b.color!];
    if (cc !== 0) return cc;
    return a.id.localeCompare(b.id);
  });
}

/** End-of-round penalty value (joker = 30). */
export function tilePoints(tile: RummikubTile): number {
  return tile.joker ? 30 : (tile.number ?? 0);
}
