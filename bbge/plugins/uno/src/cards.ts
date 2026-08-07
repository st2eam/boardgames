import type { UnoEditionId } from "./editions";

export type UnoColor = "red" | "yellow" | "green" | "blue";

export type UnoKind =
  | "number"
  | "skip"
  | "reverse"
  | "draw"
  | "wild"
  | "wildDraw"
  | "flip"
  | "skipAll"
  | "discardAll"
  | "wildSwapHands"
  | "wildShuffleHands"
  | "wildDrawColor"
  | "wildRoulette"
  | "wildReverseDraw";

/** One playable face (Flip cards have light + dark). */
export type UnoFace = {
  color: UnoColor | null;
  kind: UnoKind;
  /** 0–9 for number cards */
  number?: number;
  /** Draw penalty strength (1/2/4/5/6/10) */
  drawN?: number;
};

export type UnoCard = {
  id: string;
  light: UnoFace;
  /** Flip edition only */
  dark?: UnoFace;
};

export type UnoSide = "light" | "dark";

const COLORS: UnoColor[] = ["red", "yellow", "green", "blue"];

function face(
  color: UnoColor | null,
  kind: UnoKind,
  extra?: { number?: number; drawN?: number },
): UnoFace {
  return { color, kind, ...extra };
}

function push(
  deck: UnoCard[],
  id: string,
  light: UnoFace,
  dark?: UnoFace,
): void {
  deck.push(dark ? { id, light, dark } : { id, light });
}

/** Active face for the current side. */
export function activeFace(card: UnoCard, side: UnoSide): UnoFace {
  if (side === "dark" && card.dark) return card.dark;
  return card.light;
}

export function buildUnoDeck(edition: UnoEditionId): UnoCard[] {
  if (edition === "flip") return buildFlipDeck();
  if (edition === "no-mercy") return buildNoMercyDeck();
  return buildClassicDeck();
}

function buildClassicDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  let n = 0;
  for (const color of COLORS) {
    push(deck, `c-${n++}`, face(color, "number", { number: 0 }));
    for (let v = 1; v <= 9; v++) {
      push(deck, `c-${n++}`, face(color, "number", { number: v }));
      push(deck, `c-${n++}`, face(color, "number", { number: v }));
    }
    for (let i = 0; i < 2; i++) {
      push(deck, `c-${n++}`, face(color, "skip"));
      push(deck, `c-${n++}`, face(color, "reverse"));
      push(deck, `c-${n++}`, face(color, "draw", { drawN: 2 }));
    }
  }
  for (let i = 0; i < 4; i++) {
    push(deck, `c-${n++}`, face(null, "wild"));
    push(deck, `c-${n++}`, face(null, "wildDraw", { drawN: 4 }));
  }
  push(deck, `c-${n++}`, face(null, "wildSwapHands"));
  push(deck, `c-${n++}`, face(null, "wildShuffleHands"));
  return deck;
}

/** UNO Flip — paired light/dark faces (112 cards). */
function buildFlipDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  let n = 0;
  for (const color of COLORS) {
    // Numbers 1–9 ×2 light paired with dark numbers
    for (let v = 1; v <= 9; v++) {
      for (let i = 0; i < 2; i++) {
        push(
          deck,
          `f-${n++}`,
          face(color, "number", { number: v }),
          face(color, "number", { number: v }),
        );
      }
    }
    // 1× zero each color
    push(
      deck,
      `f-${n++}`,
      face(color, "number", { number: 0 }),
      face(color, "number", { number: 0 }),
    );
    for (let i = 0; i < 2; i++) {
      push(
        deck,
        `f-${n++}`,
        face(color, "draw", { drawN: 1 }),
        face(color, "draw", { drawN: 5 }),
      );
      push(
        deck,
        `f-${n++}`,
        face(color, "reverse"),
        face(color, "reverse"),
      );
      push(
        deck,
        `f-${n++}`,
        face(color, "skip"),
        face(color, "skipAll"),
      );
      push(deck, `f-${n++}`, face(color, "flip"), face(color, "flip"));
    }
  }
  for (let i = 0; i < 4; i++) {
    push(
      deck,
      `f-${n++}`,
      face(null, "wild"),
      face(null, "wild"),
    );
    push(
      deck,
      `f-${n++}`,
      face(null, "wildDraw", { drawN: 2 }),
      face(null, "wildDrawColor"),
    );
  }
  return deck;
}

function buildNoMercyDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  let n = 0;
  for (const color of COLORS) {
    push(deck, `m-${n++}`, face(color, "number", { number: 0 }));
    for (let v = 1; v <= 9; v++) {
      push(deck, `m-${n++}`, face(color, "number", { number: v }));
      push(deck, `m-${n++}`, face(color, "number", { number: v }));
    }
    // discard all ×3, skip ×3, reverse ×3 per color (≈12 each type total)
    for (let i = 0; i < 3; i++) {
      push(deck, `m-${n++}`, face(color, "discardAll"));
      push(deck, `m-${n++}`, face(color, "skip"));
      push(deck, `m-${n++}`, face(color, "reverse"));
    }
    for (let i = 0; i < 2; i++) {
      push(deck, `m-${n++}`, face(color, "draw", { drawN: 2 }));
      push(deck, `m-${n++}`, face(color, "draw", { drawN: 4 }));
      push(deck, `m-${n++}`, face(color, "skipAll"));
    }
  }
  for (let i = 0; i < 8; i++) {
    push(deck, `m-${n++}`, face(null, "wildRoulette"));
    push(deck, `m-${n++}`, face(null, "wildReverseDraw", { drawN: 4 }));
  }
  for (let i = 0; i < 4; i++) {
    push(deck, `m-${n++}`, face(null, "wildDraw", { drawN: 6 }));
    push(deck, `m-${n++}`, face(null, "wildDraw", { drawN: 10 }));
  }
  return deck;
}

