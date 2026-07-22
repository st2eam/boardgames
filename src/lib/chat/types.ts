export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
  /** DeepSeek thinking-mode block; must be replayed after tool calls. */
  thinking?: ThinkingBlock;
  timestamp: number;
}

export interface ThinkingBlock {
  thinking: string;
  signature?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string; // JSON string
}

export type ChatScope =
  | { type: "global" }
  | { type: "game"; slug: string; gameName: string };
