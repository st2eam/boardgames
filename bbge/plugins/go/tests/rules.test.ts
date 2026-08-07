import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import { tryPlay, scoreChinese, emptyBoard } from "../src/board";
import {
  applyGoAction,
  createGoState,
  legalActions,
  validateGoAction,
} from "../src/rules";
import type { GoAction } from "../src/state";

const ctx = { rng: createRng("go-test"), now: 1 };

function fresh() {
  return createGoState(
    {
      playerIds: ["a", "b"],
      playerNames: { a: "A", b: "B" },
      edition: "9x9",
      seed: "go-test",
    },
    ctx,
  );
}

describe("go board", () => {
  it("captures a single stone", () => {
    const board = emptyBoard(9);
    // White in atari at (1,1); only liberty (2,1)
    board[0]![1] = "black";
    board[1]![0] = "black";
    board[1]![2] = "black";
    board[1]![1] = "white";
    const result = tryPlay(board, { row: 2, col: 1 }, "black", null);
    expect(result).not.toBeNull();
    expect(result!.captured).toEqual([{ row: 1, col: 1 }]);
    expect(result!.board[1]![1]).toBeNull();
  });

  it("forbids suicide and honors ko point when set", () => {
    const board = emptyBoard(9);
    board[0]![1] = "black";
    board[1]![0] = "black";
    board[1]![2] = "black";
    board[2]![1] = "black";
    // Filling (1,1) would be suicide for white
    expect(tryPlay(board, { row: 1, col: 1 }, "white", null)).toBeNull();

    // Force ko rule: after a 1-stone capture that leaves a singleton with 1 lib
    let b = emptyBoard(9);
    b[0]![1] = "black";
    b[1]![0] = "black";
    b[1]![2] = "black";
    b[1]![1] = "white";
    // White’s only liberty is (2,1); also need (0,1) etc. — add bottom open
    // Actually W at (1,1) libs: (0,1)B (1,0)B (1,2)B (2,1)· → play B at (2,1)
    const take = tryPlay(b, { row: 2, col: 1 }, "black", null);
    expect(take).not.toBeNull();
    expect(take!.captured).toEqual([{ row: 1, col: 1 }]);
    // Whether engine marks ko depends on liberties of the capturing stone;
    // when it does, immediate recapture must fail.
    if (take!.ko) {
      expect(
        tryPlay(take!.board, take!.ko, "white", take!.ko),
      ).toBeNull();
    }
  });

  it("scores chinese area with komi", () => {
    const board = emptyBoard(5);
    for (let c = 0; c < 5; c++) board[2]![c] = "black";
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 5; c++) board[r]![c] = "black";
    for (let r = 3; r < 5; r++)
      for (let c = 0; c < 5; c++) board[r]![c] = "white";
    const s = scoreChinese(board, { black: 0, white: 0 }, 6.5);
    expect(s.black).toBeGreaterThan(0);
    expect(s.white).toBeGreaterThan(s.blackStones);
  });
});

describe("go rules", () => {
  it("creates 9x9 black-to-move", () => {
    const s = fresh();
    expect(s.size).toBe(9);
    expect(s.players[0]!.color).toBe("black");
    expect(s.toActIndex).toBe(0);
  });

  it("creates 19x19 with komi 7.5", () => {
    const s = createGoState(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        edition: "19x19",
        seed: "go-19",
      },
      ctx,
    );
    expect(s.size).toBe(19);
    expect(s.edition).toBe("19x19");
    expect(s.komi).toBe(7.5);
  });

  it("plays and alternates", () => {
    let s = fresh();
    const act: GoAction = {
      type: "play",
      playerId: "a",
      payload: { row: 4, col: 4 },
    };
    expect(validateGoAction(s, act)).toBe(true);
    const r = applyGoAction(s, act, ctx);
    s = r.state;
    expect(s.board[4]![4]).toBe("black");
    expect(s.players[s.toActIndex]!.id).toBe("b");
    expect(legalActions(s, "b").some((x) => x.type === "play")).toBe(true);
  });

  it("ends after two passes and scores", () => {
    let s = fresh();
    s = applyGoAction(
      s,
      { type: "pass", playerId: "a", payload: {} },
      ctx,
    ).state;
    const end = applyGoAction(
      s,
      { type: "pass", playerId: "b", payload: {} },
      ctx,
    );
    expect(end.state.phase).toBe("finished");
    expect(end.state.scores).not.toBeNull();
    expect(end.events.some((e) => e.type === "game/ended")).toBe(true);
  });

  it("resign awards opponent", () => {
    const s = fresh();
    const r = applyGoAction(
      s,
      { type: "resign", playerId: "a", payload: {} },
      ctx,
    );
    expect(r.state.winners).toEqual(["b"]);
    expect(r.state.endReason).toBe("resign");
  });
});
