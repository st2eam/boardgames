import type { PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";

type Legal = {
  type: string;
  payload?: Record<string, unknown>;
};

type View = {
  turnReveals?: { value: number; source: string; ownerId?: string }[];
  you?: { id: string; hand?: { value: number }[]; trios?: number[] } | null;
  seats?: { id: string; handCount: number; isYou?: boolean }[];
  center?: { empty?: boolean; faceUp?: boolean; slotIndex?: number; value?: number }[];
  legal?: Legal[];
  mode?: string;
};

/**
 * Memory-light heuristic: chase current value via own extremes, then center, then others.
 */
export function createMockTrioSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = view.legal ?? [];
      if (!legal.length) {
        progress("策略：等待");
        return {
          action: { type: "revealCenter", playerId: id, payload: { slotIndex: 0 } },
        };
      }

      const confirm = legal.find((x) => x.type === "confirmTurn");
      if (confirm) {
        progress("策略：确认翻牌结果");
        return {
          action: {
            type: "confirmTurn",
            playerId: id,
            payload: {},
          },
        };
      }

      const target = view.turnReveals?.[0]?.value ?? null;
      const hand = view.you?.hand ?? [];

      if (target != null) {
        // Prefer own extreme if it matches
        const low = hand[0]?.value;
        const high = hand[hand.length - 1]?.value;
        if (low === target) {
          const a = legal.find(
            (x) =>
              x.type === "revealExtreme" &&
              x.payload?.targetPlayerId === id &&
              x.payload?.end === "low",
          );
          if (a) {
            progress(`策略：翻自己最小 ${target}`);
            return {
              action: {
                type: "revealExtreme",
                playerId: id,
                payload: a.payload ?? {},
              },
            };
          }
        }
        if (high === target) {
          const a = legal.find(
            (x) =>
              x.type === "revealExtreme" &&
              x.payload?.targetPlayerId === id &&
              x.payload?.end === "high",
          );
          if (a) {
            progress(`策略：翻自己最大 ${target}`);
            return {
              action: {
                type: "revealExtreme",
                playerId: id,
                payload: a.payload ?? {},
              },
            };
          }
        }
      } else {
        // Start turn: peek own low (known)
        const a = legal.find(
          (x) =>
            x.type === "revealExtreme" &&
            x.payload?.targetPlayerId === id &&
            x.payload?.end === "low",
        );
        if (a && hand.length) {
          progress("策略：从自己最小开始");
          return {
            action: {
              type: "revealExtreme",
              playerId: id,
              payload: a.payload ?? {},
            },
          };
        }
      }

      const center = legal.find((x) => x.type === "revealCenter");
      if (center) {
        progress("策略：翻中央牌");
        return {
          action: {
            type: "revealCenter",
            playerId: id,
            payload: center.payload ?? {},
          },
        };
      }

      const other = legal.find(
        (x) =>
          x.type === "revealExtreme" && x.payload?.targetPlayerId !== id,
      );
      if (other) {
        progress("策略：翻对手端牌");
        return {
          action: {
            type: "revealExtreme",
            playerId: id,
            payload: other.payload ?? {},
          },
        };
      }

      const any = legal[0]!;
      progress("策略：任意合法翻牌");
      return {
        action: {
          type: any.type,
          playerId: id,
          payload: any.payload ?? {},
        },
      };
    },
  };
}
