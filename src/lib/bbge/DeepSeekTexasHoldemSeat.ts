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
      const prompt = `You are seat ${id} in No-Limit Texas Hold'em (cash). Play like a mature tight-aggressive (TAG) human with GTO-inspired balance — not a maniac, not a nit.
Use view.legal only. Actions:
{"type":"fold"|"check"|"call","playerId":"${id}","payload":{},"speak":"optional"}
{"type":"raise","playerId":"${id}","payload":{"toAmount":number},"speak":"optional"}
toAmount = total chips committed THIS STREET after the raise (not the raise delta).

Strategy (follow):
- Preflop: open a solid TAG range (pairs, broadway, suited connectors). Fold junk to raises. 3-bet premiums; mix light 3-bets/steal in position.
- Value: with flush / straight / trips / two pair / strong top pair, usually bet ~2/3–pot. Do NOT check down obvious value. Vs small bets raise for value; vs huge bets size down or call sometimes.
- Bluffs: semi-bluff strong draws; on river when checked to, sometimes bluff with blockers/scare cards (~20–30% of air). Do not bluff-call off stacks with nothing.
- Facing aggression with medium strength: fold more often (TAG). Avoid spewy calls.
- Bet sizing: prefer 55–75% pot for c-bets/value; jam mainly when SPR is low or holding the nuts vs resistance.
Optional speak: short natural table talk (not cartoon villain).
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
                "You are a skilled TAG NLHE player with GTO-aware balance: value-bet strong hands, fold junk to heat, and mix selective bluffs/semi-bluffs. Output one legal Action JSON only.",
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
