import type { AiSeat } from "@bbge/ai";
import { createDeepSeekLoveLetterSeat } from "./DeepSeekLoveLetterSeat";
import { createDeepSeekTexasHoldemSeat } from "./DeepSeekTexasHoldemSeat";
import { createDeepSeekSixNimmtSeat } from "./DeepSeekSixNimmtSeat";
import { createDeepSeekGoSeat } from "./DeepSeekGoSeat";

type SeatFactory = (id: string, apiKey: string, locale?: string) => AiSeat;

const factories: Record<string, SeatFactory> = {
  "love-letter": createDeepSeekLoveLetterSeat,
  "texas-holdem": createDeepSeekTexasHoldemSeat,
  "six-nimmt": createDeepSeekSixNimmtSeat,
  go: createDeepSeekGoSeat,
};

/**
 * Shelf-side LLM Action seat for a pluginId (undefined → mock only).
 * Locale is closed over so seats can speak in the UI language (Go: zh speak).
 */
export function getLlmSeatFactory(
  pluginId: string,
  locale?: string,
): ((id: string, apiKey: string) => AiSeat) | undefined {
  const factory = factories[pluginId];
  if (!factory) return undefined;
  return (id, apiKey) => factory(id, apiKey, locale);
}
