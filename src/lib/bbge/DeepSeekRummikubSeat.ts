import type { PlayerId } from "@bbge/core";
import type { AiDecision, AiSeat, AiThinkOptions } from "@bbge/ai";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";
import { battleLogPromptBlock } from "@/lib/bbge/aiBattleLog";
import {
  gameRulesSystemBlock,
  loadGameRulesMarkdown,
} from "@/lib/bbge/aiGameRules";

const PLAY_MODEL = "deepseek-v4-flash";

type Legal = { type: string; payload?: Record<string, unknown> };

type View = {
  you?: { rack?: { id: string }[] } | null;
  legal?: Legal[];
};

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

function rackPlayed(groups: unknown, rackIds: Set<string>): number {
  if (!Array.isArray(groups)) return 0;
  return (groups as string[][]).flat().filter((id) => rackIds.has(id)).length;
}

/** If the model picked a smaller dump, swap in the legal commit that plays more rack tiles. */
function upgradeDump(
  view: View,
  playerId: PlayerId,
  action: { type: string; payload?: Record<string, unknown> },
): { type: string; payload: Record<string, unknown> } {
  if (action.type !== "commitTurn") {
    return { type: action.type, payload: action.payload ?? {} };
  }
  const rackIds = new Set((view.you?.rack ?? []).map((t) => t.id));
  let best = action;
  let bestN = rackPlayed(action.payload?.groups, rackIds);
  for (const a of view.legal ?? []) {
    if (a.type !== "commitTurn") continue;
    const n = rackPlayed(a.payload?.groups, rackIds);
    if (n > bestN) {
      best = a;
      bestN = n;
    }
  }
  return { type: best.type, payload: best.payload ?? {} };
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
    async think(viewUnknown: unknown, opts?: AiThinkOptions): Promise<AiDecision> {
      const view = viewUnknown as View;
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
- 出牌时必须选打出手牌张数最多的那条 commitTurn；能出多张就不要只出一张。
- groups 是回合结束时的完整桌面（含原有组合）。
- 破冰需多组合计 ≥30 分；未破冰不能动桌面已有组。
- 组=3~4 张同点不同色；顺=3 张以上同色连续数字；鬼牌万能。
- 没牌可出或想攒牌时才抽牌；抽牌会立刻结束回合，不能再出。
- 牌堆空了才用 passTurn。
speak 用简体中文短句。只输出 JSON。
View:\n${JSON.stringify(viewUnknown)}${logBlock}${retryBlock}`
        : `You are seat ${id} in Rummikub. Goal: empty your rack. Use view.legal only.
Actions: drawTile / commitTurn {groups: string[][]} / passTurn (pool empty only).
When melding, pick the commitTurn that plays the MOST rack tiles — never a 1-tile play if a larger dump exists.
commitTurn.groups is the FULL table at end of turn. Drawing ends the turn immediately.
Return ONLY Action JSON.
View:\n${JSON.stringify(viewUnknown)}${logBlock}${retryBlock}`;

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
                ? `你是会凑组的拉密真人对手。出牌必须一次打出尽可能多的手牌。只输出合法 Action JSON；speak 用简体中文。${rulesBlock}`
                : `You are a sharp Rummikub player. Dump as many rack tiles as possible in one commit. Output one legal Action JSON.${rulesBlock}`,
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
          const upgraded = upgradeDump(view, id, obj);
          return {
            action: {
              type: upgraded.type,
              playerId: id,
              payload: upgraded.payload,
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
