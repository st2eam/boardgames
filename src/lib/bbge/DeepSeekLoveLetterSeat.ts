import type { PlayerId } from "@bbge/core";
import {
  parseLoveLetterAiContent,
  type AiDecision,
  type AiSeat,
  type AiThinkOptions,
} from "@bbge/ai";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";
import { battleLogPromptBlock } from "@/lib/bbge/aiBattleLog";

/** Fast model for tabletop Actions — chat site assistant may still use pro. */
const PLAY_MODEL = "deepseek-v4-flash";

function playsPrincessVoluntarily(
  view: unknown,
  action: { type: string; payload?: unknown },
): boolean {
  if (action.type !== "playCard") return false;
  const hand =
    (view as { you?: { hand?: { id: string; role?: string; rank?: number }[] } })
      .you?.hand ?? [];
  if (hand.length <= 1) return false;
  const cardId = (action.payload as { cardId?: string } | undefined)?.cardId;
  const card = hand.find((c) => c.id === cardId);
  if (!card) return false;
  if (card.role === "princess") return true;
  // Views without role: classic princess=8, full/expansion=9 and unique max
  const ranks = hand.map((c) => c.rank ?? 0);
  const max = Math.max(...ranks);
  const princessRank = ranks.includes(9) ? 9 : ranks.includes(8) ? 8 : -1;
  return (
    card.rank === princessRank &&
    card.rank === max &&
    hand.filter((c) => c.rank === princessRank).length === 1
  );
}

/**
 * Host AiSeat: LLM decides legal play Actions + optional table talk (`speak`).
 * `locale` controls speak language (default Chinese).
 */
