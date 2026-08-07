export type TrioModeId = "simple" | "spicy";

export function normalizeTrioMode(v: string | undefined): TrioModeId {
  return v === "spicy" ? "spicy" : "simple";
}

export function trioModeOptions(): {
  id: TrioModeId;
  label: { en: string; zh: string };
  hint: { en: string; zh: string };
}[] {
  return [
    {
      id: "simple",
      label: { en: "Simple", zh: "简单模式" },
      hint: { en: "3 trios or 7s", zh: "3 组三条或 7" },
    },
    {
      id: "spicy",
      label: { en: "Spicy", zh: "辣味模式" },
      hint: { en: "2 connected trios or 7s", zh: "2 组相连三条或 7" },
    },
  ];
}

/** Deal sizes by player count. */
export function dealCounts(playerCount: number): {
  hand: number;
  center: number;
} {
  switch (playerCount) {
    case 3:
      return { hand: 9, center: 9 };
    case 4:
      return { hand: 7, center: 8 };
    case 5:
      return { hand: 6, center: 6 };
    case 6:
      return { hand: 5, center: 6 };
    default:
      throw new Error("TRIO needs 3–6 players");
  }
}

/** Numbers connected by sum or difference of 7. */
export const CONNECTIONS: Record<number, number[]> = {
  1: [6, 8],
  2: [5, 9],
  3: [4, 10],
  4: [3, 11],
  5: [2, 12],
  6: [1],
  7: [],
  8: [1],
  9: [2],
  10: [3],
  11: [4],
  12: [5],
};

export function areConnected(a: number, b: number): boolean {
  return Math.abs(a - b) === 7 || a + b === 7;
}

export function hasConnectedPair(trios: number[]): boolean {
  for (let i = 0; i < trios.length; i++) {
    for (let j = i + 1; j < trios.length; j++) {
      if (areConnected(trios[i]!, trios[j]!)) return true;
    }
  }
  return false;
}
