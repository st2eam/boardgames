import type { PluginPlayModule } from "@bbge/ui";
import { createMockTrioSeat } from "./mockSeat";
import { trioPlugin } from "./plugin";
import { TrioTable } from "./ui/TrioTable";
import { formatTrioEvents } from "./ui/formatEvents";

export const trioPlayModule: PluginPlayModule = {
  id: "trio",
  plugin: trioPlugin as PluginPlayModule["plugin"],
  Table: TrioTable,
  formatEvents: formatTrioEvents,
  createMockSeat: createMockTrioSeat,
  roomIdPrefix: "trio",
};
