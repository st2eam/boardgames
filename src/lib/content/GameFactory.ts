import type { Game, GameSummary } from "@/types/game";
import { GameRepository } from "./GameRepository";
import { parseRuleDocument } from "./ruleDocument";

export class GameFactory {
  static async createGame(slug: string, locale: string): Promise<Game> {
    const meta = await GameRepository.getGameMeta(slug);
    const rules = await GameRepository.getGameRules(slug, locale);
    return { meta, rules, ruleDocument: parseRuleDocument(rules) };
  }

  static async createGameSummary(slug: string): Promise<GameSummary> {
    const meta = await GameRepository.getGameMeta(slug);
    const hasScore = GameRepository.hasScoreConfig(slug);
    const hasTrainer = GameRepository.hasTrainerConfig(slug);
    const hasCalculator = GameRepository.hasCalculatorConfig(slug);
    const hasPlay = GameRepository.hasPlayConfig(slug);
    const trainerConfig = hasTrainer ? await GameRepository.getTrainerConfig(slug) : null;
    return {
      slug: meta.slug,
      name: meta.name,
      players: meta.players,
      duration: meta.duration,
      difficulty: meta.difficulty,
      tags: meta.tags,
      category: meta.category,
      hasScore,
      hasTrainer,
      hasCalculator,
      hasPlay,
      trainerType: trainerConfig?.type,
      family: meta.family,
      familyOrder: meta.familyOrder,
      variantType: meta.variantType,
      requiresBase: meta.requiresBase,
      price: meta.price,
      bggRank: meta.bggRank,
    };
  }
}
