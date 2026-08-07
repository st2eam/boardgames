import type { Event } from "@bbge/core";
import type { PlayLogEntry } from "@bbge/ui";

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

function rankName(rank: number, zh: boolean): string {
  return (zh ? RANK_ZH : RANK_EN)[rank] ?? String(rank);
}

function nameOf(
  id: string,
  names: Record<string, string> | undefined,
): string {
  return names?.[id] ?? id;
}

const ROLE_ZH: Record<string, string> = {
  spy: "间谍",
  guard: "守卫",
  priest: "神父",
  baron: "男爵",
  handmaid: "侍女",
  prince: "王子",
  chancellor: "大臣",
  king: "国王",
  countess: "伯爵夫人",
  princess: "公主",
};

const ROLE_EN: Record<string, string> = {
  spy: "Spy",
  guard: "Guard",
  priest: "Priest",
  baron: "Baron",
  handmaid: "Handmaid",
  prince: "Prince",
  chancellor: "Chancellor",
  king: "King",
  countess: "Countess",
  princess: "Princess",
};

function roleLabel(role: string | undefined, rank: number, zh: boolean): string {
  if (role && (zh ? ROLE_ZH : ROLE_EN)[role]) {
    return (zh ? ROLE_ZH : ROLE_EN)[role]!;
  }
  return rankName(rank, zh);
}

function playBubble(
  rank: number,
  zh: boolean,
  targetName?: string,
  guessRank?: number,
  role?: string,
): string {
  const r = role ?? "";
  const card = roleLabel(role, rank, zh);
  if (zh) {
    switch (r) {
      case "guard":
        return targetName != null && guessRank != null
          ? `打出守卫，我猜 ${targetName} 是「${rankName(guessRank, true)}」。`
          : `打出守卫。`;
      case "priest":
        return targetName
          ? `打出神父，偷看 ${targetName} 的手牌。`
          : `打出神父。`;
      case "baron":
        return targetName
          ? `打出男爵，与 ${targetName} 比拼。`
          : `打出男爵。`;
      case "handmaid":
        return `打出侍女，获得保护。`;
      case "prince":
        return targetName
          ? `打出王子，令 ${targetName} 弃牌。`
          : `打出王子。`;
      case "chancellor":
        return `打出大臣。`;
      case "king":
        return targetName
          ? `打出国王，与 ${targetName} 交换手牌。`
          : `打出国王。`;
      case "countess":
        return `打出伯爵夫人。`;
      case "princess":
        return `打出公主…我出局了。`;
      case "spy":
        return `打出间谍。`;
      default:
        return `打出${card}。`;
    }
  }
  switch (r) {
    case "guard":
      return targetName != null && guessRank != null
        ? `Played Guard — I guess ${targetName} is “${rankName(guessRank, false)}”.`
        : `Played Guard.`;
    case "priest":
      return targetName
        ? `Played Priest — peeking at ${targetName}.`
        : `Played Priest.`;
    case "baron":
      return targetName
        ? `Played Baron — comparing with ${targetName}.`
        : `Played Baron.`;
    case "handmaid":
      return `Played Handmaid — protected.`;
    case "prince":
      return targetName
        ? `Played Prince — ${targetName} discards.`
        : `Played Prince.`;
    case "chancellor":
      return `Played Chancellor.`;
    case "king":
      return targetName
        ? `Played King — swap with ${targetName}.`
        : `Played King.`;
    case "countess":
      return `Played Countess.`;
    case "princess":
      return `Played Princess… I’m out.`;
    case "spy":
      return `Played Spy.`;
    default:
      return `Played ${card}.`;
  }
}

