export type Action = "H" | "S" | "D" | "P";

// H = Hit, S = Stand, D = Double (Hit if not allowed), P = Split
// Rows: player total/hand, Columns: dealer upcard (2-A indexed 0-9)
// Dealer column index: 2=0, 3=1, 4=2, 5=3, 6=4, 7=5, 8=6, 9=7, 10=8, A=9

// Hard totals (rows: 5-20)
export const HARD_TABLE: Record<number, Action[]> = {
  5:  ["H","H","H","H","H","H","H","H","H","H"],
  6:  ["H","H","H","H","H","H","H","H","H","H"],
  7:  ["H","H","H","H","H","H","H","H","H","H"],
  8:  ["H","H","H","H","H","H","H","H","H","H"],
  9:  ["H","D","D","D","D","H","H","H","H","H"],
  10: ["D","D","D","D","D","D","D","D","H","H"],
  11: ["D","D","D","D","D","D","D","D","D","D"],
  12: ["H","H","S","S","S","H","H","H","H","H"],
  13: ["S","S","S","S","S","H","H","H","H","H"],
  14: ["S","S","S","S","S","H","H","H","H","H"],
  15: ["S","S","S","S","S","H","H","H","H","H"],
  16: ["S","S","S","S","S","H","H","H","H","H"],
  17: ["S","S","S","S","S","S","S","S","S","S"],
  18: ["S","S","S","S","S","S","S","S","S","S"],
  19: ["S","S","S","S","S","S","S","S","S","S"],
  20: ["S","S","S","S","S","S","S","S","S","S"],
};

// Soft totals (rows: 13-20, i.e. A+2 through A+9)
export const SOFT_TABLE: Record<number, Action[]> = {
  13: ["H","H","H","D","D","H","H","H","H","H"],
  14: ["H","H","H","D","D","H","H","H","H","H"],
  15: ["H","H","D","D","D","H","H","H","H","H"],
  16: ["H","H","D","D","D","H","H","H","H","H"],
  17: ["H","D","D","D","D","H","H","H","H","H"],
  18: ["S","D","D","D","D","S","S","H","H","H"],
  19: ["S","S","S","S","S","S","S","S","S","S"],
  20: ["S","S","S","S","S","S","S","S","S","S"],
};

// Pair table (rows: pair value 2-11 where 11=A)
export const PAIR_TABLE: Record<number, Action[]> = {
  2:  ["P","P","P","P","P","P","H","H","H","H"],
  3:  ["P","P","P","P","P","P","H","H","H","H"],
  4:  ["H","H","H","P","P","H","H","H","H","H"],
  5:  ["D","D","D","D","D","D","D","D","H","H"],
  6:  ["P","P","P","P","P","H","H","H","H","H"],
  7:  ["P","P","P","P","P","P","H","H","H","H"],
  8:  ["P","P","P","P","P","P","P","P","P","P"],
  9:  ["P","P","P","P","P","S","P","P","S","S"],
  10: ["S","S","S","S","S","S","S","S","S","S"],
  11: ["P","P","P","P","P","P","P","P","P","P"],
};

function dealerIndex(dealerUpcard: number): number {
  // dealerUpcard: 2-11 (11=Ace)
  if (dealerUpcard === 11) return 9;
  return dealerUpcard - 2;
}

export function getCorrectAction(
  playerTotal: number,
  isSoft: boolean,
  isPair: boolean,
  pairValue: number | null,
  dealerUpcard: number
): Action {
  const col = dealerIndex(dealerUpcard);

  // Check pairs first
  if (isPair && pairValue !== null && PAIR_TABLE[pairValue]) {
    const action = PAIR_TABLE[pairValue][col];
    if (action === "P") return "P";
    // If pair table says not to split, fall through to hard/soft
  }

  // Soft hands
  if (isSoft && SOFT_TABLE[playerTotal]) {
    return SOFT_TABLE[playerTotal][col];
  }

  // Hard hands
  if (HARD_TABLE[playerTotal]) {
    return HARD_TABLE[playerTotal][col];
  }

  // Fallback: very low (hit) or very high (stand)
  return playerTotal >= 17 ? "S" : "H";
}

export const ACTION_NAMES: Record<Action, { en: string; zh: string }> = {
  H: { en: "Hit", zh: "要牌" },
  S: { en: "Stand", zh: "停牌" },
  D: { en: "Double", zh: "加倍" },
  P: { en: "Split", zh: "分牌" },
};
