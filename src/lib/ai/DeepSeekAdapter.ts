import OpenAI from "openai";
import type { ChatParams, ChatChunk as _ChatChunk } from "./LLMAdapter";
import type { ToolCall } from "@/lib/chat/types";

interface StreamCallback {
  (chunk: { content: string; toolCalls?: ToolCall[] }): void;
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
    const accumulatedToolCalls: Map<number, ToolCall> = new Map();

    for await (const event of stream) {
      const delta = event.choices[0]?.delta;
      const finish = event.choices[0]?.finish_reason;

      if (delta?.content) {
        onChunk({ content: delta.content });
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

    const toolCalls =
      accumulatedToolCalls.size > 0
        ? Array.from(accumulatedToolCalls.values())
        : undefined;

    onChunk({ content: "" }); // signal end
    return { finishReason, toolCalls };
  }
}
