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

export function createDeepSeekTrioSeat(
  id: PlayerId,
  apiKey: string,
  locale = "zh",
  slug = "trio",
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  const zh = locale !== "en";
  return {
    id,
    async think(view: unknown, opts?: AiThinkOptions): Promise<AiDecision> {
      const retry = opts?.illegalRetry;
      const retryBlock = retry
        ? zh
          ? `\n\n上一动作非法：${retry.error}\n请换合法翻牌。`
          : `\n\nREJECTED: ${retry.error}\nPick a DIFFERENT legal reveal.`
        : "";
      const logBlock = battleLogPromptBlock(opts?.battleLog, zh);
      const rules = await loadGameRulesMarkdown(slug, locale);
      const rulesBlock = gameRulesSystemBlock(rules, zh);

      const prompt = zh
        ? `你是座位 ${id}，在玩 TRIO（ナナ）。目标：翻出三张相同数字。
只用 view.legal。动作：
{"type":"revealCenter","playerId":"${id}","payload":{"slotIndex":number},"speak":"短句"}
{"type":"revealExtreme","playerId":"${id}","payload":{"targetPlayerId":"...","end":"low"|"high"},"speak":"短句"}

策略：
- turnReveals 已有数字时，优先翻可能仍是该数字的位置（自己手牌端点、刚翻过同端的对手）。
- 开局可先翻自己最小/最大（你看得见 you.hand）。
- 记住战报里翻过又盖回的牌。
- simple：凑 3 组三条或 7；spicy：2 组相连三条或 7。
speak 用简体中文短句。只输出 JSON。
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`
        : `You are seat ${id} in TRIO. Use view.legal only. Chase the current turn value; use own extremes; memory from battle log.
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
                ? `你是会记牌的 TRIO 真人对手。只输出合法 Action JSON；speak 用简体中文。${rulesBlock}`
                : `You are a sharp TRIO player. Output one legal Action JSON.${rulesBlock}`,
              messages: [{ role: "user", content: prompt }],
              maxTokens: 400,
            },
            (chunk) => {
              if (chunk.content) {
                text += chunk.content;
                opts?.onProgress?.({
                  note: zh ? "选择翻牌…" : "Choosing reveal…",
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
