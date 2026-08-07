import type { ChatToolStrategy } from "./ChatToolStrategy";
import { WEB_SEARCH_TOOL, type ToolDefinition } from "./LLMAdapter";

/**
 * Go-specific chat persona: patient teacher for rules, tsumego, and table talk.
 * Optional live board dump is appended each turn from the trainer.
 */
export class GoTutorStrategy implements ChatToolStrategy {
  private gameName: string;
  private slug: string;
  private getBoardContext: () => string | undefined;
  private cachedRules: string | null = null;

  constructor(
    gameName: string,
    slug: string,
    getBoardContext?: () => string | undefined,
  ) {
    this.gameName = gameName;
    this.slug = slug;
    this.getBoardContext = getBoardContext ?? (() => undefined);
  }

  private async loadRules(locale: string): Promise<string> {
    if (this.cachedRules) return this.cachedRules;
    try {
      const resp = await fetch(`/boardgames/data/rules/${this.slug}.json`, {
        cache: "no-store",
      });
      const rules = await resp.json();
      this.cachedRules = rules[locale] ?? rules.en ?? "";
    } catch {
      // ignore
    }
    return this.cachedRules ?? "";
  }

  async getSystemPrompt(locale: string): Promise<string> {
    const rules = await this.loadRules(locale);
    const board = this.getBoardContext()?.trim();
    const isZh = locale === "zh";

    const boardBlock = board
      ? isZh
        ? `\n\n## 当前棋盘上下文（来自训练器，请据此讲解）\n\`\`\`\n${board}\n\`\`\`\n`
        : `\n\n## Live board context (from the trainer — teach from this)\n\`\`\`\n${board}\n\`\`\`\n`
      : "";

    return isZh
      ? `你是《${this.gameName}》的耐心围棋老师，面向业余爱好者。风格：温和、具体、少术语堆砌；必要时用比喻。
**全程用简体中文回答**（术语可附英文，但正文必须是中文）。

## 教学原则
- 先确认对方水平与问题，再给分步讲解。
- 死活题 / 对局：优先给「看什么形状 / 先手要点 / 常见错着」；学员未要求看答案时不要直接报出全部正解坐标，也不要擅自替他选定落点除非对方明确要求。
- 规则问答以站内规则为准；需要历史名局、现代规则差异或外部资料时可用 web_search，并简要标明来源。
- 陪聊可以轻松，但不要编造不存在的定式名或棋谱。
- 回答尽量短段 + 条目，方便边下棋边看。

## 站内规则原文
${rules}
${boardBlock}`
      : `You are a patient Go (Weiqi) teacher for the game “${this.gameName}”, helping hobbyists. Tone: warm, concrete, light on jargon; use analogies when helpful.

## Teaching principles
- Gauge the learner’s level, then explain step by step.
- For tsumego: prefer shape cues, key forcing moves, and common mistakes. Do not dump the full solution coordinates unless they ask.
- Prefer site rules below for rules Q&A; use web_search for famous games, modern rule variants, or external refs, and cite briefly.
- Friendly chat is fine — never invent joseki names or game records.
- Keep answers short (bullets) so they can read while playing.

## Site rules
${rules}
${boardBlock}`;
  }

  getTools(): ToolDefinition[] {
    return [WEB_SEARCH_TOOL];
  }
}
