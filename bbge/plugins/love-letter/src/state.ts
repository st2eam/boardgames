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
  /** Priest peek memory (private) */
  seen: Record<string, number>;
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
  | null;

export interface LoveLetterState {
  schemaVersion: 1;
  pluginId: "love-letter";
  seed: string;
  /** full = 21-card Full Game; premium = classic 16-card Premium (2–4) */
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
}

export interface LoveLetterConfig {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
  /** Defaults to full when omitted */
  edition?: LoveLetterEdition;
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
    }
  | {
      type: "acknowledgePriest";
      playerId: PlayerId;
      payload: Record<string, never>;
      clientActionId?: string;
    };
