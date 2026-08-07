import type { PlayerId } from "@bbge/core";
import {
  parseLoveLetterAiContent,
  type AiDecision,
  type AiSeat,
  type AiThinkOptions,
} from "@bbge/ai";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";

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
 * Streams draft via onProgress for Host hover UI.
 */
export function createDeepSeekLoveLetterSeat(
  id: PlayerId,
  apiKey: string,
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  return {
    id,
    async think(view: unknown, opts?: AiThinkOptions): Promise<AiDecision> {
      const retry = opts?.illegalRetry;
      const retryBlock = retry
        ? `\n\nIMPORTANT — your previous action was REJECTED as illegal.\nError: ${retry.error}\nRejected action JSON:\n${JSON.stringify(retry.rejectedAction)}\nFix the mistake and return a DIFFERENT legal action for the same view. Do not repeat the illegal move.`
        : "";
      const prompt = `You are seat ${id} in Love Letter — play like a sharp, human table player (deduction + timing), not a random bot.
Editions: classic (1–8) | full (Spy…Princess=9 + Chancellor) | expansion (full + Bishop etc; use card.role).
Choose ONE legal action. Guard/Bishop guess ≠1.

Strategy:
- NEVER play Princess unless it is your ONLY card.
- Keep high power (King/Countess/Prince/Princess); spend Guards/Priests for info; Handmaid to protect a strong hold.
- Guard/Bishop: use you.seen and discarded piles; guess ranks still in play (Princess/King/Prince first).
- Baron/Baroness: only challenge when you are likely higher; otherwise gather info.
- Prince: force out likely high threats late; King: steal strong known hands.
- Chancellor: keep the highest held card.
- Late deck: tighten; early: peek and set up.

Return ONLY JSON. Optional speak (short table talk):
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","targetId":"...?","targetIds":["..."]?,"guessRank":number?,"peekTargetId":"...?"},"speak":"..."}
or chancellor / acknowledgePriest (bishopRedraw may include "redraw":true|false).
View JSON:\n${JSON.stringify(view)}${retryBlock}`;

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
              system:
                "You are a clever Love Letter player. Output JSON only: one legal action (+ optional speak). Deduce from discards/seen; protect power cards; never volunteer Princess unless it is your only card.",
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
