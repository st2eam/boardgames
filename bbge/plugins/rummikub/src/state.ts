import type { PlayerId } from "@bbge/core";
import type { RummikubTile } from "./cards";

export type RummikubPhase = "playing" | "finished";

export type RummikubPlayer = {
  id: PlayerId;
  name: string;
  /** Sorted ascending */
  rack: RummikubTile[];
  initialMeldDone: boolean;
  score: number;
  /** Whether this player has drawn a tile on the current turn. */
  drewThisTurn: boolean;
};

export type TableSet = {
  id: string;
  tiles: RummikubTile[];
};

export type RummikubState = {
  schemaVersion: 1;
  pluginId: "rummikub";
  seed: string;
  phase: RummikubPhase;
  players: RummikubPlayer[];
  turnOrder: PlayerId[];
  currentIndex: number;
  /** Face-down draw pool */
  pool: RummikubTile[];
  table: TableSet[];
  setSeq: number;
  winners: PlayerId[];
  matchOver: boolean;
  round: number;
  endReason: "emptyRack" | "depleted" | null;
  /** Points melded by the current player this turn (initial-meld tracking). */
  meldThisTurn: number;
};

export type RummikubConfig = {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
};

export type RummikubAction =
  | {
      type: "drawTile";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "passTurn";
      playerId: PlayerId;
      payload?: Record<string, never>;
      clientActionId?: string;
    }
  | {
      type: "playNewSet";
      playerId: PlayerId;
      payload: { tileIds: string[] };
      clientActionId?: string;
    }
  | {
      type: "extendSet";
      playerId: PlayerId;
      payload: { targetSetId: string; tileIds: string[] };
      clientActionId?: string;
    };
