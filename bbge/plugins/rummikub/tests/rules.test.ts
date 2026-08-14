import { describe, expect, it } from "vitest";
import { produce } from "immer";
import { createRng } from "@bbge/core";
import {
  applyRummikubAction,
  createRummikubState,
  legalRummikubActions,
  validateRummikubAction,
} from "../src/rules";
import { buildRummikubDeck, type RummikubTile } from "../src/cards";
import { isValidSet, setPoints } from "../src/sets";
import { evaluateCommit, INITIAL_MELD } from "../src/commit";
import type { RummikubState } from "../src/state";

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

function T(
  id: string,
  color: RummikubTile["color"],
  number: number | null,
  joker = false,
): RummikubTile {
  return { id, color, number, joker };
}

function patch(
  state: RummikubState,
  fn: (s: RummikubState) => void,
): RummikubState {
  return produce(state, fn);
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

  it("draw ends the turn immediately", () => {
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
    expect(r.state.players.find((p) => p.id === actor)!.rack.length).toBe(15);
    expect(r.state.currentIndex).not.toBe(state.currentIndex);
    expect(r.state.turnOrder[r.state.currentIndex]).not.toBe(actor);
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

  it("enumerated ice commits total at least 30", () => {
    const { state } = fresh(2);
    const actor = state.turnOrder[state.currentIndex]!;
    const legal = legalRummikubActions(state, actor);
    const p = state.players.find((x) => x.id === actor)!;
    for (const a of legal) {
      if (a.type !== "commitTurn") continue;
      const result = evaluateCommit({
        table: state.table,
        rack: p.rack,
        initialMeldDone: false,
        groups: a.payload.groups,
      });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.points).toBeGreaterThanOrEqual(INITIAL_MELD);
    }
  });
});

