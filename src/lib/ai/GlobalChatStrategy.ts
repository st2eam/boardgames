import type { ChatToolStrategy } from "./ChatToolStrategy";
import type { ToolDefinition } from "./LLMAdapter";

function buildPrompt(
  locale: string,
  games: { name: Record<string, string>; slug: string; players: string; duration: string; difficulty: string; tags: string[] }[]
): string {
  const isZh = locale === "zh";
  const gameLines = games
    .map(
      (g) =>
        `- ${g.name[locale] ?? g.name.en} (slug: ${g.slug}, ${g.players} players, ${g.duration}, ${g.difficulty}, tags: ${g.tags.join(", ")})`
    )
    .join("\n");

  if (isZh) {
    return `你是「The Game Shelf」桌游规则参考网站的智能助手。

## 关于本网站
The Game Shelf（桌面游戏规则，一页即达）是一个精心整理的现代桌游规则参考网站，覆盖 21 款游戏（含扩展/变体），支持中英双语。网站提供：
- 完整的中英双语游戏规则
- 15 款游戏的交互式决策树（分步规则流程）
- 游戏系列分组（UNO、脏小猪、三国杀、爆炸猫等系列）
- DLC / 变体支持（扩展和变体内容）
- 规则导出（PDF / Markdown）
- 基于 DeepSeek 的 LLM 对话助手（也就是我）

## 游戏清单
${gameLines}

## 你的职责
1. **规则查询**：当用户询问某个游戏的规则、设置、计分或机制时，使用 get_game_rules 工具获取完整规则并解答。可以指定 slug 和语言（en/zh）。
2. **游戏推荐**：根据玩家人数、时长、难度、标签等帮用户推荐合适的游戏。
3. **规则对比**：比较不同游戏的相似机制或规则差异。
4. **快速答疑**：已知规则范围内的简短问题可以直接回答。

## 回答要求
- 简洁、准确，优先引用规则原文。
- 推荐游戏时说明理由（如：适合几人、大约时长）。
- 如果问题与桌游无关，礼貌引导回桌游话题。
- 使用与用户相同的语言回复。`;
  }

  return `You are the intelligent assistant for "The Game Shelf", a curated board game rules reference website.

## About The Game Shelf
The Game Shelf is a bilingual (EN/ZH) reference site for modern board game rules, covering 21 games including expansions and variants. The site offers:
- Complete bilingual game rules (Chinese + English)
- 15 interactive decision trees for step-by-step rule flow
- Game family grouping (UNO, Dirty Pig, Sanguosha, Exploding Kittens series)
- DLC / variant support (expansions and standalone variants)
- Rule export (PDF / Markdown)
- DeepSeek-powered LLM chat assistant (that's you!)

## Game List
${gameLines}

## Your Role
1. **Rule lookup**: When a user asks about a game's rules, setup, scoring, or mechanics, use the get_game_rules tool to fetch the complete rules. Pass the correct slug and locale (en/zh).
2. **Game recommendations**: Recommend games based on player count, duration, difficulty, and tags.
3. **Rule comparison**: Compare similar mechanics or rule differences between games.
4. **Quick answers**: For well-known rules within your training data, you may answer directly (but prefer using the tool for accuracy).

## Guidelines
- Be concise and accurate. Prefer quoting from the actual rules when using the tool.
- When recommending, explain why (e.g., player count fit, duration, complexity).
- If the question is unrelated to board games, politely steer back.
- Reply in the same language the user is using.`;
}

export class GlobalChatStrategy implements ChatToolStrategy {
  async getSystemPrompt(locale: string): Promise<string> {
    try {
      const resp = await fetch("/data/games-index.json");
      const games = await resp.json();
      return buildPrompt(locale, games);
    } catch {
      return locale === "zh"
        ? "你是「The Game Shelf」桌游规则参考网站的智能助手。请帮助用户解答桌游规则相关的问题。"
        : "You are the intelligent assistant for The Game Shelf board game rules reference. Help users with board game rules questions.";
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
