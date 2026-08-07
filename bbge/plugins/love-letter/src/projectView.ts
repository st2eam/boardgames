import type { PlayerId } from "@bbge/core";
import { rankName } from "./cards";
import { buildRoundEndPayload } from "./rules";
import type { LoveLetterState } from "./state";

export function projectLoveLetterView(
  state: LoveLetterState,
  viewerId: PlayerId | null,
) {
  const you = viewerId ? state.players.find((p) => p.id === viewerId) : null;
  const finished = state.phase === "finished";
  const end = finished ? buildRoundEndPayload(state) : null;
  const ed = state.edition;

  const named = (c: { id: string; rank: number; role?: string }) => ({
    id: c.id,
    rank: c.rank,
    role: c.role,
    name: rankName(ed, c.rank, c.role as never),
  });

  const pendingView = (() => {
    if (!state.pending) return null;
    if (state.pending.type === "chancellor") {
      return {
        type: "chancellor" as const,
        playerId: state.pending.playerId,
        held:
          viewerId === state.pending.playerId
            ? state.pending.held.map(named)
            : state.pending.held.map((c) => ({ id: c.id })),
      };
    }
    if (state.pending.type === "priestReveal") {
      return {
        type: "priestReveal" as const,
        playerId: state.pending.playerId,
        targetId: state.pending.targetId,
        ...(viewerId === state.pending.playerId
          ? {
              rank: state.pending.rank,
              name: rankName(ed, state.pending.rank),
            }
          : {}),
      };
    }
    if (state.pending.type === "baronessReveal") {
      return {
        type: "baronessReveal" as const,
        playerId: state.pending.playerId,
        ...(viewerId === state.pending.playerId
          ? {
              targets: state.pending.targets.map((t) => ({
                targetId: t.targetId,
                rank: t.rank,
                name: rankName(ed, t.rank),
              })),
            }
          : { targetCount: state.pending.targets.length }),
      };
    }
    return {
      type: "bishopRedraw" as const,
      playerId: state.pending.playerId,
      actorId: state.pending.actorId,
    };
  })();

  return {
    phase: state.phase,
    edition: ed,
    winners: state.winners,
    spyBonus: state.spyBonus,
    endReason: end?.reason ?? null,
    forcedTargetId: state.forcedTargetId,
    jesterPick: state.jesterPick,
    jesterPlayerId: state.jesterPlayerId,
    standings: end
      ? end.standings.map((s) => ({
          ...s,
          handName:
            s.handRank != null ? rankName(ed, s.handRank) : null,
        }))
      : [],
    faceUp: state.faceUp.map(named),
    deckCount: state.deck.length + (state.burn ? 1 : 0),
    currentPlayerId: state.turnOrder[state.currentIndex],
    pending: pendingView,
    you: you
      ? {
          id: you.id,
          hand: you.hand.map(named),
          eliminated: you.eliminated,
          protected: you.protected,
          seen: you.seen,
          hearts: you.hearts,
        }
      : null,
    others: state.players
      .filter((p) => p.id !== viewerId)
      .map((p) => ({
        id: p.id,
        name: p.name,
        handCount: p.hand.length,
        hearts: p.hearts,
        ...(finished && !p.eliminated && p.hand[0]
          ? { hand: [named(p.hand[0])] }
          : {}),
        discarded: p.discarded.map(named),
        eliminated: p.eliminated,
        protected: p.protected,
      })),
    selfDiscarded: you ? you.discarded.map(named) : [],
  };
}
