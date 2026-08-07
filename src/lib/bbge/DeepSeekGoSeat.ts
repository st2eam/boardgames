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

export function createDeepSeekGoSeat(id: PlayerId, apiKey: string): AiSeat {
  const adapter = new DeepSeekAdapter(apiKey);
  return {
    id,
    async think(view: unknown, opts?: AiThinkOptions): Promise<AiDecision> {
      const retry = opts?.illegalRetry;
      const retryBlock = retry
        ? `\n\nREJECTED illegal action. Error: ${retry.error}\nRejected:\n${JSON.stringify(retry.rejectedAction)}\nReturn a DIFFERENT legal action from view.legal.`
        : "";
      const prompt = `You are seat ${id} playing Go (Weiqi) as a patient club-strength opponent / teaching partner.
Prefer solid shape; avoid filling your own eyes; capture when profitable; pass only when the game looks finished.
Use view.legal. Actions:
{"type":"play","playerId":"${id}","payload":{"row":number,"col":number},"speak":"optional short comment"}
{"type":"pass","playerId":"${id}","payload":{},"speak":"optional"}
{"type":"resign","playerId":"${id}","payload":{},"speak":"optional"}
row/col are 0-based from the top-left of view.boardAscii / view.stones.
Return ONLY JSON.
View:\n${JSON.stringify(view)}${retryBlock}`;

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
              system:
                "You play Go. Output one legal Action JSON only from view.legal. Optional brief speak for teaching.",
              messages: [{ role: "user", content: prompt }],
              maxTokens: 512,
            },
            (chunk) => {
              if (chunk.content) {
                text += chunk.content;
                opts?.onProgress?.({
                  note: "生成落子 JSON…",
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
            note: `已决定：${obj.type}`,
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
          opts?.onProgress?.({ note: `失败：${lastErr}` });
        }
      }
      throw new Error(lastErr);
    },
  };
}
