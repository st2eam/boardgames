import type { ApplyContext, GamePlugin } from "@bbge/core";
import {
  applyLoveLetterAction,
  checkLoveLetterVictory,
  continueLoveLetterMatch,
  createLoveLetterState,
  finishRound,
  validateLoveLetterAction,
} from "./rules";
import { projectLoveLetterView } from "./projectView";
import type { LoveLetterAction, LoveLetterConfig, LoveLetterState } from "./state";
import { produce } from "immer";
import type { Event } from "@bbge/core";

/** Draw for current player if needed — call from Host before plays. */
export function prepareLoveLetterTurn(
  state: LoveLetterState,
): { state: LoveLetterState; events: Event[] } {
  const events: Event[] = [];
  if (state.phase !== "playing" || state.pending || state.hasDrawn) {
    return { state, events };
  }
  const next = produce(state, (draft) => {
    const id = draft.turnOrder[draft.currentIndex]!;
    const me = draft.players.find((p) => p.id === id)!;
    if (me.eliminated) return;
    let card = draft.deck.shift();
    if (!card && draft.burn) {
      card = draft.burn;
      draft.burn = null;
    }
    if (!card) {
      finishRound(draft, events);
      return;
    }
    me.hand.push(card);
    draft.hasDrawn = true;
    events.push({ type: "loveLetter/cardDrawn", payload: { playerId: me.id } });
  });
  return { state: next, events };
}

export const loveLetterPlugin: GamePlugin<
  LoveLetterState,
  LoveLetterAction,
  LoveLetterConfig
> & {
  prepareTurn: typeof prepareLoveLetterTurn;
  continueMatch: typeof continueLoveLetterMatch;
} = {
  id: "love-letter",
  name: "Love Letter",
  version: "0.1.0",
  metadata: {
    minPlayers: 2,
    maxPlayers: 8,
    pacing: "turn",
    tags: ["cards", "deduction"],
  },

  createGame(config: LoveLetterConfig, ctx: ApplyContext) {
    const state = createLoveLetterState(
      { ...config, seed: config.seed ?? "love-letter" },
      ctx,
    );
    return prepareLoveLetterTurn(state).state;
  },

  /** Multi-round match: keep ♥ tokens; rotate start; reset when matchOver. */
  continueMatch: continueLoveLetterMatch,

  prepareTurn: prepareLoveLetterTurn,

  validateAction(state, action) {
    return validateLoveLetterAction(state, action);
  },

  applyAction(state, action, ctx) {
    return applyLoveLetterAction(state, action, ctx);
  },

  checkVictory(state) {
    return checkLoveLetterVictory(state);
  },

  projectView(state, viewerId) {
    return projectLoveLetterView(state, viewerId);
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(payload) {
    return JSON.parse(payload) as LoveLetterState;
  },
};
