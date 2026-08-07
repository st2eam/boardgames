import type { PluginPlayModule } from "@bbge/ui";
import { createMockTexasHoldemSeat } from "@bbge/ai";
import { texasHoldemPlugin } from "./plugin";
import { TexasHoldemTable } from "./ui/TexasHoldemTable";
import { formatHoldemEvents } from "./ui/formatEvents";

export const texasHoldemPlayModule: PluginPlayModule = {
  id: "texas-holdem",
  plugin: texasHoldemPlugin as PluginPlayModule["plugin"],
  Table: TexasHoldemTable,
  formatEvents: formatHoldemEvents,
  createMockSeat: createMockTexasHoldemSeat,
  roomIdPrefix: "th",
};
