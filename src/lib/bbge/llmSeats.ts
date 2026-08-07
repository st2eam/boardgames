import type { AiSeat } from "@bbge/ai";
import { createDeepSeekLoveLetterSeat } from "./DeepSeekLoveLetterSeat";
import { createDeepSeekTexasHoldemSeat } from "./DeepSeekTexasHoldemSeat";
import { createDeepSeekSixNimmtSeat } from "./DeepSeekSixNimmtSeat";
import { createDeepSeekGoSeat } from "./DeepSeekGoSeat";
import { createDeepSeekCaboSeat } from "./DeepSeekCaboSeat";

type SeatFactory = (id: string, apiKey: string, locale?: string) => AiSeat;

const factories: Record<string, SeatFactory> = {
  "love-letter": createDeepSeekLoveLetterSeat,
  "texas-holdem": createDeepSeekTexasHoldemSeat,
  "six-nimmt": createDeepSeekSixNimmtSeat,
  go: createDeepSeekGoSeat,
  cabo: createDeepSeekCaboSeat,
};

/**
 * Shelf-side LLM Action seat for a pluginId (undefined → mock only).
 * Locale is closed over so seats speak in the UI language
 * (zh/default → 简体中文口语；en → English). Action JSON types stay English.
 */
export function getLlmSeatFactory(
  pluginId: string,
  locale?: string,
): ((id: string, apiKey: string) => AiSeat) | undefined {
  const factory = factories[pluginId];
  if (!factory) return undefined;
  return (id, apiKey) => factory(id, apiKey, locale);
}
