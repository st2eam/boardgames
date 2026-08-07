import type { Action, PlayerId } from "@bbge/core";
import type { AiDecision, AiSeat, AiThinkOptions } from "@bbge/ai";
import { chooseGoPolicyAction, type GoPolicyView } from "@bbge/go/policy";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";
import { battleLogPromptBlock } from "@/lib/bbge/aiBattleLog";
import {
  gameRulesSystemBlock,
  loadGameRulesMarkdown,
} from "@/lib/bbge/aiGameRules";
import { goBoardPromptBlock, goCoordLabel } from "@/lib/bbge/aiGoBoard";

const PLAY_MODEL = "deepseek-v4-flash";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

type LegalPlay = { type: "play"; row: number; col: number };

function legalPlaySet(view: GoPolicyView): Map<string, LegalPlay> {
  const map = new Map<string, LegalPlay>();
  for (const a of view.legal ?? []) {
    if (a.type === "play" && "row" in a && "col" in a) {
      map.set(`${a.row},${a.col}`, {
        type: "play",
        row: a.row,
        col: a.col,
      });
    }
  }
  return map;
}

function parseDecision(
  obj: {
    type?: string;
    payload?: { row?: number; col?: number };
    speak?: string;
  },
  playerId: PlayerId,
  plays: Map<string, LegalPlay>,
): AiDecision {
  const speak =
    typeof obj.speak === "string" ? obj.speak.trim() || undefined : undefined;
  const type = obj.type;
  if (type === "pass" || type === "resign") {
    return {
      action: { type, playerId, payload: {} } as Action,
      speak,
    };
  }
  if (type === "play") {
    const row = obj.payload?.row;
    const col = obj.payload?.col;
    if (typeof row !== "number" || typeof col !== "number") {
      throw new Error("play missing row/col");
    }
    if (!plays.has(`${row},${col}`)) {
      throw new Error(`illegal play ${row},${col}`);
    }
    return {
      action: {
        type: "play",
        playerId,
        payload: { row, col },
      } as Action,
      speak,
    };
  }
  throw new Error(`bad type ${String(type)}`);
}

