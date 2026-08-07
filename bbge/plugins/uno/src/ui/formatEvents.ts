import type { Event } from "@bbge/core";
import type { PlayLogEntry } from "@bbge/ui";
import { faceLabel, type UnoFace } from "../cards";

function nameOf(id: string, names?: Record<string, string>): string {
  return names?.[id] ?? id;
}

export function formatUnoEvents(
  events: Event[],
  locale: string,
  names?: Record<string, string>,
): PlayLogEntry[] {
  const zh = locale === "zh";
  const out: PlayLogEntry[] = [];
  const at = Date.now();

  for (const e of events) {
    const p = e.payload as Record<string, unknown>;
    if (e.type === "card/played") {
      const face = p.face as UnoFace;
      const label = faceLabel(face, zh);
      const who = nameOf(String(p.playerId), names);
      out.push({
        id: `play-${at}-${out.length}`,
        at,
        text: zh ? `${who} 打出 ${label}` : `${who} plays ${label}`,
        speakerId: String(p.playerId),
        bubble: label,
      });
    } else if (e.type === "card/drew") {
      const who = nameOf(String(p.playerId), names);
      out.push({
        id: `draw-${at}-${out.length}`,
        at,
        text: zh ? `${who} 抽牌` : `${who} draws`,
        speakerId: String(p.playerId),
        bubble: zh ? "抽一张" : "Draw",
      });
    } else if (e.type === "cards/drawn") {
      const who = nameOf(String(p.playerId), names);
      out.push({
        id: `drawn-${at}-${out.length}`,
        at,
        text: zh
          ? `${who} 收下 ${p.count} 张`
          : `${who} draws ${p.count}`,
        speakerId: String(p.playerId),
      });
    } else if (e.type === "uno/called") {
      const who = nameOf(String(p.playerId), names);
      out.push({
        id: `uno-${at}-${out.length}`,
        at,
        text: zh ? `${who}：UNO！` : `${who}: UNO!`,
        speakerId: String(p.playerId),
        bubble: "UNO!",
        tone: "win",
      });
    } else if (e.type === "uno/caught") {
      out.push({
        id: `catch-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(String(p.by), names)} 抓住 ${nameOf(String(p.target), names)} 没喊 UNO（+${p.penalty}）`
          : `${nameOf(String(p.by), names)} catches ${nameOf(String(p.target), names)} (+${p.penalty})`,
        tone: "warn",
      });
    } else if (e.type === "board/flipped") {
      out.push({
        id: `flip-${at}-${out.length}`,
        at,
        text: zh
          ? `翻转到${p.side === "dark" ? "黑暗面" : "光明面"}`
          : `Flipped to ${p.side}`,
        tone: "warn",
      });
    } else if (e.type === "player/eliminated") {
      out.push({
        id: `mercy-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(String(p.playerId), names)} 被无情规则淘汰`
          : `${nameOf(String(p.playerId), names)} eliminated (mercy)`,
        tone: "warn",
      });
    } else if (e.type === "round/ended") {
      out.push({
        id: `end-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(String(p.winnerId), names)} 赢下本轮（+${p.gained}）`
          : `${nameOf(String(p.winnerId), names)} wins the round (+${p.gained})`,
        tone: "win",
      });
    } else if (e.type === "direction/reversed") {
      out.push({
        id: `rev-${at}-${out.length}`,
        at,
        text: zh ? "方向反转" : "Direction reversed",
      });
    } else if (e.type === "stack/added") {
      out.push({
        id: `stack-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(String(p.playerId), names)} 叠加至 ${p.amount}`
          : `${nameOf(String(p.playerId), names)} stacks to ${p.amount}`,
      });
    } else if (e.type === "hands/swapped" || e.type === "hands/rotated" || e.type === "hands/shuffled") {
      out.push({
        id: `hands-${at}-${out.length}`,
        at,
        text: zh ? "手牌发生交换/传递" : "Hands rearranged",
      });
    }
  }
  return out;
}
