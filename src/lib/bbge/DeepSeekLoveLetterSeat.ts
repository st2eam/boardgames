import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat, AiSpeakContext } from "@bbge/ai";
import type { AiChatMessage } from "@bbge/runtime";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

export function createDeepSeekLoveLetterSeat(
  id: PlayerId,
  apiKey: string,
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  return {
    id,
    async think(view: unknown): Promise<Action> {
      const prompt = `You are seat ${id} in Love Letter (Full Game, ranks 0 Spy … 9 Princess).
Return ONLY JSON for one action:
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","targetId":"...?","guessRank":number?}}
or chancellor resolve:
{"type":"resolveChancellor","playerId":"${id}","payload":{"keepCardId":"...","bottomOrderIds":["id1","id2"]}}
View JSON:\n${JSON.stringify(view)}`;

      let lastErr = "ai failed";
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          let text = "";
          await adapter.streamChat(
            {
              system:
                "You play Love Letter. Output a single JSON action object only. cardId must be from your hand.",
              messages: [{ role: "user", content: prompt }],
              maxTokens: 1024,
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
    async speak(ctx: AiSpeakContext): Promise<AiChatMessage | null> {
      try {
        let text = "";
        await adapter.streamChat(
          {
            system: "You are a playful board-game opponent.",
            messages: [
              {
                role: "user",
                content: `One short table-talk line (locale ${ctx.locale}, max 40 chars) as Love Letter seat ${id}. No JSON.`,
              },
            ],
            maxTokens: 128,
          },
          (chunk) => {
            if (chunk.content) text += chunk.content;
          },
        );
        const line = text.trim().slice(0, 80);
        if (!line) return null;
        return { playerId: id, text: line, at: Date.now() };
      } catch {
        return null;
      }
    },
  };
}
