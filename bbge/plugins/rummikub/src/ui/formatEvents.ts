import type { Event } from "@bbge/core";
import type { PlayLogEntry } from "@bbge/ui";

function nameOf(id: string, names?: Record<string, string>): string {
  return names?.[id] ?? id;
}

export function formatRummikubEvents(
  events: Event[],
  locale: string,
  names?: Record<string, string>,
): PlayLogEntry[] {
  const zh = locale === "zh";
  const out: PlayLogEntry[] = [];
  const at = Date.now();

  for (const e of events) {
    const p = e.payload as Record<string, unknown>;
    if (e.type === "rummikub/drew") {
      out.push({
        id: `drew-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(String(p.playerId), names)} 抽了 ${p.count} 张牌`
          : `${nameOf(String(p.playerId), names)} drew ${p.count}`,
        speakerId: String(p.playerId),
        bubble: zh ? "抽牌" : "Draw",
      });
    } else if (e.type === "turn/passed") {
      out.push({
        id: `pass-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(String(p.playerId), names)} 结束回合`
          : `${nameOf(String(p.playerId), names)} passes`,
        speakerId: String(p.playerId),
      });
    } else if (e.type === "rummikub/played") {
      const pts = p.points;
      out.push({
        id: `played-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(String(p.playerId), names)} 打出 ${p.tileCount} 张（${pts} 分）`
          : `${nameOf(String(p.playerId), names)} melds ${p.tileCount} tiles (${pts} pts)`,
        tone: "info",
        speakerId: String(p.playerId),
        bubble: zh ? `+${pts} 分` : `+${pts}`,
      });
    } else if (e.type === "rummikub/emptyRack") {
      out.push({
        id: `end-${at}-${out.length}`,
        at,
        text: zh
          ? `Rummikub！${nameOf(String(p.winnerId), names)} 出空牌架获胜！`
          : `Rummikub! ${nameOf(String(p.winnerId), names)} clears their rack!`,
        tone: "win",
        speakerId: String(p.winnerId),
        bubble: zh ? "Rummikub！" : "Rummikub!",
      });
    } else if (e.type === "rummikub/depleted") {
      out.push({
        id: `depleted-${at}-${out.length}`,
        at,
        text: zh
          ? `牌堆耗尽，${nameOf(String(p.winnerId), names)} 点数最低获胜！`
          : `Pool empty, ${nameOf(String(p.winnerId), names)} wins on lowest total!`,
        tone: "win",
        speakerId: String(p.winnerId),
      });
    } else if (e.type === "match/restarted") {
      out.push({
        id: `restart-${at}-${out.length}`,
        at,
        text: zh ? "新的一轮" : "New round",
        tone: "info",
      });
    }
  }
  return out;
}
