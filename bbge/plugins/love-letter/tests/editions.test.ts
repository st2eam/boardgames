import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import { loveLetterPlugin } from "../src/plugin";
import {
  buildClassicDeck,
  buildExpansionDeck,
  buildFullDeck,
  maxPlayersForEdition,
  normalizeEdition,
} from "../src/cards";

describe("love-letter editions", () => {
  it("builds a 16-card classic deck", () => {
    const deck = buildClassicDeck();
    expect(deck).toHaveLength(16);
    expect(deck.every((c) => c.role && c.rank >= 1 && c.rank <= 8)).toBe(true);
    expect(deck.filter((c) => c.role === "princess")).toHaveLength(1);
    expect(deck.filter((c) => c.role === "guard")).toHaveLength(5);
    expect(deck.some((c) => c.role === "spy" || c.role === "chancellor")).toBe(
      false,
    );
  });

  it("builds a 21-card full deck", () => {
    const deck = buildFullDeck();
    expect(deck).toHaveLength(21);
    expect(deck.filter((c) => c.role === "spy")).toHaveLength(2);
    expect(deck.filter((c) => c.role === "chancellor")).toHaveLength(2);
  });

  it("builds a 37-card expansion deck", () => {
    const deck = buildExpansionDeck();
    expect(deck).toHaveLength(37);
    expect(deck.filter((c) => c.role === "spy")).toHaveLength(2);
    expect(deck.filter((c) => c.role === "chancellor")).toHaveLength(2);
    expect(deck.filter((c) => c.role === "bishop")).toHaveLength(1);
    expect(deck.filter((c) => c.role === "guard")).toHaveLength(9);
    expect(deck.filter((c) => c.role === "assassin")).toHaveLength(1);
    expect(deck.filter((c) => c.role === "jester")).toHaveLength(1);
  });

  it("normalizes legacy premium to classic", () => {
    expect(normalizeEdition("premium")).toBe("classic");
    expect(normalizeEdition("classic")).toBe("classic");
    expect(normalizeEdition("full")).toBe("full");
    expect(normalizeEdition("expansion")).toBe("expansion");
  });

  it("caps players per edition", () => {
    expect(maxPlayersForEdition("classic")).toBe(4);
    expect(maxPlayersForEdition("full")).toBe(6);
    expect(maxPlayersForEdition("expansion")).toBe(8);
  });

  it("creates a classic game for 2–4 players", () => {
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b", "c"],
        playerNames: { a: "A", b: "B", c: "C" },
        seed: "classic-1",
        edition: "classic",
      },
      { rng: createRng("classic-1") },
    );
    expect(state.edition).toBe("classic");
    expect(state.players).toHaveLength(3);
    const view = loveLetterPlugin.projectView!(state, "a") as {
      edition: string;
    };
    expect(view.edition).toBe("classic");
  });

  it("maps legacy premium config to classic", () => {
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "legacy-prem",
        edition: "premium" as never,
      },
      { rng: createRng("legacy-prem") },
    );
    expect(state.edition).toBe("classic");
  });

  it("rejects 5 players in classic", () => {
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
          seed: "classic-5",
          edition: "classic",
        },
        { rng: createRng("classic-5") },
      ),
    ).toThrow(/2–4/);
  });

  it("rejects 7 players in full", () => {
    expect(() =>
      loveLetterPlugin.createGame(
        {
          playerIds: ["a", "b", "c", "d", "e", "f", "g"],
          playerNames: Object.fromEntries(
            ["a", "b", "c", "d", "e", "f", "g"].map((id) => [id, id]),
          ),
          seed: "full-7",
          edition: "full",
        },
        { rng: createRng("full-7") },
      ),
    ).toThrow(/2–6/);
  });

  it("creates expansion for up to 8 players", () => {
    const ids = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ids,
        playerNames: Object.fromEntries(ids.map((id) => [id, id])),
        seed: "exp-8",
        edition: "expansion",
      },
      { rng: createRng("exp-8") },
    );
    expect(state.edition).toBe("expansion");
    expect(state.players).toHaveLength(8);
    expect(state.players.every((p) => p.hearts === 0)).toBe(true);
  });
});
