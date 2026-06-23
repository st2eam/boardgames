export type Position = "UTG" | "HJ" | "CO" | "BTN" | "SB";
export type PreflopAction = "R" | "F" | "M";

export const ACTION_NAMES: Record<PreflopAction, { en: string; zh: string }> = {
  R: { en: "Raise", zh: "加注" },
  F: { en: "Fold", zh: "弃牌" },
  M: { en: "Mixed", zh: "混合" },
};

export const POSITIONS: Position[] = ["UTG", "HJ", "CO", "BTN", "SB"];

export const POSITION_NAMES: Record<Position, { en: string; zh: string }> = {
  UTG: { en: "UTG (Under the Gun)", zh: "UTG（枪口）" },
  HJ: { en: "HJ (Hijack)", zh: "HJ（劫持位）" },
  CO: { en: "CO (Cutoff)", zh: "CO（关煞位）" },
  BTN: { en: "BTN (Button)", zh: "BTN（庄位）" },
  SB: { en: "SB (Small Blind)", zh: "SB（小盲）" },
};

// 13x13 matrix: rows and cols indexed by card rank A,K,Q,J,T,9,8,7,6,5,4,3,2
// Above diagonal = suited (e.g. row A col K = AKs)
// Diagonal = pocket pair (e.g. row A col A = AA)
// Below diagonal = offsuit (e.g. row K col A = AKo)
// R = Raise, F = Fold, M = Mixed (raise at some frequency)

export const CARD_LABELS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"] as const;
export type CardLabel = typeof CARD_LABELS[number];

// GTO 6-max 100bb RFI ranges
// Sources: PokerCoaching, GTO Gecko, FreeBetRange solver outputs

//               A    K    Q    J    T    9    8    7    6    5    4    3    2
export const UTG_TABLE: PreflopAction[][] = [
  /*A*/ ["R","R","R","R","R","R","R","R","R","R","R","R","R"], // AA,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s
  /*K*/ ["R","R","R","R","R","R","M","F","F","F","F","F","F"], // AKo,KK,KQs,KJs,KTs,K9s,K8s,...
  /*Q*/ ["R","R","R","R","R","R","F","F","F","F","F","F","F"], // AQo,KQo,QQ,QJs,QTs,Q9s,...
  /*J*/ ["R","M","F","R","R","R","F","F","F","F","F","F","F"], // AJo,KJo,...,JJ,JTs,J9s,...
  /*T*/ ["R","F","F","F","R","R","F","F","F","F","F","F","F"], // ATo,...,TT,T9s,...
  /*9*/ ["F","F","F","F","F","R","R","F","F","F","F","F","F"], // ...99,98s,...
  /*8*/ ["F","F","F","F","F","F","R","R","F","F","F","F","F"], // ...88,87s,...
  /*7*/ ["F","F","F","F","F","F","F","R","R","F","F","F","F"], // ...77,76s,...
  /*6*/ ["F","F","F","F","F","F","F","F","R","R","F","F","F"], // ...66,65s,...
  /*5*/ ["F","F","F","F","F","F","F","F","F","R","M","F","F"], // ...55,54s,...
  /*4*/ ["F","F","F","F","F","F","F","F","F","F","R","F","F"], // ...44,...
  /*3*/ ["F","F","F","F","F","F","F","F","F","F","F","R","F"], // ...33,...
  /*2*/ ["F","F","F","F","F","F","F","F","F","F","F","F","R"], // ...22,...
];

export const HJ_TABLE: PreflopAction[][] = [
  /*A*/ ["R","R","R","R","R","R","R","R","R","R","R","R","R"],
  /*K*/ ["R","R","R","R","R","R","R","M","F","F","F","F","F"],
  /*Q*/ ["R","R","R","R","R","R","F","F","F","F","F","F","F"],
  /*J*/ ["R","R","M","R","R","R","F","F","F","F","F","F","F"],
  /*T*/ ["R","M","F","F","R","R","R","F","F","F","F","F","F"],
  /*9*/ ["F","F","F","F","F","R","R","R","F","F","F","F","F"],
  /*8*/ ["F","F","F","F","F","F","R","R","R","F","F","F","F"],
  /*7*/ ["F","F","F","F","F","F","F","R","R","R","F","F","F"],
  /*6*/ ["F","F","F","F","F","F","F","F","R","R","M","F","F"],
  /*5*/ ["F","F","F","F","F","F","F","F","F","R","R","F","F"],
  /*4*/ ["F","F","F","F","F","F","F","F","F","F","R","M","F"],
  /*3*/ ["F","F","F","F","F","F","F","F","F","F","F","R","F"],
  /*2*/ ["F","F","F","F","F","F","F","F","F","F","F","F","R"],
];

