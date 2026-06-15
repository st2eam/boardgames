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
    content: string | null;
    tool_call_id?: string;
    tool_calls?: {
      id: string;
      type: "function";
      function: { name: string; arguments: string };
    }[];
  }[];
  tools?: ToolDefinition[];
  model?: string;
}

export interface ChatChunk {
  content: string;
  toolCalls?: ToolCall[];
}
