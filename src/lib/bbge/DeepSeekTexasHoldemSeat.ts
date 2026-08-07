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

/** True when speak names cards / made hands too plainly (bad poker mouth). */
function speakLooksLikeCardTell(speak: string): boolean {
  return /[♠♥♦♣]|黑桃|红桃|红心|方[块片]|梅花|草花|\b[2-9tjqka][hdcs]\b|\b(aa|kk|qq|jj|tt|ak|aq|aj|kq)\b|口袋|坚果|nuts|flush|straight|full\s*house|trips|\bset\b|two\s*pair|pocket|同花顺|皇家|四条|葫芦|三条|两对|同花|顺子|顶对|听花|听顺|成牌|我有[对AKQJ]|中了|亮了/i.test(
    speak,
  );
}

function mixUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/**
 * Prefer deceptive / vague table talk. Occasional plain truth (~12%) can pass
 * (free speech) even if it names cards; otherwise rewrite card-tells.
 */
function polishHoldemSpeak(
  speak: string | undefined,
  actionType: string,
  zh: boolean,
  seed: string,
): string | undefined {
  const raw = speak?.trim();
  const mix = mixUnit(seed + "|" + (raw ?? "") + "|" + actionType);
  // ~12%: allow whatever the model said (including rare honest reveals)
  if (raw && mix < 0.12) return raw;

  if (raw && !speakLooksLikeCardTell(raw)) return raw;

  const poolZh: Record<string, string[]> = {
    fold: ["不要了", "这轮算了", "过掉"],
    check: ["先过", "看看你们", "随意"],
    call: ["跟一手", "看看", "便宜就跟"],
    raise: ["再加一点", "这手有点意思", "继续加压", "跟不跟啊", "我觉得不错"],
  };
  const poolEn: Record<string, string[]> = {
    fold: ["I'm out", "Not this one", "Pass"],
    check: ["Check", "Let's see", "Sure"],
    call: ["Call", "I'll see it", "Cheap enough"],
    raise: ["Raise", "Let's pump it", "Feeling it", "You calling?"],
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

      const speakRule = zh
        ? `speak 用简体中文短句（约 6–16 字），几乎每手都带。不要用英文术语 check/raise/fold/call。
桌边嘴炮（默认骗人，极少说实话）：
- 默认：含糊 / 虚张声势 / 装怂。弱牌要装强（「这手不错」「继续」），强牌可装怂（「随便跟」「看看」）。
- 禁止常态报牌：不要说真实底牌点数花色，不要说「我有 AA / 同花 / 三条 / 口袋对」这类实话。
- 极少数时候可以故意说错牌唬人，或极偶尔说一句半真半假的话——但绝大多数 speak 必须看不出你的真实牌。
- view.you.hole 只用来决策出牌，禁止照抄进 speak。
好例子：「再加一点」「跟不跟」「这街有点凶」「先过」「不要了」
坏例子：「我有黑桃A」「口袋对KK」「我中同花了」`
        : `speak: short table talk almost every hand. Prefer plain words over jargon.
Default to deception (rarely tell the truth):
- Usually vague / bluff / reverse-tell. Weak hands sound strong; strong hands can sound weak.
- Do NOT routinely name real hole cards or made hands ("I've got aces", "I flopped a flush").
- Very rarely you may lie about holding something, or (rarely) tell a half-truth — but most lines must not reveal your real cards.
- view.you.hole is for choosing the Action only — never copy it into speak.
Good: "Raise.", "Feeling it.", "Check.", "I'm out."
Bad: "I've got AhKd.", "Pocket kings.", "I made a flush."`;
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
                ? "你是激进、会算赔率的真人德州对手：好牌狠打，没牌时赔率合适就跟或加压。只输出一个合法 Action JSON。speak 默认骗人/含糊，禁止常态报真实底牌或成牌。"
                : "You are an aggressive, pot-odds-aware NLHE player. Output one legal Action JSON only. speak defaults to bluffs/vague lines — do not routinely reveal real hole cards.",
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
          const action = {
            type: obj.type,
            playerId: id,
            payload: obj.payload ?? {},
          };
          const speak = polishHoldemSpeak(
            typeof obj.speak === "string" ? obj.speak : undefined,
            obj.type,
            zh,
            `${id}|${obj.type}|${JSON.stringify(obj.payload ?? {})}`,
          );
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
