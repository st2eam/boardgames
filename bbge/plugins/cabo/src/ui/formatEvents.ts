import type { Event } from "@bbge/core";
import type { PlayLogEntry } from "@bbge/ui";

function nameOf(id: string, names?: Record<string, string>) {
  return names?.[id] ?? id;
}

export function formatCaboEvents(
  events: Event[],
  locale: string,
  names?: Record<string, string>,
): PlayLogEntry[] {
  const zh = locale === "zh";
  const out: PlayLogEntry[] = [];
  const at = Date.now();

  for (const e of events) {
    const p = (e.payload ?? {}) as Record<string, unknown>;
    if (e.type === "cabo/setupPeeked") {
      const id = p.playerId as string;
      out.push({
        id: `peek-${id}-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(id, names)} 完成开局偷看`
          : `${nameOf(id, names)} finished setup peek`,
      });
    } else if (e.type === "cabo/roundStarted") {
      out.push({
        id: `rs-${at}-${out.length}`,
        at,
        text: zh ? `第 ${p.round} 轮开始` : `Round ${p.round} started`,
        tone: "info",
      });
    } else if (e.type === "cabo/drewDeck") {
      const id = p.playerId as string;
      out.push({
        id: `dd-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: zh ? "摸牌" : "Draw",
        text: zh
          ? `${nameOf(id, names)} 从牌堆摸牌`
          : `${nameOf(id, names)} drew from deck`,
      });
    } else if (e.type === "cabo/drewDiscard") {
      const id = p.playerId as string;
      out.push({
        id: `dc-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: zh ? "拿弃牌" : "Take discard",
        text: zh
          ? `${nameOf(id, names)} 拿弃牌堆顶 (${p.value})`
          : `${nameOf(id, names)} took discard (${p.value})`,
      });
    } else if (e.type === "cabo/discarded") {
      const id = p.playerId as string;
      out.push({
        id: `dis-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: zh ? `弃 ${p.value}` : `Discard ${p.value}`,
        text: zh
          ? `${nameOf(id, names)} 弃掉 ${p.value}`
          : `${nameOf(id, names)} discarded ${p.value}`,
      });
    } else if (e.type === "cabo/swapped") {
      const id = p.playerId as string;
      const ok = p.success as boolean;
      out.push({
        id: `sw-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: zh ? (ok ? "交换成功" : "交换失败") : ok ? "Swap ok" : "Swap fail",
        text: ok
          ? zh
            ? `${nameOf(id, names)} 交换成功`
            : `${nameOf(id, names)} swapped successfully`
          : zh
            ? `${nameOf(id, names)} 多张交换失败`
            : `${nameOf(id, names)} multi-swap failed`,
        tone: ok ? undefined : "warn",
      });
    } else if (e.type === "cabo/called") {
      const id = p.playerId as string;
      out.push({
        id: `cab-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: "CABO!",
        text: zh
          ? `${nameOf(id, names)} 呼唤 CABO`
          : `${nameOf(id, names)} called CABO`,
        tone: "info",
      });
    } else if (e.type === "cabo/peeked" || e.type === "cabo/spied") {
      const id = p.playerId as string;
      out.push({
        id: `abl-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: zh ? "偷看" : "Peek",
        text: zh
          ? `${nameOf(id, names)} 使用偷看能力`
          : `${nameOf(id, names)} used peek/spy`,
      });
    } else if (e.type === "cabo/blindSwapped") {
      const id = p.playerId as string;
      out.push({
        id: `bs-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: zh ? "盲换" : "Swap",
        text: zh
          ? `${nameOf(id, names)} 盲换对手一张牌`
          : `${nameOf(id, names)} blind swapped`,
      });
    } else if (e.type === "cabo/roundScored") {
      const id = p.playerId as string;
      out.push({
        id: `sc-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(id, names)} 本轮 ${p.round} → 累计 ${p.cumulative}`
          : `${nameOf(id, names)} round ${p.round} → total ${p.cumulative}`,
      });
    } else if (e.type === "cabo/scoreReset") {
      const id = p.playerId as string;
      out.push({
        id: `rst-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(id, names)} 恰好 100 分，重置为 ${p.to}`
          : `${nameOf(id, names)} hit 100 — reset to ${p.to}`,
        tone: "info",
      });
    } else if (e.type === "cabo/matchEnded") {
      const winners = (p.winners as string[]) ?? [];
      out.push({
        id: `me-${at}-${out.length}`,
        at,
        text: zh
          ? `对局结束 · 胜者 ${winners.map((w) => nameOf(w, names)).join("、")}`
          : `Match over · ${winners.map((w) => nameOf(w, names)).join(", ")} wins`,
        tone: "info",
      });
    } else if (e.type === "cabo/roundEnded") {
      out.push({
        id: `re-${at}-${out.length}`,
        at,
        text: zh ? "本轮结束" : "Round ended",
        tone: "info",
      });
    } else if (e.type === "cabo/deckEmpty") {
      out.push({
        id: `de-${at}-${out.length}`,
        at,
        text: zh ? "牌堆已空" : "Draw pile empty",
        tone: "warn",
      });
    }
  }

  return out;
}
