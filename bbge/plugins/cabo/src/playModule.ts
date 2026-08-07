import type { Action, PlayerId } from "@bbge/core";
import type { PluginPlayModule } from "@bbge/ui";
import { createMockCaboSeat } from "./mockSeat";
import { caboPlugin } from "./plugin";
import { CaboTable } from "./ui/CaboTable";
import { formatCaboEvents } from "./ui/formatEvents";

function tryAutoAiAction(view: unknown, playerId: PlayerId): Action | null {
  const v = view as {
    pendingModal?: { type?: string; value?: number };
  };
  if (v.pendingModal && typeof v.pendingModal.value === "number") {
    return { type: "acknowledgeModal", playerId, payload: {} };
  }
  return null;
}

export const caboPlayModule: PluginPlayModule = {
  id: "cabo",
  plugin: caboPlugin as PluginPlayModule["plugin"],
  Table: CaboTable,
  formatEvents: formatCaboEvents,
  createMockSeat: createMockCaboSeat,
  tryAutoAiAction,
  roomIdPrefix: "cb",
};
