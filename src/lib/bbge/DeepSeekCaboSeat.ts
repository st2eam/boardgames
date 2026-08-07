import type { PlayerId } from "@bbge/core";
import type { AiDecision, AiSeat, AiThinkOptions } from "@bbge/ai";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";
import { battleLogPromptBlock } from "@/lib/bbge/aiBattleLog";

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

      const prompt = zh
        ? `你是座位 ${id}，在玩 CABO 记忆换牌：目标累计分最低，先到 ${100} 分（恰好 100 可重置 50 一次）输。
只用 view.legal。动作示例：
{"type":"setupPeek","playerId":"${id}","payload":{"slotIndices":[0,1]},"speak":"中文"}
{"type":"drawDeck","playerId":"${id}","payload":{},"speak":"中文"}
{"type":"drawDiscard","playerId":"${id}","payload":{},"speak":"中文"}
{"type":"discardDrawn","playerId":"${id}","payload":{"useAbility":true?},"speak":"中文"}
{"type":"swapWithDrawn","playerId":"${id}","payload":{"slotIndices":[0]},"speak":"中文"}
{"type":"resolveAbilityPeek","playerId":"${id}","payload":{"slotIndex":0},"speak":"中文"}
{"type":"resolveAbilitySpy","playerId":"${id}","payload":{"targetPlayerId":"...","slotIndex":0},"speak":"中文"}
{"type":"resolveAbilitySwap","playerId":"${id}","payload":{"ownSlotIndex":0,"targetPlayerId":"...","targetSlotIndex":0},"speak":"中文"}
{"type":"skipAbility","playerId":"${id}","payload":{},"speak":"中文"}
{"type":"callCabo","playerId":"${id}","payload":{},"speak":"中文"}
{"type":"acknowledgeModal","playerId":"${id}","payload":{},"speak":"中文"}

策略：
- 开局偷看角牌；记住已知点数。
- 优先换掉高分暗牌；弃牌堆低牌可拿。
- 7–8 偷看自己未知；9–10 间谍领先者；11–12 用疑似高牌盲换。
- 手牌估计很低且对手难改善时再喊 CABO（喊错 +10）。
- 多张交换只在确信同点数时使用。
- 结合战报判断弃牌信息。

${speakRule}
只输出 JSON。
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`
        : `You are seat ${id} in CABO — minimize cumulative score (target ${100}, exact 100 resets to 50 once).
Use view.legal only. Actions: setupPeek, drawDeck, drawDiscard, discardDrawn, swapWithDrawn, resolveAbility*, skipAbility, callCabo, acknowledgeModal.
Strategy: track memory, swap away highs, use spy/peek/swap abilities, call CABO when confident lowest.
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
                ? "你是 CABO 真人对手：记牌、换低、谨慎喊 CABO。只输出合法 Action JSON；speak 用简体中文短句。"
                : "Thoughtful CABO player. Output one legal Action JSON.",
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
