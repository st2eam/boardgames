import type { PluginPlayModule } from "@bbge/ui";
import { createMockRummikubSeat } from "./mockSeat";
import { rummikubPlugin } from "./plugin";
import { RummikubTable } from "./ui/RummikubTable";
import { formatRummikubEvents } from "./ui/formatEvents";

export const rummikubPlayModule: PluginPlayModule = {
  id: "rummikub",
  plugin: rummikubPlugin as PluginPlayModule["plugin"],
  Table: RummikubTable,
  formatEvents: formatRummikubEvents,
  createMockSeat: createMockRummikubSeat,
  roomIdPrefix: "rummikub",
};
