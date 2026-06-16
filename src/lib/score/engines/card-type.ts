import type { ScoreConfig } from "@/types/game";
import type { ScoringEngine, ScoreBreakdown } from "./types";

export class CardTypeEngine implements ScoringEngine {
  calculate(selections: Record<string, number>, config: ScoreConfig): ScoreBreakdown {
    const details: ScoreBreakdown["details"] = [];
    let total = 0;

    for (const cardType of config.cardTypes ?? []) {
      const count = selections[cardType.id] ?? 0;
      if (count > 0) {
        const score = cardType.value * count;
        details.push({ label: cardType.name, value: score });
        total += score;
      }
    }

    return { total, cardScore: total, colorBonus: 0, details };
  }
}
