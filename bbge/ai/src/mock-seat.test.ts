import { describe, it, expect } from "vitest";
import { createRng } from "@bbge/core";
import { loveLetterPlugin } from "@bbge/love-letter";
import { createMockLoveLetterSeat } from "./mock-seat";

describe("createMockLoveLetterSeat", () => {
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
    const action = await seat.think(view);
    expect(loveLetterPlugin.validateAction(state, action as never, {
      rng: createRng("ai-1"),
    })).toBe(true);
  });
});
