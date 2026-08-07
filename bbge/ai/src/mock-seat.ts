import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "./ai-seat";

type HandCard = { id: string; rank: number; role?: string };

type View = {
  edition?: string;
  currentPlayerId?: string;
  pending?: {
    type: string;
    playerId: string;
    held?: { id: string; rank?: number }[];
    targets?: { targetId: string; rank: number }[];
  } | null;
  you?: {
    id: string;
    hand: HandCard[];
  } | null;
  others?: {
    id: string;
    eliminated: boolean;
    protected: boolean;
  }[];
};

const NO_TARGET = new Set([
  "spy",
  "handmaid",
  "chancellor",
  "countess",
  "princess",
  "constable",
  "count",
  "assassin",
]);

function roleOf(c: HandCard): string {
  return c.role ?? String(c.rank);
}

/** Rule-free heuristic seat for tests and offline fallback demos. */
export function createMockLoveLetterSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const edition = view.edition === "classic" || view.edition === "premium"
        ? "classic"
        : view.edition === "expansion"
          ? "expansion"
          : "full";
      const maxGuess = edition === "classic" ? 8 : 9;

      if (
        (view.pending?.type === "priestReveal" ||
          view.pending?.type === "baronessReveal") &&
        view.pending.playerId === id
      ) {
        progress("本地启发式：确认偷看");
        return {
          action: { type: "acknowledgePriest", playerId: id, payload: {} },
        };
      }
      if (view.pending?.type === "bishopRedraw" && view.pending.playerId === id) {
        progress("本地启发式：主教命中后保留手牌");
        return {
          action: {
            type: "acknowledgePriest",
            playerId: id,
            payload: { redraw: false },
          },
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
      const roles = hand.map(roleOf);
      const forced =
        roles.includes("countess") &&
        (roles.includes("king") || roles.includes("prince"))
          ? hand.find((c) => roleOf(c) === "countess")!
          : null;
      const others = (view.others ?? []).filter(
        (p) => !p.eliminated && !p.protected,
      );
      const safe =
        others.length === 0
          ? hand.find((c) => NO_TARGET.has(roleOf(c))) ?? hand[0]!
          : forced ?? hand[0]!;
      const card = forced ?? safe;
      const role = roleOf(card);

      const singleTarget = [
        "guard",
        "priest",
        "baron",
        "prince",
        "king",
        "bishop",
        "dowagerQueen",
        "jester",
        "sycophant",
      ].includes(role);
      const baroness = role === "baroness";
      const cardinal = role === "cardinal";

      progress(
        forced
          ? "本地启发式：强制打出伯爵夫人"
          : others.length === 0
            ? "本地启发式：无人可指向，出安全牌"
            : `本地启发式：打出 ${role}`,
      );

      if (cardinal && others.length >= 1) {
        const a = others[0]!.id;
        const b = others[1]?.id ?? id;
        return {
          action: {
            type: "playCard",
            playerId: id,
            payload: {
              cardId: card.id,
              targetIds: [a, b],
              peekTargetId: a,
            },
          } as Action,
        };
      }
      if (baroness && others.length >= 1) {
        return {
          action: {
            type: "playCard",
            playerId: id,
            payload: {
              cardId: card.id,
              targetIds: others.slice(0, Math.min(2, others.length)).map((p) => p.id),
            },
          } as Action,
        };
      }

      return {
        action: {
          type: "playCard",
          playerId: id,
          payload: {
            cardId: card.id,
            targetId: singleTarget
              ? role === "prince" || role === "sycophant"
                ? (others[0]?.id ?? id)
                : others[0]?.id
              : undefined,
            guessRank:
              role === "guard" || role === "bishop" ? maxGuess : undefined,
          },
        } as Action,
      };
    },
  };
}
