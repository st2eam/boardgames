export interface YakuDef {
  id: string;
  name: { en: string; zh: string };
  han: number;
  hanOpen: number | null; // null = closed-only
  isYakuman?: boolean;
}

export type WinMethod = "tsumo" | "ron";
export type MeldType = "shuntsu" | "minko" | "anko" | "minkan" | "ankan";
export type WaitType = "ryanmen" | "shanpon" | "kanchan" | "penchan" | "tanki";
export type PairType = "normal" | "yakuhai";

export interface MeldInput {
  type: MeldType;
  isTerminal: boolean; // contains 1/9 or honor tiles
}

export interface FuInput {
  melds: MeldInput[];
  pairType: PairType;
  waitType: WaitType;
}

export interface CalcInput {
  isDealer: boolean;
  winMethod: WinMethod;
  isClosed: boolean;
  yakuIds: string[];
  fu: FuInput;
}

export interface ScoreBreakdown {
  han: number;
  fu: number;
  basePoints: number;
  level: string;
  dealerTsumo: number; // each player pays (×3)
  dealerRon: number;
  nonDealerTsumoDealer: number; // dealer pays
  nonDealerTsumoNonDealer: number; // non-dealer pays (×2)
  nonDealerRon: number;
}

// --- Yaku Table ---

