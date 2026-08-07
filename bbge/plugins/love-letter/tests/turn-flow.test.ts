import { describe, it, expect } from "vitest";
import { createRng } from "@bbge/core";
import { loveLetterPlugin, type LoveLetterAction } from "@bbge/love-letter";

describe("turn flow", () => {
  it("draws for the next player immediately after a play", () => {
    let state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "turn-flow-1",
      },
      { rng: createRng("turn-flow-1") },
    );
    const first = state.turnOrder[state.currentIndex]!;
    const me = state.players.find((p) => p.id === first)!;
    expect(state.hasDrawn).toBe(true);
    expect(me.hand.length).toBe(2);

    // Prefer a no-target card so the action always validates
    const card =
      me.hand.find((c) => [0, 4, 8].includes(c.rank)) ?? me.hand[0]!;
    const action: LoveLetterAction = {
      type: "playCard",
      playerId: first,
      payload: { cardId: card.id },
    };
    const v = loveLetterPlugin.validateAction(state, action, {
      rng: createRng("turn-flow-1"),
    });
    expect(v).toBe(true);
    const applied = loveLetterPlugin.applyAction(state, action, {
      rng: createRng("turn-flow-1"),
    });
    state = applied.state;
    if (state.phase === "finished" || state.pending) return;

    const next = state.turnOrder[state.currentIndex]!;
    expect(next).not.toBe(first);
    expect(state.hasDrawn).toBe(true);
    const nextPlayer = state.players.find((p) => p.id === next)!;
    expect(nextPlayer.hand.length).toBe(2);
  });
});
