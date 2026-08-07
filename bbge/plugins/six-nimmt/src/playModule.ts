import type { Action } from "@bbge/core";
import type { PluginPlayModule } from "@bbge/ui";
import { createMockSixNimmtSeat } from "@bbge/ai";
import { sixNimmtPlugin } from "./plugin";
import { SixNimmtTable } from "./ui/SixNimmtTable";
import { formatNimmtEvents } from "./ui/formatEvents";

/** Host paces one placement beat during resolving. */
function tryAutoAdvance(view: unknown): Action | null {
  const v = view as { phase?: string };
  if (v.phase !== "resolving") return null;
  return { type: "resolveStep", playerId: "", payload: {} };
}

export const sixNimmtPlayModule: PluginPlayModule = {
  id: "six-nimmt",
  plugin: sixNimmtPlugin as PluginPlayModule["plugin"],
  Table: SixNimmtTable,
  formatEvents: formatNimmtEvents,
  createMockSeat: createMockSixNimmtSeat,
  tryAutoAdvance,
  roomIdPrefix: "sn",
};