/**
 * Host AiSeat for Go: LLM chooses the move from uploaded board data each turn.
 * Local liberty/atari policy is only a soft hint + hard fallback.
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
      const v = view as GoPolicyView & {
        boardAscii?: string;
        lastMoveLabel?: string | null;
        toActColor?: string | null;
      };

      opts?.onProgress?.({
        note: zh ? "上传盘面，请求模型落子…" : "Uploading board for LLM move…",
      });

      const plays = legalPlaySet(v);
      const policy = chooseGoPolicyAction(v, id);
      const hintPlays: { row: number; col: number; note?: string }[] = [];
      if (policy.action.type === "play") {
        const p = policy.action.payload as { row?: number; col?: number };
        if (typeof p.row === "number" && typeof p.col === "number") {
          hintPlays.push({
            row: p.row,
            col: p.col,
            note: zh ? "启发式首选" : "policy#1",
          });
        }
      }

      const boardBlock = goBoardPromptBlock(v, id, zh, hintPlays);
      const logBlock = battleLogPromptBlock(opts?.battleLog, zh);
      const rules = await loadGameRulesMarkdown(slug, locale);
      const rulesBlock = gameRulesSystemBlock(rules, zh);

      const retry = opts?.illegalRetry;
      const retryBlock = retry
        ? zh
          ? `\n\n上一动作非法：${retry.error}\n被拒：${JSON.stringify(retry.rejectedAction)}\n请根据盘面另选合法动作。`
          : `\n\nREJECTED: ${retry.error}\n${JSON.stringify(retry.rejectedAction)}\nPick a DIFFERENT legal action from the board data.`
        : "";

      const size = v.size ?? 9;
      const colorLabel =
        v.you?.color === "black"
          ? zh
            ? "黑"
            : "black"
          : v.you?.color === "white"
            ? zh
              ? "白"
              : "white"
            : "?";

      const prompt = zh
        ? `你是座位 ${id}，执${colorLabel}，在下围棋（中国规则数子）。
下面「当前棋盘数据」是本手最新盘面，必须据此决策，不要瞎猜空点。
动作只能是：
{"type":"play","playerId":"${id}","payload":{"row":number,"col":number},"speak":"短评"}
{"type":"pass","playerId":"${id}","payload":{},"speak":"短评"}
{"type":"resign","playerId":"${id}","payload":{},"speak":"短评"}
- play 的 row/col 必须来自合法落点列表（0-based，左上为 0,0）。
- 优先：救己方打吃、提子、占大场/拆边；勿填自己眼、勿无谓自杀。
- 双方连续停棋将数子；局面已定可 pass；大劣可 resign。
- speak：简体中文 8–24 字，可提坐标如 ${goCoordLabel(Math.floor(size / 2), Math.floor(size / 2), size)}。
只输出一个 JSON。
${boardBlock}${logBlock}${retryBlock}`
        : `You are seat ${id} playing ${colorLabel} in Chinese-rules Go.
Use the LIVE BOARD DATA below for this move — do not invent empty points.
Actions:
{"type":"play","playerId":"${id}","payload":{"row":number,"col":number},"speak":"..."}
{"type":"pass","playerId":"${id}","payload":{},"speak":"..."}
{"type":"resign","playerId":"${id}","payload":{},"speak":"..."}
- play row/col must be from the legal list (0-based, top-left = 0,0).
- Prefer saving atari, capturing, big points; don't fill your eye / suicide.
- Two passes end the game for scoring; pass when settled; resign if hopeless.
- speak: short table talk.
Return ONLY one JSON.
${boardBlock}${logBlock}${retryBlock}`;

      const system = zh
        ? `你是会读谱的围棋陪练。每手根据上传的 ASCII/坐标盘面选择一个合法 Action JSON；speak 用简体中文短句。${rulesBlock}`
        : `You are a Go practice opponent. Each turn pick one legal Action JSON from the uploaded board data.${rulesBlock}`;

      let lastErr = "ai failed";
      for (let attempt = 0; attempt < 3; attempt++) {
        opts?.onProgress?.({
          note: zh
            ? `盘面已上传 · deepseek · ${attempt + 1}/3`
            : `Board uploaded · deepseek · ${attempt + 1}/3`,
        });
        try {
          let text = "";
          await adapter.streamChat(
            {
              model: PLAY_MODEL,
              thinking: { type: "disabled" },
              system,
              messages: [{ role: "user", content: prompt }],
              maxTokens: 512,
            },
            (chunk) => {
              if (chunk.content) {
                text += chunk.content;
                opts?.onProgress?.({
                  note: zh ? "模型选点中…" : "Model choosing move…",
                  draftText: text,
                });
              }
            },
          );
          const obj = extractJson(text) as {
            type?: string;
            payload?: { row?: number; col?: number };
            speak?: string;
          };
          const decided = parseDecision(obj, id, plays);
          const label =
            decided.action.type === "play"
              ? (() => {
                  const p = decided.action.payload as {
                    row: number;
                    col: number;
                  };
                  return goCoordLabel(p.row, p.col, size);
                })()
              : decided.action.type;
          opts?.onProgress?.({
            note: zh ? `已定：${label}` : `Decided: ${label}`,
            thinkingText: decided.speak,
          });
          return decided;
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "ai error";
        }
      }

      // Fallback: local policy still has a legal move.
      opts?.onProgress?.({
        note: zh
          ? `模型落子失败（${lastErr}），改用启发式`
          : `LLM move failed (${lastErr}); policy fallback`,
      });
      return {
        action: policy.action,
        speak: zh ? "这手先按局部感觉来" : "Playing a solid local shape",
      };
    },
  };
}
