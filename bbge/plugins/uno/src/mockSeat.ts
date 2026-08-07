import type { PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";
import type { UnoColor } from "./cards";

type Legal = {
  type: string;
  payload?: Record<string, unknown>;
};

type View = {
  phase?: string;
  currentColor?: UnoColor;
  edition?: string;
  pending?: { type?: string; amount?: number } | null;
  you?: {
    hand?: {
      id: string;
      color: UnoColor | null;
      kind: string;
      number?: number | null;
      drawN?: number | null;
    }[];
  } | null;
  seats?: { id: string; handCount: number; eliminated?: boolean }[];
  legal?: Legal[];
  unoVulnerableId?: string | null;
};

/**
 * Heuristic UNO seat: play matching cards (prefer actions), call UNO, stack when able.
 */
export function createMockUnoSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = view.legal ?? [];

      const pick = (type: string) => legal.find((a) => a.type === type);

      if (view.unoVulnerableId && view.unoVulnerableId !== id) {
        const catchA = legal.find(
          (a) =>
            a.type === "catchUno" &&
            a.payload?.targetPlayerId === view.unoVulnerableId,
        );
        if (catchA) {
          progress("策略：抓住没喊 UNO");
          return {
            action: {
              type: "catchUno",
              playerId: id,
              payload: catchA.payload ?? {},
            },
          };
        }
      }

      const chooseColor = pick("chooseColor");
      if (chooseColor) {
        const hand = view.you?.hand ?? [];
        const counts: Record<string, number> = {
          red: 0,
          yellow: 0,
          green: 0,
          blue: 0,
        };
        for (const c of hand) {
          if (c.color) counts[c.color] = (counts[c.color] ?? 0) + 1;
        }
        const color = (Object.entries(counts).sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0] ?? "red") as UnoColor;
        progress(`策略：选色 ${color}`);
        return {
          action: { type: "chooseColor", playerId: id, payload: { color } },
        };
      }

      const chooseTarget = pick("chooseTarget");
      if (chooseTarget) {
        const seats = (view.seats ?? [])
          .filter((s) => s.id !== id && !s.eliminated)
          .sort((a, b) => a.handCount - b.handCount);
        const target = seats[0]?.id;
        progress("策略：换最少手牌的对手");
        return {
          action: {
            type: "chooseTarget",
            playerId: id,
            payload: { targetPlayerId: target },
          },
        };
      }

      if (pick("acceptWildDraw") && !pick("challengeWildDraw")) {
        // unreachable
      }
      const challenge = pick("challengeWildDraw");
      const accept = pick("acceptWildDraw");
      if (challenge && accept) {
        // Light challenge if we have few cards
        const handN = view.you?.hand?.length ?? 7;
        if (handN <= 3) {
          progress("策略：接受 +4");
          return {
            action: { type: "acceptWildDraw", playerId: id, payload: {} },
          };
        }
        progress("策略：质疑 +4");
        return {
          action: { type: "challengeWildDraw", playerId: id, payload: {} },
        };
      }

      if (pick("takeStack")) {
        const stackPlay = legal.filter((a) => a.type === "playCard");
        if (stackPlay.length) {
          const a = stackPlay[0]!;
          progress("策略：叠加罚抽");
          return {
            action: {
              type: "playCard",
              playerId: id,
              payload: { ...a.payload, saidUno: true },
            },
          };
        }
        progress("策略：收下叠加惩罚");
        return {
          action: { type: "takeStack", playerId: id, payload: {} },
        };
      }

      if (pick("playDrawn")) {
        progress("策略：打出抽到的牌");
        return {
          action: {
            type: "playDrawn",
            playerId: id,
            payload: { saidUno: true, chosenColor: view.currentColor },
          },
        };
      }
      if (pick("keepDrawn")) {
        progress("策略：留下抽到的牌");
        return {
          action: { type: "keepDrawn", playerId: id, payload: {} },
        };
      }

      if (pick("callUno")) {
        progress("策略：UNO!");
        return { action: { type: "callUno", playerId: id, payload: {} } };
      }

      const plays = legal.filter((a) => a.type === "playCard");
      if (plays.length) {
        const hand = view.you?.hand ?? [];
        const scored = plays.map((a) => {
          const card = hand.find((c) => c.id === a.payload?.cardId);
          let score = 1;
          if (card?.kind === "draw" || card?.kind === "wildDraw") score += 5;
          if (card?.kind === "skip" || card?.kind === "skipAll") score += 4;
          if (card?.kind === "reverse") score += 3;
          if (card?.kind === "number") score += 2;
          if (card?.kind === "wild") score += 0;
          return { a, score };
        });
        scored.sort((x, y) => y.score - x.score);
        const best = scored[0]!.a;
        const card = hand.find((c) => c.id === best.payload?.cardId);
        const needsColor =
          card &&
          (card.kind.startsWith("wild") || card.color == null);
        progress(`策略：出牌 ${String(best.payload?.cardId ?? "")}`);
        return {
          action: {
            type: "playCard",
            playerId: id,
            payload: {
              ...best.payload,
              saidUno: true,
              chosenColor: needsColor
                ? ((view.you?.hand ?? [])
                    .map((c) => c.color)
                    .find((c) => c) ?? "red")
                : undefined,
            },
          },
        };
      }

      if (pick("drawCard")) {
        progress("策略：抽牌");
        return {
          action: { type: "drawCard", playerId: id, payload: {} },
        };
      }

      progress("策略：无合法动作");
      return {
        action: { type: "drawCard", playerId: id, payload: {} },
      };
    },
  };
}
