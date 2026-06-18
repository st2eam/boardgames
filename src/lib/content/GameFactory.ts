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
    const hasScore = GameRepository.hasScoreConfig(slug);
    const hasTrainer = GameRepository.hasTrainerConfig(slug);
    const hasCalculator = GameRepository.hasCalculatorConfig(slug);
    return {
      slug: meta.slug,
      name: meta.name,
      players: meta.players,
      duration: meta.duration,
      difficulty: meta.difficulty,
      tags: meta.tags,
      category: meta.category,
      hasFlow,
      hasScore,
      hasTrainer,
      hasCalculator,
      family: meta.family,
      familyOrder: meta.familyOrder,
      variantType: meta.variantType,
      requiresBase: meta.requiresBase,
    };
  }
}
