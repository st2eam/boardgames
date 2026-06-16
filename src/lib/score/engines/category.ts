import type { ScoreConfig } from "@/types/game";
import type { ScoringEngine, ScoreBreakdown } from "./types";

export class CategoryEngine implements ScoringEngine {
  calculate(selections: Record<string, number>, config: ScoreConfig): ScoreBreakdown {
    const details: ScoreBreakdown["details"] = [];
    let total = 0;

    for (const cat of config.categories ?? []) {
      const count = selections[cat.id] ?? 0;
      if (count > 0) {
        const score = cat.value * count;
        details.push({ label: cat.name, value: score });
        total += score;
      }
    }

    return { total, details };
  }
}