export const CO_TABLE: PreflopAction[][] = [
  /*A*/ ["R","R","R","R","R","R","R","R","R","R","R","R","R"],
  /*K*/ ["R","R","R","R","R","R","R","R","R","F","F","F","F"],
  /*Q*/ ["R","R","R","R","R","R","R","F","F","F","F","F","F"],
  /*J*/ ["R","R","R","R","R","R","R","F","F","F","F","F","F"],
  /*T*/ ["R","R","M","F","R","R","R","R","F","F","F","F","F"],
  /*9*/ ["M","F","F","F","F","R","R","R","R","F","F","F","F"],
  /*8*/ ["M","F","F","F","F","F","R","R","R","M","F","F","F"],
  /*7*/ ["F","F","F","F","F","F","F","R","R","R","M","F","F"],
  /*6*/ ["F","F","F","F","F","F","F","F","R","R","R","M","F"],
  /*5*/ ["F","F","F","F","F","F","F","F","F","R","R","R","F"],
  /*4*/ ["F","F","F","F","F","F","F","F","F","F","R","R","M"],
  /*3*/ ["F","F","F","F","F","F","F","F","F","F","F","R","R"],
  /*2*/ ["F","F","F","F","F","F","F","F","F","F","F","F","R"],
];

export const BTN_TABLE: PreflopAction[][] = [
  /*A*/ ["R","R","R","R","R","R","R","R","R","R","R","R","R"],
  /*K*/ ["R","R","R","R","R","R","R","R","R","R","R","R","R"],
  /*Q*/ ["R","R","R","R","R","R","R","R","R","R","R","M","F"],
  /*J*/ ["R","R","R","R","R","R","R","R","M","F","F","F","F"],
  /*T*/ ["R","R","R","R","R","R","R","R","R","F","F","F","F"],
  /*9*/ ["R","R","M","F","F","R","R","R","R","R","M","F","F"],
  /*8*/ ["R","M","F","F","F","F","R","R","R","R","R","F","F"],
  /*7*/ ["R","F","F","F","F","F","F","R","R","R","R","R","F"],
  /*6*/ ["R","F","F","F","F","F","F","F","R","R","R","R","R"],
  /*5*/ ["R","F","F","F","F","F","F","F","F","R","R","R","R"],
  /*4*/ ["R","F","F","F","F","F","F","F","F","F","R","R","R"],
  /*3*/ ["R","F","F","F","F","F","F","F","F","F","F","R","R"],
  /*2*/ ["R","F","F","F","F","F","F","F","F","F","F","F","R"],
];

export const SB_TABLE: PreflopAction[][] = [
  /*A*/ ["R","R","R","R","R","R","R","R","R","R","R","R","R"],
  /*K*/ ["R","R","R","R","R","R","R","R","R","R","R","R","M"],
  /*Q*/ ["R","R","R","R","R","R","R","R","M","M","F","F","F"],
  /*J*/ ["R","R","R","R","R","R","R","M","M","F","F","F","F"],
  /*T*/ ["R","R","R","R","R","R","R","R","R","M","F","F","F"],
  /*9*/ ["R","R","M","F","F","R","R","R","R","R","R","F","F"],
  /*8*/ ["R","M","F","F","F","F","R","R","R","R","R","M","F"],
  /*7*/ ["R","F","F","F","F","F","F","R","R","R","R","R","M"],
  /*6*/ ["R","F","F","F","F","F","F","F","R","R","R","R","R"],
  /*5*/ ["R","F","F","F","F","F","F","F","M","R","R","R","R"],
  /*4*/ ["R","F","F","F","F","F","F","F","F","M","R","R","R"],
  /*3*/ ["R","F","F","F","F","F","F","F","F","F","F","R","R"],
  /*2*/ ["R","F","F","F","F","F","F","F","F","F","F","F","R"],
];

export const POSITION_TABLES: Record<Position, PreflopAction[][]> = {
  UTG: UTG_TABLE,
  HJ: HJ_TABLE,
  CO: CO_TABLE,
  BTN: BTN_TABLE,
  SB: SB_TABLE,
};

export function getCorrectAction(
  position: Position,
  card1Label: CardLabel,
  card2Label: CardLabel,
  isSuited: boolean,
): PreflopAction {
  const table = POSITION_TABLES[position];
  const i1 = CARD_LABELS.indexOf(card1Label);
  const i2 = CARD_LABELS.indexOf(card2Label);

  // Ensure higher card is the row index
  const row = Math.min(i1, i2);
  const col = Math.max(i1, i2);

  if (row === col) {
    // Pocket pair — on the diagonal
    return table[row][col];
  }

  if (isSuited) {
    // Suited — above diagonal: row = higher rank, col = lower rank
    return table[row][col];
  } else {
    // Offsuit — below diagonal: row = lower rank, col = higher rank
    return table[col][row];
  }
}

export function getHandLabel(
  card1Label: CardLabel,
  card2Label: CardLabel,
  isSuited: boolean,
): string {
  const i1 = CARD_LABELS.indexOf(card1Label);
  const i2 = CARD_LABELS.indexOf(card2Label);
  const high = i1 <= i2 ? card1Label : card2Label;
  const low = i1 <= i2 ? card2Label : card1Label;

  if (high === low) return `${high}${low}`;
  return `${high}${low}${isSuited ? "s" : "o"}`;
}
