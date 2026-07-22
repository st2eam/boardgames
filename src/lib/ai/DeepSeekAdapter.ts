import type { ChatParams, ChatChunk } from "./LLMAdapter";
import type { ThinkingBlock, ToolCall } from "@/lib/chat/types";

interface StreamCallback {
  (chunk: ChatChunk): void;
}

const ANTHROPIC_URL = "https://api.deepseek.com/anthropic/v1/messages";
const DEFAULT_MODEL = "deepseek-v4-pro";
const DEFAULT_MAX_TOKENS = 8192;

interface ContentBlockState {
  type: string;
  id?: string;
  name?: string;
  text?: string;
  partialJson?: string;
  signature?: string;
}

export class DeepSeekAdapter {
  constructor(private apiKey: string) {}

  async streamChat(
    params: ChatParams,
    onChunk: StreamCallback
  ): Promise<{
    finishReason: string;
    toolCalls?: ToolCall[];
    thinking?: ThinkingBlock;
  }> {
    const body = {
      model: params.model ?? DEFAULT_MODEL,
      max_tokens: params.maxTokens ?? DEFAULT_MAX_TOKENS,
      stream: true,
      system: params.system,
      messages: params.messages,
      ...(params.tools && params.tools.length > 0
        ? { tools: params.tools }
        : {}),
    };

    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(
        `DeepSeek Anthropic API error ${response.status}: ${errText || response.statusText}`
      );
    }

    if (!response.body) {
      throw new Error("DeepSeek Anthropic API returned an empty body");
    }

    const blocks = new Map<number, ContentBlockState>();
    let stopReason = "end_turn";
    let emittedText = false;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";

      for (const line of parts) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;

        let event: Record<string, unknown>;
        try {
          event = JSON.parse(data);
        } catch {
          continue;
        }

        const type = event.type as string | undefined;

        if (type === "content_block_start") {
          const index = event.index as number;
          const block = event.content_block as {
            type: string;
            id?: string;
            name?: string;
            text?: string;
            thinking?: string;
            signature?: string;
          };
          blocks.set(index, {
            type: block.type,
            id: block.id,
            name: block.name,
            text:
              block.type === "thinking"
                ? (block.thinking ?? "")
                : (block.text ?? ""),
            partialJson: "",
            signature: block.signature ?? "",
          });

          if (block.type === "server_tool_use" && block.name === "web_search") {
            onChunk({ content: "", status: "web_search" });
          } else if (block.type === "tool_use") {
            onChunk({
              content: "",
              status:
                block.name === "get_game_rules" ? "get_game_rules" : "tool_use",
            });
          }
        } else if (type === "content_block_delta") {
          const index = event.index as number;
          const delta = event.delta as {
            type?: string;
            text?: string;
            partial_json?: string;
            thinking?: string;
            signature?: string;
          };
          const state = blocks.get(index);
          if (!state) continue;

          if (delta.type === "text_delta" && delta.text) {
            state.text = (state.text ?? "") + delta.text;
            emittedText = true;
            onChunk({ content: delta.text });
          } else if (delta.type === "thinking_delta" && delta.thinking) {
            state.text = (state.text ?? "") + delta.thinking;
          } else if (delta.type === "signature_delta" && delta.signature) {
            state.signature = (state.signature ?? "") + delta.signature;
          } else if (delta.type === "input_json_delta" && delta.partial_json) {
            state.partialJson = (state.partialJson ?? "") + delta.partial_json;
          }
        } else if (type === "message_delta") {
          const delta = event.delta as { stop_reason?: string | null };
          if (delta.stop_reason) {
            stopReason = delta.stop_reason;
          }
        } else if (type === "error") {
          const err = event.error as { message?: string } | undefined;
          throw new Error(err?.message ?? "DeepSeek stream error");
        }
      }
    }

    const toolCalls = collectClientToolCalls(blocks);
    const thinking = collectThinking(blocks);

    // Anthropic uses tool_use; normalize for our conversation loop
    const finishReason =
      stopReason === "tool_use" || toolCalls.length > 0
        ? "tool_calls"
        : stopReason;

    if (!emittedText && toolCalls.length === 0 && finishReason === "end_turn") {
      onChunk({ content: "" });
    }

    return {
      finishReason,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      thinking,
    };
  }
}

function collectClientToolCalls(
  blocks: Map<number, ContentBlockState>
): ToolCall[] {
  const calls: ToolCall[] = [];

  for (const block of blocks.values()) {
    if (block.type !== "tool_use" || !block.id || !block.name) continue;

    let args = block.partialJson?.trim() || "{}";
    try {
      JSON.parse(args);
    } catch {
      args = "{}";
    }

    calls.push({
      id: block.id,
      name: block.name,
      arguments: args,
    });
  }

  return calls;
}

function collectThinking(
  blocks: Map<number, ContentBlockState>
): ThinkingBlock | undefined {
  // Prefer the last thinking block (closest to the tool/text turn).
  let thinking: ThinkingBlock | undefined;
  for (const block of blocks.values()) {
    if (block.type !== "thinking") continue;
    const text = block.text?.trim() ?? "";
    if (!text && !block.signature) continue;
    thinking = {
      thinking: block.text ?? "",
      ...(block.signature ? { signature: block.signature } : {}),
    };
  }
  return thinking;
}
