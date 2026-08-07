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

export function createDeepSeekTexasHoldemSeat(
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
      const prompt = `You are seat ${id} in No-Limit Texas Hold'em (cash hand). Play LOOSE-AGGRESSIVE for fun.
Use view.legal only. Actions:
{"type":"fold"|"check"|"call","playerId":"${id}","payload":{},"speak":"optional"}
{"type":"raise","playerId":"${id}","payload":{"toAmount":number},"speak":"optional"}
toAmount = total chips committed THIS STREET after the raise (not the raise delta).

Style rules (must follow):
- Made hand flush / full house / quads / straight / trips / two pair: NEVER open-check if raise is legal. Bet pot-ish or jam. Vs a bet: raise, do not just call/check.
- Strong pair / overpair / top pair: bet or raise for value; rarely slow-play.
- Weak air facing a big bet: fold. Do not nit-fold every hand — open-raise decent broadway/pairs.
- Prefer larger value bets (≈ pot) over min-raise when ahead.
Optional speak: short first-person trash talk / action line.
Return ONLY JSON.
View:\n${JSON.stringify(view)}${retryBlock}`;

      let lastErr = "ai failed";
      for (let attempt = 0; attempt < 3; attempt++) {
        opts?.onProgress?.({
          note: `deepseek-v4-flash · ${attempt + 1}/3`,
        });
        try {
          let text = "";
          const result = await adapter.streamChat(
            {
              model: PLAY_MODEL,
              thinking: { type: "disabled" },
              system:
                "You are a splashy NLHE LAG. Output one legal Action JSON only. With flush+ or other strong made hands you MUST bet/raise when legal — never passive check-down.",
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
          void result;
          const obj = extractJson(text) as {
            type: string;
            playerId?: string;
            payload?: Record<string, unknown>;
            speak?: string;
          };
          if (!obj?.type) throw new Error("bad shape");
          const speak =
            typeof obj.speak === "string" ? obj.speak.trim() : undefined;
          const action = {
            type: obj.type,
            playerId: id,
            payload: obj.payload ?? {},
          };
          opts?.onProgress?.({
            note: `已决定：${obj.type}`,
            draftText: text,
          });
          return { action, speak };
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "ai error";
          opts?.onProgress?.({ note: `失败：${lastErr}` });
        }
      }
      throw new Error(lastErr);
    },
  };
}
