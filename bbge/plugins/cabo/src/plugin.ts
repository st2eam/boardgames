import type { ApplyContext, GamePlugin } from "@bbge/core";
import {
  applyCaboAction,
  checkCaboVictory,
  continueCaboMatch,
  createCaboState,
  validateCaboAction,
} from "./rules";
import { projectCaboView } from "./projectView";
import type { CaboAction, CaboConfig, CaboState } from "./state";

export const caboPlugin: GamePlugin<CaboState, CaboAction, CaboConfig> & {
  continueMatch: typeof continueCaboMatch;
} = {
  id: "cabo",
  name: "CABO",
  version: "0.1.0",
  metadata: {
    minPlayers: 2,
    maxPlayers: 4,
    pacing: "turn",
    tags: ["cards", "memory"],
  },

  createGame(config: CaboConfig, ctx: ApplyContext) {
    return createCaboState(
      { ...config, seed: config.seed ?? "cabo" },
      ctx,
    );
  },

  continueMatch: continueCaboMatch,

  validateAction(state, action) {
    return validateCaboAction(state, action);
  },

  applyAction(state, action, ctx) {
    return applyCaboAction(state, action, ctx);
  },

  checkVictory(state) {
    return checkCaboVictory(state);
  },

  projectView(state, viewerId) {
    return projectCaboView(state, viewerId);
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(payload) {
    return JSON.parse(payload) as CaboState;
  },
};
