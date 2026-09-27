import type { ApplyContext, Event, PlayerId } from "@bbge/core";
import { produce } from "immer";
import { LUCKY_BOX_CARDS, validateLuckyBoxDeck } from "./cards";
import type { LuckyBoxCard, Reward } from "./cards";
import type {
  AdvanceKind,
  LuckyBoxBoardCard,
  PendingBonus,
  SmlbAction,
  SmlbConfig,
  SmlbPlayer,
  SmlbState,
} from "./state";

const ROUND_CARD_POINTS = [15, 12, 10, 8] as const;
const ALL_NUMBER_CARDS = Array.from({ length: 9 }, (_, i) => i + 1).flatMap(
  (number) => [number, number],
);

function emptyBoardCard(cardId: string): LuckyBoxBoardCard {
  return {
    cardId,
    marked: Array(9).fill(false),
    claimedRows: Array(3).fill(false),
    claimedColumns: Array(3).fill(false),
  };
}

function initialPlayer(id: PlayerId, name: string): SmlbPlayer {
  return {
    id,
    name,
    startingOffers: [],
    cards: [],
    lightning: 4,
    moons: 0,
    starsThisRound: 0,
    roundScores: [0, 0, 0, 0],
    score: 0,
    numberDone: false,
    pendingBonuses: [],
    roundOffers: [],
    pickedRoundCardId: null,
    incompletePoints: 0,
    moonPoints: 0,
    finalScore: 0,
  };
}

export function createSmlbState(
  config: SmlbConfig,
  ctx: ApplyContext,
): SmlbState {
  if (config.playerIds.length < 1 || config.playerIds.length > 6) {
    throw new Error("Super Mega Lucky Box supports 1–6 players");
  }
  const issues = validateLuckyBoxDeck();
  if (issues.length) throw new Error("Invalid Lucky Box deck: " + issues[0]);

  const luckyDeck = ctx.rng.shuffle(LUCKY_BOX_CARDS.map((card) => card.id));
  const players = config.playerIds.map((id) => {
    const player = initialPlayer(id, config.playerNames[id] ?? id);
    player.startingOffers = luckyDeck.splice(0, 5);
    return player;
  });
  const numberDeck = ctx.rng.shuffle(ALL_NUMBER_CARDS).slice(0, 9);

  return {
    schemaVersion: 1,
    pluginId: "super-mega-lucky-box",
    seed: config.seed ?? "super-mega-lucky-box",
    phase: "startingDraft",
    advanceKind: null,
    players,
    round: 1,
    numberDeck,
    numberCursor: 0,
    currentNumber: null,
    revealedNumbers: [],
    luckyDeck,
    luckyDiscard: [],
    // Initial card and number shuffles consume 59 + 17 values from ctx.rng.
    rngCursor: 76,
    winners: [],
  };
}

function findPlayer(state: SmlbState, id: PlayerId): SmlbPlayer | undefined {
  return state.players.find((player) => player.id === id);
}

function cardDefinition(cardId: string): LuckyBoxCard | undefined {
  return LUCKY_BOX_CARDS.find((card) => card.id === cardId);
}

function openCells(
  player: SmlbPlayer,
  predicate: (value: number) => boolean,
): { cardId: string; cellIndex: number }[] {
  const cells: { cardId: string; cellIndex: number }[] = [];
  for (const boardCard of player.cards) {
    const face = cardDefinition(boardCard.cardId);
    if (!face) continue;
    face.grid.forEach((value, cellIndex) => {
      if (!boardCard.marked[cellIndex] && predicate(value)) {
        cells.push({ cardId: boardCard.cardId, cellIndex });
      }
    });
  }
  return cells;
}

function stepNumber(number: number, step: -1 | 1): number {
  return ((number - 1 + step + 9) % 9) + 1;
}

function adjustedNumber(number: number, adjustments: (-1 | 1)[]): number {
  return adjustments.reduce(stepNumber, number);
}

function circularDistance(a: number, b: number): number {
  const forward = (b - a + 9) % 9;
  return Math.min(forward, (9 - forward) % 9);
}

