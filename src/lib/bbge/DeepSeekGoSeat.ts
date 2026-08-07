import type { PlayerId } from "@bbge/core";
import type { AiDecision, AiSeat, AiThinkOptions } from "@bbge/ai";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";

const PLAY_MODEL = "deepseek-v4-flash";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

type Legal = { type: string; row?: number; col?: number };

/** Drop huge play lists on 19×19 — model reads boardAscii; host still validates. */
function slimViewForLlm(view: unknown): unknown {
  const v = view as {
    size?: number;
    legal?: Legal[];
    boardAscii?: string;
    ko?: { row: number; col: number } | null;
  };
  const plays = (v.legal ?? []).filter((a) => a.type === "play");
  if (plays.length <= 80) return view;
  const meta = (v.legal ?? []).filter((a) => a.type !== "play");
  return {
    ...v,
    legal: meta,
    legalPlayCount: plays.length,
    note:
      "legal play list omitted (too many). Pick an empty · on boardAscii that is not suicide/ko; row/col 0-based from top-left.",
  };
}

/**
 * Host AiSeat for Go. `locale` controls table-talk language (`speak`).
 * Defaults to Chinese — this product’s primary audience.
 */
export function createDeepSeekGoSeat(
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
          ? `\n\n上一手非法，已被拒绝。错误：${retry.error}\n被拒动作：\n${JSON.stringify(retry.rejectedAction)}\n请返回另一个合法动作。`
          : `\n\nREJECTED illegal action. Error: ${retry.error}\nRejected:\n${JSON.stringify(retry.rejectedAction)}\nReturn a DIFFERENT legal action.`
        : "";

      const speakRule = zh
        ? `speak 必须用简体中文，1 句短评（约 8–24 字），像陪练老师随口说：点出意图即可，勿长篇。每手都要带 speak。`
        : `speak: required short English teaching comment (one sentence).`;

      const prompt = zh
        ? `你是座位 ${id}，业余俱乐部偏强的真人棋风：会算局部、会抢先手，也会收官。
思路：
- 能提子/打吃优先考虑；对方挂棋要应。
- 序盘占角占边（三·三三/星位点附近），勿乱金井。
- 中盘跟着上一手附近战斗，兼顾厚味与眼位；别随手填自己的眼。
- 官子阶段抢大官；双方已基本定型、无明显收益再停着。
- 不要无故认输。
动作 JSON（只输出 JSON）：
{"type":"play","playerId":"${id}","payload":{"row":number,"col":number},"speak":"中文短评"}
{"type":"pass","playerId":"${id}","payload":{},"speak":"中文短评"}
{"type":"resign","playerId":"${id}","payload":{},"speak":"中文短评"}
row/col 为从盘面左上角起的 0-based 坐标（对应 view.boardAscii / view.stones）。
若 view.legal 含 play 条目则从中选；否则根据 boardAscii 选空点。
${speakRule}
View:\n${JSON.stringify(slimViewForLlm(view))}${retryBlock}`
        : `You are seat ${id}: a strong club-level human Go player — tactical, purposeful, not random.
Priorities: capture / atari when available; answer local threats; open in corners/sides; midgame fight near the last move with solid shape; endgame picks big points; pass only when settled. Do not resign casually. Avoid filling your own eyes.
Actions:
{"type":"play","playerId":"${id}","payload":{"row":number,"col":number},"speak":"short comment"}
{"type":"pass","playerId":"${id}","payload":{},"speak":"short comment"}
{"type":"resign","playerId":"${id}","payload":{},"speak":"short comment"}
row/col are 0-based from the top-left of view.boardAscii / view.stones.
If view.legal includes play entries, choose one of them; otherwise pick from boardAscii.
${speakRule}
Return ONLY JSON.
View:\n${JSON.stringify(slimViewForLlm(view))}${retryBlock}`;

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
                ? "你是有思路的真人围棋对手：算局部、占角边、该提则提。只输出一个合法 Action JSON；speak 用简体中文短句。"
                : "You are a purposeful human Go opponent. Output one legal Action JSON; speak is a brief English line.",
              messages: [{ role: "user", content: prompt }],
              maxTokens: 512,
            },
            (chunk) => {
              if (chunk.content) {
                text += chunk.content;
                opts?.onProgress?.({
                  note: zh ? "生成落子 JSON…" : "Writing move JSON…",
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
            thinkingText: speak,
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
          opts?.onProgress?.({
            note: zh ? `失败：${lastErr}` : `Failed: ${lastErr}`,
          });
        }
      }
      throw new Error(lastErr);
    },
  };
}
