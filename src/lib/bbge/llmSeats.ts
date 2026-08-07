import type { AiSeat } from "@bbge/ai";
import { createDeepSeekLoveLetterSeat } from "./DeepSeekLoveLetterSeat";
import { createDeepSeekTexasHoldemSeat } from "./DeepSeekTexasHoldemSeat";

type SeatFactory = (id: string, apiKey: string) => AiSeat;

const factories: Record<string, SeatFactory> = {
  "love-letter": createDeepSeekLoveLetterSeat,
  "texas-holdem": createDeepSeekTexasHoldemSeat,
};

/** Shelf-side LLM Action seat for a pluginId (undefined → mock only). */
export function getLlmSeatFactory(
  pluginId: string,
): SeatFactory | undefined {
  return factories[pluginId];
}
