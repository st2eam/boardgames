import type { Stone, Coord } from "./types";

/** Get orthogonal neighbors of a coordinate */
function neighbors(c: Coord, size: number): Coord[] {
  const n: Coord[] = [];
  if (c.row > 0) n.push({ row: c.row - 1, col: c.col });
  if (c.row < size - 1) n.push({ row: c.row + 1, col: c.col });
  if (c.col > 0) n.push({ row: c.row, col: c.col - 1 });
  if (c.col < size - 1) n.push({ row: c.row, col: c.col + 1 });
  return n;
}

function key(c: Coord): string {
  return `${c.row},${c.col}`;
}

/** Find the connected group containing the stone at coord */
function findGroup(
  board: (Stone | null)[][],
  c: Coord,
  size: number
): Coord[] {
  const color = board[c.row]?.[c.col];
  if (!color) return [];
  const visited = new Set<string>();
  const group: Coord[] = [];
  const stack = [c];
  visited.add(key(c));
  while (stack.length > 0) {
    const cur = stack.pop()!;
    group.push(cur);
    for (const n of neighbors(cur, size)) {
      if (!visited.has(key(n)) && board[n.row]?.[n.col] === color) {
        visited.add(key(n));
        stack.push(n);
      }
    }
  }
  return group;
}

/** Count liberties of a group */
export function countLiberties(
  board: (Stone | null)[][],
  group: Coord[],
  size: number
): number {
  const libs = new Set<string>();
  for (const c of group) {
    for (const n of neighbors(c, size)) {
      if (board[n.row]?.[n.col] === null) {
        libs.add(key(n));
      }
    }
  }
  return libs.size;
}

/**
 * Place a stone and resolve captures.
 * Returns the new board and the number of opponent stones captured.
 */
export function placeStone(
  board: (Stone | null)[][],
  c: Coord,
  color: Stone,
  size: number
): { board: (Stone | null)[][]; captured: number } {
  if (board[c.row]?.[c.col] !== null) {
    return { board, captured: 0 }; // illegal — occupied
  }

  // Clone board and place stone
  const newBoard = board.map((row) => [...row]);
  newBoard[c.row][c.col] = color;

  const opponent: Stone = color === "black" ? "white" : "black";
  let captured = 0;

  // Check opponent groups for capture
  for (const n of neighbors(c, size)) {
    if (newBoard[n.row]?.[n.col] === opponent) {
      const group = findGroup(newBoard, n, size);
      if (countLiberties(newBoard, group, size) === 0) {
        for (const gc of group) {
          newBoard[gc.row][gc.col] = null;
          captured++;
        }
      }
    }
  }

  // Check self-capture (suicide) — not allowed unless it captures
  const ownGroup = findGroup(newBoard, c, size);
  if (countLiberties(newBoard, ownGroup, size) === 0) {
    return { board, captured: 0 }; // suicide — revert
  }

  return { board: newBoard, captured };
}

/** Parse setup string like "3,3:black" into board state */
export function parseSetup(
  setup: Record<string, Stone>,
  size: number
): (Stone | null)[][] {
  const board: (Stone | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );
  for (const [k, color] of Object.entries(setup)) {
    const [r, c] = k.split(",").map(Number);
    if (r < size && c < size) {
      board[r][c] = color;
    }
  }
  return board;
}

/** Check if a board matches the expected solution sequence */
export function checkSolution(
  board: (Stone | null)[][],
  size: number,
  targetBoard: (Stone | null)[][]
): boolean {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r]?.[c] !== targetBoard[r]?.[c]) return false;
    }
  }
  return true;
}