export const YAKU_LIST: YakuDef[] = [
  // 1 han
  { id: "riichi", name: { en: "Riichi", zh: "立直" }, han: 1, hanOpen: null },
  { id: "ippatsu", name: { en: "Ippatsu", zh: "一发" }, han: 1, hanOpen: null },
  { id: "menzen-tsumo", name: { en: "Menzen Tsumo", zh: "门前清自摸和" }, han: 1, hanOpen: null },
  { id: "tanyao", name: { en: "Tanyao", zh: "断幺九" }, han: 1, hanOpen: 1 },
  { id: "pinfu", name: { en: "Pinfu", zh: "平和" }, han: 1, hanOpen: null },
  { id: "iipeiko", name: { en: "Iipeiko", zh: "一杯口" }, han: 1, hanOpen: null },
  { id: "yakuhai-haku", name: { en: "Yakuhai (Haku)", zh: "役牌·白" }, han: 1, hanOpen: 1 },
  { id: "yakuhai-hatsu", name: { en: "Yakuhai (Hatsu)", zh: "役牌·发" }, han: 1, hanOpen: 1 },
  { id: "yakuhai-chun", name: { en: "Yakuhai (Chun)", zh: "役牌·中" }, han: 1, hanOpen: 1 },
  { id: "yakuhai-bakaze", name: { en: "Yakuhai (Round Wind)", zh: "役牌·场风" }, han: 1, hanOpen: 1 },
  { id: "yakuhai-jikaze", name: { en: "Yakuhai (Seat Wind)", zh: "役牌·自风" }, han: 1, hanOpen: 1 },
  { id: "haitei", name: { en: "Haitei", zh: "海底摸月" }, han: 1, hanOpen: 1 },
  { id: "houtei", name: { en: "Houtei", zh: "河底捞鱼" }, han: 1, hanOpen: 1 },
  { id: "rinshan", name: { en: "Rinshan Kaihou", zh: "岭上开花" }, han: 1, hanOpen: 1 },
  { id: "chankan", name: { en: "Chankan", zh: "抢杠" }, han: 1, hanOpen: 1 },
  // 2 han
  { id: "double-riichi", name: { en: "Double Riichi", zh: "两立直" }, han: 2, hanOpen: null },
  { id: "chanta", name: { en: "Chanta", zh: "混全带幺九" }, han: 2, hanOpen: 1 },
  { id: "ittsu", name: { en: "Ittsu", zh: "一气通贯" }, han: 2, hanOpen: 1 },
  { id: "sanshoku-doujun", name: { en: "Sanshoku Doujun", zh: "三色同顺" }, han: 2, hanOpen: 1 },
  { id: "sanshoku-doukou", name: { en: "Sanshoku Doukou", zh: "三色同刻" }, han: 2, hanOpen: 2 },
  { id: "toitoi", name: { en: "Toitoi", zh: "对对和" }, han: 2, hanOpen: 2 },
  { id: "sanankou", name: { en: "San Ankou", zh: "三暗刻" }, han: 2, hanOpen: 2 },
  { id: "sankantsu", name: { en: "San Kantsu", zh: "三杠子" }, han: 2, hanOpen: 2 },
  { id: "honroutou", name: { en: "Honroutou", zh: "混老头" }, han: 2, hanOpen: 2 },
  { id: "shousangen", name: { en: "Shousangen", zh: "小三元" }, han: 2, hanOpen: 2 },
  { id: "chiitoitsu", name: { en: "Chiitoitsu", zh: "七对子" }, han: 2, hanOpen: null },
  // 3 han
  { id: "honitsu", name: { en: "Honitsu", zh: "混一色" }, han: 3, hanOpen: 2 },
  { id: "junchan", name: { en: "Junchan", zh: "纯全带幺九" }, han: 3, hanOpen: 2 },
  { id: "ryanpeikou", name: { en: "Ryanpeikou", zh: "二杯口" }, han: 3, hanOpen: null },
  // 6 han
  { id: "chinitsu", name: { en: "Chinitsu", zh: "清一色" }, han: 6, hanOpen: 5 },
  // Yakuman
  { id: "kokushi", name: { en: "Kokushi Musou", zh: "国士无双" }, han: 13, hanOpen: null, isYakuman: true },
  { id: "suuankou", name: { en: "Suu Ankou", zh: "四暗刻" }, han: 13, hanOpen: null, isYakuman: true },
  { id: "daisangen", name: { en: "Daisangen", zh: "大三元" }, han: 13, hanOpen: 13, isYakuman: true },
  { id: "shousuushii", name: { en: "Shousuushii", zh: "小四喜" }, han: 13, hanOpen: 13, isYakuman: true },
  { id: "daisuushii", name: { en: "Daisuushii", zh: "大四喜" }, han: 13, hanOpen: 13, isYakuman: true },
  { id: "tsuuiisou", name: { en: "Tsuuiisou", zh: "字一色" }, han: 13, hanOpen: 13, isYakuman: true },
  { id: "chinroutou", name: { en: "Chinroutou", zh: "清老头" }, han: 13, hanOpen: 13, isYakuman: true },
  { id: "ryuuiisou", name: { en: "Ryuuiisou", zh: "绿一色" }, han: 13, hanOpen: 13, isYakuman: true },
  { id: "chuuren", name: { en: "Chuuren Poutou", zh: "九莲宝灯" }, han: 13, hanOpen: null, isYakuman: true },
  { id: "suukantsu", name: { en: "Suu Kantsu", zh: "四杠子" }, han: 13, hanOpen: 13, isYakuman: true },
  { id: "tenhou", name: { en: "Tenhou", zh: "天和" }, han: 13, hanOpen: null, isYakuman: true },
  { id: "chiihou", name: { en: "Chiihou", zh: "地和" }, han: 13, hanOpen: null, isYakuman: true },
];

// Group yaku by display han for UI
export function getYakuGroups(): { han: number; label: { en: string; zh: string }; yakuman?: boolean; yaku: YakuDef[] }[] {
  return [
    { han: 1, label: { en: "1 Han", zh: "1番" }, yaku: YAKU_LIST.filter(y => y.han === 1) },
    { han: 2, label: { en: "2 Han", zh: "2番" }, yaku: YAKU_LIST.filter(y => y.han === 2 && !y.isYakuman) },
    { han: 3, label: { en: "3 Han", zh: "3番" }, yaku: YAKU_LIST.filter(y => y.han === 3) },
    { han: 6, label: { en: "6 Han", zh: "6番" }, yaku: YAKU_LIST.filter(y => y.han === 6) },
    { han: 13, label: { en: "Yakuman", zh: "役满" }, yakuman: true, yaku: YAKU_LIST.filter(y => y.isYakuman) },
  ];
}

// --- Fu Calculation ---

function getMeldFu(meld: MeldInput): number {
  const base = (() => {
    switch (meld.type) {
      case "shuntsu": return 0;
      case "minko": return 4;
      case "anko": return 8;
      case "minkan": return 16;
      case "ankan": return 32;
    }
  })();
  return meld.isTerminal ? base * 2 : base;
}

