import type { PlayerId } from "@bbge/core";
import type { Card } from "./cards";
import type { HandScore } from "./handEval";
import type { Pot } from "./pots";

export type Street = "preflop" | "flop" | "turn" | "river";

export interface HoldemPlayer {
  id: PlayerId;
  name: string;
  stack: number;
  hole: Card[];
  /** Folded this hand */
  folded: boolean;
  allIn: boolean;
  /** Chips committed this street */
  streetBet: number;
  /** Chips committed this hand (all streets) */
  handBet: number;
  /** Has voluntarily acted this betting round since last raise */
  acted: boolean;
}

export interface HoldemState {
  schemaVersion: 1;
  pluginId: "texas-holdem";
  seed: string;
  phase: "playing" | "finished";
  street: Street;
  smallBlind: number;
  bigBlind: number;
  startingStack: number;
  players: HoldemPlayer[];
  /** Seat order clockwise; buttonIndex points at BTN */
  buttonIndex: number;
  deck: Card[];
  board: Card[];
  /** Burns (not shown) */
  burns: Card[];
  /** Highest streetBet required to stay in */
  currentBet: number;
  /** Minimum total streetBet for a legal raise */
  minRaiseTo: number;
  /** Index into players for who must act */
  toActIndex: number;
  pots: Pot[];
  winners: PlayerId[];
  /** Increments each dealt hand (cash session); UI remount key */
  handNumber: number;
  /** Showdown results for UI */
  showdown?: {
    playerId: PlayerId;
    score: HandScore;
    hole: Card[];
  }[];
  /** Last action summary for animation hooks */
  lastAction?: {
    playerId: PlayerId;
    type: string;
    amount?: number;
  };
}

export interface HoldemConfig {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
  smallBlind?: number;
  bigBlind?: number;
  startingStack?: number;
}

export type HoldemAction =
  | {
      type: "fold";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "check";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "call";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "raise";
      playerId: PlayerId;
      /** Total chips committed this street after the raise */
      payload: { toAmount: number };
      clientActionId?: string;
    };
