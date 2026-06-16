import type { ScoreConfig } from "@/types/game";
import type { ScoringEngine, ScoreBreakdown } from "./types";

export class FeatureCalcEngine implements ScoringEngine {
  calculate(selections: Record<string, number>, config: ScoreConfig): ScoreBreakdown {
    const details: ScoreBreakdown["details"] = [];
    let total = 0;

    for (const feature of config.features ?? []) {
      const input = selections[feature.id] ?? 0;
      if (input > 0) {
        const score = this.evalFormula(feature.formula, input);
        details.push({ label: feature.name, value: score });
        total += score;
      }
    }

    return { total, details };
  }

  private evalFormula(formula: string, n: number): number {
    switch (formula) {
      case "n": return n;
      case "n*2": return n * 2;
      case "n*3": return n * 3;
      case "n+2*shields": return n;
      case "9": return 9;
      default: return n;
    }
  }
}
