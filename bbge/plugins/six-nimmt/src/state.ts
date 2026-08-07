import type { PlayerId } from "@bbge/core";
import type { NimmtCard } from "./cards";

export type NimmtPhase = "selecting" | "chooseRow" | "finished";

export interface NimmtPlayer {
  id: PlayerId;
  name: string;
  hand: NimmtCard[];
  /** Cards taken this round (bullhead pile) */
  taken: NimmtCard[];
  /** Cumulative bullheads across rounds */
  score: number;
}

export interface ResolveItem {
  playerId: PlayerId;
  card: NimmtCard;
}

export interface NimmtState {
  schemaVersion: 1;
  pluginId: "six-nimmt";
  seed: string;
  phase: NimmtPhase;
  players: NimmtPlayer[];
  /** 4 ascending rows */
  rows: NimmtCard[][];
  deck: NimmtCard[];
  /** Locked plays this trick; null until seat locks */
  selections: Record<string, NimmtCard | null>;
  /** After reveal: ordered ascending queue still to place */
  resolveQueue: ResolveItem[];
  /** Last revealed trick (for UI) */
  revealed: ResolveItem[] | null;
  pending: {
    type: "chooseRow";
    playerId: PlayerId;
    card: NimmtCard;
  } | null;
  round: number;
  trick: number;
  winners: PlayerId[];
  targetScore: number;
}

export interface NimmtConfig {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
  targetScore?: number;
}

export type NimmtAction =
  | {
      type: "playCard";
      playerId: PlayerId;
      payload: { cardId: string };
      clientActionId?: string;
    }
  | {
      type: "chooseRow";
      playerId: PlayerId;
      payload: { rowIndex: number };
      clientActionId?: string;
    };
