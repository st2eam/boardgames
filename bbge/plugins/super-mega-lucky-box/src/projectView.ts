import type { PlayerId } from "@bbge/core";
import { getLuckyBoxCard, legalSmlbActions, currentSmlbActorId } from "./rules";
import type { LuckyBoxBoardCard, SmlbPlayer, SmlbState } from "./state";

function liveScore(player: SmlbPlayer): number {
  const stars =
    player.starsThisRound >= 3
      ? 9
      : player.starsThisRound === 2
        ? 4
        : player.starsThisRound === 1
          ? 1
          : 0;
  return player.score + stars;
}

function publicBoardCard(card: LuckyBoxBoardCard) {
  const face = getLuckyBoxCard(card.cardId);
  if (!face) return null;
  return {
    id: card.cardId,
    grid: face.grid.slice(),
    rows: face.rows.map((reward) => ({ ...reward })),
    columns: face.columns.map((reward) => ({ ...reward })),
    marked: card.marked.slice(),
    claimedRows: card.claimedRows.slice(),
    claimedColumns: card.claimedColumns.slice(),
    completed: card.marked.every(Boolean),
  };
}

function hasResponded(state: SmlbState, player: SmlbPlayer): boolean {
  if (state.phase === "startingDraft") return player.startingOffers.length === 0;
  if (state.phase === "roundDraft") return player.pickedRoundCardId != null;
  if (state.phase === "selecting") {
    return player.numberDone && player.pendingBonuses.length === 0;
  }
  return true;
}

function aiPhase(state: SmlbState): string {
  if (state.phase === "startingDraft" || state.phase === "roundDraft") {
    return "selecting";
  }
  return state.phase;
}

export function projectSmlbView(state: SmlbState, viewerId: PlayerId | null) {
  const you = viewerId ? state.players.find((player) => player.id === viewerId) : null;
  const cardsFor = (player: SmlbPlayer) =>
    player.cards
      .map(publicBoardCard)
      .filter((card): card is NonNullable<typeof card> => card !== null);
  const offerFaces = (ids: string[]) =>
    ids
      .map((id) => {
        const face = getLuckyBoxCard(id);
        return face
          ? {
              id: face.id,
              grid: face.grid.slice(),
              rows: face.rows.map((reward) => ({ ...reward })),
              columns: face.columns.map((reward) => ({ ...reward })),
            }
          : null;
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);

  return {
    phase: aiPhase(state),
    stage:
      state.phase === "startingDraft"
        ? "startingDraft"
        : state.phase === "roundDraft"
          ? "roundDraft"
          : state.phase === "selecting"
            ? "number"
            : state.phase === "advancing"
              ? "advancing"
              : "finished",
    advanceKind: state.advanceKind,
    round: state.round,
    currentNumber: state.currentNumber,
    numberIndex: state.numberCursor,
    revealedNumbers: state.revealedNumbers.slice(),
    currentPlayerId: currentSmlbActorId(state),
    winners: state.winners.slice(),
    seats: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      cardsCount: player.cards.length,
      lightning: player.lightning,
      moons: player.moons,
      starsThisRound: player.starsThisRound,
      score: state.phase === "finished" ? player.finalScore : liveScore(player),
      roundScores: player.roundScores.slice(),
      hasPlayed: hasResponded(state, player),
      isYou: player.id === viewerId,
    })),
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      cards: cardsFor(player),
      lightning: player.lightning,
      moons: player.moons,
      starsThisRound: player.starsThisRound,
      score: state.phase === "finished" ? player.finalScore : liveScore(player),
      roundScores: player.roundScores.slice(),
      incompletePoints: player.incompletePoints,
      moonPoints: player.moonPoints,
      finalScore: player.finalScore,
      hasPlayed: hasResponded(state, player),
      isYou: player.id === viewerId,
    })),
    you: you
      ? {
          id: you.id,
          lightning: you.lightning,
          moons: you.moons,
          starsThisRound: you.starsThisRound,
          score: state.phase === "finished" ? you.finalScore : liveScore(you),
          roundScores: you.roundScores.slice(),
          numberDone: you.numberDone,
          hasPlayed: hasResponded(state, you),
          cards: cardsFor(you),
          pendingBonuses: you.pendingBonuses.map((bonus) => ({
            ...bonus,
            reward: { ...bonus.reward },
          })),
          startingOffers:
            state.phase === "startingDraft"
              ? offerFaces(you.startingOffers)
              : null,
          roundOffers:
            state.phase === "roundDraft"
              ? offerFaces(you.roundOffers)
              : null,
          pickedRoundCardId: you.pickedRoundCardId,
          incompletePoints: you.incompletePoints,
          moonPoints: you.moonPoints,
          finalScore: you.finalScore,
        }
      : null,
    /** Only the count and public face-up discard pile are shown. */
    luckyDeckCount: state.luckyDeck.length,
    luckyDiscard: state.luckyDiscard
      .map((id) => {
        const card = getLuckyBoxCard(id);
        return card ? { id, grid: card.grid.slice() } : null;
      })
      .filter((card): card is NonNullable<typeof card> => card !== null),
    legal: viewerId ? legalSmlbActions(state, viewerId) : [],
  };
}
