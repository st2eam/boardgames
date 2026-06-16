import type { ScoreConfig } from "@/types/game";
import type { ScoringEngine, ScoreBreakdown, RoundEndMode } from "./types";

const COLLECTOR_TABLES: Record<string, number[]> = {
  shell: [0, 0, 2, 4, 6, 8, 10],
  octopus: [0, 0, 3, 6, 9, 12],
  penguin: [0, 1, 3, 5],
  sailor: [0, 0, 5],
};

const MULTIPLIER_RULES: Record<string, { per: string; value: number }> = {
  lighthouse: { per: "boat", value: 1 },
  school: { per: "fish", value: 1 },
  colony: { per: "penguin", value: 2 },
  captain: { per: "sailor", value: 3 },
};

const BASE_DUO_PAIRS: string[][] = [
  ["crab", "crab"],
  ["boat", "boat"],
  ["fish", "fish"],
  ["swimmer", "shark"],
];

const EXTRA_DUO_PAIRS: string[][] = [
  ["jellyfish", "swimmer"],
  ["lobster", "crab"],
];

export class SeaSaltEngine implements ScoringEngine {
  calculate(selections: Record<string, number>, config: ScoreConfig, mode?: RoundEndMode): ScoreBreakdown {
    const details: ScoreBreakdown["details"] = [];
    let cardScore = 0;

    const hasExpansion = config.cards?.some((c) => c.id === "jellyfish" || c.id === "lobster");
    const duoPairs = hasExpansion
      ? [...BASE_DUO_PAIRS, ...EXTRA_DUO_PAIRS]
      : BASE_DUO_PAIRS;

    // Duo pairs
    let duoCount = 0;
    for (const pair of duoPairs) {
      if (pair[0] === pair[1]) {
        const count = selections[pair[0]] ?? 0;
        duoCount += Math.floor(count / 2);
      } else {
        const a = selections[pair[0]] ?? 0;
        const b = selections[pair[1]] ?? 0;
        duoCount += Math.min(a, b);
      }
    }
    if (duoCount > 0) {
      details.push({ label: { en: "Duo Pairs", zh: "配对" }, value: duoCount });
      cardScore += duoCount;
    }

    // Starfish (trio bonus: +2 per starfish used with a duo)
    const starfishCount = selections["starfish"] ?? 0;
    if (starfishCount > 0 && duoCount > 0) {
      const trioBonus = Math.min(starfishCount, duoCount) * 2;
      details.push({ label: { en: "Starfish Trio", zh: "海星三条" }, value: trioBonus });
      cardScore += trioBonus;
    }

    // Collectors (with seahorse wild support)
    const seahorseCount = selections["seahorse"] ?? 0;
    let seahorseUsed = 0;

    for (const [id, table] of Object.entries(COLLECTOR_TABLES)) {
      let count = selections[id] ?? 0;
      if (count > 0 && seahorseUsed < seahorseCount) {
        const withSeahorse = count + 1;
        const scoreWith = table[Math.min(withSeahorse, table.length - 1)] ?? 0;
        const scoreWithout = table[Math.min(count, table.length - 1)] ?? 0;
        if (scoreWith > scoreWithout) {
          count = withSeahorse;
          seahorseUsed++;
        }
      }
      if (count > 0) {
        const score = table[Math.min(count, table.length - 1)] ?? 0;
        if (score > 0) {
          const card = config.cards?.find((c) => c.id === id);
          const name = card?.name ?? { en: id, zh: id };
          details.push({ label: name, value: score });
          cardScore += score;
        }
      }
    }

    // Multipliers
    for (const [id, rule] of Object.entries(MULTIPLIER_RULES)) {
      const hasMultiplier = (selections[id] ?? 0) > 0;
      if (hasMultiplier) {
        const targetCount = selections[rule.per] ?? 0;
        const score = targetCount * rule.value;
        if (score > 0) {
          const card = config.cards?.find((c) => c.id === id);
          const name = card?.name ?? { en: id, zh: id };
          details.push({ label: name, value: score });
          cardScore += score;
        }
      }
    }

    // Crab Army (1 pt per crab card)
    const crabArmyCount = selections["crab-army"] ?? 0;
    if (crabArmyCount > 0) {
      const crabCount = selections["crab"] ?? 0;
      if (crabCount > 0) {
        details.push({ label: { en: "Crab Army", zh: "螃蟹大军" }, value: crabCount });
        cardScore += crabCount;
      }
    }

    // Mermaids
    const mermaidCount = selections["mermaid"] ?? 0;
    const colorCounts = this.getColorCounts(selections, config);
    colorCounts.sort((a, b) => b - a);

    if (mermaidCount > 0 && colorCounts.length > 0) {
      let mermaidTotal = 0;
      for (let i = 0; i < mermaidCount && i < colorCounts.length; i++) {
        mermaidTotal += colorCounts[i];
      }
      if (mermaidTotal > 0) {
        details.push({ label: { en: "Mermaids", zh: "美人鱼" }, value: mermaidTotal });
        cardScore += mermaidTotal;
      }
    }

    // Color bonus (max color count, separate from mermaids)
    const colorBonus = colorCounts[0] ?? 0;

    // Calculate total based on round-end mode
    let total: number;
    switch (mode) {
      case "last-chance-win":
        total = cardScore + colorBonus;
        break;
      case "last-chance-lose":
        total = colorBonus;
        break;
      case "stop":
      default:
        total = cardScore;
        break;
    }

    return { total, cardScore, colorBonus, details };
  }

  private getColorCounts(selections: Record<string, number>, config: ScoreConfig): number[] {
    const counts: number[] = [];
    if (config.colorDist) {
      for (const color of config.colorDist) {
        const count = selections[`color:${color.id}`] ?? 0;
        if (count > 0) counts.push(count);
      }
    }
    return counts;
  }
}
