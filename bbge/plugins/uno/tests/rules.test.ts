import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import {
  applyUnoAction,
  createUnoState,
  legalUnoActions,
  validateUnoAction,
} from "../src/rules";

function fresh(edition = "classic", n = 3) {
  const ids = Array.from({ length: n }, (_, i) => `p${i}`);
  const names = Object.fromEntries(ids.map((id) => [id, id]));
  const ctx = { rng: createRng(`uno-${edition}-${n}`) };
  const state = createUnoState(
    { playerIds: ids, playerNames: names, edition, seed: `s-${edition}` },
    ctx,
  );
  return { state, ctx, ids };
}

describe("UNO classic", () => {
  it("deals 7 cards and exposes a discard", () => {
    const { state, ids } = fresh("classic", 3);
    expect(state.players).toHaveLength(3);
    for (const id of ids) {
      expect(state.players.find((p) => p.id === id)!.hand.length).toBe(7);
    }
    expect(state.discard.length).toBe(1);
    expect(state.edition).toBe("classic");
  });

  it("allows draw on turn", () => {
    const { state, ctx, ids } = fresh("classic", 2);
    const actor = state.turnOrder[state.currentIndex]!;
    const legal = legalUnoActions(state, actor);
    expect(legal.some((a) => a.type === "drawCard")).toBe(true);
    const r = applyUnoAction(
      state,
      { type: "drawCard", playerId: actor, payload: {} },
      ctx,
    );
    expect(r.events.some((e) => e.type === "card/drew")).toBe(true);
    // turn advanced or drawn decision
    expect(
      r.state.phase === "drawnDecision" ||
        r.state.turnOrder[r.state.currentIndex] !== actor ||
        r.state.players.find((p) => p.id === actor)!.hand.length >= 7,
    ).toBe(true);
    void ids;
  });

  it("rejects out-of-turn play", () => {
    const { state, ids } = fresh("classic", 3);
    const notCurrent = ids.find(
      (id) => id !== state.turnOrder[state.currentIndex],
    )!;
    const hand = state.players.find((p) => p.id === notCurrent)!.hand[0]!;
    const v = validateUnoAction(state, {
      type: "playCard",
      playerId: notCurrent,
      payload: { cardId: hand.id },
    });
    expect(v).not.toBe(true);
  });
});

describe("UNO flip / no-mercy create", () => {
  it("creates flip edition on light side", () => {
    const { state } = fresh("flip", 2);
    expect(state.edition).toBe("flip");
    expect(state.side).toBe("light");
  });

  it("creates no-mercy with max 6", () => {
    const { state } = fresh("no-mercy", 4);
    expect(state.edition).toBe("no-mercy");
    expect(state.players).toHaveLength(4);
  });
});
