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
            bottomOrderIds: rest.map((c) => c.id),
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
      return {
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
      };
    },
    async speak(ctx) {
      const linesZh = ["哼，小心点。", "这手有点意思。", "公主在我心里。", "别瞎猜我。"];
      const linesEn = ["Watch yourself.", "Interesting hand.", "Hmm…", "Don't guess me."];
      const lines = ctx.locale === "zh" ? linesZh : linesEn;
      const text = lines[Math.floor(Math.random() * lines.length)]!;
      return { playerId: id, text, at: Date.now() };
    },
  };
}
