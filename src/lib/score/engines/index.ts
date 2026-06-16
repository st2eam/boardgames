import type { ScoreConfig } from "@/types/game";
import type { ScoringEngine } from "./types";
import { SeaSaltEngine } from "./sea-salt";
import { CardSelectEngine } from "./card-select";
import { CardTypeEngine } from "./card-type";
import { CategoryEngine } from "./category";
import { FeatureCalcEngine } from "./feature-calc";

const engines: Record<string, () => ScoringEngine> = {
  "sea-salt": () => new SeaSaltEngine(),
  "card-sum": () => new CardSelectEngine(),
  "card-type": () => new CardTypeEngine(),
  "category": () => new CategoryEngine(),
  "feature-calc": () => new FeatureCalcEngine(),
};

export function createEngine(config: ScoreConfig): ScoringEngine {
  const factory = engines[config.engine];
  if (!factory) {
    return new CategoryEngine();
  }
  return factory();
}
