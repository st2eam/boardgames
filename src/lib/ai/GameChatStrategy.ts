import type { ChatToolStrategy } from "./ChatToolStrategy";
import type { ToolDefinition } from "./LLMAdapter";

export class GameChatStrategy implements ChatToolStrategy {
  private gameName: string;
  private rules: string;

  constructor(gameName: string, rules: string) {
    this.gameName = gameName;
    this.rules = rules;
  }

  async getSystemPrompt(locale: string): Promise<string> {
    const isZh = locale === "zh";
    return isZh
      ? `你是一个专门解答《${this.gameName}》规则的助手。以下是该游戏的完整规则：\n\n${this.rules}\n\n请仅根据上述规则内容回答问题。如果用户问到规则中没有的内容，请诚实说明。回答要简洁、准确。`
      : `You are an assistant specialized in the rules of ${this.gameName}. Here are the complete rules:\n\n${this.rules}\n\nAnswer questions based only on the rules above. If a question cannot be answered from the rules, honestly say so. Answer concisely and accurately.`;
  }

  getTools(): ToolDefinition[] {
    return [];
  }
}
