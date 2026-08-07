import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";

type View = {
  phase?: string;
  currentPlayerId?: string | null;
  pendingDraw?: { source?: string; value?: number | null; cardId?: string | null } | null;
  pendingAbility?: { kind?: string } | null;
  pendingModal?: {
    type?: string;
    value?: number;
    values?: number[];
    waiting?: boolean;
  } | null;
  setupPeeksDone?: boolean;
  you?: {
    slots?: { slotIndex: number; value: number | null; faceUp: boolean; knownToYou?: boolean }[];
    cumulativeScore?: number;
  } | null;
  discardTop?: number | null;
  legal?: {
    type: string;
    payload?: Record<string, unknown>;
    slotIndices?: number[];
    useAbility?: boolean;
    slotIndex?: number;
    targetPlayerId?: string;
    ownSlotIndex?: number;
    targetSlotIndex?: number;
  }[];
  seats?: {
    id: string;
    slots?: { slotIndex: number; value: number | null; faceUp: boolean }[];
    cumulativeScore?: number;
  }[];
};

function hashMix(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unknownFaceDown(
  slots: NonNullable<View["you"]>["slots"],
): number[] {
  return (slots ?? [])
    .map((s, i) => (!s.faceUp && s.value == null ? i : -1))
    .filter((i) => i >= 0);
}

/**
 * Heuristic CABO seat: peek low unknowns, swap away highs,
 * call when estimated sum is strong; use spy on leader slots.
 */
export function createMockCaboSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = view.legal ?? [];

      if (
        view.pendingModal &&
        !view.pendingModal.waiting &&
        (view.pendingModal.value != null ||
          (view.pendingModal.values?.length ?? 0) > 0 ||
          legal.some((a) => a.type === "acknowledgeModal"))
      ) {
        return {
          action: {
            type: "acknowledgeModal",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      if (view.phase === "setupPeek" && !view.setupPeeksDone) {
        const slots = view.you?.slots ?? [];
        const picks = [0, 1].filter((i) => i < slots.length);
        if (slots.length >= 4) {
          const h = hashMix(`${id}-setup`);
          picks[0] = h % 4;
          picks[1] = (h + 2) % 4;
          if (picks[0] === picks[1]) picks[1] = (picks[1] + 1) % 4;
        }
        progress("策略：开局偷看两张");
        return {
          action: {
            type: "setupPeek",
            playerId: id,
            payload: { slotIndices: picks },
          } as Action,
        };
      }

      if (view.pendingAbility) {
        const kind = view.pendingAbility.kind;
        if (kind === "peek") {
          const acts = legal.filter((a) => a.type === "resolveAbilityPeek");
          const unknown = unknownFaceDown(view.you?.slots);
          const slotIndex =
            acts.find((a) => unknown.includes(a.payload?.slotIndex as number))
              ?.payload?.slotIndex ??
            acts[0]?.payload?.slotIndex ??
            0;
          progress("策略：偷看自己的暗牌");
          return {
            action: {
              type: "resolveAbilityPeek",
              playerId: id,
              payload: { slotIndex: slotIndex as number },
            } as Action,
          };
        }
        if (kind === "spy") {
          const acts = legal.filter((a) => a.type === "resolveAbilitySpy");
          const leader = [...(view.seats ?? [])].sort(
            (a, b) => (a.cumulativeScore ?? 0) - (b.cumulativeScore ?? 0),
          )[0];
          const pick =
            acts.find((a) => a.payload?.targetPlayerId === leader?.id) ??
            acts[0];
          progress("策略：间谍偷看");
          return {
            action: {
              type: "resolveAbilitySpy",
              playerId: id,
              payload: {
                targetPlayerId: pick?.payload?.targetPlayerId as string,
                slotIndex: pick?.payload?.slotIndex as number,
              },
            } as Action,
          };
        }
        if (kind === "swap") {
          const acts = legal.filter((a) => a.type === "resolveAbilitySwap");
          const highOwn = (view.you?.slots ?? [])
            .map((s, i) => ({ i, v: s.knownToYou ? s.value : s.faceUp ? s.value : 8 }))
            .sort((a, b) => (b.v ?? 0) - (a.v ?? 0))[0];
          const pick =
            acts.find((a) => a.payload?.ownSlotIndex === highOwn?.i) ?? acts[0];
          progress("策略：盲换一张");
          return {
            action: {
              type: "resolveAbilitySwap",
              playerId: id,
              payload: {
                ownSlotIndex: pick?.payload?.ownSlotIndex as number,
                targetPlayerId: pick?.payload?.targetPlayerId as string,
                targetSlotIndex: pick?.payload?.targetSlotIndex as number,
              },
            } as Action,
          };
        }
        progress("策略：跳过能力");
        return {
          action: {
            type: "skipAbility",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      if (view.pendingDraw) {
        const drawn = view.pendingDraw.value ?? 99;
        const slots = view.you?.slots ?? [];
        const knownSum = slots.reduce(
          (s, x) => s + (x.value ?? (x.knownToYou ? 0 : 6)),
          0,
        );

        if (drawn >= 10 && view.pendingDraw.source === "deck") {
          const discardActs = legal.filter((a) => a.type === "discardDrawn");
          const withAbility = discardActs.find(
            (a) => a.payload?.useAbility,
          );
          if (withAbility && (drawn === 9 || drawn === 10 || drawn === 7 || drawn === 8)) {
            progress("策略：弃牌并发动能力");
            return {
              action: {
                type: "discardDrawn",
                playerId: id,
                payload: { useAbility: true },
              } as Action,
            };
          }
          progress("策略：弃掉高牌");
          return {
            action: {
              type: "discardDrawn",
              playerId: id,
              payload: {},
            } as Action,
          };
        }

        const swapActs = legal.filter((a) => a.type === "swapWithDrawn");
        let best = swapActs[0];
        let bestScore = Infinity;
        for (const a of swapActs) {
          const indices = (a.payload?.slotIndices as number[]) ?? [];
          const est = indices.reduce((s, i) => {
            const v = slots[i]?.value;
            return s + (v ?? 7);
          }, 0);
          const gain = est - drawn * indices.length;
          if (gain > 0 && est > bestScore) {
            bestScore = est;
            best = a;
          }
        }
        if (best && bestScore < Infinity) {
          progress("策略：换掉高分暗牌");
          return {
            action: {
              type: "swapWithDrawn",
              playerId: id,
              payload: {
                slotIndices: best.payload?.slotIndices as number[],
              },
            } as Action,
          };
        }

        progress("策略：弃牌");
        return {
          action: {
            type: "discardDrawn",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      const callAct = legal.find((a) => a.type === "callCabo");
      const estSum = (view.you?.slots ?? []).reduce(
        (s, x) => s + (x.value ?? (x.knownToYou ? 2 : 6)),
        0,
      );
      if (callAct && estSum <= 8 && hashMix(`${id}-${view.phase}`) % 3 !== 0) {
        progress("策略：呼唤 CABO");
        return {
          action: {
            type: "callCabo",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      const discardVal = view.discardTop;
      if (
        discardVal != null &&
        discardVal <= 4 &&
        legal.some((a) => a.type === "drawDiscard")
      ) {
        progress("策略：拿弃牌堆低牌");
        return {
          action: {
            type: "drawDiscard",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      if (legal.some((a) => a.type === "drawDeck")) {
        progress("策略：摸牌堆");
        return {
          action: {
            type: "drawDeck",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      if (callAct) {
        progress("策略：呼唤 CABO");
        return {
          action: {
            type: "callCabo",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      throw new Error("no legal cabo action");
    },
  };
}