export function facesMatch(
  card: UnoFace,
  top: UnoFace,
  currentColor: UnoColor,
): boolean {
  if (card.kind === "wild" ||
    card.kind === "wildDraw" ||
    card.kind === "wildSwapHands" ||
    card.kind === "wildShuffleHands" ||
    card.kind === "wildDrawColor" ||
    card.kind === "wildRoulette" ||
    card.kind === "wildReverseDraw") {
    return true;
  }
  if (card.color === currentColor) return true;
  if (card.kind === "number" && top.kind === "number" && card.number === top.number) {
    return true;
  }
  if (card.kind === top.kind && card.kind !== "number") {
    // same symbol (skip/reverse/draw/flip/…)
    if (card.kind === "draw") return card.drawN === top.drawN;
    return true;
  }
  return false;
}

/** No Mercy: can stack this draw card onto pending penalty. */
export function canStackDraw(card: UnoFace, pendingAmount: number): boolean {
  if (card.kind === "draw" && (card.drawN ?? 0) >= pendingAmount) return true;
  if (
    (card.kind === "wildDraw" || card.kind === "wildReverseDraw") &&
    (card.drawN ?? 0) >= pendingAmount
  ) {
    return true;
  }
  return false;
}

export function cardPoints(face: UnoFace, edition: UnoEditionId): number {
  if (face.kind === "number") return face.number ?? 0;
  if (edition === "flip") {
    if (face.kind === "draw") return 10;
    if (face.kind === "flip" || face.kind === "skip" || face.kind === "skipAll" || face.kind === "reverse") {
      return 20;
    }
    if (face.kind === "wild") return 40;
    if (face.kind === "wildDraw" || face.kind === "wildDrawColor") return 50;
    return 20;
  }
  if (edition === "no-mercy") {
    if (face.kind === "draw") {
      if (face.drawN === 2) return 20;
      if (face.drawN === 4) return 50;
    }
    if (face.kind === "skip" || face.kind === "reverse" || face.kind === "discardAll") {
      return 20;
    }
    if (face.kind === "skipAll") return 30;
    if (face.kind === "wildRoulette") return 40;
    if (face.kind === "wildReverseDraw") return 20;
    if (face.kind === "wildDraw") {
      if (face.drawN === 6) return 60;
      if (face.drawN === 10) return 80;
    }
    return 20;
  }
  // classic
  if (face.kind === "skip" || face.kind === "reverse" || face.kind === "draw") {
    return 20;
  }
  if (face.kind === "wild" || face.kind === "wildDraw") return 50;
  if (face.kind === "wildSwapHands" || face.kind === "wildShuffleHands") {
    return 40;
  }
  return 20;
}

export function faceLabel(face: UnoFace, zh: boolean): string {
  const colorName = (c: UnoColor | null) => {
    if (!c) return zh ? "万能" : "Wild";
    const map = {
      red: zh ? "红" : "R",
      yellow: zh ? "黄" : "Y",
      green: zh ? "绿" : "G",
      blue: zh ? "蓝" : "B",
    };
    return map[c];
  };
  if (face.kind === "number") return `${colorName(face.color)}${face.number}`;
  if (face.kind === "skip") return `${colorName(face.color)}${zh ? "跳过" : "Skip"}`;
  if (face.kind === "reverse") {
    return `${colorName(face.color)}${zh ? "反转" : "Rev"}`;
  }
  if (face.kind === "draw") {
    return `${colorName(face.color)}+${face.drawN ?? 2}`;
  }
  if (face.kind === "flip") return `${colorName(face.color)}${zh ? "翻转" : "Flip"}`;
  if (face.kind === "skipAll") {
    return `${colorName(face.color)}${zh ? "全跳" : "SkipAll"}`;
  }
  if (face.kind === "discardAll") {
    return `${colorName(face.color)}${zh ? "弃同色" : "DiscardAll"}`;
  }
  if (face.kind === "wild") return zh ? "万能" : "Wild";
  if (face.kind === "wildDraw") return zh ? `万能+${face.drawN}` : `W+${face.drawN}`;
  if (face.kind === "wildSwapHands") return zh ? "交换手牌" : "SwapHands";
  if (face.kind === "wildShuffleHands") return zh ? "重洗手牌" : "ShuffleHands";
  if (face.kind === "wildDrawColor") return zh ? "罚抽颜色" : "DrawColor";
  if (face.kind === "wildRoulette") return zh ? "颜色轮盘" : "Roulette";
  if (face.kind === "wildReverseDraw") return zh ? "反转+4" : "Rev+4";
  return face.kind;
}
