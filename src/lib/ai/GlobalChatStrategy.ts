import type { ChatToolStrategy } from "./ChatToolStrategy";
import type { ToolDefinition } from "./LLMAdapter";

export class GlobalChatStrategy implements ChatToolStrategy {
  async getSystemPrompt(locale: string): Promise<string> {
    const isZh = locale === "zh";
    try {
      const resp = await fetch("/data/games-index.json");
      const games = await resp.json();
      const gameList = games
        .map(
          (g: { name: Record<string, string>; slug: string }) =>
            `- ${g.name[locale] ?? g.name.en} (slug: ${g.slug})`
        )
        .join("\n");

      return isZh
        ? `你是一个桌游规则助手。你可以帮助用户查询以下游戏的规则：\n\n${gameList}\n\n当用户询问某个具体游戏的规则时，使用 get_game_rules 工具来获取该游戏的完整规则。回答要简洁、准确。如果用户问的问题与桌游无关，请礼貌地引导他们回到桌游相关话题。`
        : `You are a board game rules assistant. You can help users with rules for the following games:\n\n${gameList}\n\nWhen a user asks about a specific game's rules, use the get_game_rules tool to fetch the complete rules. Answer concisely and accurately. If users ask about non-board-game topics, politely guide them back to board game topics.`;
    } catch {
      return isZh
        ? "你是一个桌游规则助手。请帮助用户解答桌游规则相关的问题。"
        : "You are a board game rules assistant. Help users with board game rules questions.";
    }
  }

  getTools(): ToolDefinition[] {
    return [
      {
        type: "function",
        function: {
          name: "get_game_rules",
          description:
            "Fetch the complete rules for a specific board game. Use this when the user asks about a game's rules, setup, scoring, or specific mechanics.",
          parameters: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description:
                  "The game identifier (slug). E.g., 'catan', 'uno'.",
              },
              locale: {
                type: "string",
                enum: ["en", "zh"],
                description: "The language for the rules.",
              },
            },
            required: ["slug", "locale"],
          },
        },
      },
    ];
  }
}
