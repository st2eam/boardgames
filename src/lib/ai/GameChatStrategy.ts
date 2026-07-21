import type { ChatToolStrategy } from "./ChatToolStrategy";
import { WEB_SEARCH_TOOL, type ToolDefinition } from "./LLMAdapter";

export class GameChatStrategy implements ChatToolStrategy {
  private gameName: string;
  private slug: string;
  private cachedRules: string | null = null;

  constructor(gameName: string, slug: string) {
    this.gameName = gameName;
    this.slug = slug;
  }

  private async loadRules(locale: string): Promise<string> {
    if (this.cachedRules) return this.cachedRules;
    try {
      const resp = await fetch(`/boardgames/data/rules/${this.slug}.json`, { cache: "no-store" });
      const rules = await resp.json();
      this.cachedRules = rules[locale] ?? rules.en ?? "";
    } catch {
      // fallback to empty
    }
    return this.cachedRules ?? "";
  }

  async getSystemPrompt(locale: string): Promise<string> {
    const rules = await this.loadRules(locale);
    const isZh = locale === "zh";
    return isZh
      ? `你是一个专门解答《${this.gameName}》规则的助手。以下是该游戏的完整官方规则：\n\n${rules}\n\n## 回答要求\n- 优先根据上述规则内容回答问题。如果规则中没有相关内容，请诚实说明。\n- 需要最新勘误、官方更新或外部资料时，可以使用 web_search。\n- 回答要简洁、准确；引用搜索结果时简要标明来源。\n## 关于村规/自创规则\n用户可能会问"村规"或自创玩法。你可以：\n1. 先说明官方规则是怎么规定的\n2. 再补充常见的村规变体（如果你知道的话），但必须明确标注"以下是常见的自创玩法，非官方规则"\n3. 提醒玩家：村规需要在开局前所有人达成一致才公平\n如果用户问的村规你完全不了解，不要编造，诚实说"官方规则中没有这个，建议你们自行协商"。`
      : `You are an assistant specialized in the rules of ${this.gameName}. Here are the complete official rules:\n\n${rules}\n\n## Guidelines\n- Prefer answering from the rules above. If something isn't covered, say so honestly.\n- Use web_search for recent errata, official updates, or external references.\n- Be concise and accurate; briefly cite sources when using search results.\n## About House Rules\nUsers may ask about house rules or unofficial variants. You should:\n1. First state what the official rules say\n2. Then mention common house rule variants if you know them, clearly marked as "Unofficial / House Rule"\n3. Remind players that house rules should be agreed upon by all before the game starts\nIf you don't know the house rule they're asking about, don't make it up — say "The official rules don't cover this; we recommend discussing it among yourselves."`;
  }

  getTools(): ToolDefinition[] {
    return [WEB_SEARCH_TOOL];
  }
}
