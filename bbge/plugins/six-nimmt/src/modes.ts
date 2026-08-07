export type NimmtMode =
  | "classic"
  | "pro"
  | "fan-even-odd"
  | "fan-mountain"
  | "fan-jumping-cow"
  | "fan-flippin"
  | "buffalo";

export const NIMMT_MODES: NimmtMode[] = [
  "classic",
  "pro",
  "fan-even-odd",
  "fan-mountain",
  "fan-jumping-cow",
  "fan-flippin",
  "buffalo",
];

export function normalizeNimmtMode(v: unknown): NimmtMode {
  if (typeof v === "string" && (NIMMT_MODES as string[]).includes(v)) {
    return v as NimmtMode;
  }
  // Accept love-letter-style "edition" aliases from older links
  if (v === "full" || v === "premium") return "classic";
  return "classic";
}

export function minPlayersForMode(mode: NimmtMode): number {
  return mode === "buffalo" ? 1 : 2;
}

export function maxPlayersForMode(mode: NimmtMode): number {
  if (mode === "pro" || mode === "buffalo") return 6;
  return 10;
}

export function isFanMode(mode: NimmtMode): boolean {
  return (
    mode === "fan-even-odd" ||
    mode === "fan-mountain" ||
    mode === "fan-jumping-cow" ||
    mode === "fan-flippin"
  );
}

/** Face-up special count by player count (Beat the Buffalo). */
export function buffaloSpecialCount(players: number): number {
  const table: Record<number, number> = {
    1: 0,
    2: 2,
    3: 4,
    4: 6,
    5: 11,
    6: 16,
  };
  return table[players] ?? 0;
}

export type BuffaloSpecialKind =
  | "take7"
  | "stop"
  | "replace"
  | "insert"
  | "push"
  | "first"
  | "last"
  | "sort";

export const BUFFALO_SPECIAL_KINDS: BuffaloSpecialKind[] = [
  "take7",
  "stop",
  "replace",
  "insert",
  "push",
  "first",
  "last",
  "sort",
];

/** 2 of each kind → 16 cards. */
export function buildBuffaloSpecialDeck(): BuffaloSpecialKind[] {
  const out: BuffaloSpecialKind[] = [];
  for (const k of BUFFALO_SPECIAL_KINDS) {
    out.push(k, k);
  }
  return out;
}

export const BUFFALO_ID = "__buffalo__";
