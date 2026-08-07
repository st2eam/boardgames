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
      const prompt = `You are seat ${id} in Love Letter. view.edition is one of:
- "classic": 16 cards, ranks 1–8 Princess, no Spy/Chancellor, 2–4 players
- "full": 21 cards, Spy…Princess=9, Chancellor, 2–6 players
- "expansion": 37 cards = full + Bishop/Dowager/Constable/Count/Sycophant/Baroness/Cardinal/Jester/Assassin (+3 Guard); keep Spy+Chancellor; 2–8 players; shared ranks; use card.role
Choose ONE legal action. Effects use role (not unique ranks). Guard/Bishop guess a number ≠1.
Return ONLY JSON (action required). Optional speak:
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","targetId":"...?","targetIds":["..."]?,"guessRank":number?,"peekTargetId":"...?"},"speak":"..."}
or chancellor / acknowledgePriest (bishopRedraw may include "redraw":true|false).
speak: one short first-person sentence. No illegal moves.
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
                "You play Love Letter. Output JSON only: a legal action, optionally with speak (table talk). cardId must be from your hand. No prose outside JSON.",
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
