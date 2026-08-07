import type { Action, Event, PlayerId } from "@bbge/core";
import type { AiChatMessage } from "@bbge/runtime";

export interface AiSpeakContext {
  view: unknown;
  lastEvents: Event[];
  locale: string;
}

export interface AiSeat {
  id: PlayerId;
  think(view: unknown): Promise<Action>;
  speak?(ctx: AiSpeakContext): Promise<AiChatMessage | null>;
}
