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

      const speakRule = zh
        ? `speak 用简体中文短句（口语牌桌闲话，约 6–20 字），常带。不要用英文术语 check/raise/fold/call/all-in；可说「过」「跟」「再加一点」「不要了」「全下」等。JSON 的 type 仍必须是 fold|check|call|raise。`
        : `Optional speak: short natural English table talk. Prefer plain words over jargon.`;
      const logBlock = battleLogPromptBlock(opts?.battleLog, zh);

      const prompt = zh
        ? `你是座位 ${id}，无限注德州扑克现金桌。打激进、看赔率的真人风格——不要 TAG（别动不动弃牌），也不要无脑疯打。
只用 view.legal。动作 JSON：
{"type":"fold"|"check"|"call","playerId":"${id}","payload":{},"speak":"中文短句"}
{"type":"raise","playerId":"${id}","payload":{"toAmount":number},"speak":"中文短句"}
toAmount = 本街加注后累计投入（不是加注增量）。

核心策略：
- 有好牌就狠打：顶对以上、两对、三条、顺子、同花、葫芦+，优先加注/重下注拿价值；别慢玩到河牌白白过牌。面对小注直接再加；SPR 低或坚果可全下。
- 没成牌时看底池赔率：跟注价 ≈ toCall/(potTotal+toCall)。赔率合适（便宜跟注、听花听顺、有位置）就入池跟；有时直接加注施压。价太贵、几乎没胜率再弃。
- 翻前：强牌开得大、3-bet 加压；中等牌/同花连张看价格跟或轻加；垃圾牌只在很便宜时跟或偶尔偷。
- 尺度：价值注常打底池 2/3～满池；别把明显成牌过到摊牌。
- 结合战报里每位玩家本局行动判断谁在诈唬/谁在价值下注。
${speakRule}
只输出 JSON。
View:\n${JSON.stringify(view)}${logBlock}${retryBlock}`
        : `You are seat ${id} in No-Limit Texas Hold'em (cash). Play aggressive and pot-odds aware — NOT tight-TAG (do not auto-fold medium spots), and not mindless spew.
Use view.legal only. Actions:
{"type":"fold"|"check"|"call","playerId":"${id}","payload":{},"speak":"optional"}
{"type":"raise","playerId":"${id}","payload":{"toAmount":number},"speak":"optional"}
toAmount = total chips committed THIS STREET after the raise (not the raise delta).

Strategy:
- Strong hands: smash — top pair+, two pair, trips, straights, flushes, boats+: bet/raise for value. Do not check down obvious value. Re-raise small bets; jam when SPR is low or you have the nuts.
- Weak / no hand: use pot odds. Price ≈ toCall/(potTotal+toCall). If the price is good (cheap call, flush/straight draw, position), call — sometimes raise for pressure. Fold only when expensive with almost no equity.
- Preflop: size up premiums and 3-bet; call or light-raise speculative hands at a fair price; trash only peels very cheap or steals occasionally.
- Sizing: value often ~2/3–pot to pot.
- Use the battle log of every player's actions to read the table.
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
          const result = await adapter.streamChat(
            {
              model: PLAY_MODEL,
              thinking: { type: "disabled" },
              system: zh
                ? "你是激进、会算赔率的真人德州对手：好牌狠打，没牌时赔率合适就跟或加压。不要 TAG 式过度弃牌。只输出一个合法 Action JSON；speak 用简体中文口语，勿用英文术语。"
                : "You are an aggressive, pot-odds-aware NLHE player: smash strong hands; with air/draws, call or raise when the price is right. Not a tight TAG. Output one legal Action JSON only.",
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
          void result;
          const obj = extractJson(text) as {
            type: string;
            playerId?: string;
            payload?: Record<string, unknown>;
            speak?: string;
          };
          if (!obj?.type) throw new Error("bad shape");
          const speak =
            typeof obj.speak === "string" ? obj.speak.trim() : undefined;
          const action = {
            type: obj.type,
            playerId: id,
            payload: obj.payload ?? {},
          };
          opts?.onProgress?.({
            note: zh ? `已决定：${obj.type}` : `Decided: ${obj.type}`,
            draftText: text,
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
