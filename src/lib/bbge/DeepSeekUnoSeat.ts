import type { PlayerId } from "@bbge/core";
import type { AiDecision, AiSeat, AiThinkOptions } from "@bbge/ai";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";
import { battleLogPromptBlock } from "@/lib/bbge/aiBattleLog";
import {
  gameRulesSystemBlock,
  loadGameRulesMarkdown,
} from "@/lib/bbge/aiGameRules";

const PLAY_MODEL = "deepseek-v4-flash";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

export function createDeepSeekUnoSeat(
  id: PlayerId,
  apiKey: string,
  locale = "zh",
  slug = "uno",
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  const zh = locale !== "en";
  return {
    id,
    async think(view: unknown, opts?: AiThinkOptions): Promise<AiDecision> {
      const retry = opts?.illegalRetry;
      const retryBlock = retry
        ? zh
          ? `\n\n上一动作非法：${retry.error}\n被拒：${JSON.stringify(retry.rejectedAction)}\n请换合法动作。`
          : `\n\nREJECTED: ${retry.error}\nReturn a DIFFERENT legal action.`
        : "";
      const logBlock = battleLogPromptBlock(opts?.battleLog, zh);
      const rules = await loadGameRulesMarkdown(slug, locale);
      const rulesBlock = gameRulesSystemBlock(rules, zh);
      const v = view as { edition?: string };

      const prompt = zh
        ? `你是座位 ${id}，在玩 UNO（版本 edition=${v.edition ?? "classic"}）。
只用 view.legal。动作示例：
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","chosenColor":"red|yellow|green|blue?","targetPlayerId":"?","saidUno":true},"speak":"短句"}
{"type":"drawCard","playerId":"${id}","payload":{},"speak":"短句"}
{"type":"playDrawn"|"keepDrawn","playerId":"${id}","payload":{...},"speak":"短句"}
{"type":"chooseColor","playerId":"${id}","payload":{"color":"red"},"speak":"短句"}
{"type":"chooseTarget","playerId":"${id}","payload":{"targetPlayerId":"..."},"speak":"短句"}
{"type":"challengeWildDraw"|"acceptWildDraw"|"takeStack"|"callUno"|"catchUno",...}

策略：优先出功能牌给下家施压；剩 2 张时 saidUno=true；没牌可出再抽；No Mercy 尽量叠加；Flip 注意 side。
speak 用简体中文短句。只输出 JSON。
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`
        : `You are seat ${id} in UNO (edition=${v.edition}). Use view.legal only. Prefer action cards; saidUno when down to 1; stack in no-mercy.
Return ONLY Action JSON.
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`;

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
              system: zh
                ? `你是会喊 UNO 的真人对手。只输出合法 Action JSON；speak 用简体中文。${rulesBlock}`
                : `You are a sharp UNO player. Output one legal Action JSON.${rulesBlock}`,
              messages: [{ role: "user", content: prompt }],
              maxTokens: 512,
            },
            (chunk) => {
              if (chunk.content) {
                text += chunk.content;
                opts?.onProgress?.({
                  note: zh ? "生成出牌…" : "Writing action…",
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
          return {
            action: {
              type: obj.type,
              playerId: id,
              payload: obj.payload ?? {},
            },
            speak:
              typeof obj.speak === "string" ? obj.speak.trim() : undefined,
          };
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "ai error";
        }
      }
      throw new Error(lastErr);
    },
  };
}