export function canMarkRevealedNumber(
  state: SmlbState,
  player: SmlbPlayer,
): boolean {
  if (state.currentNumber == null) return false;
  return openCells(player, () => true).some(({ cardId, cellIndex }) => {
    const value = cardDefinition(cardId)!.grid[cellIndex]!;
    return circularDistance(state.currentNumber!, value) <= player.lightning;
  });
}

function pendingBonus(
  card: LuckyBoxCard,
  line: "row" | "column",
  index: number,
): PendingBonus {
  return {
    id: card.id + ":" + line + ":" + index,
    cardId: card.id,
    line,
    index,
    reward: line === "row" ? card.rows[index]! : card.columns[index]!,
  };
}

function queueNewlyCompletedLines(
  player: SmlbPlayer,
  boardCard: LuckyBoxBoardCard,
  events: Event[],
): void {
  const face = cardDefinition(boardCard.cardId);
  if (!face) return;
  for (let row = 0; row < 3; row++) {
    const cells = [0, 1, 2].map((col) => row * 3 + col);
    if (
      !boardCard.claimedRows[row] &&
      cells.every((index) => boardCard.marked[index])
    ) {
      boardCard.claimedRows[row] = true;
      const bonus = pendingBonus(face, "row", row);
      player.pendingBonuses.push(bonus);
      events.push({
        type: "smlb/lineCompleted",
        payload: {
          playerId: player.id,
          cardId: face.id,
          line: "row",
          index: row,
          bonusId: bonus.id,
          reward: bonus.reward,
        },
      });
    }
  }
  for (let col = 0; col < 3; col++) {
    const cells = [0, 1, 2].map((row) => row * 3 + col);
    if (
      !boardCard.claimedColumns[col] &&
      cells.every((index) => boardCard.marked[index])
    ) {
      boardCard.claimedColumns[col] = true;
      const bonus = pendingBonus(face, "column", col);
      player.pendingBonuses.push(bonus);
      events.push({
        type: "smlb/lineCompleted",
        payload: {
          playerId: player.id,
          cardId: face.id,
          line: "column",
          index: col,
          bonusId: bonus.id,
          reward: bonus.reward,
        },
      });
    }
  }
}

function markCell(
  player: SmlbPlayer,
  cardId: string,
  cellIndex: number,
  source: "number" | "numberBonus" | "wild",
  events: Event[],
): void {
  const boardCard = player.cards.find((card) => card.cardId === cardId)!;
  const face = cardDefinition(cardId)!;
  boardCard.marked[cellIndex] = true;
  events.push({
    type: "smlb/squareMarked",
    payload: {
      playerId: player.id,
      cardId,
      cellIndex,
      value: face.grid[cellIndex],
      source,
    },
  });
  queueNewlyCompletedLines(player, boardCard, events);
}

function allPlayersResponded(state: SmlbState): boolean {
  return state.players.every(
    (player) =>
      player.numberDone && player.pendingBonuses.length === 0,
  );
}

function moveToAdvance(
  state: SmlbState,
  kind: AdvanceKind,
  events: Event[],
): void {
  state.phase = "advancing";
  state.advanceKind = kind;
  events.push({
    type: "smlb/advanceReady",
    payload: { kind, round: state.round, number: state.numberCursor },
  });
}

function maybeFinishNumberSelection(
  state: SmlbState,
  events: Event[],
): void {
  if (state.phase !== "selecting" || !allPlayersResponded(state)) return;
  moveToAdvance(
    state,
    state.numberCursor >= 9 ? "scoreRound" : "revealNumber",
    events,
  );
}

function setupShuffle(
  state: SmlbState,
  ctx: ApplyContext,
): <U>(items: U[]) => U[] {
  const initialCursor = state.rngCursor;
  let warmed = false;
  return function shuffle<U>(items: U[]): U[] {
    if (!warmed) {
      for (let i = 0; i < initialCursor; i++) ctx.rng.next();
      warmed = true;
    }
    const shuffled = ctx.rng.shuffle(items);
    state.rngCursor += Math.max(0, items.length - 1);
    return shuffled;
  };
}

