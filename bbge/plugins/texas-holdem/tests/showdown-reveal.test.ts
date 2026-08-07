import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import {
  applyHoldemAction,
  createHoldemState,
  validateHoldemAction,
} from "../src/rules";
import { projectHoldemView } from "../src/projectView";
import type { HoldemAction, HoldemState } from "../src/state";

function setup(n: number, seed = "sd-1") {
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

/** Check / call only until finished — forces showdown when 2+ remain. */
function checkCallDown(state: HoldemState, max = 80): HoldemState {
  let s = state;
  for (let i = 0; i < max && s.phase === "playing"; i++) {
    const pid = s.players[s.toActIndex]!.id;
    const check: HoldemAction = { type: "check", playerId: pid, payload: {} };
    if (validateHoldemAction(s, check) === true) {
      s = act(s, check);
      continue;
    }
    const call: HoldemAction = { type: "call", playerId: pid, payload: {} };
    if (validateHoldemAction(s, call) === true) {
      s = act(s, call);
      continue;
    }
    throw new Error(`stuck: ${pid} street=${s.street}`);
  }
  return s;
}

describe("showdown reveal", () => {
  it("reaches showdown and reveals hole cards in every seat view", () => {
    let s = setup(2, "reveal-hu");
    s = checkCallDown(s);
    expect(s.phase).toBe("finished");
    expect(s.showdown).toBeDefined();
    expect(s.showdown!.length).toBe(2);
    expect(s.board).toHaveLength(5);

    for (const viewer of ["p0", "p1"] as const) {
      const view = projectHoldemView(s, viewer) as {
        seats: {
          id: string;
          hole: { id: string; rank?: number; suit?: string }[];
          handCategory: unknown;
        }[];
      };
      for (const seat of view.seats) {
        expect(seat.hole).toHaveLength(2);
        expect(seat.hole.every((c) => c.rank != null && c.suit != null)).toBe(
          true,
        );
        expect(seat.handCategory).not.toBeNull();
      }
    }
  });

  it("includes hole cards on the showdown handEnded event", () => {
    let s = setup(2, "reveal-evt");
    let events: { type: string; payload: Record<string, unknown> }[] = [];
    for (let i = 0; i < 80 && s.phase === "playing"; i++) {
      const pid = s.players[s.toActIndex]!.id;
      const check: HoldemAction = { type: "check", playerId: pid, payload: {} };
      const call: HoldemAction = { type: "call", playerId: pid, payload: {} };
      const action =
        validateHoldemAction(s, check) === true
          ? check
          : validateHoldemAction(s, call) === true
            ? call
            : null;
      expect(action).not.toBeNull();
      const result = applyHoldemAction(s, action!, { rng: createRng("x") });
      s = result.state;
      events = result.events as typeof events;
    }
    expect(s.phase).toBe("finished");
    const ended = events.find((e) => e.type === "holdem/handEnded");
    expect(ended?.payload.reason).toBe("showdown");
    const show = ended?.payload.showdown as {
      playerId: string;
      hole: { rank: number; suit: string }[];
    }[];
    expect(show).toHaveLength(2);
    expect(show.every((x) => x.hole?.length === 2)).toBe(true);
  });

  it("does not reveal hole cards on a fold win", () => {
    let s = setup(2, "hu-bb-fold");
    const sb = s.players[s.smallBlindIndex]!;
    s = act(s, { type: "fold", playerId: sb.id, payload: {} });
    expect(s.phase).toBe("finished");
    expect(s.showdown).toBeUndefined();
    const view = projectHoldemView(s, "p0") as {
      seats: { id: string; hole: { rank?: number }[]; folded: boolean }[];
    };
    const opp = view.seats.find((seat) => seat.id !== "p0")!;
    if (!opp.folded) {
      expect(opp.hole.every((c) => c.rank == null)).toBe(true);
    } else {
      expect(opp.hole.every((c) => c.rank == null)).toBe(true);
    }
  });
});
