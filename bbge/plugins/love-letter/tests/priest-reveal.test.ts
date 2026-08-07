import { describe, it, expect } from "vitest";
import { createRng } from "@bbge/core";
import { loveLetterPlugin, type LoveLetterAction } from "@bbge/love-letter";

describe("priest reveal confirm", () => {
  it("holds the turn until acknowledgePriest", () => {
    let state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "priest-reveal-1",
      },
      { rng: createRng("priest-reveal-1") },
    );

    expect(state.turnOrder[state.currentIndex]).toBe("a");
    state = {
      ...state,
      hasDrawn: true,
      players: state.players.map((p) =>
        p.id === "a"
          ? {
              ...p,
              hand: [
                { id: "priest", rank: 2 as const, role: "priest" as const },
                { id: "other", rank: 4 as const, role: "handmaid" as const },
              ],
            }
          : p,
      ),
    };

    const play: LoveLetterAction = {
      type: "playCard",
      playerId: "a",
      payload: { cardId: "priest", targetId: "b" },
    };
    expect(
      loveLetterPlugin.validateAction(state, play, { rng: createRng("x") }),
    ).toBe(true);
    const applied = loveLetterPlugin.applyAction(state, play, {
      rng: createRng("x"),
    });
    state = applied.state;
    expect(state.pending?.type).toBe("priestReveal");
    expect(state.turnOrder[state.currentIndex]).toBe("a");

    const viewA = loveLetterPlugin.projectView!(state, "a") as {
      pending: { type: string; rank?: number };
    };
    expect(viewA.pending.type).toBe("priestReveal");
    expect(typeof viewA.pending.rank).toBe("number");

    const viewB = loveLetterPlugin.projectView!(state, "b") as {
      pending: { type: string; rank?: number };
    };
    expect(viewB.pending.rank).toBeUndefined();

    const ack: LoveLetterAction = {
      type: "acknowledgePriest",
      playerId: "a",
      payload: {},
    };
    const after = loveLetterPlugin.applyAction(state, ack, {
      rng: createRng("x"),
    });
    expect(after.state.pending).toBeNull();
    expect(after.state.turnOrder[after.state.currentIndex]).toBe("b");
  });
});
