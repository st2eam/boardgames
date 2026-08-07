import type { PluginPlayModule } from "@bbge/ui";
import { goPlugin } from "./plugin";
import { createStrategicGoSeat } from "./mockSeat";
import { GoTable } from "./ui/GoTable";
import { formatGoEvents } from "./ui/formatEvents";

export const goPlayModule: PluginPlayModule = {
  id: "go",
  plugin: goPlugin as PluginPlayModule["plugin"],
  Table: GoTable,
  formatEvents: formatGoEvents,
  createMockSeat: createStrategicGoSeat,
  roomIdPrefix: "go",
};