function drawLuckyCards(
  state: SmlbState,
  count: number,
  shuffle: <T>(items: T[]) => T[],
): string[] {
  const result: string[] = [];
  while (result.length < count) {
    if (state.luckyDeck.length === 0) {
      if (state.luckyDiscard.length === 0) break;
      state.luckyDeck = shuffle(state.luckyDiscard);
      state.luckyDiscard = [];
    }
    const card = state.luckyDeck.pop();
    if (!card) break;
    result.push(card);
  }
  return result;
}

function starPoints(stars: number): number {
  return stars >= 3 ? 9 : stars === 2 ? 4 : stars === 1 ? 1 : 0;
}

export function scoreSoloMoons(moons: number): number {
  if (moons <= 0) return -6;
  if (moons === 1) return -2;
  if (moons === 2) return 0;
  if (moons === 3) return 1;
  if (moons === 4) return 3;
  if (moons === 5) return 6;
  return 10;
}

export function scoreMoonTokens(players: Pick<SmlbPlayer, "id" | "moons">[]): Record<string, number> {
  if (players.length === 1) {
    return { [players[0]!.id]: scoreSoloMoons(players[0]!.moons) };
  }
  const highest = Math.max(...players.map((player) => player.moons));
  const lowest = Math.min(...players.map((player) => player.moons));
  const scores: Record<string, number> = {};
  for (const player of players) {
    if (players.length === 2) {
      scores[player.id] = player.moons === highest ? 6 : 0;
    } else {
      scores[player.id] =
        (player.moons === highest ? 6 : 0) -
        (player.moons === lowest ? 6 : 0);
    }
  }
  return scores;
}

export function soloScoreRating(score: number): string | null {
  if (score <= 44) return "unlucky";
  if (score <= 49) return "goodStart";
  if (score <= 54) return "onTrolley";
  if (score <= 59) return "greatGame";
  if (score <= 64) return "superScore";
  if (score <= 69) return "megaGame";
  return "luckyChampion";
}

function completed(boardCard: LuckyBoxBoardCard): boolean {
  return boardCard.marked.every(Boolean);
}

function scoreRound(state: SmlbState, events: Event[], shuffle: <T>(items: T[]) => T[]): void {
  const roundCardPoints = ROUND_CARD_POINTS[state.round - 1]!;
  for (const player of state.players) {
    const completedCards = player.cards.filter(completed);
    const incompleteCards = player.cards.filter((card) => !completed(card));
    const cardsPoints = completedCards.length * roundCardPoints;
    const stars = starPoints(player.starsThisRound);
    const gain = cardsPoints + stars;
    player.roundScores[state.round - 1] = gain;
    player.score += gain;
    player.cards = incompleteCards;
    state.luckyDiscard.push(...completedCards.map((card) => card.cardId));
    events.push({
      type: "smlb/roundScored",
      payload: {
        playerId: player.id,
        round: state.round,
        completedCards: completedCards.length,
        cardsPoints,
        stars: player.starsThisRound,
        starPoints: stars,
        gained: gain,
        total: player.score,
      },
    });
  }

  if (state.round === 4) {
    const moonScores = scoreMoonTokens(state.players);
    for (const player of state.players) {
      player.incompletePoints = Math.floor(
        player.cards.reduce(
          (sum, card) => sum + card.marked.filter(Boolean).length,
          0,
        ) / 2,
      );
      player.moonPoints = moonScores[player.id] ?? 0;
      player.finalScore =
        player.score + player.incompletePoints + player.moonPoints;
    }
    const highScore = Math.max(...state.players.map((player) => player.finalScore));
    const tiedOnScore = state.players.filter((player) => player.finalScore === highScore);
    const highMoons = Math.max(...tiedOnScore.map((player) => player.moons));
    state.winners = tiedOnScore
      .filter((player) => player.moons === highMoons)
      .map((player) => player.id);
    state.phase = "finished";
    state.advanceKind = null;
    events.push({
      type: "smlb/gameFinished",
      payload: {
        winners: state.winners,
        scores: Object.fromEntries(
          state.players.map((player) => [player.id, player.finalScore]),
        ),
      },
    });
    return;
  }

  for (const player of state.players) {
    player.roundOffers = drawLuckyCards(state, 3, shuffle);
    player.pickedRoundCardId = null;
  }
  state.phase = "roundDraft";
  state.advanceKind = null;
  events.push({
    type: "smlb/roundDraftStarted",
    payload: { round: state.round + 1 },
  });
}

