import type { Action, Event, PlayerId } from "@bbge/core";
import type { AiChatMessage } from "@bbge/runtime";

export interface AiSpeakContext {
  view: unknown;
  lastEvents: Event[];
  locale: string;
}

/** Streaming progress while an AiSeat decides an Action (Host UI / hover). */
export type AiThinkProgress = {
  /** Short status for UI */
  note?: string;
  /** Model chain-of-thought when the API emits thinking blocks */
  thinkingText?: string;
  /** Partial assistant content (usually the Action JSON) */
  draftText?: string;
};

/** Host rejected a prior Action as illegal — feed back for one LLM retry. */
export type AiIllegalRetry = {
  rejectedAction: Action;
  error: string;
};

export interface AiThinkOptions {
  onProgress?: (p: AiThinkProgress) => void;
  /** When set, the seat should correct this illegal Action (LLM retry). */
  illegalRetry?: AiIllegalRetry;
}

/** Result of AiSeat.think — Action plus optional table talk. */
export type AiDecision = {
  action: Action;
  /**
   * Short first-person line for avatar bubble / chat.
   * From LLM `speak` (or `say`). Host may fall back to event bubble text.
   */
  speak?: string;
};

export interface AiSeat {
  id: PlayerId;
  /**
   * Produce one legal Action from the seat's private view.
   * Optional onProgress powers “what is AI thinking” UI on Host.
   */
  think(view: unknown, opts?: AiThinkOptions): Promise<AiDecision>;
  speak?(ctx: AiSpeakContext): Promise<AiChatMessage | null>;
}
