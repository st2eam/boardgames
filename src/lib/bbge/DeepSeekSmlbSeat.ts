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
  const raw = text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

export function createDeepSeekSmlbSeat(
  id: PlayerId,
  apiKey: string,
  locale = "zh",
  slug = "super-mega-lucky-box",
): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  const zh = locale !== "en";
  return {
    id,
    async think(viewUnknown, opts?: AiThinkOptions): Promise<AiDecision> {
      const rules = await loadGameRulesMarkdown(slug, locale);
      const rulesBlock = gameRulesSystemBlock(rules, zh);
      const logBlock = battleLogPromptBlock(opts?.battleLog, zh);
      const retry = opts?.illegalRetry
        ? zh
          ? "\n上一个动作被拒：" + opts.illegalRetry.error + "。请改为另一个合法动作。"
          : "\nThe previous action was rejected: " + opts.illegalRetry.error + ". Choose another legal action."
        : "";
      const policy = zh
        ? "你在玩《超级巨型幸运盒子》。按 view.stage 决策：startingDraft 从 startingOffers 中选恰好 3 张；roundDraft 从 roundOffers 中选 1 张；number 阶段每个翻出的数字只划一个可达空格，payload.adjustments 是逐步 ±1 的数组且 9/1 循环，闪电总数不可超出 view.you.lightning；如果存在任何可达格就必须划，完全没有可达格才 skipNumber。每完成的横行或竖列都进入 pendingBonuses，可任意顺序 resolveBonus；数字奖励只能立即划对应数字，问号可划任意空格，奖励触发的连锁也要处理。"
        : "You are playing Super Mega Lucky Box. Follow view.stage: keep exactly 3 startingOffers in startingDraft; choose 1 roundOffer in roundDraft; in number stage cross exactly one reachable open square for the revealed number. payload.adjustments is a sequence of +/-1 steps with 9/1 wrap and may not exceed view.you.lightning. If any square is reachable you must cross one; skipNumber is only for no reachable square. Resolve every pendingBonuses item in any order; number rewards must immediately cross that number, wild rewards cross any open square, and resolve every chain.";
      const prompt =
        policy +
        "\nUse one of these Action shapes: keepStartingCards {cardIds:string[]}; pickRoundCard {cardId:string}; markNumber {cardId:string,cellIndex:number,adjustments:(-1|1)[]}; skipNumber {}; resolveBonus {bonusId:string,cardId?:string,cellIndex?:number}." +
        "\nOnly return JSON with type, payload, and optional speak. Do not invent card IDs or target squares." +
        "\nView:\n" +
        JSON.stringify(viewUnknown) +
        logBlock +
        retry;
      const system =
        (zh
          ? "你是聪明、友善的《超级巨型幸运盒子》玩家，只选择符合规则的动作；行动与简短桌面发言使用简体中文。星星每轮总分为 1、4、9。"
          : "You are a thoughtful Super Mega Lucky Box player. Choose only legal actions. Star totals are 1, 4, or 9 per round.") +
        rulesBlock;

      let lastError = "AI failed";
      for (let attempt = 0; attempt < 3; attempt++) {
        opts?.onProgress?.({
          note: "deepseek-v4-flash · " + (attempt + 1) + "/3",
        });
        try {
          let text = "";
          await adapter.streamChat(
            {
              model: PLAY_MODEL,
              thinking: { type: "disabled" },
              system,
              messages: [{ role: "user", content: prompt }],
              maxTokens: 700,
            },
            (chunk) => {
              if (!chunk.content) return;
              text += chunk.content;
              opts?.onProgress?.({
                note: zh ? "生成动作…" : "Writing action…",
                draftText: text,
              });
            },
          );
          const obj = extractJson(text) as {
            type?: string;
            payload?: Record<string, unknown>;
            speak?: string;
          };
          if (!obj.type) throw new Error("bad action");
          return {
            action: {
              type: obj.type,
              playerId: id,
              payload: obj.payload ?? {},
            },
            speak: typeof obj.speak === "string" ? obj.speak.trim() : undefined,
          };
        } catch (error) {
          lastError = error instanceof Error ? error.message : "AI error";
        }
      }
      throw new Error(lastError);
    },
  };
}
