import type { AiSeat } from "@bbge/ai";
import { createDeepSeekLoveLetterSeat } from "./DeepSeekLoveLetterSeat";
import { createDeepSeekTexasHoldemSeat } from "./DeepSeekTexasHoldemSeat";
import { createDeepSeekSixNimmtSeat } from "./DeepSeekSixNimmtSeat";
import { createDeepSeekGoSeat } from "./DeepSeekGoSeat";
import { createDeepSeekCaboSeat } from "./DeepSeekCaboSeat";
import { createDeepSeekUnoSeat } from "./DeepSeekUnoSeat";
import { createDeepSeekTrioSeat } from "./DeepSeekTrioSeat";

type SeatFactory = (
  id: string,
  apiKey: string,
  locale?: string,
  /** Content slug for `/data/rules/<slug>.json` (may differ from pluginId). */
  slug?: string,
) => AiSeat;

const factories: Record<string, SeatFactory> = {
  "love-letter": createDeepSeekLoveLetterSeat,
  "texas-holdem": createDeepSeekTexasHoldemSeat,
  "six-nimmt": createDeepSeekSixNimmtSeat,
  go: createDeepSeekGoSeat,
  cabo: createDeepSeekCaboSeat,
  uno: createDeepSeekUnoSeat,
  trio: createDeepSeekTrioSeat,
};

/**
 * Shelf-side LLM Action seat for a pluginId (undefined → mock only).
 * Locale + content slug are closed over so seats speak in the UI language
 * and load on-site rules (same JSON as chat). Action JSON types stay English.
 */
export function getLlmSeatFactory(
  pluginId: string,
  locale?: string,
  slug?: string,
): ((id: string, apiKey: string) => AiSeat) | undefined {
  const factory = factories[pluginId];
  if (!factory) return undefined;
  return (id, apiKey) => factory(id, apiKey, locale, slug);
}
