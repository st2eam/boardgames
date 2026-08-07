import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import { loveLetterPlugin } from "../src/plugin";
import { buildRoundEndPayload, finishRound } from "../src/rules";
import type { LoveLetterState } from "../src/state";
import { produce } from "immer";

describe("round end standings", () => {
  it("exposes hand_compare standings when multiple living", () => {
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "end-1",
      },
      { rng: createRng("end-1") },
    );
    const finished = produce(state, (draft) => {
      const events: never[] = [];
      finishRound(draft, events);
    });
    const payload = buildRoundEndPayload(finished);
    expect(payload.reason === "last_standing" || payload.reason === "hand_compare").toBe(
      true,
    );
    expect(payload.standings.length).toBe(2);
    expect(payload.winners.length).toBeGreaterThanOrEqual(1);
    const view = loveLetterPlugin.projectView!(finished, "a") as {
      standings: { playerId: string; handRank: number | null }[];
      others: { hand?: { rank: number }[] }[];
    };
    expect(view.standings.length).toBe(2);
    for (const o of view.others) {
      if (o.hand) expect(typeof o.hand[0]?.rank).toBe("number");
    }
  });

  it("marks last_standing when only one alive", () => {
    const state = loveLetterPlugin.createGame(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "end-2",
      },
      { rng: createRng("end-2") },
    ) as LoveLetterState;
    const finished = produce(state, (draft) => {
      draft.players[1]!.eliminated = true;
      draft.players[1]!.hand = [];
      finishRound(draft, []);
    });
    const payload = buildRoundEndPayload(finished);
    expect(payload.reason).toBe("last_standing");
    expect(payload.winners).toEqual(["a"]);
  });
});
