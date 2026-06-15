import type { Game, GameSummary } from "@/types/game";
import { GameRepository } from "./GameRepository";

export class GameFactory {
  static async createGame(slug: string, locale: string): Promise<Game> {
    const meta = await GameRepository.getGameMeta(slug);
    const rules = await GameRepository.getGameRules(slug, locale);
    const flow = await GameRepository.getFlowData(slug, locale);
    return { meta, rules, flow };
  }

  static async createGameSummary(slug: string): Promise<GameSummary> {
    const meta = await GameRepository.getGameMeta(slug);
    const hasFlow = (await GameRepository.getFlowData(slug, "en")) !== null;
    return {
      slug: meta.slug,
      name: meta.name,
      players: meta.players,
      duration: meta.duration,
      difficulty: meta.difficulty,
      tags: meta.tags,
      category: meta.category,
      hasFlow,
    };
  }
}