function applyAdvance(
  state: SmlbState,
  events: Event[],
  shuffle: <T>(items: T[]) => T[],
): void {
  const kind = state.advanceKind;
  if (!kind) return;
  if (kind === "revealNumber") {
    const number = state.numberDeck[state.numberCursor];
    if (number == null) return;
    state.currentNumber = number;
    state.numberCursor += 1;
    state.revealedNumbers.push(number);
    state.phase = "selecting";
    state.advanceKind = null;
    for (const player of state.players) {
      player.numberDone = false;
      player.pendingBonuses = [];
    }
    events.push({
      type: "smlb/numberRevealed",
      payload: { round: state.round, index: state.numberCursor, number },
    });
    return;
  }

  if (kind === "scoreRound") {
    scoreRound(state, events, shuffle);
    return;
  }

  for (const player of state.players) {
    const selected = player.pickedRoundCardId;
    for (const id of player.roundOffers) {
      if (id !== selected) state.luckyDiscard.push(id);
    }
    if (selected) player.cards.push(emptyBoardCard(selected));
    player.roundOffers = [];
    player.pickedRoundCardId = null;
    player.starsThisRound = 0;
    player.numberDone = false;
    player.pendingBonuses = [];
  }
  state.round += 1;
  state.numberDeck = shuffle(ALL_NUMBER_CARDS).slice(0, 9);
  state.numberCursor = 0;
  state.currentNumber = null;
  state.revealedNumbers = [];
  state.phase = "advancing";
  state.advanceKind = "revealNumber";
  events.push({
    type: "smlb/roundStarted",
    payload: { round: state.round },
  });
}

function rewardTargets(
  player: SmlbPlayer,
  reward: Reward,
): { cardId: string; cellIndex: number }[] {
  if (reward.kind === "number") {
    return openCells(player, (value) => value === reward.value);
  }
  if (reward.kind === "wild") return openCells(player, () => true);
  return [];
}

function validateTarget(
  player: SmlbPlayer,
  reward: Reward,
  cardId: string | undefined,
  cellIndex: number | undefined,
): boolean {
  const targets = rewardTargets(player, reward);
  if (targets.length === 0) return cardId == null && cellIndex == null;
  if (
    cardId == null ||
    cellIndex == null ||
    !Number.isInteger(cellIndex)
  ) {
    return false;
  }
  return targets.some(
    (target) => target.cardId === cardId && target.cellIndex === cellIndex,
  );
}

