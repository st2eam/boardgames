import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import { loveLetterPlugin } from "../src/plugin";
import { buildPremiumClassicDeck } from "../src/cards";

describe("love-letter premium edition", () => {
  it("builds a 16-card classic deck", () => {
    const deck = buildPremiumClassicDeck();
    expect(deck).toHaveLength(16);
    expect(deck.every((c) => c.role && c.rank >= 1 && c.rank <= 8)).toBe(true);
    expect(deck.filter((c) => c.role === "princess")).toHaveLength(1);
    expect(deck.filter((c) => c.role === "guard")).toHaveLength(5);
    expect(deck.some((c) => c.role === "spy" || c.role === "chancellor")).toBe(
      false,
    );
  });

  it("creates a premium game for 2–4 players", () => {
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b", "c"],
        playerNames: { a: "A", b: "B", c: "C" },
        seed: "prem-1",
        edition: "premium",
      },
      { rng: createRng("prem-1") },
    );
    expect(state.edition).toBe("premium");
    expect(state.players).toHaveLength(3);
    const view = loveLetterPlugin.projectView!(state, "a") as {
      edition: string;
    };
    expect(view.edition).toBe("premium");
  });

  it("rejects 5 players in premium classic", () => {
    expect(() =>
      loveLetterPlugin.createGame(
        {
          playerIds: ["a", "b", "c", "d", "e"],
          playerNames: {
            a: "A",
            b: "B",
            c: "C",
            d: "D",
            e: "E",
          },
          seed: "prem-5",
          edition: "premium",
        },
        { rng: createRng("prem-5") },
      ),
    ).toThrow(/2–4/);
  });
});
