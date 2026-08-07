import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat, AiThinkOptions } from "@bbge/ai";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";

/** Fast model for tabletop Actions — chat site assistant may still use pro. */
const PLAY_MODEL = "deepseek-v4-flash";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

/**
 * Host AiSeat: LLM decides **legal play Actions** (primary).
 * Streams thinking/draft via onProgress for Host hover UI.
 */
export function createDeepSeekLoveLetterSeat(
  id: PlayerId,
  apiKey: string,
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  return {
    id,
    async think(view: unknown, opts?: AiThinkOptions): Promise<Action> {
      const prompt = `You are seat ${id} in Love Letter (Full Game, ranks 0 Spy … 9 Princess).
Choose ONE legal action from the private view. Prefer strong play; do not chat.
Return ONLY JSON:
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","targetId":"...?","guessRank":number?}}
or chancellor:
{"type":"resolveChancellor","playerId":"${id}","payload":{"keepCardId":"...","bottomOrderIds":["id1","id2"]}}
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
                "You play Love Letter. Output a single JSON action object only. cardId must be from your hand. No prose.",
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
          // Prefer final thinking block from adapter if stream activities were partial
          const thinkingFinal =
            result.thinking?.thinking?.trim() || thinking || "";
          let parsed: Action | null = null;
          let parseError: string | null = null;
          try {
            const p = extractJson(text) as Action;
            if (p && typeof p === "object" && "type" in p) {
              parsed = { ...p, playerId: id } as Action;
            } else {
              parseError = "bad action shape";
            }
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
          console.log("parsedAction:", parsed);
          if (parseError) console.warn("parseError:", parseError);
          console.groupEnd();

          if (parsed) {
            opts?.onProgress?.({
              note: `已决定：${String(parsed.type)}`,
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
