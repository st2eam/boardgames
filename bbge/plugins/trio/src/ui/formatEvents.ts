import type { Event } from "@bbge/core";
import type { PlayLogEntry } from "@bbge/ui";

function nameOf(id: string, names?: Record<string, string>): string {
  return names?.[id] ?? id;
}

export function formatTrioEvents(
  events: Event[],
  locale: string,
  names?: Record<string, string>,
): PlayLogEntry[] {
  const zh = locale === "zh";
  const out: PlayLogEntry[] = [];
  const at = Date.now();

  for (const e of events) {
    const p = e.payload as Record<string, unknown>;
    if (e.type === "card/revealed") {
      const who = nameOf(String(p.playerId), names);
      const value = p.value;
      const src =
        p.source === "center"
          ? zh
            ? "中央"
            : "center"
          : zh
            ? `${nameOf(String(p.ownerId), names)}的${p.end === "low" ? "最小" : "最大"}`
            : `${nameOf(String(p.ownerId), names)}'s ${p.end}`;
      out.push({
        id: `rev-${at}-${out.length}`,
        at,
        text: zh
          ? `${who} 翻开 ${src} → ${value}`
          : `${who} reveals ${src} → ${value}`,
        speakerId: String(p.playerId),
        bubble: String(value),
      });
    } else if (e.type === "turn/bust") {
      out.push({
        id: `bust-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(String(p.playerId), names)} 爆了（${(p.values as number[]).join("·")}）`
          : `${nameOf(String(p.playerId), names)} busts (${(p.values as number[]).join("·")})`,
        tone: "warn",
        speakerId: String(p.playerId),
        bubble: zh ? "不对…" : "Bust",
      });
    } else if (e.type === "trio/collected") {
      out.push({
        id: `trio-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(String(p.playerId), names)} 收走三条 ${p.value}`
          : `${nameOf(String(p.playerId), names)} collects trio ${p.value}`,
        tone: "win",
        speakerId: String(p.playerId),
        bubble: zh ? `三条 ${p.value}！` : `Trio ${p.value}!`,
      });
    } else if (e.type === "match/ended") {
      out.push({
        id: `end-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(String(p.winnerId), names)} 获胜！`
          : `${nameOf(String(p.winnerId), names)} wins!`,
        tone: "win",
      });
    }
  }
  return out;
}
