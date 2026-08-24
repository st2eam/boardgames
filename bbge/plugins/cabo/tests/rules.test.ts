import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import { caboPlugin } from "../src/plugin";
import {
  applyCaboAction,
  continueCaboMatch,
  createCaboState,
  computeRoundScores,
  isKamikaze,
} from "../src/rules";
import type { CaboState } from "../src/state";
import { produce } from "immer";

function finishSetup(state: CaboState): CaboState {
  let s = state;
  for (const p of s.players) {
    const peeked = applyCaboAction(
      s,
      {
        type: "setupPeek",
        playerId: p.id,
        payload: { slotIndices: [0, 1] },
      },
      { rng: createRng("x") },
    );
    s = peeked.state;
    const ack = applyCaboAction(
      s,
      { type: "acknowledgeModal", playerId: p.id, payload: {} },
      { rng: createRng("x") },
    );
    s = ack.state;
  }
  return s;
}

describe("CABO deck and setup", () => {
  it("creates 52-card deck and deals 4 slots each", () => {
    const state = caboPlugin.createGame(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "cabo-1",
      },
      { rng: createRng("cabo-1") },
    ) as CaboState;
    expect(state.phase).toBe("setupPeek");
    expect(state.players[0]!.slots.length).toBe(4);
    expect(state.deck.length).toBe(52 - 8 - 1);
    expect(state.discard.length).toBe(1);
  });

  it("starts playing after all setup peeks", () => {
    const state = finishSetup(
      createCaboState(
        {
          playerIds: ["a", "b"],
          playerNames: { a: "A", b: "B" },
          seed: "cabo-2",
        },
        { rng: createRng("cabo-2") },
      ),
    );
    expect(state.phase).toBe("playing");
    expect(state.players[0]!.knownSlots).toEqual([0, 1]);
  });

  it("shows setup peek in a modal then covers cards after ack", () => {
    let state = createCaboState(
      {
        playerIds: ["a", "b"],
        playerNames: { a: "A", b: "B" },
        seed: "cabo-peek-modal",
      },
      { rng: createRng("cabo-peek-modal") },
    );
    const peeked = applyCaboAction(
      state,
      {
        type: "setupPeek",
        playerId: "a",
        payload: { slotIndices: [0, 1] },
      },
      { rng: createRng("x") },
    );
    state = peeked.state;
    expect(state.pendingModal?.type).toBe("setupPeek");
    expect(state.pendingModal?.values?.length).toBe(2);
    expect(state.phase).toBe("setupPeek");

    const view = caboPlugin.projectView!(state, "a") as {
      you: { slots: { value: number | null; faceUp: boolean }[] };
      pendingModal: { values?: number[] } | null;
    };
    expect(view.pendingModal?.values?.length).toBe(2);
    expect(view.you.slots[0]!.value).not.toBeNull();
    expect(view.you.slots[0]!.faceUp).toBe(false);

    const ack = applyCaboAction(
      state,
      { type: "acknowledgeModal", playerId: "a", payload: {} },
      { rng: createRng("x") },
    );
    state = ack.state;
    expect(state.pendingModal).toBeNull();
    const after = caboPlugin.projectView!(state, "a") as {
      you: {
        slots: {
          value: number | null;
          faceUp: boolean;
          knownToYou?: boolean;
        }[];
      };
    };
    // Still face-down on the table, but owner keeps memory values for AI/UI logic.
    expect(after.you.slots[0]!.faceUp).toBe(false);
    expect(after.you.slots[1]!.faceUp).toBe(false);
    expect(after.you.slots[0]!.knownToYou).toBe(true);
    expect(after.you.slots[0]!.value).not.toBeNull();
    expect(state.players[0]!.knownSlots).toEqual([0, 1]);
  });

  it("keeps discard-pile swaps face up", () => {
    let state = finishSetup(
      createCaboState(
        {
          playerIds: ["a", "b"],
          playerNames: { a: "A", b: "B" },
          seed: "cabo-disc-up",
        },
        { rng: createRng("cabo-disc-up") },
      ),
    );
    state = produce(state, (draft) => {
      draft.currentIndex = draft.turnOrder.indexOf("a");
      draft.discard = [{ id: "d1", value: 3 }];
      draft.players[0]!.slots = [
        { card: { id: "a0", value: 9 }, faceUp: false },
        { card: { id: "a1", value: 9 }, faceUp: false },
        { card: { id: "a2", value: 9 }, faceUp: false },
        { card: { id: "a3", value: 9 }, faceUp: false },
      ];
    });
    state = applyCaboAction(
      state,
      { type: "drawDiscard", playerId: "a", payload: {} },
      { rng: createRng("x") },
    ).state;
    state = applyCaboAction(
      state,
      {
        type: "swapWithDrawn",
        playerId: "a",
        payload: { slotIndices: [0] },
      },
      { rng: createRng("x") },
    ).state;
    expect(state.players[0]!.slots[0]!.card.value).toBe(3);
    expect(state.players[0]!.slots[0]!.faceUp).toBe(true);
  });

  it("can replace a face-up tableau card with a deck draw", () => {
    let state = finishSetup(
      createCaboState(
        {
          playerIds: ["a", "b"],
          playerNames: { a: "A", b: "B" },
          seed: "cabo-faceup-swap",
        },
        { rng: createRng("cabo-faceup-swap") },
      ),
    );
    state = produce(state, (draft) => {
      draft.currentIndex = draft.turnOrder.indexOf("a");
      draft.players[0]!.slots = [
        { card: { id: "up", value: 11 }, faceUp: true },
        { card: { id: "a1", value: 2 }, faceUp: false },
        { card: { id: "a2", value: 3 }, faceUp: false },
        { card: { id: "a3", value: 4 }, faceUp: false },
      ];
      draft.deck = [{ id: "new", value: 1 }, ...draft.deck];
    });
    state = applyCaboAction(
      state,
      { type: "drawDeck", playerId: "a", payload: {} },
      { rng: createRng("x") },
    ).state;
    state = applyCaboAction(
      state,
      {
        type: "swapWithDrawn",
        playerId: "a",
        payload: { slotIndices: [0] },
      },
      { rng: createRng("x") },
    ).state;
    expect(state.players[0]!.slots[0]!.card.value).toBe(1);
    expect(state.players[0]!.slots[0]!.faceUp).toBe(false);
    expect(state.discard.some((c) => c.value === 11)).toBe(true);
  });
});