export function validateSmlbAction(
  state: SmlbState,
  action: SmlbAction,
): true | { error: string; code?: string } {
  const player = findPlayer(state, action.playerId);
  if (!player) return { error: "unknown player", code: "unknown-player" };

  if (action.type === "advance") {
    return state.phase === "advancing"
      ? true
      : { error: "game is not waiting to advance", code: "wrong-phase" };
  }
  if (action.type === "keepStartingCards") {
    if (state.phase !== "startingDraft") {
      return { error: "starting draft is over", code: "wrong-phase" };
    }
    const ids = action.payload.cardIds;
    if (
      !Array.isArray(ids) ||
      ids.length !== 3 ||
      new Set(ids).size !== 3 ||
      ids.some((id) => !player.startingOffers.includes(id))
    ) {
      return { error: "choose exactly three offered cards", code: "bad-draft" };
    }
    return true;
  }
  if (action.type === "pickRoundCard") {
    if (state.phase !== "roundDraft") {
      return { error: "round draft is not open", code: "wrong-phase" };
    }
    if (!player.roundOffers.includes(action.payload.cardId)) {
      return { error: "card is not in your offer", code: "bad-draft" };
    }
    if (player.pickedRoundCardId) {
      return { error: "already picked a card", code: "already-acted" };
    }
    return true;
  }
  if (state.phase !== "selecting") {
    return { error: "no number is being resolved", code: "wrong-phase" };
  }

  if (action.type === "markNumber") {
    if (player.numberDone) {
      return { error: "already responded to this number", code: "already-acted" };
    }
    const face = cardDefinition(action.payload.cardId);
    const boardCard = player.cards.find(
      (card) => card.cardId === action.payload.cardId,
    );
    const index = action.payload.cellIndex;
    const adjustments = action.payload.adjustments;
    if (!face || !boardCard || !Number.isInteger(index) || index < 0 || index > 8) {
      return { error: "choose an open square on one of your cards", code: "bad-square" };
    }
    if (boardCard.marked[index]) {
      return { error: "square is already crossed", code: "square-used" };
    }
    if (
      !Array.isArray(adjustments) ||
      adjustments.some((step) => step !== 1 && step !== -1) ||
      adjustments.length > player.lightning
    ) {
      return { error: "invalid Lightning adjustment", code: "bad-lightning" };
    }
    if (
      state.currentNumber == null ||
      adjustedNumber(state.currentNumber, adjustments) !== face.grid[index]
    ) {
      return { error: "adjusted number does not match the square", code: "bad-number" };
    }
    return true;
  }

  if (action.type === "skipNumber") {
    if (player.numberDone) {
      return { error: "already responded to this number", code: "already-acted" };
    }
    return canMarkRevealedNumber(state, player)
      ? { error: "a reachable number must be crossed", code: "number-available" }
      : true;
  }

  if (action.type === "resolveBonus") {
    const bonus = player.pendingBonuses.find(
      (item) => item.id === action.payload.bonusId,
    );
    if (!bonus) return { error: "bonus is not pending", code: "bad-bonus" };
    if (
      !validateTarget(
        player,
        bonus.reward,
        action.payload.cardId,
        action.payload.cellIndex,
      )
    ) {
      return {
        error: "choose an available square for this reward",
        code: "bad-bonus-target",
      };
    }
    if (
      bonus.reward.kind !== "number" &&
      bonus.reward.kind !== "wild" &&
      (action.payload.cardId != null || action.payload.cellIndex != null)
    ) {
      return { error: "this reward has no square target", code: "bad-bonus-target" };
    }
    return true;
  }
  return { error: "unknown action", code: "unknown-action" };
}

