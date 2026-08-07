import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "./ai-seat";

type View = {
  currentPlayerId?: string | null;
  phase?: string;
  you?: {
    id: string;
    toCall?: number;
    stack?: number;
    streetBet?: number;
  } | null;
  legal?: { type: string; toAmount?: number; callAmount?: number }[];
  bigBlind?: number;
  minRaiseTo?: number;
};

/** Simple heuristic: check > call small > fold to big bets; occasional min-raise. */
export function createMockTexasHoldemSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = view.legal ?? [];
      const toCall = view.you?.toCall ?? 0;
      const stack = view.you?.stack ?? 0;
      const bb = view.bigBlind ?? 2;

      const has = (t: string) => legal.some((a) => a.type === t);

      if (has("check")) {
        progress("本地启发式：过牌");
        return {
          action: { type: "check", playerId: id, payload: {} } as Action,
        };
      }
      if (has("call") && toCall <= bb * 3) {
        progress("本地启发式：跟注");
        return {
          action: { type: "call", playerId: id, payload: {} } as Action,
        };
      }
      if (has("raise") && stack > bb * 20 && toCall === 0) {
        const to =
          legal.find((a) => a.type === "raise")?.toAmount ??
          view.minRaiseTo ??
          bb * 2;
        progress("本地启发式：最小加注");
        return {
          action: {
            type: "raise",
            playerId: id,
            payload: { toAmount: to },
          } as Action,
        };
      }
      if (has("fold")) {
        progress("本地启发式：弃牌");
        return {
          action: { type: "fold", playerId: id, payload: {} } as Action,
        };
      }
      if (has("call")) {
        return {
          action: { type: "call", playerId: id, payload: {} } as Action,
        };
      }
      throw new Error("no legal holdem action");
    },
  };
}
