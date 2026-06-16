import type { ScoreConfig } from "@/types/game";

export interface ScoreBreakdown {
  total: number;
  details: { label: Record<"en" | "zh", string>; value: number }[];
}

export interface ScoringEngine {
  calculate(selections: Record<string, number>, config: ScoreConfig): ScoreBreakdown;
}

export type EngineFactory = (config: ScoreConfig) => ScoringEngine;
