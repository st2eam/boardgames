import type { ScoreConfig } from "@/types/game";
import type { ScoringEngine, ScoreBreakdown } from "./types";

export class CardSelectEngine implements ScoringEngine {
  calculate(selections: Record<string, number>, config: ScoreConfig): ScoreBreakdown {
    const details: ScoreBreakdown["details"] = [];
    let total = 0;

    if (config.cardGroups) {
      for (const group of config.cardGroups) {
        let groupTotal = 0;
        for (const card of group.cards) {
          const count = selections[card.id] ?? 0;
          if (count > 0) {
            groupTotal += (card.points ?? 0) * count;
          }
        }
        if (groupTotal > 0) {
          details.push({ label: group.name, value: groupTotal });
          total += groupTotal;
        }
      }
    }

    if (config.cards) {
      for (const card of config.cards) {
        const count = selections[card.id] ?? 0;
        if (count > 0 && card.points) {
          const score = card.points * count;
          details.push({ label: card.name, value: score });
          total += score;
        }
      }
    }

    return { total, cardScore: total, colorBonus: 0, details };
  }
}
