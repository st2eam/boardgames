import type { PluginPlayModule } from "@bbge/ui";
import { createMockGoSeat } from "@bbge/ai";
import { goPlugin } from "./plugin";
import { GoTable } from "./ui/GoTable";
import { formatGoEvents } from "./ui/formatEvents";

export const goPlayModule: PluginPlayModule = {
  id: "go",
  plugin: goPlugin as PluginPlayModule["plugin"],
  Table: GoTable,
  formatEvents: formatGoEvents,
  createMockSeat: createMockGoSeat,
  roomIdPrefix: "go",
};