export function formatLoveLetterEvents(
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
    let speakerId: string | undefined;
    let bubble: string | undefined;

    const next = events[i + 1];
    const nextP = (next?.payload ?? {}) as Record<string, unknown>;

    switch (e.type) {
      case "loveLetter/cardDrawn":
        text = zh
          ? `${nameOf(String(p.playerId), names)} 抽了一张牌`
          : `${nameOf(String(p.playerId), names)} drew a card`;
        break;
      case "loveLetter/cardPlayed": {
        const rank = Number(p.rank);
        const role = typeof p.role === "string" ? p.role : undefined;
        const playerId = String(p.playerId);
        text = zh
          ? `${nameOf(playerId, names)} 打出 ${roleLabel(role, rank, true)}`
          : `${nameOf(playerId, names)} played ${roleLabel(role, rank, false)}`;
        // Guard: bubble waits for the following guardGuess event
        if (
          (role === "guard" || (!role && rank === 1)) &&
          next?.type === "loveLetter/guardGuess"
        ) {
          break;
        }
        speakerId = playerId;
        let targetName: string | undefined;
        if (next?.type === "loveLetter/priestPeek") {
          targetName = nameOf(String(nextP.targetId), names);
        } else if (next?.type === "loveLetter/baronCompare") {
          const a = String(nextP.a);
          const b = String(nextP.b);
          targetName = nameOf(a === playerId ? b : a, names);
        } else if (next?.type === "loveLetter/forcedDiscard") {
          targetName = nameOf(String(nextP.playerId), names);
        } else if (next?.type === "loveLetter/swapped") {
          const a = String(nextP.a);
          const b = String(nextP.b);
          targetName = nameOf(a === playerId ? b : a, names);
        } else if (next?.type === "loveLetter/protected") {
          // handmaid — no target
        } else if (
          next?.type === "loveLetter/chancellorPending" ||
          next?.type === "loveLetter/chancellorResolved"
        ) {
          // chancellor
        }
        if (
          (role === "prince" || (!role && rank === 5)) &&
          next?.type === "loveLetter/forcedDiscard"
        ) {
          targetName = nameOf(String(nextP.playerId), names);
        }
        bubble = playBubble(rank, zh, targetName, undefined, role);
        break;
      }
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
      case "loveLetter/guardGuess": {
        const actorId = String(p.actorId);
        const targetId = String(p.targetId);
        const guess = Number(p.guessRank);
        text = zh
          ? `${nameOf(actorId, names)} 猜 ${nameOf(targetId, names)} 是 ${rankName(guess, true)} → ${p.hit ? "命中" : "落空"}`
          : `${nameOf(actorId, names)} guessed ${nameOf(targetId, names)} = ${rankName(guess, false)} → ${p.hit ? "hit" : "miss"}`;
        tone = p.hit ? "warn" : "info";
        speakerId = actorId;
        bubble = playBubble(1, zh, nameOf(targetId, names), guess, "guard");
        break;
      }
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
      case "loveLetter/baronCompare": {
        const loser = p.loserId != null ? String(p.loserId) : null;
        text = loser
          ? zh
            ? `男爵比拼：${nameOf(String(p.a), names)} vs ${nameOf(String(p.b), names)} → ${nameOf(loser, names)} 出局`
            : `Baron: ${nameOf(String(p.a), names)} vs ${nameOf(String(p.b), names)} → ${nameOf(loser, names)} out`
          : zh
            ? `男爵比拼：${nameOf(String(p.a), names)} vs ${nameOf(String(p.b), names)} → 平局`
            : `Baron: ${nameOf(String(p.a), names)} vs ${nameOf(String(p.b), names)} → tie`;
        break;
      }
      case "loveLetter/forcedDiscard":
        text = zh
          ? `${nameOf(String(p.playerId), names)} 弃掉 ${roleLabel(typeof p.role === "string" ? p.role : undefined, Number(p.rank), true)}`
          : `${nameOf(String(p.playerId), names)} discarded ${roleLabel(typeof p.role === "string" ? p.role : undefined, Number(p.rank), false)}`;
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
      case "loveLetter/roundEnded": {
        const winners = (p.winners as string[] | undefined) ?? [];
        const spyBonus = (p.spyBonus as string[] | undefined) ?? [];
        const reason = p.reason as string | undefined;
        const standings = (p.standings as
          | {
              playerId: string;
              eliminated: boolean;
              handRank: number | null;
              won: boolean;
              spyFavor: boolean;
            }[]
          | undefined) ?? [];
        const reasonZh =
          reason === "last_standing"
            ? "仅剩一人"
            : reason === "hand_compare"
              ? "牌堆耗尽 · 比点"
              : "本局结束";
        const reasonEn =
          reason === "last_standing"
            ? "last player standing"
            : reason === "hand_compare"
              ? "deck empty · compare hands"
              : "round over";
        const lines: string[] = [
          zh
            ? `${reasonZh} · 胜者 ${winners.map((id) => nameOf(id, names)).join("、") || "—"}`
            : `${reasonEn} · ${winners.map((id) => nameOf(id, names)).join(", ") || "—"}`,
        ];
        for (const s of standings) {
          if (s.eliminated) {
            lines.push(
              zh
                ? `· ${nameOf(s.playerId, names)}：已出局`
                : `· ${nameOf(s.playerId, names)}: out`,
            );
          } else {
            const card =
              s.handRank != null ? rankName(s.handRank, zh) : "?";
            const flags = [
              s.won ? (zh ? "胜" : "win") : null,
              s.spyFavor ? (zh ? "间谍好感" : "spy favor") : null,
            ]
              .filter(Boolean)
              .join(" · ");
            lines.push(
              zh
                ? `· ${nameOf(s.playerId, names)}：手牌 ${card}${flags ? `（${flags}）` : ""}`
                : `· ${nameOf(s.playerId, names)}: ${card}${flags ? ` (${flags})` : ""}`,
            );
          }
        }
        if (spyBonus.length && !standings.some((s) => s.spyFavor)) {
          lines.push(
            zh
              ? `间谍好感：${spyBonus.map((id) => nameOf(id, names)).join("、")}`
              : `Spy favor: ${spyBonus.map((id) => nameOf(id, names)).join(", ")}`,
          );
        }
        text = lines.join("\n");
        tone = "win";
        break;
      }
      case "WinnerDeclared":
        // Detail already logged on loveLetter/roundEnded
        break;
      default:
        break;
    }

    if (text) {
      out.push({
        id: `${e.type}-${at}-${i}`,
        at,
        text,
        tone,
        speakerId,
        bubble,
      });
    }
  }
  return out;
}
