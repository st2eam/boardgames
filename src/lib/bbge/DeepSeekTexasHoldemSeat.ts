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

/**
 * Host AiSeat for NLHE. `locale` controls table-talk language (`speak`).
 * Defaults to Chinese — this product’s primary audience.
 */
export function createDeepSeekTexasHoldemSeat(
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
          ? `\n\n上一动作非法，已被拒绝。错误：${retry.error}\n被拒：\n${JSON.stringify(retry.rejectedAction)}\n请返回另一个合法动作。`
          : `\n\nREJECTED illegal action. Error: ${retry.error}\nRejected:\n${JSON.stringify(retry.rejectedAction)}\nReturn a DIFFERENT legal action.`
        : "";

      const speakRule = zh
        ? `speak 用简体中文短句（口语牌桌闲话，约 6–20 字），常带。不要用英文术语 check/raise/fold/call/all-in；可说「过」「跟」「再加一点」「不要了」「全下」等。JSON 的 type 仍必须是 fold|check|call|raise。`
        : `Optional speak: short natural English table talk (not cartoon villain). Prefer plain words over jargon.`;

      const prompt = zh
        ? `你是座位 ${id}，无限注德州扑克现金桌。打成熟的紧凶（TAG）真人风格，带一点 GTO 平衡——别疯，也别只会弃牌。
只用 view.legal。动作 JSON：
{"type":"fold"|"check"|"call","playerId":"${id}","payload":{},"speak":"中文短句"}
{"type":"raise","playerId":"${id}","payload":{"toAmount":number},"speak":"中文短句"}
toAmount = 本街加注后累计投入（不是加注增量）。

策略：
- 翻前：开对子、大牌、同花连张；垃圾牌面对加注多弃。强牌 3-bet；有位置可混偷盲。
- 有价值就下注：同花/顺子/三条/两对/强顶对，常打约 2/3 底池；别把明显成牌过到河牌。面对小注可再加；面对巨注有时跟或收小。
- 诈唬：强听牌半诈唬；河牌被过给时，偶尔用阻断牌/吓人牌诈唬（空气约 20–30%）。别拿空气硬跟到底。
- 中等牌力遇重压：偏弃（TAG）。
- 尺度：持续下注/价值注偏好底池 55–75%；SPR 低或坚果遇抵抗再考虑全下。
${speakRule}
只输出 JSON。
View:\n${JSON.stringify(view)}${retryBlock}`
        : `You are seat ${id} in No-Limit Texas Hold'em (cash). Play like a mature tight-aggressive (TAG) human with GTO-inspired balance — not a maniac, not a nit.
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
${speakRule}
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
              system: zh
                ? "你是紧凶、有平衡的真人德州对手：强牌加压、垃圾遇热弃、选择性诈唬。只输出一个合法 Action JSON；speak 用简体中文口语，勿用英文术语。"
                : "You are a skilled TAG NLHE player with GTO-aware balance: value-bet strong hands, fold junk to heat, and mix selective bluffs/semi-bluffs. Output one legal Action JSON only.",
              messages: [{ role: "user", content: prompt }],
              maxTokens: 512,
            },
            (chunk) => {
              if (chunk.content) {
                text += chunk.content;
                opts?.onProgress?.({
                  note: zh ? "生成出牌 JSON…" : "Writing action JSON…",
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
            note: zh ? `已决定：${obj.type}` : `Decided: ${obj.type}`,
            draftText: text,
          });
          return { action, speak };
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "ai error";
          opts?.onProgress?.({ note: zh ? `失败：${lastErr}` : `Failed: ${lastErr}` });
        }
      }
      throw new Error(lastErr);
    },
  };
}
