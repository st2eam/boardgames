import type { ApplyContext, GamePlugin } from "@bbge/core";
import {
  applyUnoAction,
  checkUnoVictory,
  continueUnoMatch,
  createUnoState,
  validateUnoAction,
} from "./rules";
import { projectUnoView } from "./projectView";
import type { UnoAction, UnoConfig, UnoState } from "./state";

export const unoPlugin: GamePlugin<UnoState, UnoAction, UnoConfig> & {
  continueMatch: typeof continueUnoMatch;
} = {
  id: "uno",
  name: "UNO",
  version: "0.1.0",
  metadata: {
    minPlayers: 2,
    maxPlayers: 10,
    pacing: "turn",
    tags: ["cards", "family"],
  },

  createGame(config: UnoConfig, ctx: ApplyContext) {
    return createUnoState(
      { ...config, seed: config.seed ?? "uno" },
      ctx,
    );
  },

  continueMatch: continueUnoMatch,

  validateAction(state, action) {
    return validateUnoAction(state, action);
  },

  applyAction(state, action, ctx) {
    return applyUnoAction(state, action, ctx);
  },

  checkVictory(state) {
    return checkUnoVictory(state);
  },

  projectView(state, viewerId) {
    return projectUnoView(state, viewerId);
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(payload) {
    return JSON.parse(payload) as UnoState;
  },
};
