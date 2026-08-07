import type { PluginPlayModule } from "@bbge/ui";
import { createMockSixNimmtSeat } from "@bbge/ai";
import { sixNimmtPlugin } from "./plugin";
import { SixNimmtTable } from "./ui/SixNimmtTable";
import { formatNimmtEvents } from "./ui/formatEvents";

export const sixNimmtPlayModule: PluginPlayModule = {
  id: "six-nimmt",
  plugin: sixNimmtPlugin as PluginPlayModule["plugin"],
  Table: SixNimmtTable,
  formatEvents: formatNimmtEvents,
  createMockSeat: createMockSixNimmtSeat,
  roomIdPrefix: "sn",
};
