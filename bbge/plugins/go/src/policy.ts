import type { Action, PlayerId } from "@bbge/core";
import {
  groupAt,
  keyOf,
  opposite,
  scoreChinese,
  tryPlay,
} from "./board";
import type { GoCell, GoColor, GoCoord } from "./state";

export type GoPolicyView = {
  phase?: string;
  size?: number;
  komi?: number;
  consecutivePasses?: number;
  ko?: { row: number; col: number } | null;
  you?: { id: string; color: string; captures: number } | null;
  seats?: { id: string; color: string; captures: number }[];
  legal?: (
    | { type: "play"; row: number; col: number }
    | { type: "pass" }
    | { type: "resign" }
  )[];
  lastMove?: { row: number; col: number } | null;
  stones?: Record<string, "black" | "white">;
};

export type GoPolicyChoice = {
  action: Action;
  note: string;
  score: number;
};

const DIRS: GoCoord[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

function boardFromStones(
  size: number,
  stones: Record<string, "black" | "white"> | undefined,
): GoCell[][] {
  const board: GoCell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
  for (const [k, color] of Object.entries(stones ?? {})) {
    const [rs, cs] = k.split(",");
    const r = Number(rs);
    const c = Number(cs);
    if (r >= 0 && r < size && c >= 0 && c < size) board[r]![c] = color;
  }
  return board;
}

function neighbors(size: number, c: GoCoord): GoCoord[] {
  const out: GoCoord[] = [];
  for (const d of DIRS) {
    const n = { row: c.row + d.row, col: c.col + d.col };
    if (n.row >= 0 && n.row < size && n.col >= 0 && n.col < size) out.push(n);
  }
  return out;
}

function emptyCount(board: GoCell[][]): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell === null) n++;
  return n;
}

/** Points that are the last liberty of a `color` group. */
function atariLiberties(board: GoCell[][], color: GoColor): Set<string> {
  const size = board.length;
  const seen = new Set<string>();
  const libs = new Set<string>();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r]![c] !== color) continue;
      const k = keyOf({ row: r, col: c });
      if (seen.has(k)) continue;
      const g = groupAt(board, { row: r, col: c });
      for (const s of g.stones) seen.add(keyOf(s));
      if (g.liberties.size === 1) {
        for (const lib of g.liberties) libs.add(lib);
      }
    }
  }
  return libs;
}

function countAtariGroups(board: GoCell[][], color: GoColor): number {
  const size = board.length;
  const seen = new Set<string>();
  let n = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r]![c] !== color) continue;
      const k = keyOf({ row: r, col: c });
      if (seen.has(k)) continue;
      const g = groupAt(board, { row: r, col: c });
      for (const s of g.stones) seen.add(keyOf(s));
      if (g.liberties.size === 1) n++;
    }
  }
  return n;
}

/** True when every existing neighbor is own color (likely 1-point eye). */
function isLikelyOwnEye(
  board: GoCell[][],
  at: GoCoord,
  color: GoColor,
): boolean {
  const size = board.length;
  const neigh = neighbors(size, at);
  if (!neigh.length) return false;
  let own = 0;
  for (const n of neigh) {
    const cell = board[n.row]![n.col];
    if (cell === null) return false;
    if (cell !== color) return false;
    own++;
  }
  return own === neigh.length;
}

function areaFor(
  scores: ReturnType<typeof scoreChinese>,
  color: GoColor,
): number {
  return color === "black" ? scores.black : scores.white;
}

type ScoredPlay = {
  row: number;
  col: number;
  score: number;
  captured: number;
  tactician: number;
};

/**
 * Mathematical Go policy: liberty / atari tactics + Chinese-area 1-ply eval.
 * Used by mock seats and as the move brain for the LLM hybrid seat.
 */
