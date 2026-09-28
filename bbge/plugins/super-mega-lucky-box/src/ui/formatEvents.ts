import type { Event } from "@bbge/core";
import type { PlayLogEntry } from "@bbge/ui";

function nameOf(id: string, names?: Record<string, string>): string {
  return names?.[id] ?? id;
}

export function formatSmlbEvents(
  events: Event[],
  locale: string,
  names?: Record<string, string>,
): PlayLogEntry[] {
  const zh = locale === "zh";
  const at = Date.now();
  const result: PlayLogEntry[] = [];
  for (const event of events) {
    const payload = (event.payload ?? {}) as Record<string, unknown>;
    const playerId = String(payload.playerId ?? "");
    const who = nameOf(playerId, names);
    if (event.type === "smlb/numberRevealed") {
      result.push({
        id: "smlb-reveal-" + at + "-" + result.length,
        at,
        text: zh
          ? "第 " + payload.round + " 轮 · 翻出数字 " + payload.number
          : "Round " + payload.round + " · number " + payload.number + " revealed",
        tone: "info",
        bubble: String(payload.number),
      });
    } else if (event.type === "smlb/squareMarked") {
      const value = String(payload.value);
      const source = String(payload.source);
      result.push({
        id: "smlb-mark-" + at + "-" + result.length,
        at,
        text: zh
          ? who + " 划掉数字 " + value + (source === "numberBonus" ? "（数字奖励）" : source === "wild" ? "（问号奖励）" : "")
          : who + " crosses off " + value + (source === "numberBonus" ? " (number bonus)" : source === "wild" ? " (wild bonus)" : ""),
        speakerId: playerId || undefined,
        bubble: value,
      });
    } else if (event.type === "smlb/numberResolved") {
      const spent = Number(payload.lightningSpent ?? 0);
      if (spent > 0) {
        result.push({
          id: "smlb-lightning-" + at + "-" + result.length,
          at,
          text: zh
            ? who + " 花费 " + spent + " 个闪电调整为 " + payload.adjusted
            : who + " spends " + spent + " lightning to reach " + payload.adjusted,
        });
      }
    } else if (event.type === "smlb/numberSkipped") {
      result.push({
        id: "smlb-skip-" + at + "-" + result.length,
        at,
        text: zh
          ? who + " 没有可划的数字 " + payload.number
          : who + " has no open square for " + payload.number,
        tone: "info",
      });
    } else if (event.type === "smlb/lineCompleted") {
      const reward = payload.reward as { kind?: string; value?: number; count?: number };
      const label = reward?.kind === "none"
        ? null
        : reward?.kind === "number"
        ? String(reward.value)
        : reward?.kind === "lightning"
          ? (zh ? "闪电 ×" + reward.count : "Lightning ×" + reward.count)
          : reward?.kind === "wild"
            ? "?"
            : reward?.kind === "star"
              ? (zh ? "星星" : "Star")
              : (zh ? "月亮" : "Moon");
      result.push({
        id: "smlb-line-" + at + "-" + result.length,
        at,
        text: zh
          ? who + " 完成" + (payload.line === "row" ? "横行" : "竖列") + (label ? "，解锁 " + label : "")
          : who + " completes a " + payload.line + (label ? " and unlocks " + label : ""),
      });
    } else if (event.type === "smlb/bonusResolved") {
      const reward = payload.reward as { kind?: string };
      result.push({
        id: "smlb-bonus-" + at + "-" + result.length,
        at,
        text: zh
          ? who + " 结算奖励：" + (reward?.kind ?? "")
          : who + " resolves a " + (reward?.kind ?? "") + " bonus",
      });
    } else if (event.type === "smlb/roundScored") {
      result.push({
        id: "smlb-round-" + at + "-" + result.length,
        at,
        text: zh
          ? who + " 第 " + payload.round + " 轮得 " + payload.gained + " 分（累计 " + payload.total + "）"
          : who + " scores " + payload.gained + " in round " + payload.round + " (" + payload.total + " total)",
      });
    } else if (event.type === "smlb/roundStarted") {
      result.push({
        id: "smlb-next-" + at + "-" + result.length,
        at,
        text: zh ? "第 " + payload.round + " 轮开始" : "Round " + payload.round + " begins",
        tone: "info",
      });
    } else if (event.type === "smlb/gameFinished") {
      const winners = (payload.winners as string[]) ?? [];
      result.push({
        id: "smlb-end-" + at + "-" + result.length,
        at,
        text: zh
          ? "四轮结束 · " + winners.map((id) => nameOf(id, names)).join("、") + " 获胜"
          : "Four rounds complete · " + winners.map((id) => nameOf(id, names)).join(", ") + " win",
        tone: "win",
      });
    }
  }
  return result;
}
