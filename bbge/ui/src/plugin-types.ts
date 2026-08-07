import type { ComponentType } from "react";
import type { Action, Event, GamePlugin, PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";
import type { AiChatMessage } from "@bbge/runtime";

export type PlayLogEntry = {
  id: string;
  at: number;
  text: string;
  tone?: "info" | "warn" | "win";
};

/** Props every plugin table UI must accept (PlayShell contract). */
export interface PluginTableProps {
  locale: string;
  view: unknown;
  /** Seat this client may view / act as */
  myId: string;
  disabled?: boolean;
  thinkingId?: string | null;
  onAction: (action: Action) => void;
  playLog: PlayLogEntry[];
  chat: AiChatMessage[];
  onChat?: (text: string) => void;
  nameOf?: (id: string) => string;
}

/**
 * First-party playable game package: rules plugin + table + AI helpers.
 * Register via `registerPlayModule` — PlayShell never hardcodes a game.
 */
export interface PluginPlayModule {
  id: string;
  plugin: GamePlugin;
  Table: ComponentType<PluginTableProps>;
  formatEvents: (
    events: Event[],
    locale: string,
    names?: Record<string, string>,
  ) => PlayLogEntry[];
  createMockSeat: (id: PlayerId) => AiSeat;
  /**
   * Optional deterministic Action when AI should not call LLM
   * (e.g. acknowledge a private reveal modal).
   */
  tryAutoAiAction?: (view: unknown, playerId: PlayerId) => Action | null;
  /** Prefix for PeerJS room ids (default `bbge`) */
  roomIdPrefix?: string;
}