export function chooseGoPolicyAction(
  view: GoPolicyView,
  playerId: PlayerId,
): GoPolicyChoice {
  const plays = (view.legal ?? []).filter((a) => a.type === "play") as {
    type: "play";
    row: number;
    col: number;
  }[];

  if (view.phase === "finished") {
    return {
      action: { type: "pass", playerId, payload: {} },
      note: "策略：终局",
      score: 0,
    };
  }

  if (!plays.length) {
    return {
      action: { type: "resign", playerId, payload: {} },
      note: "策略：无子可下，认输",
      score: -999,
    };
  }

  const size = view.size ?? 9;
  const color = (view.you?.color ?? "black") as GoColor;
  const opp = opposite(color);
  const board = boardFromStones(size, view.stones);
  const empties = emptyCount(board);
  const mid = (size - 1) / 2;
  const last = view.lastMove;
  const ko = view.ko ?? null;
  const komi = view.komi ?? (size >= 13 ? 7.5 : 6.5);
  const myCaps = view.you?.captures ?? 0;
  const oppCaps =
    view.seats?.find((s) => s.id !== playerId)?.captures ?? 0;
  const captures = {
    black: color === "black" ? myCaps : oppCaps,
    white: color === "white" ? myCaps : oppCaps,
  };

  const beforeScores = scoreChinese(board, captures, komi);
  const beforeArea = areaFor(beforeScores, color) - areaFor(beforeScores, opp);
  const ownAtariLibs = atariLiberties(board, color);
  const oppAtariLibs = atariLiberties(board, opp);

  const scored: ScoredPlay[] = [];

  for (const m of plays) {
    const at = { row: m.row, col: m.col };
    const result = tryPlay(board, at, color, ko);
    if (!result) continue;

    let tactician = 0;
    const captured = result.captured.length;
    tactician += captured * 42;

    const k = keyOf(at);
    if (ownAtariLibs.has(k)) tactician += 55; // save
    if (oppAtariLibs.has(k)) tactician += 48; // take the throw-in / capture race liberty

    if (isLikelyOwnEye(board, at, color) && captured === 0) {
      tactician -= 80; // don't fill your eye
    }

    const self = groupAt(result.board, at);
    if (self.liberties.size === 1 && captured === 0) {
      tactician -= 35; // self-atari
    } else if (self.liberties.size === 2 && captured === 0) {
      tactician -= 4;
    }

    const oppAtariAfter = countAtariGroups(result.board, opp);
    const oppAtariBefore = countAtariGroups(board, opp);
    tactician += Math.max(0, oppAtariAfter - oppAtariBefore) * 22;

    if (last) {
      const d = Math.abs(m.row - last.row) + Math.abs(m.col - last.col);
      if (d === 1) tactician += 14;
      else if (d === 2) tactician += 8;
      else if (d <= 3) tactician += 3;
    }

    const edgeDist = Math.min(
      m.row,
      m.col,
      size - 1 - m.row,
      size - 1 - m.col,
    );
    if (empties > size * size * 0.65) {
      if (edgeDist === 2 || edgeDist === 3) tactician += 10;
      if (edgeDist === 0) tactician -= 10;
      if (edgeDist === 1) tactician -= 3;
      const distMid = Math.abs(m.row - mid) + Math.abs(m.col - mid);
      tactician += Math.max(0, 3 - Math.abs(distMid - size * 0.55));
    }

    // Tiny deterministic jitter so ties don't always pick the first cell
    tactician += ((m.row * 17 + m.col * 31 + empties) % 11) * 0.04;

    scored.push({
      row: m.row,
      col: m.col,
      score: tactician,
      captured,
      tactician,
    });
  }

  if (!scored.length) {
    return {
      action: { type: "resign", playerId, payload: {} },
      note: "策略：无合法落子，认输",
      score: -999,
    };
  }

  scored.sort((a, b) => b.score - a.score);

  // Area 1-ply on the tactical shortlist (keeps 19×19 responsive)
  const shortlistN = size >= 19 ? 28 : size >= 13 ? 36 : 48;
  const shortlist = scored.slice(0, Math.min(shortlistN, scored.length));
  for (const cand of shortlist) {
    const result = tryPlay(
      board,
      { row: cand.row, col: cand.col },
      color,
      ko,
    );
    if (!result) continue;
    const nextCaps = {
      black:
        captures.black + (color === "black" ? result.captured.length : 0),
      white:
        captures.white + (color === "white" ? result.captured.length : 0),
    };
    const after = scoreChinese(result.board, nextCaps, komi);
    const afterArea = areaFor(after, color) - areaFor(after, opp);
    const areaDelta = afterArea - beforeArea;
    cand.score = cand.tactician + areaDelta * 6;

    // Cheap opponent reply: if they can recapture / take our new atari, discount
    const ourAtari = atariLiberties(result.board, color);
    if (ourAtari.size > 0) {
      cand.score -= Math.min(ourAtari.size, 3) * 12;
    }
  }

  shortlist.sort((a, b) => b.score - a.score);
  const best = shortlist[0]!;

  const captureDeficit = oppCaps - myCaps;
  if (
    best.captured === 0 &&
    best.score < 10 &&
    captureDeficit >= Math.max(10, Math.floor(size * size * 0.1)) &&
    empties < size * size * 0.35
  ) {
    return {
      action: { type: "resign", playerId, payload: {} },
      note: "策略：目数/提子大劣，认输",
      score: best.score,
    };
  }

  if (
    (view.consecutivePasses ?? 0) >= 1 &&
    best.captured === 0 &&
    best.score < 14 &&
    empties < size * size * 0.25
  ) {
    return {
      action: { type: "pass", playerId, payload: {} },
      note: "策略：局面已定，停着",
      score: best.score,
    };
  }

  // Late quiet board with no tactical value — pass to score rather than dump
  if (
    best.captured === 0 &&
    best.score < 6 &&
    empties < size * size * 0.12 &&
    (view.consecutivePasses ?? 0) >= 1
  ) {
    return {
      action: { type: "pass", playerId, payload: {} },
      note: "策略：官子已尽，停着",
      score: best.score,
    };
  }

  return {
    action: {
      type: "play",
      playerId,
      payload: { row: best.row, col: best.col },
    },
    note:
      best.captured > 0
        ? `策略：提子 ${best.row},${best.col} · 分=${best.score.toFixed(1)}`
        : `策略：落子 ${best.row},${best.col} · 分=${best.score.toFixed(1)}`,
    score: best.score,
  };
}
