export type Suit = "man" | "pin" | "sou" | "wind" | "dragon";

export interface TileDef {
  id: number;
  suit: Suit;
  value: number; // 1-9 for numbered suits, 1-4 for wind, 1-3 for dragon
  unicode: string;
  name: { en: string; zh: string };
}

const UNICODE_MAN = [
  "\u{1F007}","\u{1F008}","\u{1F009}","\u{1F00A}","\u{1F00B}",
  "\u{1F00C}","\u{1F00D}","\u{1F00E}","\u{1F00F}",
];
const UNICODE_PIN = [
  "\u{1F019}","\u{1F01A}","\u{1F01B}","\u{1F01C}","\u{1F01D}",
  "\u{1F01E}","\u{1F01F}","\u{1F020}","\u{1F021}",
];
const UNICODE_SOU = [
  "\u{1F010}","\u{1F011}","\u{1F012}","\u{1F013}","\u{1F014}",
  "\u{1F015}","\u{1F016}","\u{1F017}","\u{1F018}",
];
const UNICODE_WIND = ["\u{1F000}","\u{1F001}","\u{1F002}","\u{1F003}"];
const UNICODE_DRAGON = ["\u{1F004}","\u{1F005}","\u{1F006}"];

const MAN_NAMES = ["One","Two","Three","Four","Five","Six","Seven","Eight","Nine"];
const MAN_ZH = ["一","二","三","四","五","六","七","八","九"];
const WIND_EN = ["East","South","West","North"];
const WIND_ZH = ["东","南","西","北"];
const DRAGON_EN = ["Red","Green","White"];
const DRAGON_ZH = ["中","发","白"];

function buildTileDefs(): TileDef[] {
  const defs: TileDef[] = [];
  let id = 0;

  for (let v = 1; v <= 9; v++) {
    defs.push({
      id: id++,
      suit: "man",
      value: v,
      unicode: UNICODE_MAN[v - 1],
      name: { en: `${MAN_NAMES[v - 1]} of Characters`, zh: `${MAN_ZH[v - 1]}万` },
    });
  }

  for (let v = 1; v <= 9; v++) {
    defs.push({
      id: id++,
      suit: "pin",
      value: v,
      unicode: UNICODE_PIN[v - 1],
      name: { en: `${MAN_NAMES[v - 1]} of Circles`, zh: `${MAN_ZH[v - 1]}筒` },
    });
  }

  for (let v = 1; v <= 9; v++) {
    defs.push({
      id: id++,
      suit: "sou",
      value: v,
      unicode: UNICODE_SOU[v - 1],
      name: { en: `${MAN_NAMES[v - 1]} of Bamboo`, zh: `${MAN_ZH[v - 1]}条` },
    });
  }

  for (let v = 1; v <= 4; v++) {
    defs.push({
      id: id++,
      suit: "wind",
      value: v,
      unicode: UNICODE_WIND[v - 1],
      name: { en: `${WIND_EN[v - 1]} Wind`, zh: `${WIND_ZH[v - 1]}风` },
    });
  }

  for (let v = 1; v <= 3; v++) {
    defs.push({
      id: id++,
      suit: "dragon",
      value: v,
      unicode: UNICODE_DRAGON[v - 1],
      name: { en: `${DRAGON_EN[v - 1]} Dragon`, zh: `${DRAGON_ZH[v - 1]}` },
    });
  }

  return defs;
}

export const TILE_DEFS: TileDef[] = buildTileDefs();
export const TILE_COUNT = 34; // unique tile types
export const TOTAL_TILES = 136; // 34 types × 4 copies

export function getTileDef(tileId: number): TileDef {
  return TILE_DEFS[tileId];
}

export function tileIdFromSuitValue(suit: Suit, value: number): number {
  switch (suit) {
    case "man": return value - 1;
    case "pin": return 9 + value - 1;
    case "sou": return 18 + value - 1;
    case "wind": return 27 + value - 1;
    case "dragon": return 31 + value - 1;
  }
}

export function isNumbered(tileId: number): boolean {
  return tileId < 27;
}

export function getSuitOffset(tileId: number): number {
  if (tileId < 9) return 0;
  if (tileId < 18) return 9;
  if (tileId < 27) return 18;
  return -1;
}
