import type { ToolCall } from "@/lib/chat/types";

/** Anthropic-style client tool (executed in the browser). */
export interface ClientToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/** DeepSeek/Anthropic server-side web search (executed by the API). */
export interface WebSearchToolDefinition {
  type: "web_search_20250305";
  name: "web_search";
  max_uses?: number;
}

export type ToolDefinition = ClientToolDefinition | WebSearchToolDefinition;

export const WEB_SEARCH_TOOL: WebSearchToolDefinition = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 5,
};

export interface AnthropicContentBlock {
  type: string;
  [key: string]: unknown;
}

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
}

export interface ChatParams {
  system: string;
  messages: AnthropicMessage[];
  tools?: ToolDefinition[];
  model?: string;
  maxTokens?: number;
}

export interface ChatChunk {
  content: string;
  status?: "web_search" | "tool_use";
  toolCalls?: ToolCall[];
}
