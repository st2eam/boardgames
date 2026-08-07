import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";

type SlotV = {
  slotIndex?: number;
  value: number | null;
  faceUp: boolean;
  knownToYou?: boolean;
};

type View = {
  phase?: string;
  currentPlayerId?: string | null;
  pendingDraw?: {
    source?: string;
    value?: number | null;
    cardId?: string | null;
  } | null;
  pendingAbility?: { kind?: string } | null;
  pendingModal?: {
    type?: string;
    value?: number;
    values?: number[];
    waiting?: boolean;
  } | null;
  setupPeeksDone?: boolean;
  you?: {
    slots?: SlotV[];
    cumulativeScore?: number;
  } | null;
  discardTop?: number | null;
  legal?: {
    type: string;
    payload?: Record<string, unknown>;
  }[];
  seats?: {
    id: string;
    slots?: SlotV[];
    cumulativeScore?: number;
    isYou?: boolean;
  }[];
};

/** Estimated points for a slot. Lower is better. Unknown ≈ mid-high. */
function estValue(s: SlotV | undefined): number {
  if (!s) return 7;
  if (s.value != null) return s.value;
  return 7;
}

function unknownFaceDown(slots: SlotV[] | undefined): number[] {
  return (slots ?? [])
    .map((s, i) => (!s.faceUp && s.value == null ? i : -1))
    .filter((i) => i >= 0);
}

/**
 * Heuristic CABO seat — goal is lowest tableau / cumulative score.
 * Never discard 0–2 draws; swap drawn lows onto highest known slots.
 */
