import type { PlayerId } from "@bbge/core";
import type { AiDecision, AiSeat, AiThinkOptions } from "@bbge/ai";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";

const PLAY_MODEL = "deepseek-v4-flash";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

export function createDeepSeekSixNimmtSeat(
  id: PlayerId,
  apiKey: string,
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  return {
    id,
    async think(view: unknown, opts?: AiThinkOptions): Promise<AiDecision> {
      const retry = opts?.illegalRetry;
      const retryBlock = retry
        ? `\n\nREJECTED illegal action. Error: ${retry.error}\nRejected:\n${JSON.stringify(retry.rejectedAction)}\nReturn a DIFFERENT legal action.`
        : "";
      const prompt = `You are seat ${id} in 6 nimmt! — play like a careful human: minimize bullheads, think ahead.
Use view.legal only. Actions:
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","flip":true?},"speak":"optional"}
{"type":"chooseRow","playerId":"${id}","payload":{"rowIndex":0|1|2|3},"speak":"optional"}
{"type":"draftPick","playerId":"${id}","payload":{"cardId":"..."},"speak":"optional"}
{"type":"beginPlace","playerId":"${id}","payload":{},"speak":"optional"}

Strategy:
- Prefer cards that fit a row with the SMALLEST gap; strongly avoid playing the 5th card on a row (you take it).
- Keep very high "control" cards when your hand is still large; dump awkward mids that would land on len=4 rows.
- If you must take a row: choose fewest bullheads (then shorter row).
- Draft: flexible mid values, low bullheads; avoid extreme highs early.
- Flip tokens only when the flipped face clearly improves the fit.

Return ONLY JSON.
View:\n${JSON.stringify(view)}${retryBlock}`;

      let lastErr = "ai failed";
      for (let attempt = 0; attempt < 3; attempt++) {
        opts?.onProgress?.({
          note: `deepseek-v4-flash · ${attempt + 1}/3`,
        });
        try {
          let text = "";
          await adapter.streamChat(
            {
              model: PLAY_MODEL,
              thinking: { type: "disabled" },
              system:
                "You are a thoughtful 6 nimmt! player. Output one legal Action JSON from view.legal. Avoid 5th-card traps; minimize bullheads.",
              messages: [{ role: "user", content: prompt }],
              maxTokens: 512,
            },
            (chunk) => {
              if (chunk.content) {
                text += chunk.content;
                opts?.onProgress?.({
                  note: "生成出牌 JSON…",
                  draftText: text,
                });
              }
            },
          );
          const obj = extractJson(text) as {
            type: string;
            payload?: Record<string, unknown>;
            speak?: string;
          };
          if (!obj?.type) throw new Error("bad shape");
          const speak =
            typeof obj.speak === "string" ? obj.speak.trim() : undefined;
          opts?.onProgress?.({
            note: `已决定：${obj.type}`,
            draftText: text,
          });
          return {
            action: {
              type: obj.type,
              playerId: id,
              payload: obj.payload ?? {},
            },
            speak,
          };
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "ai error";
          opts?.onProgress?.({ note: `失败：${lastErr}` });
        }
      }
      throw new Error(lastErr);
    },
  };
}
