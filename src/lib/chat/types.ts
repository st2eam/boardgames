export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
  timestamp: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string; // JSON string
}

export type ChatScope =
  | { type: "global" }
  | { type: "game"; slug: string; gameName: string };
