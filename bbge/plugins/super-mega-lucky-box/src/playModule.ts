import type { Action } from "@bbge/core";
import type { PluginPlayModule } from "@bbge/ui";
import { createMockSmlbSeat } from "./mockSeat";
import { superMegaLuckyBoxPlugin } from "./plugin";
import { SmlbTable } from "./ui/SmlbTable";
import { formatSmlbEvents } from "./ui/formatEvents";

function tryAutoAdvance(view: unknown): Action | null {
  const v = view as { phase?: string; advanceKind?: string | null };
  if (v.phase !== "advancing" || !v.advanceKind) return null;
  return { type: "advance", playerId: "", payload: {} };
}

export const superMegaLuckyBoxPlayModule: PluginPlayModule = {
  id: "super-mega-lucky-box",
  plugin: superMegaLuckyBoxPlugin as PluginPlayModule["plugin"],
  Table: SmlbTable,
  lobbyNotice: {
    zh: "使用按实体版编号录入的 60 张固定盒子牌；每局只随机洗牌，不随机生成牌面。",
    en: "Uses 60 fixed Lucky Box faces transcribed by physical card number. Only the deck order is shuffled.",
  },
  formatEvents: formatSmlbEvents,
  createMockSeat: createMockSmlbSeat,
  tryAutoAdvance,
  roomIdPrefix: "smlb",
};
