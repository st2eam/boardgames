import { describe, it, expect } from "vitest";
import { HostSession } from "./host";
import {
  loveLetterPlugin,
  type LoveLetterAction,
  type LoveLetterState,
} from "@bbge/love-letter";
import { prepareLoveLetterTurn } from "@bbge/love-letter";

function pickAction(state: LoveLetterState): LoveLetterAction | null {
  if (state.phase !== "playing") return null;
  if (state.pending?.type === "chancellor") {
    const held = state.pending.held;
    const keep = held[0]!;
    const rest = held.filter((c) => c.id !== keep.id);
    return {
      type: "resolveChancellor",
      playerId: state.pending.playerId,
      payload: {
        keepCardId: keep.id,
        bottomOrderIds: [rest[0]!.id, rest[1]!.id],
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
  return {
    type: "playCard",
    playerId: pid,
    payload: {
      cardId: card.id,
      targetId: card.rank === 5 ? (others[0]?.id ?? pid) : others[0]?.id,
      guessRank: card.rank === 1 ? 9 : undefined,
    },
  };
}

describe("HostSession", () => {
  it("finishes a fixture via autopilot", async () => {
    const host = new HostSession(loveLetterPlugin, {
      seed: "ll-fixed-1",
      hostPlayerId: "a",
    });
    host.addHumanSeat("a", "A");
    host.addHumanSeat("b", "B");
    host.setReady("a", true);
    host.setReady("b", true);
    const started = await host.start();
    expect(started.ok).toBe(true);
    expect(host.getPhase()).toBe("playing");

    for (let i = 0; i < 200; i++) {
      if (host.getPhase() === "finished") break;
      const raw = host.getSerializedState()!;
      let state = loveLetterPlugin.deserialize(raw) as LoveLetterState;
      state = prepareLoveLetterTurn(state).state;
      const action = pickAction(state);
      if (!action) break;
      const r = host.submitAction(action);
      expect(r.ok).toBe(true);
    }
    expect(host.getPhase()).toBe("finished");
  });
});
