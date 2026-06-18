import type { GameMeta, FlowData, ScoreConfig, TrainerConfig } from "@/types/game";
import { loadJson, loadMarkdown, fileExists } from "./markdown";

const metaCache = new Map<string, GameMeta>();

export class GameRepository {
  static async getAllGameSlugs(): Promise<string[]> {
    return loadJson<string[]>("index.json");
  }

  static async getGameMeta(slug: string): Promise<GameMeta> {
    if (metaCache.has(slug)) return metaCache.get(slug)!;
    const raw = loadJson<Omit<GameMeta, "slug">>(slug, "meta.json");
    const meta = { ...raw, slug };
    metaCache.set(slug, meta);
    return meta;
  }

  static async getGameRules(slug: string, locale: string): Promise<string> {
    return loadMarkdown(slug, locale, "rules.md");
  }

  static async getFlowData(
    slug: string,
    locale: string
  ): Promise<FlowData | null> {
    if (!fileExists(slug, "flow.json")) {
      return null;
    }
    return loadJson<FlowData>(slug, "flow.json");
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

  static async getTrainerConfig(slug: string): Promise<TrainerConfig | null> {
    if (!fileExists(slug, "trainer.json")) {
      return null;
    }
    return loadJson<TrainerConfig>(slug, "trainer.json");
  }

  static hasTrainerConfig(slug: string): boolean {
    return fileExists(slug, "trainer.json");
  }

  static hasFlowData(slug: string): boolean {
    return fileExists(slug, "flow.json");
  }

  static async getFamilyGames(family: string): Promise<GameMeta[]> {
    const slugs = await this.getAllGameSlugs();
    const result: GameMeta[] = [];
    for (const slug of slugs) {
      try {
        const meta = await this.getGameMeta(slug);
        if (meta.family === family) {
          result.push(meta);
        }
      } catch {
        // skip
      }
    }
    return result;
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
