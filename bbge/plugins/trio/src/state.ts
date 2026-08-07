import type { PlayerId } from "@bbge/core";
import type { TrioCard } from "./cards";
import type { TrioModeId } from "./editions";

export type TrioPhase = "playing" | "finished";

export type RevealEnd = "low" | "high";

export type TurnReveal =
  | {
      source: "center";
      slotIndex: number;
      card: TrioCard;
    }
  | {
      source: "hand";
      ownerId: PlayerId;
      end: RevealEnd;
      card: TrioCard;
    };

export type TrioPlayer = {
  id: PlayerId;
  name: string;
  /** Always sorted ascending */
  hand: TrioCard[];
  /** Collected trio values (each entry is the number collected) */
  trios: number[];
};

export type TrioState = {
  schemaVersion: 1;
  pluginId: "trio";
  mode: TrioModeId;
  seed: string;
  phase: TrioPhase;
  players: TrioPlayer[];
  turnOrder: PlayerId[];
  currentIndex: number;
  /** Center face-down cards (null slot = removed) */
  center: (TrioCard | null)[];
  turnReveals: TurnReveal[];
  winners: PlayerId[];
  matchOver: boolean;
};

export type TrioConfig = {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
  edition?: string;
};

export type TrioAction =
  | {
      type: "revealCenter";
      playerId: PlayerId;
      payload: { slotIndex: number };
      clientActionId?: string;
    }
  | {
      type: "revealExtreme";
      playerId: PlayerId;
      payload: { targetPlayerId: PlayerId; end: RevealEnd };
      clientActionId?: string;
    };
