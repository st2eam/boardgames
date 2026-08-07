import type { Action, PlayerId } from "@bbge/core";
import type { PluginPlayModule } from "@bbge/ui";
import { createMockLoveLetterSeat } from "@bbge/ai";
import { loveLetterPlugin } from "./plugin";
import { LoveLetterTable } from "./ui/LoveLetterTable";
import { formatLoveLetterEvents } from "./ui/formatEvents";

function tryAutoAiAction(view: unknown, playerId: PlayerId): Action | null {
  const v = view as {
    pending?: { type?: string; playerId?: string };
  };
  if (v.pending?.playerId !== playerId) return null;
  if (
    v.pending.type === "priestReveal" ||
    v.pending.type === "baronessReveal"
  ) {
    return { type: "acknowledgePriest", playerId, payload: {} };
  }
  if (v.pending.type === "bishopRedraw") {
    // Keep hand by default (redraw is optional)
    return {
      type: "acknowledgePriest",
      playerId,
      payload: { redraw: false },
    };
  }
  return null;
}

/** Registerable play package for Love Letter (Full Game). */
export const loveLetterPlayModule: PluginPlayModule = {
  id: "love-letter",
  plugin: loveLetterPlugin as PluginPlayModule["plugin"],
  Table: LoveLetterTable,
  formatEvents: formatLoveLetterEvents,
  createMockSeat: createMockLoveLetterSeat,
  tryAutoAiAction,
  roomIdPrefix: "ll",
};
