import type { Event } from "@bbge/core";

const RANK_ZH: Record<number, string> = {
  0: "间谍",
  1: "守卫",
  2: "神父",
  3: "男爵",
  4: "侍女",
  5: "王子",
  6: "大臣",
  7: "国王",
  8: "伯爵夫人",
  9: "公主",
};

const RANK_EN: Record<number, string> = {
  0: "Spy",
  1: "Guard",
  2: "Priest",
  3: "Baron",
  4: "Handmaid",
  5: "Prince",
  6: "Chancellor",
  7: "King",
  8: "Countess",
  9: "Princess",
};

export type PlayLogEntry = {
  id: string;
  at: number;
  text: string;
  tone?: "info" | "warn" | "win";
};

function rankName(rank: number, zh: boolean): string {
  return (zh ? RANK_ZH : RANK_EN)[rank] ?? String(rank);
}

function nameOf(
  id: string,
  names: Record<string, string> | undefined,
): string {
  return names?.[id] ?? id;
}

export function formatPlayEvents(
  events: Event[],
  locale: string,
  names?: Record<string, string>,
): PlayLogEntry[] {
  const zh = locale === "zh";
  const out: PlayLogEntry[] = [];
  const at = Date.now();

  for (let i = 0; i < events.length; i++) {
    const e = events[i]!;
    const p = (e.payload ?? {}) as Record<string, unknown>;
    let text: string | null = null;
    let tone: PlayLogEntry["tone"] = "info";

    switch (e.type) {
      case "loveLetter/cardDrawn":
        text = zh
          ? `${nameOf(String(p.playerId), names)} 抽了一张牌`
          : `${nameOf(String(p.playerId), names)} drew a card`;
        break;
      case "loveLetter/cardPlayed":
        text = zh
          ? `${nameOf(String(p.playerId), names)} 打出 ${rankName(Number(p.rank), true)}`
          : `${nameOf(String(p.playerId), names)} played ${rankName(Number(p.rank), false)}`;
        break;
      case "loveLetter/eliminated":
        text = zh
          ? `${nameOf(String(p.playerId), names)} 出局`
          : `${nameOf(String(p.playerId), names)} eliminated`;
        tone = "warn";
        break;
      case "loveLetter/protected":
        text = zh
          ? `${nameOf(String(p.playerId), names)} 获得侍女保护`
          : `${nameOf(String(p.playerId), names)} is protected`;
        break;
      case "loveLetter/guardGuess":
        text = zh
          ? `${nameOf(String(p.actorId), names)} 猜 ${nameOf(String(p.targetId), names)} 是 ${rankName(Number(p.guessRank), true)} → ${p.hit ? "命中" : "落空"}`
          : `${nameOf(String(p.actorId), names)} guessed ${nameOf(String(p.targetId), names)} = ${rankName(Number(p.guessRank), false)} → ${p.hit ? "hit" : "miss"}`;
        tone = p.hit ? "warn" : "info";
        break;
      case "loveLetter/priestPeek":
        text = zh
          ? `${nameOf(String(p.viewerId), names)} 偷看了 ${nameOf(String(p.targetId), names)} 的手牌（待确认）`
          : `${nameOf(String(p.viewerId), names)} peeked at ${nameOf(String(p.targetId), names)} (confirming)`;
        break;
      case "loveLetter/priestAcknowledged":
        text = zh
          ? `${nameOf(String(p.playerId), names)} 确认偷看结果`
          : `${nameOf(String(p.playerId), names)} acknowledged the peek`;
        break;
      case "loveLetter/baronCompare":
        text = zh
          ? `男爵比拼：${nameOf(String(p.a), names)}(${p.aRank}) vs ${nameOf(String(p.b), names)}(${p.bRank})`
          : `Baron: ${nameOf(String(p.a), names)}(${p.aRank}) vs ${nameOf(String(p.b), names)}(${p.bRank})`;
        break;
      case "loveLetter/forcedDiscard":
        text = zh
          ? `${nameOf(String(p.playerId), names)} 弃掉 ${rankName(Number(p.rank), true)}`
          : `${nameOf(String(p.playerId), names)} discarded ${rankName(Number(p.rank), false)}`;
        break;
      case "loveLetter/swapped":
        text = zh
          ? `${nameOf(String(p.a), names)} 与 ${nameOf(String(p.b), names)} 交换手牌`
          : `${nameOf(String(p.a), names)} swapped with ${nameOf(String(p.b), names)}`;
        break;
      case "loveLetter/chancellorPending":
        text = zh
          ? `${nameOf(String(p.playerId), names)} 发动大臣（选留 ${p.count} 张）`
          : `${nameOf(String(p.playerId), names)} Chancellor (${p.count} cards)`;
        break;
      case "loveLetter/chancellorResolved":
        text = zh
          ? `${nameOf(String(p.playerId), names)} 大臣结算完毕`
          : `${nameOf(String(p.playerId), names)} resolved Chancellor`;
        break;
      case "loveLetter/roundEnded":
      case "WinnerDeclared": {
        const winners = (p.winners as string[] | undefined) ?? [];
        text = zh
          ? `本局结束 · 胜者 ${winners.map((id) => nameOf(id, names)).join("、") || "—"}`
          : `Round over · ${winners.map((id) => nameOf(id, names)).join(", ") || "—"}`;
        tone = "win";
        break;
      }
      default:
        break;
    }

    if (text) {
      out.push({ id: `${e.type}-${at}-${i}`, at, text, tone });
    }
  }
  return out;
}
