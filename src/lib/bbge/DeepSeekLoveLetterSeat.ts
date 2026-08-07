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
 * Host AiSeat: LLM decides legal play Actions + optional table talk (发言).
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
      const prompt = `You are seat ${id} in Love Letter (Full Game, ranks 0 Spy … 9 Princess).
Choose ONE legal action from the private view. Prefer strong play.
Return ONLY JSON (action required). Optional short first-person table talk as 发言:
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","targetId":"...?","guessRank":number?},"发言":"打出守卫，我猜某某是「公主」。"}
or chancellor:
{"type":"resolveChancellor","playerId":"${id}","payload":{"keepCardId":"...","bottomOrderIds":["id1","id2"]},"发言":"留这张。"}
or array:
[{"type":"playCard","playerId":"${id}","payload":{...}},{"type":"发言","text":"短句"}]
发言 should be one short Chinese sentence in first person when locale cues suggest zh; otherwise English. Do not invent illegal moves.
View JSON:\n${JSON.stringify(view)}`;

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
                "You play Love Letter. Output JSON only: a legal action, optionally with 发言 (table talk). cardId must be from your hand. No prose outside JSON.",
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
              note: `已决定：${String(parsed.action.type)}${parsed.speak ? " · 发言" : ""}`,
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
