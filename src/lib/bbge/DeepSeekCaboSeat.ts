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

/** Host AiSeat for CABO. Defaults to Chinese table talk. */
export function createDeepSeekCaboSeat(
  id: PlayerId,
  apiKey: string,
  locale = "zh",
  slug = "cabo",
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  const zh = locale !== "en";
  return {
    id,
    async think(view: unknown, opts?: AiThinkOptions): Promise<AiDecision> {
      const retry = opts?.illegalRetry;
      const retryBlock = retry
        ? zh
          ? `\n\n上一动作非法。错误：${retry.error}\n被拒：\n${JSON.stringify(retry.rejectedAction)}\n请返回另一个合法动作。`
          : `\n\nREJECTED: ${retry.error}\nReturn a DIFFERENT legal action.`
        : "";

      const speakRule = zh
        ? `speak 用简体中文短句（口语，约 6–20 字），可以说「换这张」「该喊了」「看看这张」等。`
        : `Optional speak: short English table talk.`;
      const logBlock = battleLogPromptBlock(opts?.battleLog, zh);
      const rules = await loadGameRulesMarkdown(slug, locale);
      const rulesBlock = gameRulesSystemBlock(rules, zh);

      const prompt = zh
        ? `你是座位 ${id}，在玩 CABO：本轮与累计都要尽量低分（越小越好）。有人先到 ${100} 分则终局，累计最低者胜（恰好 100 可重置 50 一次）。
动作类型必须合法。swapWithDrawn 的 slotIndices 可任选你面前的下标，不必照抄 legal 示例。
示例：
{"type":"setupPeek","playerId":"${id}","payload":{"slotIndices":[0,3]},"speak":"中文"}
{"type":"drawDeck","playerId":"${id}","payload":{},"speak":"中文"}
{"type":"drawDiscard","playerId":"${id}","payload":{},"speak":"中文"}
{"type":"discardDrawn","playerId":"${id}","payload":{"useAbility":true?},"speak":"中文"}
{"type":"swapWithDrawn","playerId":"${id}","payload":{"slotIndices":[2]},"speak":"中文"}
{"type":"swapWithDrawn","playerId":"${id}","payload":{"slotIndices":[0,2]},"speak":"中文"}
{"type":"resolveAbilityPeek","playerId":"${id}","payload":{"slotIndex":0},"speak":"中文"}
{"type":"resolveAbilitySpy","playerId":"${id}","payload":{"targetPlayerId":"...","slotIndex":0},"speak":"中文"}
{"type":"resolveAbilitySwap","playerId":"${id}","payload":{"ownSlotIndex":0,"targetPlayerId":"...","targetSlotIndex":0},"speak":"中文"}
{"type":"skipAbility","playerId":"${id}","payload":{},"speak":"中文"}
{"type":"callCabo","playerId":"${id}","payload":{},"speak":"中文"}
{"type":"acknowledgeModal","playerId":"${id}","payload":{},"speak":"中文"}

硬性策略（必须遵守）：
- 目标是低分：0、1、2 是神牌；绝不要 discardDrawn 丢掉 0–3。
- you.slots[].value 若有数字就是你已知的点数（即使 faceUp=false，牌面朝下但你记得）；用它做决策。
- 摸到低牌 → 用 swapWithDrawn 换掉你面前估计最高的那张（value 最大或未知）。
- 若你知道面前有两张（或更多）同点数高牌，且摸到的牌更小：用一张小牌一次换掉整组对子/多张（slotIndices 含那些同点数下标）——这比只换一张更划算。
- 摸到 ≥9 的垃圾牌 → discardDrawn；7–10 可考虑 useAbility。
- 弃牌堆顶 ≤4 且能改善你某张更高牌时才 drawDiscard。
- 只有估计总和很低（约 ≤6–8）才 callCabo；喊错 +10。

${speakRule}
只输出 JSON。
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`
        : `You are seat ${id} in CABO. Goal: LOWEST score (0/1/2 are best). Never discardDrawn a 0–3.
you.slots[].value is your memory even when faceUp=false. Swap lows onto your highest slots; discard junk ≥9; call CABO only when very low.
If you know a matching pair/set of high values and draw a lower card, multi-swap them in one swapWithDrawn (slotIndices = all matching indexes).
swapWithDrawn.slotIndices may be any of your slot indexes (not only legal stubs).
${speakRule}
Return ONLY JSON.
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`;

      let lastErr = "ai failed";
      for (let attempt = 0; attempt < 3; attempt++) {
        opts?.onProgress?.({ note: `deepseek-v4-flash · ${attempt + 1}/3` });
        try {
          let text = "";
          await adapter.streamChat(
            {
              model: PLAY_MODEL,
              thinking: { type: "disabled" },
              system: zh
                ? `你是 CABO 真人对手：追求最低分，绝不丢掉 0/1/2，用低牌换掉高牌；有同点高对时优先用一张更小的牌一次换掉多张。只输出合法 Action JSON；speak 用简体中文短句。${rulesBlock}`
                : `CABO player seeking lowest score; never discard 0–2; multi-swap matching highs with one lower drawn card when possible. Output one legal Action JSON.${rulesBlock}`,
              messages: [{ role: "user", content: prompt }],
              maxTokens: 512,
            },
            (chunk) => {
              if (chunk.content) {
                text += chunk.content;
                opts?.onProgress?.({
                  note: zh ? "生成动作…" : "Writing action…",
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
        }
      }
      throw new Error(lastErr);
    },
  };
}
