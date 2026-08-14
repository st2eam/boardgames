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

export function createDeepSeekRummikubSeat(
  id: PlayerId,
  apiKey: string,
  locale = "zh",
  slug = "rummikub",
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

      const prompt = zh
        ? `你是座位 ${id}，在玩拉密（Rummikub）。目标：最先出空牌架。
只用 view.legal。动作示例：
{"type":"drawTile","playerId":"${id}","payload":{},"speak":"短句"}
{"type":"playNewSet","playerId":"${id}","payload":{"tileIds":["..."]},"speak":"短句"}
{"type":"extendSet","playerId":"${id}","payload":{"targetSetId":"...","tileIds":["..."]},"speak":"短句"}
{"type":"passTurn","playerId":"${id}","payload":{},"speak":"短句"}

策略：
- 破冰（首次出牌）需 ≥30 分；未破冰时优先凑 30 分以上的同花顺或同点数组。
- 已破冰后尽量一次性出多组，并把手牌接到桌面已有组合上。
- 组=3~4 张同点不同色；顺=3 张以上同色连续数字；鬼牌万能。
- 没牌可出或想攒牌时才抽牌；抽完不能立刻再抽，只能出牌或结束回合。
speak 用简体中文短句。只输出 JSON。
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`
        : `You are seat ${id} in Rummikub. Goal: empty your rack. Use view.legal only.
Actions: drawTile / playNewSet {tileIds} / extendSet {targetSetId, tileIds} / passTurn.
Strategy: reach 30+ initial meld first; then meld multiple sets and extend table sets; jokers are wild.
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
                ? `你是会凑组的拉密真人对手。只输出合法 Action JSON；speak 用简体中文。${rulesBlock}`
                : `You are a sharp Rummikub player. Output one legal Action JSON.${rulesBlock}`,
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
