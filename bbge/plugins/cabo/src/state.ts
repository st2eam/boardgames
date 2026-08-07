import type { PlayerId } from "@bbge/core";
import type { CaboCard } from "./cards";

export type CaboPhase =
  | "setupPeek"
  | "playing"
  | "caboFinalTurns"
  | "finished";

export interface CaboSlot {
  card: CaboCard;
  faceUp: boolean;
}

export interface CaboPlayer {
  id: PlayerId;
  name: string;
  slots: CaboSlot[];
  /** Cumulative match score (lower wins) */
  cumulativeScore: number;
  /** Used the exactly-100 → 50 reset once */
  scoreResetUsed: boolean;
  /** Slot indices the owner knows (setup peek + own peek ability) */
  knownSlots: number[];
}

export interface PendingDraw {
  source: "deck" | "discard";
  card: CaboCard;
}

export interface PendingAbility {
  kind: "peek" | "spy" | "swap";
}

export interface PendingModal {
  type: "peekOwn" | "spyOther";
  /** Who must acknowledge */
  playerId: PlayerId;
  targetPlayerId?: PlayerId;
  slotIndex: number;
  value: number;
}

export interface CaboState {
  schemaVersion: 1;
  pluginId: "cabo";
  seed: string;
  phase: CaboPhase;
  players: CaboPlayer[];
  turnOrder: PlayerId[];
  currentIndex: number;
  deck: CaboCard[];
  discard: CaboCard[];
  pendingDraw: PendingDraw | null;
  pendingAbility: PendingAbility | null;
  pendingModal: PendingModal | null;
  caboCallerId: PlayerId | null;
  /** Seats still owed one turn after CABO */
  finalTurnQueue: PlayerId[];
  round: number;
  targetScore: number;
  winners: PlayerId[];
  matchOver: boolean;
  /** Last round raw totals before match tally (for UI) */
  roundScores: Record<string, number> | null;
  /** Setup: playerId → peeks submitted (2 slot indices) */
  setupPeeks: Record<string, number[] | null>;
}

export interface CaboConfig {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
  targetScore?: number;
}

export type CaboAction =
  | {
      type: "setupPeek";
      playerId: PlayerId;
      payload: { slotIndices: number[] };
      clientActionId?: string;
    }
  | {
      type: "drawDeck";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "drawDiscard";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "discardDrawn";
      playerId: PlayerId;
      payload: { useAbility?: boolean };
      clientActionId?: string;
    }
  | {
      type: "swapWithDrawn";
      playerId: PlayerId;
      payload: { slotIndices: number[] };
      clientActionId?: string;
    }
  | {
      type: "resolveAbilityPeek";
      playerId: PlayerId;
      payload: { slotIndex: number };
      clientActionId?: string;
    }
  | {
      type: "resolveAbilitySpy";
      playerId: PlayerId;
      payload: { targetPlayerId: PlayerId; slotIndex: number };
      clientActionId?: string;
    }
  | {
      type: "resolveAbilitySwap";
      playerId: PlayerId;
      payload: {
        ownSlotIndex: number;
        targetPlayerId: PlayerId;
        targetSlotIndex: number;
      };
      clientActionId?: string;
    }
  | {
      type: "skipAbility";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "callCabo";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "acknowledgeModal";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    };
