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
      type: "commitTurn";
      playerId: PlayerId;
      payload: { groups: string[][] };
      clientActionId?: string;
    };
