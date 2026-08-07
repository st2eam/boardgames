import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import { heartTargetForPlayers } from "../src/cards";
import { loveLetterPlugin } from "../src/plugin";
import {
  continueLoveLetterMatch,
  finishRound,
} from "../src/rules";
import type { LoveLetterState } from "../src/state";
import { produce } from "immer";

describe("multi-round affection tokens", () => {
  it("grants a heart to the round winner and continues the match", () => {
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "mr-1",
        edition: "classic",
      },
      { rng: createRng("mr-1") },
    ) as LoveLetterState;

    const finished = produce(state, (draft) => {
      draft.players[1]!.eliminated = true;
      draft.players[1]!.hand = [];
      finishRound(draft, []);
    });

    expect(finished.phase).toBe("finished");
    expect(finished.matchOver).toBe(false);
    expect(finished.players.find((p) => p.id === "a")!.hearts).toBe(1);
    expect(finished.players.find((p) => p.id === "b")!.hearts).toBe(0);

    const next = continueLoveLetterMatch(finished, {
      rng: createRng("mr-1-next"),
    });
    expect(next.phase).toBe("playing");
    expect(next.roundNumber).toBe(2);
    expect(next.players.find((p) => p.id === "a")!.hearts).toBe(1);
    expect(next.matchOver).toBe(false);
  });

  it("ends the match when a player reaches the heart target", () => {
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "mr-2",
        edition: "classic",
      },
      { rng: createRng("mr-2") },
    ) as LoveLetterState;

    const target = heartTargetForPlayers(2);
    expect(target).toBe(7);

    const finished = produce(state, (draft) => {
      draft.players[0]!.hearts = target - 1;
      draft.players[1]!.eliminated = true;
      draft.players[1]!.hand = [];
      finishRound(draft, []);
    });

    expect(finished.matchOver).toBe(true);
    expect(finished.winners).toEqual(["a"]);
    expect(finished.players.find((p) => p.id === "a")!.hearts).toBe(target);

    const again = continueLoveLetterMatch(finished, {
      rng: createRng("mr-2-reset"),
    });
    expect(again.roundNumber).toBe(1);
    expect(again.players.every((p) => p.hearts === 0)).toBe(true);
  });
});
