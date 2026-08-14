import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import {
  applyRummikubAction,
  createRummikubState,
  legalRummikubActions,
  validateRummikubAction,
} from "../src/rules";
import { buildRummikubDeck } from "../src/cards";
import { isValidSet, setPoints } from "../src/sets";

function fresh(n = 2) {
  const ids = Array.from({ length: n }, (_, i) => `p${i}`);
  const names = Object.fromEntries(ids.map((id) => [id, id]));
  const ctx = { rng: createRng(`rummikub-${n}`) };
  const state = createRummikubState(
    { playerIds: ids, playerNames: names, seed: "r1" },
    ctx,
  );
  return { state, ctx, ids };
}

describe("Rummikub deck", () => {
  it("builds 106 tiles with 2 jokers", () => {
    const deck = buildRummikubDeck();
    expect(deck).toHaveLength(106);
    expect(deck.filter((t) => t.joker)).toHaveLength(2);
  });
});

describe("set validity", () => {
  it("accepts a 3-run", () => {
    const tiles = [1, 2, 3].map((n, i) => ({
      id: `x${i}`,
      color: "red" as const,
      number: n,
      joker: false,
    }));
    expect(isValidSet(tiles)).toBe(true);
    expect(setPoints(tiles)).toBe(6);
  });

  it("accepts a 3-group", () => {
    const tiles = ["red", "blue", "black"].map((c, i) => ({
      id: `x${i}`,
      color: c as "red" | "blue" | "black",
      number: 5,
      joker: false,
    }));
    expect(isValidSet(tiles)).toBe(true);
    expect(setPoints(tiles)).toBe(15);
  });

  it("rejects mixed colors in a run", () => {
    const tiles = [
      { id: "a", color: "red" as const, number: 1, joker: false },
      { id: "b", color: "blue" as const, number: 2, joker: false },
      { id: "c", color: "red" as const, number: 3, joker: false },
    ];
    expect(isValidSet(tiles)).toBe(false);
  });

  it("allows joker to fill a run gap", () => {
    const tiles = [
      { id: "a", color: "red" as const, number: 4, joker: false },
      { id: "j", color: null, number: null, joker: true },
      { id: "c", color: "red" as const, number: 6, joker: false },
    ];
    expect(isValidSet(tiles)).toBe(true);
    expect(setPoints(tiles)).toBe(15);
  });
});

describe("Rummikub state", () => {
  it("deals 14 tiles each and leaves a pool", () => {
    const { state } = fresh(2);
    for (const p of state.players) {
      expect(p.rack).toHaveLength(14);
    }
    expect(state.pool).toHaveLength(106 - 28);
    expect(state.phase).toBe("playing");
  });

  it("current player can draw", () => {
    const { state, ctx } = fresh(2);
    const actor = state.turnOrder[state.currentIndex]!;
    const legal = legalRummikubActions(state, actor);
    expect(legal.some((a) => a.type === "drawTile")).toBe(true);
    const r = applyRummikubAction(
      state,
      { type: "drawTile", playerId: actor, payload: {} },
      ctx,
    );
    expect(r.events.some((e) => e.type === "rummikub/drew")).toBe(true);
    expect(
      r.state.players.find((p) => p.id === actor)!.rack.length,
    ).toBe(15);
  });

  it("rejects out-of-turn action", () => {
    const { state, ids } = fresh(3);
    const notCurrent = ids.find(
      (id) => id !== state.turnOrder[state.currentIndex],
    )!;
    const v = validateRummikubAction(state, {
      type: "drawTile",
      playerId: notCurrent,
      payload: {},
    });
    expect(v).not.toBe(true);
  });

  it("enforces 30-point initial meld", () => {
    const { state } = fresh(2);
    const actor = state.turnOrder[state.currentIndex]!;
    // No cheap meld should be legal before initial meld (random rack may or
    // may not contain a valid ≥30 set; ensure the legal list respects it).
    const legal = legalRummikubActions(state, actor);
    const rack = state.players.find((p) => p.id === actor)!.rack;
    for (const a of legal) {
      if (a.type === "playNewSet") {
        const tiles = rack.filter((t) => a.payload.tileIds.includes(t.id));
        expect(setPoints(tiles)).toBeGreaterThanOrEqual(30);
      }
    }
  });
});
