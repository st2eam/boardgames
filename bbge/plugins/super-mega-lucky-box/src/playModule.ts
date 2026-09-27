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
    zh: "在线版使用 60 张原创幸运盒牌面，便于网页游玩；牌面不是实体盒子的复刻。",
    en: "Online play uses 60 original Lucky Box card faces for the browser; these are not reproductions of the physical deck.",
  },
  formatEvents: formatSmlbEvents,
  createMockSeat: createMockSmlbSeat,
  tryAutoAdvance,
  roomIdPrefix: "smlb",
};
