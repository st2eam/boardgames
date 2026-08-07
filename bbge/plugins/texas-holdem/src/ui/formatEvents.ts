import type { Event } from "@bbge/core";
import type { PlayLogEntry } from "@bbge/ui";

function nameOf(
  id: string,
  names?: Record<string, string>,
): string {
  return names?.[id] ?? id;
}

export function formatHoldemEvents(
  events: Event[],
  locale: string,
  names?: Record<string, string>,
): PlayLogEntry[] {
  const zh = locale === "zh";
  const out: PlayLogEntry[] = [];
  const at = Date.now();

  for (const e of events) {
    const p = e.payload as Record<string, unknown>;
    if (e.type === "holdem/fold") {
      const id = p.playerId as string;
      out.push({
        id: `fold-${id}-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: zh ? "弃牌" : "I fold",
        text: zh
          ? `${nameOf(id, names)} 弃牌`
          : `${nameOf(id, names)} folds`,
      });
    } else if (e.type === "holdem/check") {
      const id = p.playerId as string;
      out.push({
        id: `check-${id}-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: zh ? "过牌" : "Check",
        text: zh
          ? `${nameOf(id, names)} 过牌`
          : `${nameOf(id, names)} checks`,
      });
    } else if (e.type === "holdem/call") {
      const id = p.playerId as string;
      const allIn = Boolean(p.allIn);
      const amount = p.amount as number;
      out.push({
        id: `call-${id}-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: allIn
          ? zh
            ? "全下"
            : "All-in"
          : zh
            ? "跟注"
            : "Call",
        text: zh
          ? `${nameOf(id, names)} ${allIn ? "全下" : "跟注"} ${amount}`
          : `${nameOf(id, names)} ${allIn ? "all-in" : "calls"} ${amount}`,
      });
    } else if (e.type === "holdem/raise") {
      const id = p.playerId as string;
      const to = p.toAmount as number;
      const allIn = Boolean(p.allIn);
      out.push({
        id: `raise-${id}-${at}-${out.length}`,
        at,
        speakerId: id,
        bubble: allIn
          ? zh
            ? `全下 ${to}`
            : `All-in ${to}`
          : zh
            ? `加注至 ${to}`
            : `Raise to ${to}`,
        text: zh
          ? `${nameOf(id, names)} ${allIn ? "全下" : "加注至"} ${to}`
          : `${nameOf(id, names)} ${allIn ? "all-in" : "raises to"} ${to}`,
      });
    } else if (e.type === "holdem/boardDealt") {
      const street = p.street as string;
      out.push({
        id: `board-${street}-${at}-${out.length}`,
        at,
        text: zh
          ? `发公共牌 · ${street}`
          : `Board dealt · ${street}`,
        tone: "info",
      });
    } else if (e.type === "holdem/handEnded") {
      const winners = (p.winners as string[]) ?? [];
      out.push({
        id: `end-${at}-${out.length}`,
        at,
        text: zh
          ? `本手结束 · 胜者 ${winners.map((id) => nameOf(id, names)).join("、")}`
          : `Hand over · ${winners.map((id) => nameOf(id, names)).join(", ")}`,
        tone: "win",
      });
    }
  }
  return out;
}
