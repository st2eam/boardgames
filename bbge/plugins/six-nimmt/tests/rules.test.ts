import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import { bullheads, bullheadsOfCards } from "../src/cards";
import { bestRowIndex } from "../src/placement";
import {
  applyNimmtAction,
  continueNimmtMatch,
  createNimmtState,
  validateNimmtAction,
} from "../src/rules";
import type { NimmtAction, NimmtState } from "../src/state";

function setup(
  n: number,
  seed = "sn-1",
  targetScore = 66,
  mode: string = "classic",
) {
  const ids = Array.from({ length: n }, (_, i) => `p${i}`);
  const names = Object.fromEntries(ids.map((id) => [id, id]));
  return createNimmtState(
    { playerIds: ids, playerNames: names, seed, targetScore, mode },
    { rng: createRng(seed) },
  );
}

function act(state: NimmtState, action: NimmtAction) {
  const v = validateNimmtAction(state, action);
  expect(v).toBe(true);
  return applyNimmtAction(state, action, { rng: createRng("x") }).state;
}

/** Drain stepped resolve until chooseRow / selecting / finished. */
function drainResolve(state: NimmtState): NimmtState {
  let s = state;
  let guard = 20;
  while (s.phase === "resolving" && guard-- > 0) {
    s = act(s, {
      type: "resolveStep",
      playerId: s.players[0]!.id,
      payload: {},
    });
  }
  return s;
}

function classicRowsState(rows: { id: string; value: number }[][]): NimmtState {
  const base = setup(2, "rows");
  return {
    ...base,
    rows: rows.map((r) => r.map((c) => ({ ...c }))),
    mode: "classic",
    parityMarker: null,
    mountain: null,
    jumpingCowRow: null,
    rowMods: [0, 1, 2, 3].map(() => ({ take7: false, stopped: false })),
  };
}

describe("six-nimmt cards", () => {
  it("computes bullheads", () => {
    expect(bullheads(1)).toBe(1);
    expect(bullheads(5)).toBe(2);
    expect(bullheads(10)).toBe(3);
    expect(bullheads(11)).toBe(5);
    expect(bullheads(55)).toBe(7);
    expect(bullheads(100)).toBe(3);
  });
});

