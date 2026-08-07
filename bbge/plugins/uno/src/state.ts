import type { PlayerId } from "@bbge/core";
import type { UnoCard, UnoColor, UnoSide } from "./cards";
import type { UnoEditionId } from "./editions";

export type UnoPhase =
  | "playing"
  | "chooseColor"
  | "chooseTarget"
  | "challenge"
  | "drawnDecision"
  | "stackResponse"
  | "finished";

export type UnoPlayer = {
  id: PlayerId;
  name: string;
  hand: UnoCard[];
  score: number;
  eliminated: boolean;
};

export type UnoPending =
  | { type: "chooseColor"; playerId: PlayerId; cardId: string }
  | {
      type: "chooseTarget";
      playerId: PlayerId;
      cardId: string;
      purpose: "swapHands" | "sevenSwap";
    }
  | {
      type: "challenge";
      /** Player who may challenge */
      playerId: PlayerId;
      /** Who played the WD4 */
      offenderId: PlayerId;
      chosenColor: UnoColor;
    }
  | {
      type: "drawnDecision";
      playerId: PlayerId;
      card: UnoCard;
    }
  | {
      type: "stackResponse";
      /** Who must stack or take the pile */
      playerId: PlayerId;
      amount: number;
    };

export type UnoState = {
  schemaVersion: 1;
  pluginId: "uno";
  edition: UnoEditionId;
  seed: string;
  phase: UnoPhase;
  players: UnoPlayer[];
  turnOrder: PlayerId[];
  currentIndex: number;
  direction: 1 | -1;
  deck: UnoCard[];
  discard: UnoCard[];
  /** Color in force (after wilds) */
  currentColor: UnoColor;
  side: UnoSide;
  pending: UnoPending | null;
  /** Missed UNO — catchable until cleared */
  unoVulnerableId: PlayerId | null;
  /** Soft reminder: player just went to 1 without saying UNO */
  saidUno: Record<string, boolean>;
  winners: PlayerId[];
  matchOver: boolean;
  round: number;
  targetScore: number;
  /** Cards sidelined from eliminated No Mercy players */
  mercyPile: UnoCard[];
  lastPlayedBy: PlayerId | null;
};

export type UnoConfig = {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
  edition?: string;
  targetScore?: number;
};

export type UnoAction =
  | {
      type: "playCard";
      playerId: PlayerId;
      payload: {
        cardId: string;
        chosenColor?: UnoColor;
        targetPlayerId?: PlayerId;
        saidUno?: boolean;
      };
      clientActionId?: string;
    }
  | {
      type: "drawCard";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "playDrawn";
      playerId: PlayerId;
      payload: {
        chosenColor?: UnoColor;
        targetPlayerId?: PlayerId;
        saidUno?: boolean;
      };
      clientActionId?: string;
    }
  | {
      type: "keepDrawn";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "chooseColor";
      playerId: PlayerId;
      payload: { color: UnoColor };
      clientActionId?: string;
    }
  | {
      type: "chooseTarget";
      playerId: PlayerId;
      payload: { targetPlayerId: PlayerId };
      clientActionId?: string;
    }
  | {
      type: "challengeWildDraw";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "acceptWildDraw";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "catchUno";
      playerId: PlayerId;
      payload: { targetPlayerId: PlayerId };
      clientActionId?: string;
    }
  | {
      type: "takeStack";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "callUno";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    };
