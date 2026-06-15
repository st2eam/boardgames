import OpenAI from "openai";
import type { ChatParams, ChatChunk as _ChatChunk } from "./LLMAdapter";
import type { ToolCall } from "@/lib/chat/types";

interface StreamCallback {
  (chunk: { content: string; toolCalls?: ToolCall[] }): void;
}

const DSML_MARKER = "\uFF5C\uFF5CDSML\uFF5C\uFF5C"; // ｜｜DSML｜｜

function parseDsmlToolCalls(raw: string): ToolCall[] | null {
  const invokeRe = new RegExp(
    `<${DSML_MARKER}invoke\\s+name="([^"]+)"[^>]*>([\\s\\S]*?)</${DSML_MARKER}invoke>`,
    "g"
  );
  const paramRe = new RegExp(
    `<${DSML_MARKER}parameter\\s+name="([^"]+)"[^>]*>([\\s\\S]*?)</${DSML_MARKER}parameter>`,
    "g"
  );

  const calls: ToolCall[] = [];
  let match: RegExpExecArray | null;

  while ((match = invokeRe.exec(raw)) !== null) {
    const name = match[1];
    const body = match[2];
    const args: Record<string, string> = {};

    let pm: RegExpExecArray | null;
    while ((pm = paramRe.exec(body)) !== null) {
      args[pm[1]] = pm[2].trim();
    }

    calls.push({
      id: `dsml_${crypto.randomUUID().slice(0, 8)}`,
      name,
      arguments: JSON.stringify(args),
    });
  }

  return calls.length > 0 ? calls : null;
}

export class DeepSeekAdapter {
  private getClient: () => OpenAI;

  constructor(apiKey: string) {
    this.getClient = () =>
      new OpenAI({
        apiKey,
        baseURL: "https://api.deepseek.com",
        dangerouslyAllowBrowser: true,
      });
  }

  async streamChat(
    params: ChatParams,
    onChunk: StreamCallback
  ): Promise<{ finishReason: string; toolCalls?: ToolCall[] }> {
    const client = this.getClient();

    const stream = await client.chat.completions.create({
      model: params.model ?? "deepseek-v4-pro",
      messages: params.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      tools: params.tools?.map((t) => ({
        type: "function" as const,
        function: t.function,
      })),
      stream: true,
    });

    let finishReason = "";
    let fullContent = "";
    let dsmlDetected = false;
    const accumulatedToolCalls: Map<number, ToolCall> = new Map();

    for await (const event of stream) {
      const delta = event.choices[0]?.delta;
      const finish = event.choices[0]?.finish_reason;

      if (delta?.content) {
        fullContent += delta.content;

        if (!dsmlDetected && fullContent.includes(`<${DSML_MARKER}`)) {
          dsmlDetected = true;
        }

        if (!dsmlDetected) {
          onChunk({ content: delta.content });
        }
      }

      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const index = tc.index;
          if (tc.id) {
            accumulatedToolCalls.set(index, {
              id: tc.id,
              name: tc.function?.name ?? "",
              arguments: tc.function?.arguments ?? "",
            });
          } else if (accumulatedToolCalls.has(index)) {
            const existing = accumulatedToolCalls.get(index)!;
            if (tc.function?.arguments) {
              existing.arguments += tc.function.arguments;
            }
          }
        }
      }

      if (finish) {
        finishReason = finish;
      }
    }

    let toolCalls =
      accumulatedToolCalls.size > 0
        ? Array.from(accumulatedToolCalls.values())
        : undefined;

    if (!toolCalls && dsmlDetected) {
      const parsed = parseDsmlToolCalls(fullContent);
      if (parsed) {
        toolCalls = parsed;
        finishReason = "tool_calls";
      }
    }

    onChunk({ content: "" });
    return { finishReason, toolCalls };
  }
}
