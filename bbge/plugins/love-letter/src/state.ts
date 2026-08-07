import type { PlayerId } from "@bbge/core";
import type { Card, LoveLetterEdition } from "./cards";

export interface LoveLetterPlayer {
  id: PlayerId;
  name: string;
  hand: Card[];
  discarded: Card[];
  eliminated: boolean;
  protected: boolean;
  /** Played or discarded a Spy this round while in play */
  playedSpy: boolean;
  /** Priest / Cardinal peek memory (private) */
  seen: Record<string, number>;
  /** Expansion: affection tokens toward match win */
  hearts: number;
}

export type PendingChoice =
  | {
      type: "chancellor";
      playerId: PlayerId;
      held: Card[];
    }
  | {
      /** Priest: viewer must acknowledge the peeked card before the turn advances */
      type: "priestReveal";
      playerId: PlayerId;
      targetId: PlayerId;
      rank: number;
    }
  | {
      /** Baroness: viewer must acknowledge peeked hand(s) before the turn advances */
      type: "baronessReveal";
      playerId: PlayerId;
      targets: { targetId: PlayerId; rank: number }[];
    }
  | {
      /** Bishop hit: target may discard and redraw */
      type: "bishopRedraw";
      playerId: PlayerId;
      actorId: PlayerId;
    }
  | null;

export interface LoveLetterState {
  schemaVersion: 1;
  pluginId: "love-letter";
  seed: string;
  edition: LoveLetterEdition;
  phase: "playing" | "finished";
  players: LoveLetterPlayer[];
  turnOrder: PlayerId[];
  currentIndex: number;
  deck: Card[];
  burn: Card | null;
  faceUp: Card[];
  pending: PendingChoice;
  /** Drawn for current turn already */
  hasDrawn: boolean;
  winners: PlayerId[];
  spyBonus: PlayerId[];
  /** Sycophant: next targeting effect must include this player */
  forcedTargetId: PlayerId | null;
  /** Jester: player who played the jester card */
  jesterPlayerId: PlayerId | null;
  /** Jester: nominated player for end-of-round heart bonus */
  jesterPick: PlayerId | null;
}

export interface LoveLetterConfig {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
  edition?: LoveLetterEdition;
}

export type LoveLetterAction =
  | {
      type: "playCard";
      playerId: PlayerId;
      payload: {
        cardId: string;
        targetId?: PlayerId;
        targetIds?: PlayerId[];
        guessRank?: number;
        peekTargetId?: PlayerId;
      };
      clientActionId?: string;
    }
  | {
      type: "resolveChancellor";
      playerId: PlayerId;
      payload: {
        keepCardId: string;
        bottomOrderIds: string[];
      };
      clientActionId?: string;
    }
  | {
      type: "acknowledgePriest";
      playerId: PlayerId;
      payload: {
        /** Bishop redraw: true = discard hand and redraw */
        redraw?: boolean;
      };
      clientActionId?: string;
    };
