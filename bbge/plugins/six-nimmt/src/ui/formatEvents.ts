import type { Event } from "@bbge/core";
import type { PlayLogEntry } from "@bbge/ui";

function nameOf(id: string, names?: Record<string, string>) {
  return names?.[id] ?? id;
}

export function formatNimmtEvents(
  events: Event[],
  locale: string,
  names?: Record<string, string>,
): PlayLogEntry[] {
  const zh = locale === "zh";
  const out: PlayLogEntry[] = [];
  const at = Date.now();

  for (const e of events) {
    const p = (e.payload ?? {}) as Record<string, unknown>;
    if (e.type === "sixNimmt/cardPlayed") {
      const id = p.playerId as string;
      out.push({
        id: `play-${id}-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: zh ? "出牌" : "Play",
        text: zh
          ? `${nameOf(id, names)} 锁定出牌`
          : `${nameOf(id, names)} locked a card`,
      });
    } else if (e.type === "sixNimmt/revealed") {
      out.push({
        id: `rev-${at}-${out.length}`,
        at,
        text: zh ? "翻开本轮出牌" : "Cards revealed",
        tone: "info",
      });
    } else if (e.type === "sixNimmt/placed") {
      const id = p.playerId as string;
      out.push({
        id: `place-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(id, names)} 将 ${p.value} 放入第 ${(p.rowIndex as number) + 1} 行`
          : `${nameOf(id, names)} places ${p.value} on row ${(p.rowIndex as number) + 1}`,
      });
    } else if (e.type === "sixNimmt/tookRow") {
      const id = p.playerId as string;
      const reason = p.reason as string;
      out.push({
        id: `take-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: zh ? `+${p.bullheads} 牛头` : `+${p.bullheads}`,
        text: zh
          ? `${nameOf(id, names)} 收走第 ${(p.rowIndex as number) + 1} 行（${reason === "sixth" ? "第6张" : "过小"}）· +${p.bullheads}`
          : `${nameOf(id, names)} takes row ${(p.rowIndex as number) + 1} (${reason}) · +${p.bullheads}`,
        tone: "warn",
      });
    } else if (e.type === "sixNimmt/needChooseRow") {
      const id = p.playerId as string;
      out.push({
        id: `need-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(id, names)} 需选择收哪一行`
          : `${nameOf(id, names)} must choose a row`,
        tone: "warn",
      });
    } else if (e.type === "sixNimmt/roundScored") {
      const id = p.playerId as string;
      out.push({
        id: `score-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(id, names)} 本轮 +${p.gained} → 总分 ${p.total}`
          : `${nameOf(id, names)} round +${p.gained} → ${p.total}`,
      });
    } else if (e.type === "sixNimmt/matchEnded") {
      const winners = (p.winners as string[]) ?? [];
      out.push({
        id: `end-${at}-${out.length}`,
        at,
        text: zh
          ? `对局结束 · 胜者 ${winners.map((id) => nameOf(id, names)).join("、")}`
          : `Match over · ${winners.map((id) => nameOf(id, names)).join(", ")}`,
        tone: "win",
      });
    } else if (e.type === "sixNimmt/roundDealt") {
      out.push({
        id: `deal-${at}-${out.length}`,
        at,
        text: zh ? `第 ${p.round} 轮发牌` : `Round ${p.round} dealt`,
        tone: "info",
      });
    } else if (e.type === "sixNimmt/draftStarted") {
      out.push({
        id: `draft-${at}-${out.length}`,
        at,
        text: zh ? "进阶选牌开始" : "Pro draft started",
        tone: "info",
      });
    } else if (e.type === "sixNimmt/draftPicked") {
      const id = p.playerId as string;
      out.push({
        id: `dp-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(id, names)} 选了 ${p.value}`
          : `${nameOf(id, names)} drafted ${p.value}`,
      });
    } else if (e.type === "sixNimmt/specialsOpen") {
      out.push({
        id: `sp-${at}-${out.length}`,
        at,
        text: zh ? "特殊牌阶段" : "Specials phase",
        tone: "info",
      });
    } else if (e.type === "sixNimmt/specialUsed") {
      out.push({
        id: `su-${at}-${out.length}`,
        at,
        text: zh
          ? `使用特殊牌：${p.kind}`
          : `Special used: ${p.kind}`,
        tone: "info",
      });
    } else if (e.type === "sixNimmt/resolveReady") {
      out.push({
        id: `rr-${at}-${out.length}`,
        at,
        text: zh
          ? `开始入行（${p.count} 张）`
          : `Placing ${p.count} cards`,
        tone: "info",
      });
    } else if (e.type === "sixNimmt/buffaloEnded") {
      out.push({
        id: `bf-${at}-${out.length}`,
        at,
        text: zh
          ? `水牛战结束 · 队伍 ${p.team} vs 水牛 ${p.buffalo} · ${p.won ? "胜利" : "失败"}`
          : `Buffalo done · team ${p.team} vs ${p.buffalo} · ${p.won ? "win" : "loss"}`,
        tone: p.won ? "win" : "warn",
      });
    }
  }
  return out;
}
