import type { PlayerId } from "@bbge/core";

export type GoColor = "black" | "white";
export type GoCell = GoColor | null;
export type GoBoardSize = 9 | 13 | 19;

export type GoEditionId = "9x9" | "13x13" | "19x19";

export type GoPhase = "playing" | "finished";

export interface GoCoord {
  row: number;
  col: number;
}

export interface GoPlayer {
  id: PlayerId;
  name: string;
  color: GoColor;
  captures: number;
  resigned: boolean;
}

export interface GoScores {
  black: number;
  white: number;
  blackTerritory: number;
  whiteTerritory: number;
  blackStones: number;
  whiteStones: number;
  komi: number;
}

export interface GoState {
  schemaVersion: 1;
  pluginId: "go";
  seed: string;
  edition: GoEditionId;
  size: GoBoardSize;
  komi: number;
  phase: GoPhase;
  board: GoCell[][];
  players: GoPlayer[];
  /** Index into players — whose turn */
  toActIndex: number;
  consecutivePasses: number;
  /** Simple ko: forbidden intersection for the player about to move */
  ko: GoCoord | null;
  lastMove: (GoCoord & { color: GoColor }) | null;
  winners: PlayerId[];
  scores: GoScores | null;
  endReason: "score" | "resign" | null;
}

export interface GoConfig {
  playerIds: PlayerId[];
  playerNames: Record<string, string>;
  seed?: string;
  edition?: string;
  size?: number;
  komi?: number;
}

export type GoAction =
  | {
      type: "play";
      playerId: PlayerId;
      payload: { row: number; col: number };
    }
  | {
      type: "pass";
      playerId: PlayerId;
      payload: Record<string, never>;
    }
  | {
      type: "resign";
      playerId: PlayerId;
      payload: Record<string, never>;
    };

export function normalizeGoEdition(raw?: string): GoEditionId {
  if (raw === "19x19" || raw === "19") return "19x19";
  if (raw === "13x13" || raw === "13") return "13x13";
  return "9x9";
}

export function sizeForEdition(edition: GoEditionId): GoBoardSize {
  if (edition === "19x19") return 19;
  if (edition === "13x13") return 13;
  return 9;
}

/** Chinese-rules–style komi defaults for teaching games. */
export function komiForEdition(edition: GoEditionId): number {
  if (edition === "19x19" || edition === "13x13") return 7.5;
  return 6.5;
}
