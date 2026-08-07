import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import {
  applyTrioAction,
  createTrioState,
  legalTrioActions,
} from "../src/rules";

function fresh(n = 3, edition = "simple") {
  const ids = Array.from({ length: n }, (_, i) => `p${i}`);
  const names = Object.fromEntries(ids.map((id) => [id, id]));
  const ctx = { rng: createRng(`trio-${edition}-${n}`) };
  const state = createTrioState(
    { playerIds: ids, playerNames: names, edition, seed: "t1" },
    ctx,
  );
  return { state, ctx, ids };
}

describe("TRIO", () => {
  it("deals by player count", () => {
    const { state } = fresh(3);
    expect(state.players.every((p) => p.hand.length === 9)).toBe(true);
    expect(state.center.filter(Boolean)).toHaveLength(9);
    expect(state.mode).toBe("simple");
  });

  it("hands stay sorted ascending", () => {
    const { state } = fresh(4, "spicy");
    expect(state.mode).toBe("spicy");
    for (const p of state.players) {
      for (let i = 1; i < p.hand.length; i++) {
        expect(p.hand[i]!.value).toBeGreaterThanOrEqual(p.hand[i - 1]!.value);
      }
    }
  });

  it("can reveal center on turn", () => {
    const { state, ctx } = fresh(3);
    const actor = state.turnOrder[0]!;
    const legal = legalTrioActions(state, actor);
    expect(legal.some((a) => a.type === "revealCenter")).toBe(true);
    const slot = legal.find((a) => a.type === "revealCenter")!.payload
      .slotIndex as number;
    const r = applyTrioAction(
      state,
      { type: "revealCenter", playerId: actor, payload: { slotIndex: slot } },
      ctx,
    );
    expect(r.state.turnReveals).toHaveLength(1);
    expect(r.events.some((e) => e.type === "card/revealed")).toBe(true);
  });
});
