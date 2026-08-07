import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";
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
 * No table-talk `speak` — chat UI is for humans; AI is here to play cards.
 */
export function createDeepSeekLoveLetterSeat(
  id: PlayerId,
  apiKey: string,
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  return {
    id,
    async think(view: unknown): Promise<Action> {
      const prompt = `You are seat ${id} in Love Letter (Full Game, ranks 0 Spy … 9 Princess).
Choose ONE legal action from the private view. Prefer strong play; do not chat.
Return ONLY JSON:
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","targetId":"...?","guessRank":number?}}
or chancellor:
{"type":"resolveChancellor","playerId":"${id}","payload":{"keepCardId":"...","bottomOrderIds":["id1","id2"]}}
View JSON:\n${JSON.stringify(view)}`;

      let lastErr = "ai failed";
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          let text = "";
          await adapter.streamChat(
            {
              model: PLAY_MODEL,
              system:
                "You play Love Letter. Output a single JSON action object only. cardId must be from your hand. No prose.",
              messages: [{ role: "user", content: prompt }],
              maxTokens: 512,
            },
            (chunk) => {
              if (chunk.content) text += chunk.content;
            },
          );
          const parsed = extractJson(text) as Action;
          if (parsed && typeof parsed === "object" && "type" in parsed) {
            return { ...parsed, playerId: id } as Action;
          }
          lastErr = "bad action shape";
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "ai error";
        }
      }
      throw new Error(lastErr);
    },
  };
}
