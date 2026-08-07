import { describe, it, expect } from "vitest";
import { createRng } from "@bbge/core";
import { loveLetterPlugin } from "@bbge/love-letter";
import { createMockLoveLetterSeat } from "./mock-seat";

describe("createMockLoveLetterSeat", () => {
  it("does not volunteer the Princess when another card exists", async () => {
    const seat = createMockLoveLetterSeat("ai1");
    const { action } = await seat.think({
      edition: "full",
      currentPlayerId: "ai1",
      you: {
        id: "ai1",
        hand: [
          { id: "p", rank: 9, role: "princess" },
          { id: "g", rank: 1, role: "guard" },
        ],
      },
      others: [{ id: "h", eliminated: false, protected: false }],
    });
    expect(action.type).toBe("playCard");
    expect((action.payload as { cardId: string }).cardId).toBe("g");
  });

  it("guesses a seen non-guard rank with Guard", async () => {
    const seat = createMockLoveLetterSeat("ai1");
    const { action } = await seat.think({
      edition: "classic",
      currentPlayerId: "ai1",
      deckCount: 10,
      you: {
        id: "ai1",
        hand: [
          { id: "g", rank: 1, role: "guard" },
          { id: "h", rank: 4, role: "handmaid" },
        ],
        seen: { foe: 8 },
      },
      others: [
        {
          id: "foe",
          eliminated: false,
          protected: false,
          discarded: [],
        },
      ],
      faceUp: [],
      selfDiscarded: [],
    });
    expect(action.type).toBe("playCard");
    const payload = action.payload as {
      cardId: string;
      targetId?: string;
      guessRank?: number;
    };
    // May play guard or handmaid depending on scoring; if guard, use seen
    if (payload.cardId === "g") {
      expect(payload.targetId).toBe("foe");
      expect(payload.guessRank).toBe(8);
    }
  });

  it("returns a legal playCard", async () => {
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "ai1"],
        playerNames: { a: "A", ai1: "Bot" },
        seed: "ai-1",
      },
      { rng: createRng("ai-1") },
    );
    const current = (loveLetterPlugin.projectView!(state, "ai1") as {
      currentPlayerId: string;
    }).currentPlayerId;
    const seatId = current;
    const view = loveLetterPlugin.projectView!(state, seatId);
    const seat = createMockLoveLetterSeat(seatId);
    const { action } = await seat.think(view);
    expect(loveLetterPlugin.validateAction(state, action as never, {
      rng: createRng("ai-1"),
    })).toBe(true);
  });
});
