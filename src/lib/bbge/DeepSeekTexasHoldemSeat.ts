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

function mixUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/** Strip speak / hole leaks from streamed draft shown in Host thinking UI. */
function redactThinkDraft(text: string): string {
  return text
    .replace(/"speak"\s*:\s*"(?:\\.|[^"\\])*"/gi, '"speak":"…"')
    .replace(/"hole"\s*:\s*\[[^\]]*\]/gi, '"hole":["?","?"]')
    .replace(/[♠♥♦♣]|黑桃|红桃|红心|方[块片]|梅花|草花/g, "□")
    .replace(/\b[2-9tjqka][hdcs]\b/gi, "??");
}

/**
 * Host-side table talk only — never trust the model to keep secrets.
 * Lines are vague / reverse-tells; no ranks, suits, or made-hand names.
 */
function bluffSpeak(actionType: string, zh: boolean, seed: string): string {
  const mix = mixUnit(seed);
  const poolZh: Record<string, string[]> = {
    fold: ["不要了", "这轮算了", "过掉", "没感觉"],
    check: ["先过", "看看你们", "随意", "你们先"],
    call: ["跟一手", "便宜就跟", "看看", "跟一下"],
    raise: [
      "再加一点",
      "这手有点意思",
      "继续加压",
      "跟不跟啊",
      "我觉得不错",
      "打大一点",
      "来啊",
    ],
  };
  const poolEn: Record<string, string[]> = {
    fold: ["I'm out", "Not this one", "Pass"],
    check: ["Check", "Let's see", "After you"],
    call: ["Call", "I'll see it", "Cheap enough"],
    raise: ["Raise", "Let's pump it", "Feeling it", "You calling?", "More"],
  };
  const key =
    actionType === "fold" || actionType === "check" || actionType === "call"
      ? actionType
      : "raise";
  const pool = zh ? poolZh[key]! : poolEn[key]!;
  return pool[Math.floor(mix * pool.length) % pool.length]!;
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

      const logBlock = battleLogPromptBlock(opts?.battleLog, zh);

      // Do not ask the model for speak — Host invents bluff lines after the Action.
      const prompt = zh
        ? `你是座位 ${id}，无限注德州扑克现金桌。打激进、看赔率的真人风格——不要 TAG（别动不动弃牌），也不要无脑疯打。
只用 view.legal。动作 JSON（不要 speak 字段，桌边闲话由系统生成）：
{"type":"fold"|"check"|"call","playerId":"${id}","payload":{}}
{"type":"raise","playerId":"${id}","payload":{"toAmount":number}}
toAmount = 本街加注后累计投入（不是加注增量）。

核心策略：
- 有好牌就狠打：顶对以上、两对、三条、顺子、同花、葫芦+，优先加注/重下注拿价值；别慢玩到河牌白白过牌。面对小注直接再加；SPR 低或坚果可全下。
- 没成牌时看底池赔率：跟注价 ≈ toCall/(potTotal+toCall)。赔率合适（便宜跟注、听花听顺、有位置）就入池跟；有时直接加注施压。价太贵、几乎没胜率再弃。
- 翻前：强牌开得大、3-bet 加压；中等牌/同花连张看价格跟或轻加；垃圾牌只在很便宜时跟或偶尔偷。
- 尺度：价值注常打底池 2/3～满池；别把明显成牌过到摊牌。
- 结合战报里每位玩家本局行动判断谁在诈唬/谁在价值下注。
只输出 JSON。不要在 JSON 外写牌面，不要解释手牌。
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`
        : `You are seat ${id} in No-Limit Texas Hold'em (cash). Play aggressive and pot-odds aware — NOT tight-TAG.
Use view.legal only. Action JSON only (no speak field — Host generates table talk):
{"type":"fold"|"check"|"call","playerId":"${id}","payload":{}}
{"type":"raise","playerId":"${id}","payload":{"toAmount":number}}
toAmount = total chips committed THIS STREET after the raise.

Strategy: smash strong hands; with air/draws call or raise when pot odds are good; preflop size up premiums; use battle log to read the table.
Return ONLY JSON. Do not narrate hole cards outside/inside the JSON.
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`;

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
                ? "你是激进、会算赔率的真人德州对手。只输出一个合法 Action JSON，不要 speak，不要在任何字段里写出底牌或成牌名称。"
                : "You are an aggressive pot-odds-aware NLHE player. Output one legal Action JSON only — no speak, never name hole cards.",
              messages: [{ role: "user", content: prompt }],
              maxTokens: 512,
            },
            (chunk) => {
              if (chunk.content) {
                text += chunk.content;
                opts?.onProgress?.({
                  note: zh ? "生成出牌 JSON…" : "Writing action JSON…",
                  draftText: redactThinkDraft(text),
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
          const action = {
            type: obj.type,
            playerId: id,
            payload: obj.payload ?? {},
          };
          // Ignore model speak entirely — Host bluff lines only.
          const speak = bluffSpeak(
            obj.type,
            zh,
            `${id}|${obj.type}|${JSON.stringify(obj.payload ?? {})}|${attempt}`,
          );
          opts?.onProgress?.({
            note: zh ? `已决定：${obj.type}` : `Decided: ${obj.type}`,
            draftText: redactThinkDraft(text),
          });
          return { action, speak };
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "ai error";
          opts?.onProgress?.({
            note: zh ? `失败：${lastErr}` : `Failed: ${lastErr}`,
          });
        }
      }
      throw new Error(lastErr);
    },
  };
}
