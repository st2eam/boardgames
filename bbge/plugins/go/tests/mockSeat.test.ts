import { describe, expect, it } from "vitest";
import { createStrategicGoSeat } from "../src/mockSeat";

describe("createStrategicGoSeat", () => {
  it("prefers a capturing move over a random empty point", async () => {
    const seat = createStrategicGoSeat("ai1");
    // White in corner 0,0 with sole liberty 0,1 (1,0 already black)
    const stones: Record<string, "black" | "white"> = {
      "0,0": "white",
      "1,0": "black",
    };
    const { action } = await seat.think({
      phase: "playing",
      size: 5,
      toActColor: "black",
      consecutivePasses: 0,
      you: { id: "ai1", color: "black", captures: 0 },
      stones,
      lastMove: { row: 0, col: 0 },
      legal: [
        { type: "play", row: 0, col: 1 }, // capture
        { type: "play", row: 4, col: 4 }, // far corner
        { type: "pass" },
      ],
    });
    expect(action.type).toBe("play");
    expect(action.payload).toEqual({ row: 0, col: 1 });
  });
});