export function createMockCaboSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const legal = view.legal ?? [];
      const slots = view.you?.slots ?? [];

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
        // Prefer corner pair 0+3 or 1+2 so later peeks cover the rest.
        const picks =
          slots.length >= 4 ? [0, 3] : [0, Math.min(1, slots.length - 1)];
        progress("策略：开局偷看两端");
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
          const unknown = unknownFaceDown(slots);
          const slotIndex = unknown[0] ?? 0;
          progress("策略：偷看未知暗牌");
          return {
            action: {
              type: "resolveAbilityPeek",
              playerId: id,
              payload: { slotIndex },
            } as Action,
          };
        }
        if (kind === "spy") {
          const acts = legal.filter((a) => a.type === "resolveAbilitySpy");
          const rivals = (view.seats ?? []).filter((s) => s.id !== id);
          const leader = [...rivals].sort(
            (a, b) => (a.cumulativeScore ?? 0) - (b.cumulativeScore ?? 0),
          )[0];
          const pick =
            acts.find((a) => a.payload?.targetPlayerId === leader?.id) ??
            acts[0];
          if (pick) {
            progress("策略：间谍偷看低分对手");
            return {
              action: {
                type: "resolveAbilitySpy",
                playerId: id,
                payload: {
                  targetPlayerId: pick.payload?.targetPlayerId as string,
                  slotIndex: pick.payload?.slotIndex as number,
                },
              } as Action,
            };
          }
        }
        if (kind === "swap") {
          // Only blind-swap when we have a clearly high known card (>= 9).
          const highOwn = slots
            .map((s, i) => ({ i, v: estValue(s) }))
            .filter((x) => x.v >= 9)
            .sort((a, b) => b.v - a.v)[0];
          const acts = legal.filter((a) => a.type === "resolveAbilitySwap");
          const pick =
            highOwn != null
              ? acts.find((a) => a.payload?.ownSlotIndex === highOwn.i)
              : undefined;
          if (pick && highOwn) {
            progress("策略：用高牌盲换");
            return {
              action: {
                type: "resolveAbilitySwap",
                playerId: id,
                payload: {
                  ownSlotIndex: pick.payload?.ownSlotIndex as number,
                  targetPlayerId: pick.payload?.targetPlayerId as string,
                  targetSlotIndex: pick.payload?.targetSlotIndex as number,
                },
              } as Action,
            };
          }
          progress("策略：跳过盲换（没有明显高牌）");
          return {
            action: {
              type: "skipAbility",
              playerId: id,
              payload: {},
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
        const drawn = view.pendingDraw.value;
        // Hidden draw shouldn't happen for the acting seat; treat as medium.
        const drawnVal = drawn ?? 7;
        const canDiscard =
          view.pendingDraw.source === "deck" &&
          legal.some((a) => a.type === "discardDrawn");
        const canAbility = legal.some(
          (a) => a.type === "discardDrawn" && a.payload?.useAbility,
        );

        // Find the best slot(s) to replace: maximize (slotEst - drawn).
        let bestIdx = -1;
        let bestGain = 0;
        for (let i = 0; i < slots.length; i++) {
          const gain = estValue(slots[i]) - drawnVal;
          if (gain > bestGain) {
            bestGain = gain;
            bestIdx = i;
          }
        }

        // Multi-match: if two+ known equal highs and drawn is lower, dump them.
        const byVal = new Map<number, number[]>();
        for (let i = 0; i < slots.length; i++) {
          const v = slots[i]?.value;
          if (v == null) continue;
          const list = byVal.get(v) ?? [];
          list.push(i);
          byVal.set(v, list);
        }
        let multi: number[] | null = null;
        let multiGain = 0;
        for (const [v, idxs] of byVal) {
          if (idxs.length < 2) continue;
          if (v <= drawnVal) continue;
          const gain = (v - drawnVal) * idxs.length;
          if (gain > multiGain) {
            multiGain = gain;
            multi = idxs;
          }
        }

        if (multi && multiGain >= bestGain && multiGain > 0) {
          progress(`策略：多张换掉 ${multi.length} 张高牌`);
          return {
            action: {
              type: "swapWithDrawn",
              playerId: id,
              payload: { slotIndices: multi },
            } as Action,
          };
        }

        // Keep very low draws: always install 0–2 onto something worse / unknown.
        if (drawnVal <= 2 && bestIdx >= 0 && bestGain > 0) {
          progress(`策略：保留低牌 ${drawnVal}，换掉更高位`);
          return {
            action: {
              type: "swapWithDrawn",
              playerId: id,
              payload: { slotIndices: [bestIdx] },
            } as Action,
          };
        }

        // Never discard 0–3 — find any improvement, else put on highest slot.
        if (drawnVal <= 3) {
          const idx =
            bestIdx >= 0
              ? bestIdx
              : slots
                  .map((s, i) => ({ i, v: estValue(s) }))
                  .sort((a, b) => b.v - a.v)[0]?.i ?? 0;
          progress(`策略：绝不能弃掉 ${drawnVal}`);
          return {
            action: {
              type: "swapWithDrawn",
              playerId: id,
              payload: { slotIndices: [idx] },
            } as Action,
          };
        }

        // Clear improvement: swap onto a higher slot.
        if (bestIdx >= 0 && bestGain >= 2) {
          progress(`策略：用 ${drawnVal} 换掉估计 ${estValue(slots[bestIdx])}`);
          return {
            action: {
              type: "swapWithDrawn",
              playerId: id,
              payload: { slotIndices: [bestIdx] },
            } as Action,
          };
        }

        // High trash from deck: discard (+ ability if useful).
        if (canDiscard && drawnVal >= 7) {
          if (
            canAbility &&
            (drawnVal === 7 ||
              drawnVal === 8 ||
              drawnVal === 9 ||
              drawnVal === 10)
          ) {
            progress("策略：弃高牌并开能力");
            return {
              action: {
                type: "discardDrawn",
                playerId: id,
                payload: { useAbility: true },
              } as Action,
            };
          }
          if (drawnVal >= 9 || bestGain <= 0) {
            progress("策略：弃掉高牌");
            return {
              action: {
                type: "discardDrawn",
                playerId: id,
                payload: {},
              } as Action,
            };
          }
        }

        // Mild improvement or unknown: swap if any gain, else discard if allowed.
        if (bestIdx >= 0 && bestGain > 0) {
          progress("策略：小幅改善换牌");
          return {
            action: {
              type: "swapWithDrawn",
              playerId: id,
              payload: { slotIndices: [bestIdx] },
            } as Action,
          };
        }

        if (canDiscard) {
          progress("策略：摸到的牌不划算，弃掉");
          return {
            action: {
              type: "discardDrawn",
              playerId: id,
              payload: {},
            } as Action,
          };
        }

        // Discard-pile take must swap — put onto highest estimate.
        const forced =
          slots
            .map((s, i) => ({ i, v: estValue(s) }))
            .sort((a, b) => b.v - a.v)[0]?.i ?? 0;
        progress("策略：弃牌堆必须换上");
        return {
          action: {
            type: "swapWithDrawn",
            playerId: id,
            payload: { slotIndices: [forced] },
          } as Action,
        };
      }

      const estSum = slots.reduce((s, x) => s + estValue(x), 0);
      const callAct = legal.find((a) => a.type === "callCabo");
      // Call only with a strong low hand.
      if (callAct && estSum <= 6 && slots.every((s) => s.value != null || s.faceUp)) {
        progress("策略：手牌够低，呼唤 CABO");
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
        // Only take discard if it beats at least one known/estimated slot.
        const beats = slots.some((s) => estValue(s) > discardVal);
        if (beats) {
          progress("策略：拿弃牌堆低牌");
          return {
            action: {
              type: "drawDiscard",
              playerId: id,
              payload: {},
            } as Action,
          };
        }
      }

      if (legal.some((a) => a.type === "drawDeck")) {
        progress("策略：摸牌堆找低牌");
        return {
          action: {
            type: "drawDeck",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      if (callAct && estSum <= 10) {
        progress("策略：偏保守呼唤 CABO");
        return {
          action: {
            type: "callCabo",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      if (legal.some((a) => a.type === "drawDiscard")) {
        return {
          action: {
            type: "drawDiscard",
            playerId: id,
            payload: {},
          } as Action,
        };
      }

      throw new Error("no legal cabo action");
    },
  };
}