function getWaitFu(waitType: WaitType): number {
  switch (waitType) {
    case "ryanmen": return 0;
    case "shanpon": return 0;
    case "kanchan": return 2;
    case "penchan": return 2;
    case "tanki": return 2;
  }
}

export function calculateFu(input: CalcInput): number {
  const { winMethod, isClosed, fu: fuInput, yakuIds } = input;

  // Chiitoitsu is always 25 fu
  if (yakuIds.includes("chiitoitsu")) return 25;

  // Pinfu tsumo = 20, pinfu ron = 30
  const isPinfu = yakuIds.includes("pinfu");
  if (isPinfu && winMethod === "tsumo") return 20;
  if (isPinfu && winMethod === "ron") return 30;

  // Base fu (futei)
  let total = 20;

  // Menzen ron bonus
  if (isClosed && winMethod === "ron") {
    total += 10;
  }

  // Tsumo bonus (not pinfu)
  if (winMethod === "tsumo") {
    total += 2;
  }

  // Meld fu
  for (const meld of fuInput.melds) {
    total += getMeldFu(meld);
  }

  // Pair fu
  if (fuInput.pairType === "yakuhai") {
    total += 2;
  }

  // Wait fu
  total += getWaitFu(fuInput.waitType);

  // Open pinfu exception: minimum 30 for open hand with no fu
  if (!isClosed && total === 20) {
    total = 30;
  }

  // Round up to nearest 10
  return Math.ceil(total / 10) * 10;
}

// --- Han Calculation ---

export function calculateHan(input: CalcInput): number {
  const { isClosed, yakuIds } = input;
  let totalHan = 0;

  for (const id of yakuIds) {
    const yaku = YAKU_LIST.find(y => y.id === id);
    if (!yaku) continue;

    if (isClosed) {
      totalHan += yaku.han;
    } else {
      if (yaku.hanOpen === null) continue; // closed-only, skip
      totalHan += yaku.hanOpen;
    }
  }

  return totalHan;
}

// --- Points Calculation ---

export type ScoreLevel = "normal" | "mangan" | "haneman" | "baiman" | "sanbaiman" | "yakuman";

export function getScoreLevel(han: number): ScoreLevel {
  if (han >= 13) return "yakuman";
  if (han >= 11) return "sanbaiman";
  if (han >= 8) return "baiman";
  if (han >= 6) return "haneman";
  if (han >= 5) return "mangan";
  return "normal";
}

export const LEVEL_NAMES: Record<ScoreLevel, { en: string; zh: string }> = {
  normal: { en: "Normal", zh: "通常" },
  mangan: { en: "Mangan", zh: "满贯" },
  haneman: { en: "Haneman", zh: "跳满" },
  baiman: { en: "Baiman", zh: "倍满" },
  sanbaiman: { en: "Sanbaiman", zh: "三倍满" },
  yakuman: { en: "Yakuman", zh: "役满" },
};

function roundUp100(n: number): number {
  return Math.ceil(n / 100) * 100;
}

export function calculateScore(input: CalcInput): ScoreBreakdown {
  const han = calculateHan(input);
  const fu = calculateFu(input);
  const level = getScoreLevel(han);

  let basePoints: number;

  switch (level) {
    case "yakuman":
      basePoints = 8000;
      break;
    case "sanbaiman":
      basePoints = 6000;
      break;
    case "baiman":
      basePoints = 4000;
      break;
    case "haneman":
      basePoints = 3000;
      break;
    case "mangan":
      basePoints = 2000;
      break;
    default: {
      const raw = fu * Math.pow(2, han + 2);
      basePoints = Math.min(raw, 2000); // cap at mangan
    }
  }

  return {
    han,
    fu,
    basePoints,
    level,
    dealerTsumo: roundUp100(basePoints * 2),
    dealerRon: roundUp100(basePoints * 6),
    nonDealerTsumoDealer: roundUp100(basePoints * 2),
    nonDealerTsumoNonDealer: roundUp100(basePoints),
    nonDealerRon: roundUp100(basePoints * 4),
  };
}