export function createDeepSeekLoveLetterSeat(
  id: PlayerId,
  apiKey: string,
  locale = "zh",
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  const zh = locale !== "en";
  return {
    id,
    async think(view: unknown, opts?: AiThinkOptions): Promise<AiDecision> {
      const retry = opts?.illegalRetry;
      const retryBlock = retry
        ? zh
          ? `\n\n重要——上一动作非法，已被拒绝。\n错误：${retry.error}\n被拒动作：\n${JSON.stringify(retry.rejectedAction)}\n请修正并返回另一个合法动作，不要重复非法操作。`
          : `\n\nIMPORTANT — your previous action was REJECTED as illegal.\nError: ${retry.error}\nRejected action JSON:\n${JSON.stringify(retry.rejectedAction)}\nFix the mistake and return a DIFFERENT legal action for the same view. Do not repeat the illegal move.`
        : "";

      const speakRule = zh
        ? `speak 用简体中文短句（牌桌闲话，约 6–20 字），尽量带。不要用英文术语；牌名可用中文（守卫、神父、男爵、侍女、王子、国王、伯爵夫人、公主等）。`
        : `Optional speak: short natural English table talk.`;
      const logBlock = battleLogPromptBlock(opts?.battleLog, zh);

      const prompt = zh
        ? `你是座位 ${id}，在玩《情书》——像会推理、会抓时机的真人，而不是随机机器人。
版本：经典(1–8) | 完整(间谍…公主=9 + 宰相) | 扩展(完整 + 主教等；看 card.role)。
选一个合法动作。守卫/主教猜的点数不能是 1。

策略：
- 除非手里只剩公主，否则绝不打出公主。
- 留高位牌（国王/伯爵夫人/王子/公主）；用守卫/神父探信息；侍女保护强牌。
- 守卫/主教：结合 you.seen、弃牌堆与战报里每人出牌/猜牌记录，猜仍在场的高牌（先公主/国王/王子）。
- 男爵/女男爵：只在自己更可能更大时对决，否则先收集信息。
- 王子：后期逼出高威胁；国王：偷已知强牌。
- 宰相：留下更高的那张。
- 牌库将尽时收紧；前期可偷看布局。

只输出 JSON。${speakRule}
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","targetId":"...?","targetIds":["..."]?,"guessRank":number?,"peekTargetId":"...?"},"speak":"中文短句"}
或 chancellor / acknowledgePriest（bishopRedraw 可含 "redraw":true|false）。
View JSON:\n${JSON.stringify(view)}${logBlock}${retryBlock}`
        : `You are seat ${id} in Love Letter — play like a sharp, human table player (deduction + timing), not a random bot.
Editions: classic (1–8) | full (Spy…Princess=9 + Chancellor) | expansion (full + Bishop etc; use card.role).
Choose ONE legal action. Guard/Bishop guess ≠1.

Strategy:
- NEVER play Princess unless it is your ONLY card.
- Keep high power (King/Countess/Prince/Princess); spend Guards/Priests for info; Handmaid to protect a strong hold.
- Guard/Bishop: use you.seen, discards, and the battle log of plays/guesses; guess ranks still in play (Princess/King/Prince first).
- Baron/Baroness: only challenge when you are likely higher; otherwise gather info.
- Prince: force out likely high threats late; King: steal strong known hands.
- Chancellor: keep the highest held card.
- Late deck: tighten; early: peek and set up.

Return ONLY JSON. ${speakRule}
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","targetId":"...?","targetIds":["..."]?,"guessRank":number?,"peekTargetId":"...?"},"speak":"..."}
or chancellor / acknowledgePriest (bishopRedraw may include "redraw":true|false).
View JSON:\n${JSON.stringify(view)}${logBlock}${retryBlock}`;

      let lastErr = "ai failed";
      for (let attempt = 0; attempt < 3; attempt++) {
        opts?.onProgress?.({
          note: `deepseek-v4-flash · 第 ${attempt + 1}/3 次请求`,
        });
        try {
          let text = "";
          let thinking = "";
          // V4 thinking is on by default and counts against max_tokens — a 512
          // budget often finishes with empty content (finishReason: max_tokens).
          // Play seats need a reliable JSON Action, so disable thinking here.
          const result = await adapter.streamChat(
            {
              model: PLAY_MODEL,
              thinking: { type: "disabled" },
              system: zh
                ? "你是聪明的《情书》真人对手：会推理弃牌/偷看信息，保护高牌，绝不主动打出公主（除非只剩一张）。只输出合法 Action JSON；speak 用简体中文短句。"
                : "You are a clever Love Letter player. Output JSON only: one legal action (+ optional speak). Deduce from discards/seen; protect power cards; never volunteer Princess unless it is your only card.",
              messages: [{ role: "user", content: prompt }],
              maxTokens: 1024,
            },
            (chunk) => {
              if (
                chunk.activity?.kind === "thinking" &&
                chunk.activity.thinkingText
              ) {
                thinking = chunk.activity.thinkingText;
                opts?.onProgress?.({
                  note: "模型推理中…",
                  thinkingText: thinking,
                  draftText: text || undefined,
                });
              }
              if (chunk.content) {
                text += chunk.content;
                opts?.onProgress?.({
                  note: thinking ? "模型推理中… · 写出动作" : "正在生成出牌 JSON…",
                  thinkingText: thinking || undefined,
                  draftText: text,
                });
              }
            },
          );
          const thinkingFinal =
            result.thinking?.thinking?.trim() || thinking || "";
          let parsed: AiDecision | null = null;
          let parseError: string | null = null;
          try {
            parsed = parseLoveLetterAiContent(text, id);
          } catch (pe) {
            parseError = pe instanceof Error ? pe.message : "json parse failed";
          }

          console.groupCollapsed(
            `[BBGE AI] seat=${id} attempt=${attempt + 1}/3 model=${PLAY_MODEL}`,
          );
          console.log("finishReason:", result.finishReason);
          console.log("thinking:\n", thinkingFinal || "(empty)");
          console.log("content:\n", text || "(empty)");
          console.log("toolCalls:", result.toolCalls ?? null);
          console.log("parsedAction:", parsed?.action ?? null);
          console.log("parsedSpeak:", parsed?.speak ?? null);
          if (parseError) console.warn("parseError:", parseError);
          console.groupEnd();

          if (parsed) {
            if (playsPrincessVoluntarily(view, parsed.action)) {
              lastErr = "refused voluntary Princess";
              opts?.onProgress?.({
                note: "拒绝主动打出公主，重试…",
                thinkingText: thinkingFinal || undefined,
                draftText: text,
              });
              continue;
            }
            opts?.onProgress?.({
              note: `已决定：${String(parsed.action.type)}${parsed.speak ? " · speak" : ""}`,
              thinkingText: thinkingFinal || undefined,
              draftText: text,
            });
            return parsed;
          }
          lastErr = parseError ?? "bad action shape";
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "ai error";
          console.groupCollapsed(
            `[BBGE AI] seat=${id} attempt=${attempt + 1}/3 FAILED`,
          );
          console.error(e);
          console.groupEnd();
          opts?.onProgress?.({ note: `失败：${lastErr}` });
        }
      }
      throw new Error(lastErr);
    },
  };
}
