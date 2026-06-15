import type { ToolCall } from "@/lib/chat/types";

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export interface ChatParams {
  messages: {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    tool_call_id?: string;
    tool_calls?: ToolCall[];
  }[];
  tools?: ToolDefinition[];
  model?: string;
}

export interface ChatChunk {
  content: string;
  toolCalls?: ToolCall[];
}
