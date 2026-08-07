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

/**
 * Host AiSeat for 6 nimmt!. `locale` controls table-talk language (`speak`).
 * Defaults to Chinese — this product’s primary audience.
 */
export function createDeepSeekSixNimmtSeat(
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
        ? `speak 用简体中文短句（口语，约 6–20 字），尽量带。不要用英文术语；可以说「接这行」「有点凶」「少拿点牛」等。`
        : `Optional speak: short natural English table talk.`;
      const logBlock = battleLogPromptBlock(opts?.battleLog, zh);

      const prompt = zh
        ? `你是座位 ${id}，在玩《谁是牛头王》(6 nimmt!)——像细心真人：尽量少拿牛头，会预判。
只用 view.legal。动作：
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","flip":true?},"speak":"中文短句"}
{"type":"chooseRow","playerId":"${id}","payload":{"rowIndex":0|1|2|3},"speak":"中文短句"}
{"type":"draftPick","playerId":"${id}","payload":{"cardId":"..."},"speak":"中文短句"}
{"type":"beginPlace","playerId":"${id}","payload":{},"speak":"中文短句"}

策略：
- 优先接到「空隙最小」的行；极力避免打出某行第 5 张（会收走该行）。
- 手里牌还多时留超大控制牌；丢掉容易落到 len=4 行上的尴尬中牌。
- 必须收行时：选牛头最少（其次更短的行）。
- 选牌：灵活中值、低牛头；早期少拿极端大牌。
- 翻转标记只在翻转后明显更合适时使用。
- 结合战报里每人出牌/收行记录，预判谁可能砸中哪一行。

${speakRule}
只输出 JSON。
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`
        : `You are seat ${id} in 6 nimmt! — play like a careful human: minimize bullheads, think ahead.
Use view.legal only. Actions:
{"type":"playCard","playerId":"${id}","payload":{"cardId":"...","flip":true?},"speak":"optional"}
{"type":"chooseRow","playerId":"${id}","payload":{"rowIndex":0|1|2|3},"speak":"optional"}
{"type":"draftPick","playerId":"${id}","payload":{"cardId":"..."},"speak":"optional"}
{"type":"beginPlace","playerId":"${id}","payload":{},"speak":"optional"}

Strategy:
- Prefer cards that fit a row with the SMALLEST gap; strongly avoid playing the 5th card on a row (you take it).
- Keep very high "control" cards when your hand is still large; dump awkward mids that would land on len=4 rows.
- If you must take a row: choose fewest bullheads (then shorter row).
- Draft: flexible mid values, low bullheads; avoid extreme highs early.
- Flip tokens only when the flipped face clearly improves the fit.
- Use the battle log of plays/takes to anticipate which rows others threaten.

${speakRule}
Return ONLY JSON.
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
                ? "你是会算行的《谁是牛头王》真人对手：躲第 5 张陷阱、少拿牛头。只输出一个合法 Action JSON；speak 用简体中文短句。"
                : "You are a thoughtful 6 nimmt! player. Output one legal Action JSON from view.legal. Avoid 5th-card traps; minimize bullheads.",
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
          const obj = extractJson(text) as {
            type: string;
            payload?: Record<string, unknown>;
            speak?: string;
          };
          if (!obj?.type) throw new Error("bad shape");
          const speak =
            typeof obj.speak === "string" ? obj.speak.trim() : undefined;
          opts?.onProgress?.({
            note: zh ? `已决定：${obj.type}` : `Decided: ${obj.type}`,
            draftText: text,
          });
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
          opts?.onProgress?.({ note: zh ? `失败：${lastErr}` : `Failed: ${lastErr}` });
        }
      }
      throw new Error(lastErr);
    },
  };
}
