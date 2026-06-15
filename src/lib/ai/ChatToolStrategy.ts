import type { ToolDefinition } from "./LLMAdapter";

export interface ChatToolStrategy {
  getSystemPrompt(locale: string): Promise<string>;
  getTools(): ToolDefinition[];
}
