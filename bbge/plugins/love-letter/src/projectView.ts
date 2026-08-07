import type { PlayerId } from "@bbge/core";
import { RANK_NAME } from "./cards";
import { buildRoundEndPayload } from "./rules";
import type { LoveLetterState } from "./state";

export function projectLoveLetterView(
  state: LoveLetterState,
  viewerId: PlayerId | null,
) {
  const you = viewerId ? state.players.find((p) => p.id === viewerId) : null;
  const finished = state.phase === "finished";
  const end = finished ? buildRoundEndPayload(state) : null;

  return {
    phase: state.phase,
    winners: state.winners,
    spyBonus: state.spyBonus,
    endReason: end?.reason ?? null,
    standings: end
      ? end.standings.map((s) => ({
          ...s,
          handName:
            s.handRank != null
              ? RANK_NAME[s.handRank as keyof typeof RANK_NAME]
              : null,
        }))
      : [],
    faceUp: state.faceUp.map((c) => ({
      id: c.id,
      rank: c.rank,
      name: RANK_NAME[c.rank],
    })),
    deckCount: state.deck.length + (state.burn ? 1 : 0),
    currentPlayerId: state.turnOrder[state.currentIndex],
    pending: state.pending
      ? state.pending.type === "chancellor"
        ? {
            type: "chancellor" as const,
            playerId: state.pending.playerId,
            held:
              viewerId === state.pending.playerId
                ? state.pending.held.map((c) => ({
                    id: c.id,
                    rank: c.rank,
                    name: RANK_NAME[c.rank],
                  }))
                : state.pending.held.map((c) => ({ id: c.id })),
          }
        : {
            type: "priestReveal" as const,
            playerId: state.pending.playerId,
            targetId: state.pending.targetId,
            ...(viewerId === state.pending.playerId
              ? {
                  rank: state.pending.rank,
                  name: RANK_NAME[state.pending.rank as keyof typeof RANK_NAME],
                }
              : {}),
          }
      : null,
    you: you
      ? {
          id: you.id,
          hand: you.hand.map((c) => ({
            id: c.id,
            rank: c.rank,
            name: RANK_NAME[c.rank],
          })),
          eliminated: you.eliminated,
          protected: you.protected,
          seen: you.seen,
        }
      : null,
    others: state.players
      .filter((p) => p.id !== viewerId)
      .map((p) => ({
        id: p.id,
        name: p.name,
        handCount: p.hand.length,
        // Reveal final hand when the round is over (比点)
        ...(finished && !p.eliminated && p.hand[0]
          ? {
              hand: [
                {
                  id: p.hand[0].id,
                  rank: p.hand[0].rank,
                  name: RANK_NAME[p.hand[0].rank],
                },
              ],
            }
          : {}),
        discarded: p.discarded.map((c) => ({
          id: c.id,
          rank: c.rank,
          name: RANK_NAME[c.rank],
        })),
        eliminated: p.eliminated,
        protected: p.protected,
      })),
    selfDiscarded: you
      ? you.discarded.map((c) => ({
          id: c.id,
          rank: c.rank,
          name: RANK_NAME[c.rank],
        }))
      : [],
  };
}
