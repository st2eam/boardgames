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
{"type":"commitTurn","playerId":"${id}","payload":{"groups":[["t-1","t-2","t-3"],["t-4","t-5","t-6"]]},"speak":"短句"}
{"type":"passTurn","playerId":"${id}","payload":{},"speak":"短句"}

策略：
- 破冰（首次出牌）需多组合计 ≥30 分，可一次 commit 多组；未破冰不能动桌面已有组。
- 已破冰后尽量一次性出多组，并把 groups 写成回合结束时的完整桌面（含原有组合）。
- 组=3~4 张同点不同色；顺=3 张以上同色连续数字；鬼牌万能。
- 没牌可出或想攒牌时才抽牌；抽牌会立刻结束回合，不能再出。
- 牌堆空了才用 passTurn。
speak 用简体中文短句。只输出 JSON。
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`
        : `You are seat ${id} in Rummikub. Goal: empty your rack. Use view.legal only.
Actions: drawTile / commitTurn {groups: string[][]} / passTurn (pool empty only).
Strategy: reach 30+ initial meld (multiple new sets ok); then meld multiple sets and extend table sets; jokers are wild.
commitTurn.groups is the FULL table at end of turn. Drawing ends the turn immediately.
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
              maxTokens: 1024,
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
