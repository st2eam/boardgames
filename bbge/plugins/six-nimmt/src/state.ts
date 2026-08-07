import type { PlayerId } from "@bbge/core";
import type { NimmtCard } from "./cards";
import type { BuffaloSpecialKind, NimmtMode } from "./modes";

export type NimmtPhase =
  | "drafting"
  | "selecting"
  | "specials"
  | "resolving"
  | "chooseRow"
  | "finished";

export interface NimmtPlayer {
  id: PlayerId;
  name: string;
  hand: NimmtCard[];
  /** Cards taken this round (bullhead pile); unused in buffalo (shared pile) */
  taken: NimmtCard[];
  /** Cumulative bullheads across rounds (classic/pro/fan) */
  score: number;
  /** Flippin’ Digits: still holding the special */
  hasFlipToken: boolean;
}

export interface ResolveItem {
  playerId: PlayerId;
  card: NimmtCard;
  /** Effective value for order/placement (Flippin’ Digits) */
  placeValue: number;
  usedFlip?: boolean;
}

export interface RowMods {
  /** Take 7! — capacity 6 numbers before take */
  take7: boolean;
  /** Stop! — locked until removed */
  stopped: boolean;
}

export interface NimmtState {
  schemaVersion: 1;
  pluginId: "six-nimmt";
  seed: string;
  mode: NimmtMode;
  phase: NimmtPhase;
  players: NimmtPlayer[];
  /** 4 rows of number cards */
  rows: NimmtCard[][];
  deck: NimmtCard[];
  /** Pro draft: face-up remaining pool */
  draftPool: NimmtCard[];
  /** Whose turn to draft */
  draftTurn: PlayerId | null;
  /** Locked plays this trick */
  selections: Record<
    string,
    { card: NimmtCard; useFlip: boolean } | null
  >;
  resolveQueue: ResolveItem[];
  revealed: ResolveItem[] | null;
  pending: {
    type: "chooseRow";
    playerId: PlayerId;
    card: NimmtCard;
    placeValue: number;
  } | null;
  round: number;
  trick: number;
  winners: PlayerId[];
  targetScore: number;
  /** Even/Odd marker */
  parityMarker: { rowIndex: number; parity: "even" | "odd" } | null;
  /** Mountain Climbing marker */
  mountain: { rowIndex: number; direction: 1 | -1 } | null;
  /** Jumping Cow row index */
  jumpingCowRow: number | null;
  /** Beat the Buffalo */
  buffaloHand: NimmtCard[];
  buffaloRevealed: NimmtCard | null;
  teamTaken: NimmtCard[];
  buffaloTaken: NimmtCard[];
  specialDeck: BuffaloSpecialKind[];
  faceUpSpecials: (BuffaloSpecialKind | null)[];
  rowMods: RowMods[];
  /** Coop result message */
  buffaloWon: boolean | null;
}

export interface NimmtConfig {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
  targetScore?: number;
  /** Lobby passes love-letter-style `edition` or `mode` */
  mode?: NimmtMode | string;
  edition?: NimmtMode | string;
}

export type NimmtAction =
  | {
      type: "playCard";
      playerId: PlayerId;
      payload: { cardId: string; flip?: boolean };
      clientActionId?: string;
    }
  | {
      type: "chooseRow";
      playerId: PlayerId;
      payload: { rowIndex: number };
      clientActionId?: string;
    }
  | {
      type: "draftPick";
      playerId: PlayerId;
      payload: { cardId: string };
      clientActionId?: string;
    }
  | {
      type: "beginPlace";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      /** Host/auto: place the next revealed card into its row */
      type: "resolveStep";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "useSpecial";
      playerId: PlayerId;
      payload: {
        kind: BuffaloSpecialKind;
        faceIndex: number;
        rowIndex?: number;
        /** Replace / insert / first / last target seat */
        targetPlayerId?: string;
        /** Insert / push position within row */
        insertAt?: number;
        /** Push: source row + card id */
        fromRowIndex?: number;
        cardId?: string;
        toRowIndex?: number;
        /** Sort: full order of playerIds (+ buffalo) */
        order?: string[];
      };
      clientActionId?: string;
    }
  | {
      type: "removeStop";
      playerId: PlayerId;
      payload: { rowIndex: number };
      clientActionId?: string;
    };
