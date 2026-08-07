/** Client-side cache of on-site rules markdown for LLM play seats. */
const cache = new Map<string, string>();

/**
 * Load bilingual rules JSON written by prebuild (`public/data/rules/<slug>.json`),
 * same source as game-scoped chat (`GameChatStrategy` / `get_game_rules`).
 */
export async function loadGameRulesMarkdown(
  slug: string | undefined,
  locale: string,
): Promise<string> {
  if (!slug) return "";
  const lang = locale === "en" ? "en" : "zh";
  const key = `${slug}:${lang}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const resp = await fetch(`/boardgames/data/rules/${slug}.json`, {
      cache: "force-cache",
    });
    if (!resp.ok) {
      cache.set(key, "");
      return "";
    }
    const rules = (await resp.json()) as Record<string, string>;
    const text = rules[lang] ?? rules.en ?? rules.zh ?? "";
    cache.set(key, text);
    return text;
  } catch {
    cache.set(key, "");
    return "";
  }
}

/** Append full on-site rules into the seat system prompt (chat-parity). */
export function gameRulesSystemBlock(rules: string, zh: boolean): string {
  if (!rules.trim()) return "";
  return zh
    ? `\n\n## 站内完整规则（必须遵守，与官网规则页一致）\n${rules}\n\n决策时优先依据上述规则；动作仍须对引擎合法。`
    : `\n\n## Official on-site rules (must follow — same as the rules page)\n${rules}\n\nPrefer these rules when deciding; actions must still be legal for the engine.`;
}
