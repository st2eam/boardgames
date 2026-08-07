import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "./ai-seat";

type View = {
  currentPlayerId?: string;
  pending?: {
    type: string;
    playerId: string;
    held?: { id: string; rank?: number }[];
  } | null;
  you?: {
    id: string;
    hand: { id: string; rank: number }[];
  } | null;
  others?: {
    id: string;
    eliminated: boolean;
    protected: boolean;
  }[];
};

const NO_TARGET = new Set([0, 4, 6, 8, 9]);

/** Rule-free heuristic seat for tests and offline fallback demos. */
export function createMockLoveLetterSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });

      if (view.pending?.type === "priestReveal" && view.pending.playerId === id) {
        progress("本地启发式：确认神父偷看");
        return {
          action: { type: "acknowledgePriest", playerId: id, payload: {} },
        };
      }
      if (view.pending?.type === "chancellor" && view.pending.playerId === id) {
        progress("本地启发式：大臣保留第一张");
        const held = view.pending.held ?? [];
        const keep = held[0]!;
        const rest = held.filter((c) => c.id !== keep.id);
        return {
          action: {
            type: "resolveChancellor",
            playerId: id,
            payload: {
              keepCardId: keep.id,
              bottomOrderIds: rest.map((c) => c.id),
            },
          },
        };
      }
      const hand = view.you?.hand ?? [];
      if (hand.length === 0) throw new Error("AI has no card");
      const ranks = hand.map((c) => c.rank);
      const forced =
        ranks.includes(8) && (ranks.includes(7) || ranks.includes(5))
          ? hand.find((c) => c.rank === 8)!
          : null;
      const others = (view.others ?? []).filter(
        (p) => !p.eliminated && !p.protected,
      );
      // Prefer a no-target card when nobody is targetable (avoids illegal Guard etc.)
      const safe =
        others.length === 0
          ? hand.find((c) => NO_TARGET.has(c.rank)) ?? hand[0]!
          : forced ?? hand[0]!;
      const card = forced ?? safe;
      const needsTarget = [1, 2, 3, 5, 7].includes(card.rank);
      progress(
        forced
          ? "本地启发式：强制打出伯爵夫人"
          : others.length === 0
            ? "本地启发式：无人可指向，出安全牌"
            : `本地启发式：打出 rank ${card.rank}`,
      );
      return {
        action: {
          type: "playCard",
          playerId: id,
          payload: {
            cardId: card.id,
            targetId: needsTarget
              ? card.rank === 5
                ? (others[0]?.id ?? id)
                : others[0]?.id
              : undefined,
            guessRank: card.rank === 1 ? 9 : undefined,
          },
        },
      };
    },
  };
}
