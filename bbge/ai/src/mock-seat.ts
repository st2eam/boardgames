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

/** Rule-free heuristic seat for tests and offline fallback demos. */
export function createMockLoveLetterSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown: unknown): Promise<Action> {
      const view = viewUnknown as View;
      if (view.pending?.type === "chancellor" && view.pending.playerId === id) {
        const held = view.pending.held ?? [];
        const keep = held[0]!;
        const rest = held.filter((c) => c.id !== keep.id);
        return {
          type: "resolveChancellor",
          playerId: id,
          payload: {
            keepCardId: keep.id,
            bottomOrderIds: [rest[0]!.id, rest[1]!.id],
          },
        };
      }
      const hand = view.you?.hand ?? [];
      const ranks = hand.map((c) => c.rank);
      const forced =
        ranks.includes(8) && (ranks.includes(7) || ranks.includes(5))
          ? hand.find((c) => c.rank === 8)!
          : null;
      const card = forced ?? hand[0];
      if (!card) {
        throw new Error("AI has no card");
      }
      const others = (view.others ?? []).filter(
        (p) => !p.eliminated && !p.protected,
      );
      return {
        type: "playCard",
        playerId: id,
        payload: {
          cardId: card.id,
          targetId: card.rank === 5 ? (others[0]?.id ?? id) : others[0]?.id,
          guessRank: card.rank === 1 ? 9 : undefined,
        },
      };
    },
    async speak() {
      return {
        playerId: id,
        text: "…",
        at: Date.now(),
      };
    },
  };
}