describe("six-nimmt rules", () => {
  it("deals 10 cards and 4 row starters", () => {
    const s = setup(3);
    expect(s.players).toHaveLength(3);
    expect(s.players.every((p) => p.hand.length === 10)).toBe(true);
    expect(s.rows.every((r) => r.length === 1)).toBe(true);
    expect(s.phase).toBe("selecting");
    expect(s.round).toBe(1);
    expect(s.mode).toBe("classic");
  });

  it("picks minimal-difference fitting row", () => {
    const s = classicRowsState([
      [{ id: "a", value: 10 }],
      [{ id: "b", value: 20 }],
      [{ id: "c", value: 50 }],
      [{ id: "d", value: 80 }],
    ]);
    expect(bestRowIndex(s, 25)).toBe(1);
    expect(bestRowIndex(s, 5)).toBeNull();
  });

  it("resolves a trick when everyone plays", () => {
    let s = setup(2, "trick-1");
    const a = s.players[0]!;
    const b = s.players[1]!;
    s = act(s, {
      type: "playCard",
      playerId: a.id,
      payload: { cardId: a.hand[0]!.id },
    });
    expect(s.phase).toBe("selecting");
    expect(s.selections[a.id]).not.toBeNull();
    s = act(s, {
      type: "playCard",
      playerId: b.id,
      payload: { cardId: b.hand[0]!.id },
    });
    expect(s.phase).toBe("resolving");
    s = drainResolve(s);
    expect(["selecting", "chooseRow", "finished"]).toContain(s.phase);
    if (s.phase === "selecting") {
      expect(s.trick).toBe(2);
      expect(s.players.every((p) => p.hand.length === 9)).toBe(true);
    }
  });

  it("places one card per resolveStep", () => {
    let s = setup(2, "step-1");
    const a = s.players[0]!;
    const b = s.players[1]!;
    s = act(s, {
      type: "playCard",
      playerId: a.id,
      payload: { cardId: a.hand[0]!.id },
    });
    s = act(s, {
      type: "playCard",
      playerId: b.id,
      payload: { cardId: b.hand[0]!.id },
    });
    expect(s.phase).toBe("resolving");
    expect(s.resolveQueue).toHaveLength(2);
    s = act(s, {
      type: "resolveStep",
      playerId: a.id,
      payload: {},
    });
    expect(s.resolveQueue).toHaveLength(1);
    expect(s.phase).toBe("resolving");
  });

  it("chooseRow when card is too low", () => {
    let s = setup(2, "low-1");
    s = {
      ...s,
      rows: [
        [{ id: "r0", value: 90 }],
        [{ id: "r1", value: 91 }],
        [{ id: "r2", value: 92 }],
        [{ id: "r3", value: 93 }],
      ],
      players: s.players.map((p) => ({
        ...p,
        hand: [
          { id: `${p.id}-c1`, value: 1 },
          { id: `${p.id}-c2`, value: 2 },
          ...p.hand.slice(2),
        ],
      })),
    };
    const a = s.players[0]!;
    const b = s.players[1]!;
    s = act(s, {
      type: "playCard",
      playerId: a.id,
      payload: { cardId: `${a.id}-c1` },
    });
    s = act(s, {
      type: "playCard",
      playerId: b.id,
      payload: { cardId: `${b.id}-c2` },
    });
    expect(s.phase).toBe("resolving");
    s = drainResolve(s);
    expect(s.phase).toBe("chooseRow");
    expect(s.pending?.playerId).toBe(a.id);
    s = act(s, {
      type: "chooseRow",
      playerId: a.id,
      payload: { rowIndex: 0 },
    });
    // Next card may still need resolve beats or another chooseRow
    expect(["selecting", "chooseRow", "resolving"]).toContain(s.phase);
    expect(s.rows[0]![0]!.value).toBe(1);
  });

  it("pro mode starts in drafting", () => {
    const s = setup(2, "pro-1", 66, "pro");
    expect(s.mode).toBe("pro");
    expect(s.phase).toBe("drafting");
    expect(s.draftPool.length).toBe(2 * 10 + 4);
    expect(s.draftTurn).toBe("p0");
  });

  it("fan-even-odd places parity marker", () => {
    const s = setup(2, "eo-1", 66, "fan-even-odd");
    expect(s.parityMarker).not.toBeNull();
    expect(["even", "odd"]).toContain(s.parityMarker!.parity);
  });

  it("fan-mountain marks fourth row", () => {
    const s = setup(2, "mt-1", 66, "fan-mountain");
    expect(s.mountain?.rowIndex).toBe(3);
    expect(s.mountain?.direction).toBe(-1);
  });

  it("buffalo deals hand to buffalo and shared piles", () => {
    const s = setup(2, "bf-1", 66, "buffalo");
    expect(s.mode).toBe("buffalo");
    expect(s.buffaloHand).toHaveLength(10);
    expect(s.faceUpSpecials.filter(Boolean).length).toBe(2);
    expect(s.players.every((p) => p.hand.length === 10)).toBe(true);
  });

  it("buffalo solo has no specials", () => {
    const s = setup(1, "bf-solo", 66, "buffalo");
    expect(s.players).toHaveLength(1);
    expect(s.specialDeck).toHaveLength(0);
    expect(s.faceUpSpecials.every((x) => x == null)).toBe(true);
  });

  it("flippin grants flip tokens", () => {
    const s = setup(2, "fl-1", 66, "fan-flippin");
    expect(s.players.every((p) => p.hasFlipToken)).toBe(true);
  });

  it("rematch preserves mode and resets scores", () => {
    let s = setup(2, "rematch", 66, "fan-mountain");
    s = {
      ...s,
      phase: "finished",
      players: s.players.map((p, i) => ({ ...p, score: 10 + i })),
      winners: [s.players[0]!.id],
    };
    const next = continueNimmtMatch(s, { rng: createRng("rematch-2") });
    expect(next.mode).toBe("fan-mountain");
    expect(next.phase).toBe("selecting");
    expect(next.players.every((p) => p.score === 0)).toBe(true);
    expect(next.round).toBe(1);
  });

  it("rejects classic with 1 player", () => {
    expect(() => setup(1, "bad", 66, "classic")).toThrow(/2–10/);
  });
});

describe("six-nimmt scoring helper", () => {
  it("bullheadsOfCards", () => {
    expect(bullheadsOfCards([{ id: "x", value: 55 }])).toBe(7);
  });
});
