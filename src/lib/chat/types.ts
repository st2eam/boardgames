export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
  /** DeepSeek thinking-mode block; must be replayed after tool calls. */
  thinking?: ThinkingBlock;
  /** Streamed content-block activities shown in the UI. */
  activities?: ChatActivity[];
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

export interface WebSearchResultItem {
  title: string;
  url: string;
}

export type ChatActivityKind =
  | "thinking"
  | "web_search"
  | "get_game_rules"
  | "tool_use";

export type ChatActivityStatus = "running" | "done" | "error";

export interface ChatActivity {
  id: string;
  kind: ChatActivityKind;
  status: ChatActivityStatus;
  /** Accumulated thinking text (for thinking activities). */
  thinkingText?: string;
  /** Parsed web_search query. */
  query?: string;
  /** web_search_tool_result_error.error_code */
  errorCode?: string;
  results?: WebSearchResultItem[];
  toolName?: string;
}

export type ChatScope =
  | { type: "global" }
  | { type: "game"; slug: string; gameName: string };
