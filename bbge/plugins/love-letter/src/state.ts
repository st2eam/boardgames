import type { PlayerId } from "@bbge/core";
import type { Card } from "./cards";

export interface LoveLetterPlayer {
  id: PlayerId;
  name: string;
  hand: Card[];
  discarded: Card[];
  eliminated: boolean;
  protected: boolean;
  /** Played or discarded a Spy this round while in play */
  playedSpy: boolean;
  /** Priest peek memory (private) */
  seen: Record<string, number>;
}

export type PendingChoice =
  | {
      type: "chancellor";
      playerId: PlayerId;
      held: Card[];
    }
  | null;

export interface LoveLetterState {
  schemaVersion: 1;
  pluginId: "love-letter";
  seed: string;
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
}

export interface LoveLetterConfig {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
}

export type LoveLetterAction =
  | {
      type: "playCard";
      playerId: PlayerId;
      payload: {
        cardId: string;
        targetId?: PlayerId;
        guessRank?: number;
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
    };
