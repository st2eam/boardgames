import type { PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";
import { commitRackPlayed } from "./commit";

type Legal = { type: string; payload?: Record<string, unknown> };

type View = {
  poolCount?: number;
  you?: {
    id: string;
    rack?: { id: string }[];
    initialMeldDone?: boolean;
  } | null;
  legal?: Legal[];
};

/** Greedy heuristic: commit the meld that plays the most rack tiles, else draw. */
export function createMockRummikubSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = view.legal ?? [];
      const rackIds = new Set((view.you?.rack ?? []).map((t) => t.id));

      const commits = legal
        .filter((a) => a.type === "commitTurn")
        .sort((a, b) => {
          const na = commitRackPlayed(
            a.payload?.groups as string[][] | undefined,
            rackIds,
          );
          const nb = commitRackPlayed(
            b.payload?.groups as string[][] | undefined,
            rackIds,
          );
          if (nb !== na) return nb - na;
          const ga = (a.payload?.groups as string[][] | undefined)?.flat().length ?? 0;
          const gb = (b.payload?.groups as string[][] | undefined)?.flat().length ?? 0;
          return gb - ga;
        });
      if (commits.length) {
        progress("策略：打出组合");
        const best = commits[0]!;
        return {
          action: {
            type: "commitTurn",
            playerId: id,
            payload: best.payload ?? { groups: [] },
          },
        };
      }

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

      if (!legal.length) {
        progress("策略：等待");
        return {
          action: { type: "passTurn", playerId: id, payload: {} },
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