describe("CABO scoring", () => {
  it("caller gets 0 when lowest, +10 penalty otherwise", () => {
    const base = finishSetup(
      createCaboState(
        {
          playerIds: ["a", "b"],
          playerNames: { a: "A", b: "B" },
          seed: "sc-1",
        },
        { rng: createRng("sc-1") },
      ),
    );
    const state = produce(base, (draft) => {
      draft.caboCallerId = "a";
      draft.players[0]!.slots = [
        { card: { id: "x", value: 1 }, faceUp: true },
        { card: { id: "y", value: 2 }, faceUp: true },
        { card: { id: "z", value: 0 }, faceUp: true },
        { card: { id: "w", value: 0 }, faceUp: true },
      ];
      draft.players[1]!.slots = [
        { card: { id: "a", value: 10 }, faceUp: true },
        { card: { id: "b", value: 10 }, faceUp: true },
        { card: { id: "c", value: 10 }, faceUp: true },
        { card: { id: "d", value: 10 }, faceUp: true },
      ];
    });
    const scores = computeRoundScores(state);
    expect(scores.a).toBe(0);
    expect(scores.b).toBe(40);
  });

  it("detects kamikaze hand", () => {
    const slots = [
      { card: { id: "a", value: 12 }, faceUp: false },
      { card: { id: "b", value: 12 }, faceUp: false },
      { card: { id: "c", value: 13 }, faceUp: false },
      { card: { id: "d", value: 13 }, faceUp: false },
    ];
    expect(isKamikaze(slots)).toBe(true);
  });

  it("kamikaze overrides normal scoring", () => {
    const base = finishSetup(
      createCaboState(
        {
          playerIds: ["a", "b"],
          playerNames: { a: "A", b: "B" },
          seed: "km-1",
        },
        { rng: createRng("km-1") },
      ),
    );
    const state = produce(base, (draft) => {
      draft.caboCallerId = "b";
      draft.players[0]!.slots = [
        { card: { id: "a", value: 12 }, faceUp: true },
        { card: { id: "b", value: 12 }, faceUp: true },
        { card: { id: "c", value: 13 }, faceUp: true },
        { card: { id: "d", value: 13 }, faceUp: true },
      ];
      draft.players[1]!.slots = [
        { card: { id: "e", value: 0 }, faceUp: true },
        { card: { id: "f", value: 0 }, faceUp: true },
        { card: { id: "g", value: 0 }, faceUp: true },
        { card: { id: "h", value: 0 }, faceUp: true },
      ];
    });
    const scores = computeRoundScores(state);
    expect(scores.a).toBe(0);
    expect(scores.b).toBe(50);
  });
});

describe("CABO multi-round match", () => {
  it("continueMatch keeps cumulative scores between rounds", () => {
    const state = finishSetup(
      createCaboState(
        {
          playerIds: ["a", "b"],
          playerNames: { a: "A", b: "B" },
          seed: "mr-1",
        },
        { rng: createRng("mr-1") },
      ),
    );
    const finished = produce(state, (draft) => {
      draft.phase = "finished";
      draft.players[0]!.cumulativeScore = 25;
      draft.players[1]!.cumulativeScore = 40;
      draft.matchOver = false;
    });
    const next = continueCaboMatch(finished, { rng: createRng("mr-1-n") });
    expect(next.phase).toBe("setupPeek");
    expect(next.round).toBe(2);
    expect(next.players[0]!.cumulativeScore).toBe(25);
    expect(next.matchOver).toBe(false);
  });

  it("resets match on matchOver continue", () => {
    const finished = produce(
      finishSetup(
        createCaboState(
          {
            playerIds: ["a", "b"],
            playerNames: { a: "A", b: "B" },
            seed: "mr-2",
          },
          { rng: createRng("mr-2") },
        ),
      ),
      (draft) => {
        draft.matchOver = true;
        draft.players[0]!.cumulativeScore = 105;
      },
    );
    const next = continueCaboMatch(finished, { rng: createRng("mr-2-n") });
    expect(next.round).toBe(1);
    expect(next.players.every((p) => p.cumulativeScore === 0)).toBe(true);
  });
});

describe("CABO call flow", () => {
  it("calling CABO queues final turns for others", () => {
    let state = finishSetup(
      createCaboState(
        {
          playerIds: ["a", "b", "c"],
          playerNames: { a: "A", b: "B", c: "C" },
          seed: "cb-1",
        },
        { rng: createRng("cb-1") },
      ),
    );
    state = produce(state, (draft) => {
      draft.currentIndex = draft.turnOrder.indexOf("a");
    });
    const r = applyCaboAction(
      state,
      { type: "callCabo", playerId: "a", payload: {} },
      { rng: createRng("cb-1") },
    );
    expect(r.state.phase).toBe("caboFinalTurns");
    expect(r.state.caboCallerId).toBe("a");
    expect(r.state.finalTurnQueue).toEqual(["b", "c"]);
  });
});
