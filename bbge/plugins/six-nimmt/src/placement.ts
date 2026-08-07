import type { NimmtCard } from "./cards";
import type { NimmtState } from "./state";

const BASE_ROW_MAX = 5;

export function rowEnd(row: NimmtCard[]): number {
  return row[row.length - 1]!.value;
}

export function rowCapacity(state: NimmtState, rowIndex: number): number {
  let cap = BASE_ROW_MAX;
  if (state.rowMods[rowIndex]?.take7) cap = 6;
  return cap;
}

/** Occupied slots (numbers + jumping cow if present). */
export function rowSlots(state: NimmtState, rowIndex: number): number {
  let n = state.rows[rowIndex]!.length;
  if (state.jumpingCowRow === rowIndex) n += 1;
  return n;
}

export function isRowStopped(state: NimmtState, rowIndex: number): boolean {
  return Boolean(state.rowMods[rowIndex]?.stopped);
}

export function flipDigits(value: number): number | null {
  if (value >= 100) return null;
  if (value < 10) return value * 10; // 9 → 09 = 9 (same); rule example 90→09
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return ones * 10 + tens;
}

/**
 * Whether `value` can attach to row end under mode rules
 * (ignores Stop! / capacity).
 */
export function canAttach(
  state: NimmtState,
  rowIndex: number,
  value: number,
): boolean {
  if (isRowStopped(state, rowIndex)) return false;
  const row = state.rows[rowIndex]!;
  if (row.length === 0) return true;

  const end = rowEnd(row);
  const mountain = state.mountain;
  const descending =
    mountain != null && mountain.rowIndex === rowIndex;

  if (descending) {
    if (value >= end) return false;
  } else if (value <= end) {
    return false;
  }

  if (state.parityMarker?.rowIndex === rowIndex) {
    const wantEven = state.parityMarker.parity === "even";
    if (wantEven !== (value % 2 === 0)) return false;
  }

  return true;
}

export function fittingRows(state: NimmtState, value: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < state.rows.length; i++) {
    if (canAttach(state, i, value)) out.push(i);
  }
  return out;
}

/** Min |diff| among fitting; empty rows preferred; mountain ties → mountain row. */
export function bestRowIndex(
  state: NimmtState,
  value: number,
): number | null {
  const fits = fittingRows(state, value);
  if (fits.length === 0) return null;

  const empty = fits.find((i) => state.rows[i]!.length === 0);
  if (empty != null) return empty;

  const mountainIdx = state.mountain?.rowIndex ?? -1;
  let best = fits[0]!;
  let bestDiff = Math.abs(value - rowEnd(state.rows[best]!));

  for (const i of fits.slice(1)) {
    const d = Math.abs(value - rowEnd(state.rows[i]!));
    if (d < bestDiff) {
      best = i;
      bestDiff = d;
    }
  }
  if (mountainIdx >= 0 && fits.includes(mountainIdx)) {
    const md = Math.abs(value - rowEnd(state.rows[mountainIdx]!));
    if (md === bestDiff) return mountainIdx;
  }
  return best;
}

export function moveParityMarker(state: NimmtState): void {
  if (!state.parityMarker) return;
  let best = 0;
  let bestEnd = Infinity;
  for (let i = 0; i < state.rows.length; i++) {
    const row = state.rows[i]!;
    if (row.length === 0) continue;
    const end = rowEnd(row);
    if (end < bestEnd) {
      bestEnd = end;
      best = i;
    }
  }
  state.parityMarker = {
    rowIndex: best,
    parity: bestEnd % 2 === 0 ? "even" : "odd",
  };
}

export function moveMountainMarker(state: NimmtState): void {
  if (!state.mountain) return;
  let { rowIndex, direction } = state.mountain;
  rowIndex += direction;
  if (rowIndex <= 0) {
    rowIndex = 0;
    direction = 1;
  } else if (rowIndex >= 3) {
    rowIndex = 3;
    direction = -1;
  }
  state.mountain = { rowIndex, direction };
}

/** Jump cow to row with lowest end among other rows. */
export function jumpCow(state: NimmtState, fromRow: number): void {
  let best: number | null = null;
  let bestEnd = Infinity;
  for (let i = 0; i < state.rows.length; i++) {
    if (i === fromRow) continue;
    const row = state.rows[i]!;
    if (row.length === 0) continue;
    const end = rowEnd(row);
    if (end < bestEnd) {
      bestEnd = end;
      best = i;
    }
  }
  state.jumpingCowRow = best;
}

export function initFanMarkers(state: NimmtState): void {
  state.parityMarker = null;
  state.mountain = null;
  state.jumpingCowRow = null;

  if (state.mode === "fan-even-odd") {
    let best = 0;
    let bestVal = Infinity;
    for (let i = 0; i < state.rows.length; i++) {
      const v = state.rows[i]![0]?.value ?? Infinity;
      if (v < bestVal) {
        bestVal = v;
        best = i;
      }
    }
    state.parityMarker = {
      rowIndex: best,
      parity: bestVal % 2 === 0 ? "even" : "odd",
    };
  }

  if (state.mode === "fan-mountain") {
    // 4th row, arrows up → toward row 0
    state.mountain = { rowIndex: 3, direction: -1 };
  }

  if (state.mode === "fan-jumping-cow") {
    let best = 0;
    let bestVal = Infinity;
    for (let i = 0; i < state.rows.length; i++) {
      const v = state.rows[i]![0]?.value ?? Infinity;
      if (v < bestVal) {
        bestVal = v;
        best = i;
      }
    }
    state.jumpingCowRow = best;
  }
}
