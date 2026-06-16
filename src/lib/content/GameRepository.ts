import type { GameMeta, FlowData, ScoreConfig } from "@/types/game";
import { loadJson, loadMarkdown, fileExists } from "./markdown";

export class GameRepository {
  static async getAllGameSlugs(): Promise<string[]> {
    return loadJson<string[]>("index.json");
  }

  static async getGameMeta(slug: string): Promise<GameMeta> {
    const raw = loadJson<Omit<GameMeta, "slug">>(slug, "meta.json");
    return { ...raw, slug };
  }

  static async getGameRules(slug: string, locale: string): Promise<string> {
    return loadMarkdown(slug, locale, "rules.md");
  }

  static async getFlowData(
    slug: string,
    locale: string
  ): Promise<FlowData | null> {
    if (!fileExists(slug, locale, "flow.json")) {
      return null;
    }
    return loadJson<FlowData>(slug, locale, "flow.json");
  }

  static async getScoreConfig(slug: string): Promise<ScoreConfig | null> {
    if (!fileExists(slug, "score.json")) {
      return null;
    }
    return loadJson<ScoreConfig>(slug, "score.json");
  }

  static hasScoreConfig(slug: string): boolean {
    return fileExists(slug, "score.json");
  }

  static async getAllTags(): Promise<string[]> {
    const slugs = await this.getAllGameSlugs();
    const tagSet = new Set<string>();
    for (const slug of slugs) {
      try {
        const meta = await this.getGameMeta(slug);
        meta.tags.forEach((tag) => tagSet.add(tag));
      } catch {
        // Skip games with invalid meta
      }
    }
    return Array.from(tagSet).sort();
  }
}
