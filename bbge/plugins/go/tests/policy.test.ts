import { describe, expect, it } from "vitest";
import { chooseGoPolicyAction } from "../src/policy";
import { listLegalPlays, emptyBoard, tryPlay } from "../src/board";
import type { GoCell } from "../src/state";

function stonesOf(board: GoCell[][]): Record<string, "black" | "white"> {
  const stones: Record<string, "black" | "white"> = {};
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board.length; c++) {
      const cell = board[r]![c];
      if (cell) stones[`${r},${c}`] = cell;
    }
  }
  return stones;
}

describe("chooseGoPolicyAction", () => {
  it("prefers capturing a stone in atari", () => {
    // White at 0,0 with sole liberty 0,1 (1,0 black)
    const board = emptyBoard(5);
    board[0]![0] = "white";
    board[1]![0] = "black";
    const legal = listLegalPlays(board, "black", null).map((p) => ({
      type: "play" as const,
      row: p.row,
      col: p.col,
    }));
    const { action } = chooseGoPolicyAction(
      {
        phase: "playing",
        size: 5,
        komi: 6.5,
        you: { id: "ai1", color: "black", captures: 0 },
        seats: [
          { id: "ai1", color: "black", captures: 0 },
          { id: "h", color: "white", captures: 0 },
        ],
        stones: stonesOf(board),
        lastMove: { row: 0, col: 0 },
        legal: [...legal, { type: "pass" }, { type: "resign" }],
      },
      "ai1",
    );
    expect(action.type).toBe("play");
    expect(action.payload).toEqual({ row: 0, col: 1 });
  });

  it("saves an own group in atari before playing elsewhere", () => {
    const board = emptyBoard(5);
    // Black one-stone group at 2,2 with liberty only at 2,3 (surrounded otherwise)
    board[2]![2] = "black";
    board[1]![2] = "white";
    board[3]![2] = "white";
    board[2]![1] = "white";
    // liberty 2,3 open; also far empty points
    const legal = listLegalPlays(board, "black", null).map((p) => ({
      type: "play" as const,
      row: p.row,
      col: p.col,
    }));
    const { action } = chooseGoPolicyAction(
      {
        phase: "playing",
        size: 5,
        komi: 6.5,
        you: { id: "ai1", color: "black", captures: 0 },
        seats: [
          { id: "ai1", color: "black", captures: 0 },
          { id: "h", color: "white", captures: 0 },
        ],
        stones: stonesOf(board),
        lastMove: { row: 2, col: 1 },
        legal: [...legal, { type: "pass" }, { type: "resign" }],
      },
      "ai1",
    );
    expect(action.type).toBe("play");
    expect(action.payload).toEqual({ row: 2, col: 3 });
  });

  it("resigns when no legal plays remain", () => {
    const board = emptyBoard(3);
    // Fill board completely with alternating pattern leaving no legal black play
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        board[r]![c] = "white";
      }
    }
    const { action } = chooseGoPolicyAction(
      {
        phase: "playing",
        size: 3,
        you: { id: "ai1", color: "black", captures: 0 },
        legal: [{ type: "pass" }, { type: "resign" }],
        stones: stonesOf(board),
      },
      "ai1",
    );
    expect(action.type).toBe("resign");
  });

  it("keeps tryPlay capture consistent with policy pick", () => {
    const board = emptyBoard(5);
    board[0]![0] = "white";
    board[1]![0] = "black";
    const played = tryPlay(board, { row: 0, col: 1 }, "black", null);
    expect(played?.captured.length).toBe(1);
  });
});
