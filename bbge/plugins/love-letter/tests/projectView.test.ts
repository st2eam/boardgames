import { describe, it, expect } from "vitest";
import { createRng } from "@bbge/core";
import { loveLetterPlugin } from "@bbge/love-letter";

describe("projectView", () => {
  it("hides other hands", () => {
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "view-1",
      },
      { rng: createRng("view-1") },
    );
    const v = loveLetterPlugin.projectView!(state, "a") as {
      you: { hand: { rank: number }[] };
      others: { hand?: unknown; handCount: number }[];
    };
    expect(v.you.hand.length).toBeGreaterThan(0);
    for (const o of v.others) {
      expect(o.hand).toBeUndefined();
      expect(typeof o.handCount).toBe("number");
    }
  });
});
