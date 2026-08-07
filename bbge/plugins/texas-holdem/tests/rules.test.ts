import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import {
  applyHoldemAction,
  createHoldemState,
  validateHoldemAction,
} from "../src/rules";
import type { HoldemAction, HoldemState } from "../src/state";

function setup(n: number, seed = "th-1") {
  const ids = Array.from({ length: n }, (_, i) => `p${i}`);
  const names = Object.fromEntries(ids.map((id) => [id, id]));
  return createHoldemState(
    {
      playerIds: ids,
      playerNames: names,
      seed,
      smallBlind: 1,
      bigBlind: 2,
      startingStack: 200,
    },
    { rng: createRng(seed) },
  );
}

function act(state: HoldemState, action: HoldemAction) {
  const v = validateHoldemAction(state, action);
  expect(v).toBe(true);
  return applyHoldemAction(state, action, { rng: createRng("x") }).state;
}

describe("texas-holdem rules", () => {
  it("creates HU with blinds posted", () => {
    const s = setup(2);
    expect(s.players).toHaveLength(2);
    expect(s.street).toBe("preflop");
    const committed = s.players.reduce((a, p) => a + p.handBet, 0);
    expect(committed).toBe(3); // 1+2
    expect(s.players.every((p) => p.hole.length === 2)).toBe(true);
  });

  it("is deterministic for same seed", () => {
    const a = setup(6, "det");
    const b = setup(6, "det");
    expect(a.players.map((p) => p.hole.map((c) => c.id))).toEqual(
      b.players.map((p) => p.hole.map((c) => c.id)),
    );
    expect(a.buttonIndex).toBe(b.buttonIndex);
  });

  it("supports 9 players", () => {
    const s = setup(9);
    expect(s.players).toHaveLength(9);
  });

  it("finishes when everyone folds to one player", () => {
    let s = setup(3);
    // Force fold loop: act until finished by folding whenever possible
    for (let i = 0; i < 30 && s.phase === "playing"; i++) {
      const pid = s.players[s.toActIndex]!.id;
      const fold: HoldemAction = { type: "fold", playerId: pid, payload: {} };
      if (validateHoldemAction(s, fold) === true) {
        s = act(s, fold);
      } else {
        const check: HoldemAction = {
          type: "check",
          playerId: pid,
          payload: {},
        };
        if (validateHoldemAction(s, check) === true) s = act(s, check);
        else {
          const call: HoldemAction = {
            type: "call",
            playerId: pid,
            payload: {},
          };
          s = act(s, call);
        }
      }
    }
    expect(s.phase).toBe("finished");
    expect(s.winners.length).toBeGreaterThanOrEqual(1);
  });
});
