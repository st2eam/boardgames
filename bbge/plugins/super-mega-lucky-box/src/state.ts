import type { PlayerId } from "@bbge/core";
import type { Reward } from "./cards";

export type LuckyLine = "row" | "column";
export type AdvanceKind = "revealNumber" | "scoreRound" | "startRound";
export type SmlbPhase =
  | "startingDraft"
  | "selecting"
  | "roundDraft"
  | "advancing"
  | "finished";

export interface LuckyBoxBoardCard {
  cardId: string;
  marked: boolean[];
  claimedRows: boolean[];
  claimedColumns: boolean[];
}

export interface PendingBonus {
  id: string;
  cardId: string;
  line: LuckyLine;
  index: number;
  reward: Reward;
}

export interface SmlbPlayer {
  id: PlayerId;
  name: string;
  /** Private until the starting draft is complete. */
  startingOffers: string[];
  cards: LuckyBoxBoardCard[];
  lightning: number;
  moons: number;
  starsThisRound: number;
  roundScores: number[];
  score: number;
  numberDone: boolean;
  pendingBonuses: PendingBonus[];
  /** Private three-card offer after rounds 1–3. */
  roundOffers: string[];
  pickedRoundCardId: string | null;
  incompletePoints: number;
  moonPoints: number;
  finalScore: number;
}

export interface SmlbState {
  schemaVersion: 1;
  pluginId: "super-mega-lucky-box";
  seed: string;
  phase: SmlbPhase;
  advanceKind: AdvanceKind | null;
  players: SmlbPlayer[];
  round: number;
  /** All 18 values are shuffled each round; next value is dealt on advance. */
  numberDeck: number[];
  numberCursor: number;
  currentNumber: number | null;
  revealedNumbers: number[];
  luckyDeck: string[];
  luckyDiscard: string[];
  /** Number of PRNG samples consumed so later host actions get fresh streams. */
  rngCursor: number;
  winners: PlayerId[];
}

export interface SmlbConfig {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
}

export type SmlbAction =
  | {
      type: "keepStartingCards";
      playerId: PlayerId;
      payload: { cardIds: string[] };
    }
  | {
      type: "markNumber";
      playerId: PlayerId;
      payload: {
        cardId: string;
        cellIndex: number;
        adjustments: (-1 | 1)[];
      };
    }
  | { type: "skipNumber"; playerId: PlayerId; payload: Record<string, never> }
  | {
      type: "resolveBonus";
      playerId: PlayerId;
      payload: {
        bonusId: string;
        cardId?: string;
        cellIndex?: number;
      };
    }
  | {
      type: "pickRoundCard";
      playerId: PlayerId;
      payload: { cardId: string };
    }
  | { type: "advance"; playerId: PlayerId; payload: Record<string, never> };
