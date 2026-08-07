import { describe, it, expect } from "vitest";
import { createRng, stableHash } from "@bbge/core";
import {
  loveLetterPlugin,
  prepareLoveLetterTurn,
  type LoveLetterAction,
  type LoveLetterState,
} from "@bbge/love-letter";

function ctx(seed: string) {
  return { rng: createRng(seed) };
}

/** Deterministic autopilot: play first hand card; pick targets/guesses stably. */
function pickAction(state: LoveLetterState): LoveLetterAction | null {
  if (state.phase !== "playing") return null;
  if (state.pending?.type === "priestReveal" || state.pending?.type === "baronessReveal" || state.pending?.type === "bishopRedraw") {
    return {
      type: "acknowledgePriest",
      playerId: state.pending.playerId,
      payload: {},
    };
  }
  if (state.pending?.type === "chancellor") {
    const held = state.pending.held;
    const keep = held[0]!;
    const rest = held.filter((c) => c.id !== keep.id);
    return {
      type: "resolveChancellor",
      playerId: state.pending.playerId,
      payload: {
        keepCardId: keep.id,
        bottomOrderIds: rest.map((c) => c.id),
      },
    };
  }
  const pid = state.turnOrder[state.currentIndex]!;
  const me = state.players.find((p) => p.id === pid)!;
  if (me.eliminated || me.hand.length === 0) return null;
  const ranks = me.hand.map((c) => c.rank);
  const forced =
    ranks.includes(8) && (ranks.includes(7) || ranks.includes(5))
      ? me.hand.find((c) => c.rank === 8)!
      : null;
  const card = forced ?? me.hand[0]!;
  const others = state.players.filter(
    (p) => !p.eliminated && p.id !== pid && !p.protected,
  );
  const targetId =
    card.rank === 5
      ? (others[0]?.id ?? pid)
      : others[0]?.id;
  return {
    type: "playCard",
    playerId: pid,
    payload: {
      cardId: card.id,
      targetId,
      guessRank: card.rank === 1 ? 9 : undefined,
    },
  };
}

function playToEnd(seed: string): LoveLetterState {
  let state = loveLetterPlugin.createGame(
    {
      playerIds: ["a", "b", "c"],
      playerNames: { a: "A", b: "B", c: "C" },
      seed,
    },
    ctx(seed),
  );
  for (let i = 0; i < 200; i++) {
    if (state.phase === "finished") break;
    const prepared = prepareLoveLetterTurn(state);
    state = prepared.state;
    if (state.phase === "finished") break;
    const action = pickAction(state);
    if (!action) break;
    const v = loveLetterPlugin.validateAction(state, action, ctx(seed));
    if (v !== true) break;
    state = loveLetterPlugin.applyAction(state, action, ctx(seed)).state;
  }
  return state;
}

describe("love-letter determinism", () => {
  it("same seed + autopilot → same hash", () => {
    const s1 = playToEnd("ll-fixed-1");
    const s2 = playToEnd("ll-fixed-1");
    expect(s1.phase).toBe("finished");
    expect(stableHash(s1)).toBe(stableHash(s2));
  });
});
