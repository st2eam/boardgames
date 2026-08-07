import { describe, it, expect } from "vitest";
import { createRng } from "@bbge/core";
import { loveLetterPlugin, type LoveLetterAction } from "@bbge/love-letter";

describe("validateAction", () => {
  it("rejects card not in hand", () => {
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "val-1",
      },
      { rng: createRng("val-1") },
    );
    const current = state.turnOrder[state.currentIndex]!;
    const action: LoveLetterAction = {
      type: "playCard",
      playerId: current,
      payload: { cardId: "not-a-real-card" },
    };
    const v = loveLetterPlugin.validateAction(state, action, {
      rng: createRng("val-1"),
    });
    expect(v).not.toBe(true);
    if (v !== true) expect(v.error).toMatch(/hand|card/i);
  });
});