export function applySmlbAction(
  state: SmlbState,
  action: SmlbAction,
  ctx: ApplyContext,
): { state: SmlbState; events: Event[] } {
  const events: Event[] = [];
  const next = produce(state, (draft) => {
    const randomShuffle = setupShuffle(draft, ctx);
    const player = findPlayer(draft, action.playerId);
    if (!player) return;

    if (action.type === "keepStartingCards") {
      const keep = new Set(action.payload.cardIds);
      for (const id of player.startingOffers) {
        if (keep.has(id)) player.cards.push(emptyBoardCard(id));
        else draft.luckyDiscard.push(id);
      }
      player.startingOffers = [];
      events.push({
        type: "smlb/startingCardsKept",
        payload: { playerId: player.id, cardIds: action.payload.cardIds },
      });
      if (draft.players.every((p) => p.startingOffers.length === 0)) {
        moveToAdvance(draft, "revealNumber", events);
      }
      return;
    }

    if (action.type === "markNumber") {
      const boardCard = player.cards.find(
        (card) => card.cardId === action.payload.cardId,
      )!;
      const face = cardDefinition(boardCard.cardId)!;
      const from = draft.currentNumber!;
      const to = adjustedNumber(from, action.payload.adjustments);
      player.lightning -= action.payload.adjustments.length;
      player.numberDone = true;
      markCell(
        player,
        boardCard.cardId,
        action.payload.cellIndex,
        "number",
        events,
      );
      events.push({
        type: "smlb/numberResolved",
        payload: {
          playerId: player.id,
          revealed: from,
          adjusted: to,
          lightningSpent: action.payload.adjustments.length,
          value: face.grid[action.payload.cellIndex],
        },
      });
      maybeFinishNumberSelection(draft, events);
      return;
    }

    if (action.type === "skipNumber") {
      player.numberDone = true;
      events.push({
        type: "smlb/numberSkipped",
        payload: { playerId: player.id, number: draft.currentNumber },
      });
      maybeFinishNumberSelection(draft, events);
      return;
    }

    if (action.type === "resolveBonus") {
      const bonusIndex = player.pendingBonuses.findIndex(
        (item) => item.id === action.payload.bonusId,
      );
      const [bonus] = player.pendingBonuses.splice(bonusIndex, 1);
      if (!bonus) return;
      const reward = bonus.reward;
      if (
        (reward.kind === "number" || reward.kind === "wild") &&
        action.payload.cardId != null &&
        action.payload.cellIndex != null
      ) {
        markCell(
          player,
          action.payload.cardId,
          action.payload.cellIndex,
          reward.kind === "number" ? "numberBonus" : "wild",
          events,
        );
      } else if (reward.kind === "lightning") {
        player.lightning += reward.count;
      } else if (reward.kind === "star") {
        player.starsThisRound = Math.min(3, player.starsThisRound + 1);
      } else if (reward.kind === "moon") {
        player.moons += 1;
      }
      events.push({
        type: "smlb/bonusResolved",
        payload: {
          playerId: player.id,
          bonusId: bonus.id,
          reward,
          targetCardId: action.payload.cardId,
          targetCellIndex: action.payload.cellIndex,
        },
      });
      maybeFinishNumberSelection(draft, events);
      return;
    }

    if (action.type === "pickRoundCard") {
      player.pickedRoundCardId = action.payload.cardId;
      events.push({
        type: "smlb/roundCardPicked",
        payload: { playerId: player.id, cardId: action.payload.cardId },
      });
      if (draft.players.every((p) => p.pickedRoundCardId != null)) {
        moveToAdvance(draft, "startRound", events);
      }
      return;
    }

    if (action.type === "advance") {
      applyAdvance(draft, events, randomShuffle);
    }
  });
  return { state: next, events };
}

export function legalSmlbActions(state: SmlbState, playerId: PlayerId) {
  const player = findPlayer(state, playerId);
  if (!player) return [];
  if (state.phase === "startingDraft" && player.startingOffers.length > 0) {
    return [{ type: "keepStartingCards" }];
  }
  if (state.phase === "roundDraft" && !player.pickedRoundCardId) {
    return [{ type: "pickRoundCard" }];
  }
  if (state.phase !== "selecting") return [];
  if (!player.numberDone) {
    return canMarkRevealedNumber(state, player)
      ? [{ type: "markNumber" }]
      : [{ type: "skipNumber" }];
  }
  return player.pendingBonuses.map((bonus) => ({
    type: "resolveBonus",
    bonusId: bonus.id,
  }));
}

export function currentSmlbActorId(state: SmlbState): PlayerId | null {
  if (state.phase === "startingDraft") {
    return state.players.find((player) => player.startingOffers.length > 0)?.id ?? null;
  }
  if (state.phase === "roundDraft") {
    return state.players.find((player) => player.pickedRoundCardId == null)?.id ?? null;
  }
  if (state.phase === "selecting") {
    return (
      state.players.find(
        (player) =>
          !player.numberDone || player.pendingBonuses.length > 0,
      )?.id ?? null
    );
  }
  return null;
}

export function checkSmlbVictory(state: SmlbState) {
  if (state.phase !== "finished") return null;
  return {
    kind: "winner" as const,
    winners: state.winners,
    reason: "highest_total_score",
  };
}

export function getLuckyBoxCard(cardId: string): LuckyBoxCard | undefined {
  return cardDefinition(cardId);
}
