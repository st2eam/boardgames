import type { ScoreConfig } from "@/types/game";

export interface ScoreBreakdown {
  total: number;
  cardScore: number;
  colorBonus: number;
  details: { label: Record<"en" | "zh", string>; value: number }[];
}

export type RoundEndMode = "stop" | "last-chance-win" | "last-chance-lose";

export interface ScoringEngine {
  calculate(selections: Record<string, number>, config: ScoreConfig, mode?: RoundEndMode): ScoreBreakdown;
}

export type EngineFactory = (config: ScoreConfig) => ScoringEngine;
