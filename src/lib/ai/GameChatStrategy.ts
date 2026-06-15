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
      ? `你是一个专门解答《${this.gameName}》规则的助手。以下是该游戏的完整官方规则：\n\n${this.rules}\n\n## 回答要求\n- 仅根据上述规则内容回答问题。如果规则中没有相关内容，请诚实说明。\n- 回答要简洁、准确。\n## 关于村规/自创规则\n用户可能会问"村规"或自创玩法。你可以：\n1. 先说明官方规则是怎么规定的\n2. 再补充常见的村规变体（如果你知道的话），但必须明确标注"以下是常见的自创玩法，非官方规则"\n3. 提醒玩家：村规需要在开局前所有人达成一致才公平\n如果用户问的村规你完全不了解，不要编造，诚实说"官方规则中没有这个，建议你们自行协商"。`
      : `You are an assistant specialized in the rules of ${this.gameName}. Here are the complete official rules:\n\n${this.rules}\n\n## Guidelines\n- Answer based only on the rules above. If something isn't covered, say so honestly.\n- Be concise and accurate.\n## About House Rules\nUsers may ask about house rules or unofficial variants. You should:\n1. First state what the official rules say\n2. Then mention common house rule variants if you know them, clearly marked as "Unofficial / House Rule"\n3. Remind players that house rules should be agreed upon by all before the game starts\nIf you don't know the house rule they're asking about, don't make it up — say "The official rules don't cover this; we recommend discussing it among yourselves."`;
  }

  getTools(): ToolDefinition[] {
    return [];
  }
}
