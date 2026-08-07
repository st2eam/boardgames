import type { Action, PlayerId } from "@bbge/core";
import type { PluginPlayModule } from "@bbge/ui";
import { createMockUnoSeat } from "./mockSeat";
import { unoPlugin } from "./plugin";
import { UnoTable } from "./ui/UnoTable";
import { formatUnoEvents } from "./ui/formatEvents";

function tryAutoAiAction(view: unknown, playerId: PlayerId): Action | null {
  const v = view as {
    pending?: { type?: string; playerId?: string };
    legal?: { type: string; payload?: Record<string, unknown> }[];
  };
  // Auto-pick most common color is handled by mock/LLM — no forced ack.
  void playerId;
  void v;
  return null;
}

export const unoPlayModule: PluginPlayModule = {
  id: "uno",
  plugin: unoPlugin as PluginPlayModule["plugin"],
  Table: UnoTable,
  formatEvents: formatUnoEvents,
  createMockSeat: createMockUnoSeat,
  tryAutoAiAction,
  roomIdPrefix: "uno",
};