describe("commitTurn", () => {
  it("plays multiple new sets in one turn", () => {
    const { state, ctx } = fresh(2);
    const actor = state.turnOrder[0]!;
    const run = [T("r1", "red", 10), T("r2", "red", 11), T("r3", "red", 12)];
    const group = [T("g1", "red", 7), T("g2", "blue", 7), T("g3", "black", 7)];
    const next = patch(state, (s) => {
      const p = s.players.find((x) => x.id === actor)!;
      p.rack = [...run, ...group, T("x", "orange", 1)];
      p.initialMeldDone = true;
      s.table = [];
      s.currentIndex = 0;
    });
    const action = {
      type: "commitTurn" as const,
      playerId: actor,
      payload: {
        groups: [run.map((t) => t.id), group.map((t) => t.id)],
      },
    };
    expect(validateRummikubAction(next, action)).toBe(true);
    const r = applyRummikubAction(next, action, ctx);
    expect(r.state.table).toHaveLength(2);
    expect(r.state.currentIndex).toBe(1);
    expect(r.state.players.find((p) => p.id === actor)!.rack).toHaveLength(1);
    expect(r.events.some((e) => e.type === "rummikub/played")).toBe(true);
  });

  it("allows a two-set ice totaling 30", () => {
    const { state, ctx } = fresh(2);
    const actor = state.turnOrder[0]!;
    const a = [T("a1", "red", 5), T("a2", "blue", 5), T("a3", "black", 5)];
    const b = [T("b1", "red", 6), T("b2", "blue", 6), T("b3", "black", 6)];
    const next = patch(state, (s) => {
      const p = s.players.find((x) => x.id === actor)!;
      p.rack = [...a, ...b, T("x", "orange", 1)];
      p.initialMeldDone = false;
      s.table = [];
      s.currentIndex = 0;
    });
    const action = {
      type: "commitTurn" as const,
      playerId: actor,
      payload: { groups: [a.map((t) => t.id), b.map((t) => t.id)] },
    };
    expect(validateRummikubAction(next, action)).toBe(true);
    const r = applyRummikubAction(next, action, ctx);
    expect(r.state.players.find((p) => p.id === actor)!.initialMeldDone).toBe(
      true,
    );
    expect(r.state.table).toHaveLength(2);
  });

  it("rejects a single ice set under 30", () => {
    const { state } = fresh(2);
    const actor = state.turnOrder[0]!;
    const cheap = [T("c1", "red", 1), T("c2", "red", 2), T("c3", "red", 3)];
    const next = patch(state, (s) => {
      const p = s.players.find((x) => x.id === actor)!;
      p.rack = [...cheap, T("x", "orange", 13)];
      p.initialMeldDone = false;
      s.table = [];
      s.currentIndex = 0;
    });
    const v = validateRummikubAction(next, {
      type: "commitTurn",
      playerId: actor,
      payload: { groups: [cheap.map((t) => t.id)] },
    });
    expect(v).not.toBe(true);
  });

  it("rejects using table tiles before ice", () => {
    const { state } = fresh(2);
    const actor = state.turnOrder[0]!;
    const tableSet = [T("t1", "red", 8), T("t2", "red", 9), T("t3", "red", 10)];
    const extra = T("h1", "red", 11);
    const next = patch(state, (s) => {
      const p = s.players.find((x) => x.id === actor)!;
      p.rack = [extra, T("x", "orange", 1), T("y", "orange", 2)];
      p.initialMeldDone = false;
      s.table = [{ id: "s0", tiles: tableSet }];
      s.setSeq = 1;
      s.currentIndex = 0;
    });
    const v = validateRummikubAction(next, {
      type: "commitTurn",
      playerId: actor,
      payload: {
        groups: [[...tableSet.map((t) => t.id), extra.id]],
      },
    });
    expect(v).not.toBe(true);
  });

  it("lets an iced player extend and split table sets", () => {
    const { state, ctx } = fresh(2);
    const actor = state.turnOrder[0]!;
    const tableSet = [
      T("t1", "red", 3),
      T("t2", "red", 4),
      T("t3", "red", 5),
      T("t4", "red", 6),
      T("t5", "red", 7),
    ];
    const extra = T("h1", "red", 5);
    const next = patch(state, (s) => {
      const p = s.players.find((x) => x.id === actor)!;
      p.rack = [extra, T("x", "orange", 1)];
      p.initialMeldDone = true;
      s.table = [{ id: "s0", tiles: tableSet }];
      s.setSeq = 1;
      s.currentIndex = 0;
    });
    const action = {
      type: "commitTurn" as const,
      playerId: actor,
      payload: {
        groups: [
          ["t1", "t2", "h1"],
          ["t3", "t4", "t5"],
        ],
      },
    };
    expect(validateRummikubAction(next, action)).toBe(true);
    const r = applyRummikubAction(next, action, ctx);
    expect(r.state.table).toHaveLength(2);
    expect(r.state.players.find((p) => p.id === actor)!.rack.map((t) => t.id)).toEqual(
      ["x"],
    );
  });

  it("rejects an isolated leftover tile on the table", () => {
    const { state } = fresh(2);
    const actor = state.turnOrder[0]!;
    const run = [T("r1", "red", 10), T("r2", "red", 11), T("r3", "red", 12)];
    const lone = T("z", "black", 1);
    const next = patch(state, (s) => {
      const p = s.players.find((x) => x.id === actor)!;
      p.rack = [...run, lone];
      p.initialMeldDone = true;
      s.table = [];
      s.currentIndex = 0;
    });
    const v = validateRummikubAction(next, {
      type: "commitTurn",
      playerId: actor,
      payload: { groups: [run.map((t) => t.id), [lone.id]] },
    });
    expect(v).not.toBe(true);
  });

  it("rejects taking a table tile back to the rack", () => {
    const { state } = fresh(2);
    const actor = state.turnOrder[0]!;
    const tableSet = [T("t1", "red", 8), T("t2", "red", 9), T("t3", "red", 10)];
    const extra = [T("h1", "blue", 12), T("h2", "black", 12), T("h3", "orange", 12)];
    const next = patch(state, (s) => {
      const p = s.players.find((x) => x.id === actor)!;
      p.rack = extra;
      p.initialMeldDone = true;
      s.table = [{ id: "s0", tiles: tableSet }];
      s.currentIndex = 0;
    });
    const v = validateRummikubAction(next, {
      type: "commitTurn",
      playerId: actor,
      payload: {
        groups: [extra.map((t) => t.id)],
      },
    });
    expect(v).not.toBe(true);
  });

  it("cannot commit after drawing", () => {
    const { state, ctx } = fresh(2);
    const actor = state.turnOrder[0]!;
    const run = [T("r1", "red", 10), T("r2", "red", 11), T("r3", "red", 12)];
    const dealt = patch(state, (s) => {
      const p = s.players.find((x) => x.id === actor)!;
      p.rack = [...run, T("x", "orange", 1)];
      p.initialMeldDone = true;
      s.table = [];
      s.currentIndex = 0;
    });
    const drawn = applyRummikubAction(
      dealt,
      { type: "drawTile", playerId: actor, payload: {} },
      ctx,
    ).state;
    const v = validateRummikubAction(drawn, {
      type: "commitTurn",
      playerId: actor,
      payload: { groups: [run.map((t) => t.id)] },
    });
    expect(v).not.toBe(true);
  });
});
