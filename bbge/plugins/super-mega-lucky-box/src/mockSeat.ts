import type { PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";

type GridCard = {
  id: string;
  grid: number[];
  marked?: boolean[];
  rows: { kind: string; value?: number }[];
  columns: { kind: string; value?: number }[];
};
type Bonus = { id: string; reward: { kind: string; value?: number } };
type SmlbView = {
  stage?: string;
  currentNumber?: number | null;
  you?: {
    id: string;
    lightning: number;
    numberDone: boolean;
    cards: GridCard[];
    pendingBonuses: Bonus[];
    startingOffers?: GridCard[] | null;
    roundOffers?: GridCard[] | null;
  } | null;
};

function crossedByChoice(card: GridCard, index: number): number {
  const row = Math.floor(index / 3);
  const col = index % 3;
  const rowCount = [0, 1, 2].filter(
    (x) => x !== col && card.marked?.[row * 3 + x],
  ).length;
  const colCount = [0, 1, 2].filter(
    (x) => x !== row && card.marked?.[x * 3 + col],
  ).length;
  return Number(rowCount === 2) + Number(colCount === 2);
}

function bestTarget(
  cards: GridCard[],
  predicate: (value: number) => boolean,
): { cardId: string; cellIndex: number; completes: number } | null {
  let best: { cardId: string; cellIndex: number; completes: number } | null = null;
  for (const card of cards) {
    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
      const value = card.grid[cellIndex];
      if (card.marked?.[cellIndex] || value == null || !predicate(value)) continue;
      const completes = crossedByChoice(card, cellIndex);
      if (!best || completes > best.completes) {
        best = { cardId: card.id, cellIndex, completes };
      }
    }
  }
  return best;
}

function chooseThree(cards: GridCard[]): string[] {
  let bestIds = cards.slice(0, 3).map((card) => card.id);
  let bestCoverage = -1;
  for (let a = 0; a < cards.length; a++) {
    for (let b = a + 1; b < cards.length; b++) {
      for (let c = b + 1; c < cards.length; c++) {
        const coverage = new Set([
          ...cards[a]!.grid,
          ...cards[b]!.grid,
          ...cards[c]!.grid,
        ]).size;
        if (coverage > bestCoverage) {
          bestCoverage = coverage;
          bestIds = [cards[a]!.id, cards[b]!.id, cards[c]!.id];
        }
      }
    }
  }
  return bestIds;
}

function bonusAction(view: SmlbView, id: PlayerId, bonus: Bonus) {
  const target =
    bonus.reward.kind === "number"
      ? bestTarget(view.you!.cards, (value) => value === bonus.reward.value)
      : bonus.reward.kind === "wild"
        ? bestTarget(view.you!.cards, () => true)
        : null;
  return {
    type: "resolveBonus",
    playerId: id,
    payload: {
      bonusId: bonus.id,
      ...(target
        ? { cardId: target.cardId, cellIndex: target.cellIndex }
        : {}),
    },
  };
}

function decide(view: SmlbView, id: PlayerId) {
  const you = view.you;
  if (!you) return { type: "skipNumber", playerId: id, payload: {} };
  if (view.stage === "startingDraft") {
    return {
      type: "keepStartingCards",
      playerId: id,
      payload: { cardIds: chooseThree(you.startingOffers ?? []) },
    };
  }
  if (view.stage === "roundDraft") {
    const offers = you.roundOffers ?? [];
    const existing = new Set(you.cards.flatMap((card) => card.grid));
    const chosen = offers
      .slice()
      .sort((a, b) => {
        const newA = a.grid.filter((n) => !existing.has(n)).length;
        const newB = b.grid.filter((n) => !existing.has(n)).length;
        return newB - newA || a.id.localeCompare(b.id);
      })[0];
    return {
      type: "pickRoundCard",
      playerId: id,
      payload: { cardId: chosen?.id ?? "" },
    };
  }
  if (you.numberDone && you.pendingBonuses.length) {
    const ordered = you.pendingBonuses.slice().sort((a, b) => {
      const score = (bonus: Bonus) =>
        bonus.reward.kind === "wild"
          ? 5
          : bonus.reward.kind === "number"
            ? 4
            : bonus.reward.kind === "lightning"
              ? 3
              : bonus.reward.kind === "star"
                ? 2
                : 1;
      return score(b) - score(a);
    });
    return bonusAction(view, id, ordered[0]!);
  }

  const number = view.currentNumber;
  if (number == null) return { type: "skipNumber", playerId: id, payload: {} };
  let best:
    | {
        cardId: string;
        cellIndex: number;
        adjustments: (-1 | 1)[];
        score: number;
      }
    | null = null;
  for (const card of you.cards) {
    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
      if (card.marked?.[cellIndex]) continue;
      const target = card.grid[cellIndex]!;
      const forward = (target - number + 9) % 9;
      const backward = (number - target + 9) % 9;
      const cost = Math.min(forward, backward);
      if (cost > you.lightning) continue;
      const direction: -1 | 1 = forward <= backward ? 1 : -1;
      const candidate = {
        cardId: card.id,
        cellIndex,
        adjustments: Array.from({ length: cost }, () => direction),
        score: crossedByChoice(card, cellIndex) * 10 - cost,
      };
      if (!best || candidate.score > best.score) best = candidate;
    }
  }
  if (!best) return { type: "skipNumber", playerId: id, payload: {} };
  return { type: "markNumber", playerId: id, payload: best };
}

/** Deterministic heuristic seat used without an API key and as LLM fallback. */
export function createMockSmlbSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as SmlbView;
      const action = decide(view, id);
      opts?.onProgress?.({
        note:
          view.stage === "startingDraft"
            ? "策略：保留数字分布较广的三张卡"
            : view.stage === "roundDraft"
              ? "策略：补充尚未覆盖的数字"
              : "策略：完成数字格并优先连接奖励",
      });
      return { action: action as never };
    },
  };
}
