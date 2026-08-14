import type { PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";

type Legal = { type: string; payload?: Record<string, unknown> };

type View = {
  poolCount?: number;
  table?: { id: string; tiles?: unknown[] }[];
  you?: {
    id: string;
    rack?: { id: string; color?: string | null; number?: number | null; joker?: boolean }[];
    initialMeldDone?: boolean;
    rackPoints?: number;
  } | null;
  legal?: Legal[];
};

/** Greedy heuristic: play the best legal meld, else extend, else draw/pass. */
export function createMockRummikubSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = view.legal ?? [];
      if (!legal.length) {
        progress("策略：等待");
        return {
          action: { type: "passTurn", playerId: id, payload: {} },
        };
      }

      // Prefer new sets with the most tiles.
      const newSets = legal
        .filter((a) => a.type === "playNewSet")
        .sort(
          (a, b) =>
            ((b.payload?.tileIds as string[] | undefined)?.length ?? 0) -
            ((a.payload?.tileIds as string[] | undefined)?.length ?? 0),
        );
      if (newSets.length) {
        progress("策略：打出新组合");
        const best = newSets[0]!;
        return {
          action: {
            type: "playNewSet",
            playerId: id,
            payload: best.payload ?? {},
          },
        };
      }

      // Then extend existing sets.
      const extend = legal.find((a) => a.type === "extendSet");
      if (extend) {
        progress("策略：延伸桌面组合");
        return {
          action: {
            type: "extendSet",
            playerId: id,
            payload: extend.payload ?? {},
          },
        };
      }

      // If we may draw, draw once.
      const draw = legal.find((a) => a.type === "drawTile");
      if (draw) {
        progress("策略：抽牌");
        return {
          action: {
            type: "drawTile",
            playerId: id,
            payload: {},
          },
        };
      }

      const pass = legal.find((a) => a.type === "passTurn");
      if (pass) {
        progress("策略：过牌");
        return {
          action: {
            type: "passTurn",
            playerId: id,
            payload: {},
          },
        };
      }

      const any = legal[0]!;
      progress("策略：任意合法动作");
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
