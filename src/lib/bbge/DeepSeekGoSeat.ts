import type { PlayerId } from "@bbge/core";
import type { AiDecision, AiSeat, AiThinkOptions } from "@bbge/ai";
import { chooseGoPolicyAction, type GoPolicyView } from "@bbge/go/policy";
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

/**
 * Hybrid Go seat: mathematical policy picks the Action; LLM only writes `speak`.
 * Pure LLM move selection was too weak for playable Go.
 */
export function createDeepSeekGoSeat(
  id: PlayerId,
  apiKey: string,
  locale = "zh",
  slug = "go",
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  const zh = locale !== "en";
  return {
    id,
    async think(view: unknown, opts?: AiThinkOptions): Promise<AiDecision> {
      opts?.onProgress?.({
        note: zh ? "气数/打吃/目数评估中…" : "Liberty / atari / area eval…",
      });
      const choice = chooseGoPolicyAction(view as GoPolicyView, id);
      opts?.onProgress?.({ note: choice.note });

      const logBlock = battleLogPromptBlock(opts?.battleLog, zh);
      const rules = await loadGameRulesMarkdown(slug, locale);
      const rulesBlock = gameRulesSystemBlock(rules, zh);
      const action = choice.action;
      const v = view as GoPolicyView & { boardAscii?: string; size?: number };

      const prompt = zh
        ? `你是座位 ${id} 的围棋陪练，落子已由气数/打吃/中国规则目数启发式选定，你只负责一句桌边短评。
已定动作（不要改）：
${JSON.stringify(action)}
策略摘要：${choice.note}
盘面（供你说话参考）：
${v.boardAscii ?? "(no ascii)"}
${logBlock}
只输出 JSON：{"speak":"简体中文短评，约 8–24 字，点出意图，勿长篇，勿改坐标"}`
        : `You are seat ${id}. The move was chosen by a liberty/atari/area heuristic — you ONLY write table talk.
Fixed action (do not change):
${JSON.stringify(action)}
Policy note: ${choice.note}
Board:
${v.boardAscii ?? "(no ascii)"}
${logBlock}
Return ONLY JSON: {"speak":"one short English teaching line"}`;

      let speak: string | undefined;
      try {
        let text = "";
        await adapter.streamChat(
          {
            model: PLAY_MODEL,
            thinking: { type: "disabled" },
            system: zh
              ? `你只输出 JSON：{"speak":"…"}。不要输出落子，不要改动已定动作。评语可参考站内规则术语。${rulesBlock}`
              : `Output only JSON: {"speak":"..."}. Do not choose a move. Table talk may use on-site rules terminology.${rulesBlock}`,
            messages: [{ role: "user", content: prompt }],
            maxTokens: 160,
          },
          (chunk) => {
            if (chunk.content) {
              text += chunk.content;
              opts?.onProgress?.({
                note: zh ? "生成评语…" : "Writing speak…",
                draftText: text,
              });
            }
          },
        );
        const obj = extractJson(text) as { speak?: string };
        if (typeof obj.speak === "string" && obj.speak.trim()) {
          speak = obj.speak.trim();
        }
      } catch {
        // Speak is optional — policy move still stands.
      }

      opts?.onProgress?.({
        note: zh
          ? `已定：${action.type}${speak ? " · 有评语" : ""}`
          : `Decided: ${action.type}${speak ? " · speak" : ""}`,
        thinkingText: speak,
      });
      return { action, speak };
    },
  };
}
