import type { PluginPlayModule } from "@bbge/ui";
import { texasHoldemPlugin } from "./plugin";
import { createAggressiveHoldemSeat } from "./mockSeat";
import { TexasHoldemTable } from "./ui/TexasHoldemTable";
import { formatHoldemEvents } from "./ui/formatEvents";

export const texasHoldemPlayModule: PluginPlayModule = {
  id: "texas-holdem",
  plugin: texasHoldemPlugin as PluginPlayModule["plugin"],
  Table: TexasHoldemTable,
  formatEvents: formatHoldemEvents,
  createMockSeat: createAggressiveHoldemSeat,
  roomIdPrefix: "th",
};
