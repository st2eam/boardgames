import type { ChatParams, ChatChunk } from "./LLMAdapter";
import type {
  ChatActivity,
  ThinkingBlock,
  ToolCall,
  WebSearchResultItem,
} from "@/lib/chat/types";
import { DeepSeekApiError } from "@/lib/chat/chat-errors";

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
  activityId?: string;
  toolUseId?: string;
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
      throw new DeepSeekApiError(
        response.status,
        errText || response.statusText
      );
    }

    if (!response.body) {
      throw new DeepSeekApiError(502, "Empty response body from DeepSeek API");
    }

    const blocks = new Map<number, ContentBlockState>();
    let stopReason = "end_turn";
    let emittedText = false;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const emitActivity = (activity: ChatActivity) => {
      onChunk({ activity });
    };

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
            tool_use_id?: string;
            content?: unknown;
          };

          const state: ContentBlockState = {
            type: block.type,
            id: block.id,
            name: block.name,
            text:
              block.type === "thinking"
                ? (block.thinking ?? "")
                : (block.text ?? ""),
            partialJson: "",
            signature: block.signature ?? "",
            toolUseId: block.tool_use_id,
          };

          if (block.type === "thinking") {
            state.activityId = `thinking-${index}`;
            emitActivity({
              id: state.activityId,
              kind: "thinking",
              status: "running",
              thinkingText: state.text,
            });
          } else if (block.type === "server_tool_use" && block.name === "web_search") {
            state.activityId = block.id ?? `web-search-${index}`;
            emitActivity({
              id: state.activityId,
              kind: "web_search",
              status: "running",
              toolName: "web_search",
            });
          } else if (block.type === "tool_use") {
            const kind =
              block.name === "get_game_rules" ? "get_game_rules" : "tool_use";
            state.activityId = block.id ?? `tool-${index}`;
            emitActivity({
              id: state.activityId,
              kind,
              status: "running",
              toolName: block.name,
            });
          } else if (block.type === "web_search_tool_result") {
            const toolUseId = block.tool_use_id ?? `web-result-${index}`;
            const parsed = parseWebSearchResultContent(block.content);
            emitActivity({
              id: toolUseId,
              kind: "web_search",
              status: parsed.errorCode ? "error" : "done",
              errorCode: parsed.errorCode,
              results: parsed.results,
              toolName: "web_search",
            });
          }

          blocks.set(index, state);
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
            if (state.activityId) {
              emitActivity({
                id: state.activityId,
                kind: "thinking",
                status: "running",
                thinkingText: state.text,
              });
            }
          } else if (delta.type === "signature_delta" && delta.signature) {
            state.signature = (state.signature ?? "") + delta.signature;
          } else if (delta.type === "input_json_delta" && delta.partial_json) {
            state.partialJson = (state.partialJson ?? "") + delta.partial_json;
            if (
              state.type === "server_tool_use" &&
              state.name === "web_search" &&
              state.activityId
            ) {
              const query = tryParseQuery(state.partialJson);
              if (query) {
                emitActivity({
                  id: state.activityId,
                  kind: "web_search",
                  status: "running",
                  query,
                  toolName: "web_search",
                });
              }
            }
          }
        } else if (type === "content_block_stop") {
          const index = event.index as number;
          const state = blocks.get(index);
          // Client tool_use stays "running" until the browser finishes executeToolCall.
          if (state?.type === "thinking" && state.activityId) {
            emitActivity({
              id: state.activityId,
              kind: "thinking",
              status: "done",
              thinkingText: state.text,
            });
          }
        } else if (type === "message_delta") {
          const delta = event.delta as { stop_reason?: string | null };
          if (delta.stop_reason) {
            stopReason = delta.stop_reason;
          }
        } else if (type === "error") {
          const err = event.error as { message?: string } | undefined;
          throw new DeepSeekApiError(
            400,
            err?.message ?? "DeepSeek stream error"
          );
        }
      }
    }

    const toolCalls = collectClientToolCalls(blocks);
    const thinking = collectThinking(blocks);

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

function tryParseQuery(partialJson: string): string | undefined {
  try {
    const parsed = JSON.parse(partialJson) as { query?: unknown };
    return typeof parsed.query === "string" && parsed.query.trim()
      ? parsed.query.trim()
      : undefined;
  } catch {
    return undefined;
  }
}

function parseWebSearchResultContent(content: unknown): {
  results?: WebSearchResultItem[];
  errorCode?: string;
} {
  if (!Array.isArray(content)) return {};

  for (const item of content) {
    if (!item || typeof item !== "object") continue;
    const row = item as {
      type?: string;
      error_code?: string;
      title?: string;
      url?: string;
    };
    if (row.type === "web_search_tool_result_error") {
      return { errorCode: row.error_code || "unavailable" };
    }
  }

  const results: WebSearchResultItem[] = [];
  for (const item of content) {
    if (!item || typeof item !== "object") continue;
    const row = item as { type?: string; title?: string; url?: string };
    if (row.type === "web_search_result" && row.url) {
      results.push({
        title: row.title?.trim() || row.url,
        url: row.url,
      });
    }
  }

  return results.length > 0 ? { results } : {};
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
