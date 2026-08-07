import type { GoCell, GoColor, GoCoord, GoScores } from "./state";

const DIRS: GoCoord[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

export function emptyBoard(size: number): GoCell[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
}

export function cloneBoard(board: GoCell[][]): GoCell[][] {
  return board.map((row) => row.slice());
}

export function inBounds(size: number, c: GoCoord): boolean {
  return c.row >= 0 && c.row < size && c.col >= 0 && c.col < size;
}

export function opposite(color: GoColor): GoColor {
  return color === "black" ? "white" : "black";
}

export function keyOf(c: GoCoord): string {
  return `${c.row},${c.col}`;
}

function neighbors(size: number, c: GoCoord): GoCoord[] {
  const out: GoCoord[] = [];
  for (const d of DIRS) {
    const n = { row: c.row + d.row, col: c.col + d.col };
    if (inBounds(size, n)) out.push(n);
  }
  return out;
}

/** Flood-fill connected group of `color` starting at `start`. */
export function groupAt(
  board: GoCell[][],
  start: GoCoord,
): { stones: GoCoord[]; liberties: Set<string> } {
  const size = board.length;
  const color = board[start.row]![start.col];
  if (!color) return { stones: [], liberties: new Set() };

  const stones: GoCoord[] = [];
  const liberties = new Set<string>();
  const seen = new Set<string>();
  const stack = [start];
  seen.add(keyOf(start));

  while (stack.length) {
    const cur = stack.pop()!;
    stones.push(cur);
    for (const n of neighbors(size, cur)) {
      const cell = board[n.row]![n.col];
      if (cell === null) {
        liberties.add(keyOf(n));
      } else if (cell === color) {
        const k = keyOf(n);
        if (!seen.has(k)) {
          seen.add(k);
          stack.push(n);
        }
      }
    }
  }
  return { stones, liberties };
}

/**
 * Place `color` at `at`. Returns new board + captures, or null if illegal
 * (occupied / suicide / ko). Captures opponent groups with 0 liberties first;
 * suicide is illegal unless the move captures.
 */
export function tryPlay(
  board: GoCell[][],
  at: GoCoord,
  color: GoColor,
  ko: GoCoord | null,
): { board: GoCell[][]; captured: GoCoord[]; ko: GoCoord | null } | null {
  const size = board.length;
  if (!inBounds(size, at)) return null;
  if (board[at.row]![at.col] !== null) return null;
  if (ko && ko.row === at.row && ko.col === at.col) return null;

  const next = cloneBoard(board);
  next[at.row]![at.col] = color;

  const opp = opposite(color);
  const captured: GoCoord[] = [];
  for (const n of neighbors(size, at)) {
    if (next[n.row]![n.col] !== opp) continue;
    const g = groupAt(next, n);
    if (g.liberties.size === 0) {
      for (const s of g.stones) {
        next[s.row]![s.col] = null;
        captured.push(s);
      }
    }
  }

  const self = groupAt(next, at);
  if (self.liberties.size === 0) return null;

  // Simple ko: single-stone capture that leaves exactly one liberty at that point
  // for the opponent — forbid immediate recapture.
  let newKo: GoCoord | null = null;
  if (captured.length === 1) {
    const cap = captured[0]!;
    const afterSelf = groupAt(next, at);
    if (afterSelf.stones.length === 1 && afterSelf.liberties.size === 1) {
      newKo = cap;
    }
  }

  return { board: next, captured, ko: newKo };
}

export function listLegalPlays(
  board: GoCell[][],
  color: GoColor,
  ko: GoCoord | null,
): GoCoord[] {
  const size = board.length;
  const legal: GoCoord[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (tryPlay(board, { row, col }, color, ko)) {
        legal.push({ row, col });
      }
    }
  }
  return legal;
}

/** Chinese-area-ish score: stones on board + exclusively surrounded empty. */
export function scoreChinese(
  board: GoCell[][],
  captures: { black: number; white: number },
  komi: number,
): GoScores {
  const size = board.length;
  let blackStones = 0;
  let whiteStones = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r]![c] === "black") blackStones++;
      else if (board[r]![c] === "white") whiteStones++;
    }
  }

  const seen = new Set<string>();
  let blackTerritory = 0;
  let whiteTerritory = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const k = keyOf({ row: r, col: c });
      if (board[r]![c] !== null || seen.has(k)) continue;

      const region: GoCoord[] = [];
      const borders = new Set<GoColor>();
      const stack = [{ row: r, col: c }];
      seen.add(k);

      while (stack.length) {
        const cur = stack.pop()!;
        region.push(cur);
        for (const n of neighbors(size, cur)) {
          const cell = board[n.row]![n.col];
          if (cell === null) {
            const nk = keyOf(n);
            if (!seen.has(nk)) {
              seen.add(nk);
              stack.push(n);
            }
          } else {
            borders.add(cell);
          }
        }
      }

      if (borders.size === 1) {
        if (borders.has("black")) blackTerritory += region.length;
        else whiteTerritory += region.length;
      }
    }
  }

  // Teaching simplification: area = stones + territory; captures shown but not double-counted
  // (Chinese area already includes living stones). Captures field kept for UI.
  void captures;
  const black = blackStones + blackTerritory;
  const white = whiteStones + whiteTerritory + komi;

  return {
    black,
    white,
    blackTerritory,
    whiteTerritory,
    blackStones,
    whiteStones,
    komi,
  };
}

/** Compact ASCII for LLM tutor / AI seats. */
export function boardToAscii(board: GoCell[][]): string {
  const size = board.length;
  const cols = "ABCDEFGHJKLMNOPQRST";
  const header = ["  ", ...Array.from({ length: size }, (_, c) => cols[c]!)].join(
    " ",
  );
  const lines = [header];
  for (let r = 0; r < size; r++) {
    const rowNum = String(size - r).padStart(2, " ");
    const cells = board[r]!.map((cell) =>
      cell === "black" ? "●" : cell === "white" ? "○" : "·",
    );
    lines.push(`${rowNum} ${cells.join(" ")}`);
  }
  return lines.join("\n");
}

export function coordLabel(c: GoCoord, size: number): string {
  const cols = "ABCDEFGHJKLMNOPQRST";
  return `${cols[c.col] ?? "?"}${size - c.row}`;
}
