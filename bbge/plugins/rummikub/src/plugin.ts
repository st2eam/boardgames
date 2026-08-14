import type { ApplyContext, GamePlugin } from "@bbge/core";
import {
  applyRummikubAction,
  checkRummikubVictory,
  continueRummikubMatch,
  createRummikubState,
  validateRummikubAction,
} from "./rules";
import { projectRummikubView } from "./projectView";
import type {
  RummikubAction,
  RummikubConfig,
  RummikubState,
} from "./state";

export const rummikubPlugin: GamePlugin<
  RummikubState,
  RummikubAction,
  RummikubConfig
> & {
  continueMatch: typeof continueRummikubMatch;
} = {
  id: "rummikub",
  name: "Rummikub",
  version: "0.2.0",
  metadata: {
    minPlayers: 2,
    maxPlayers: 4,
    pacing: "turn",
    tags: ["board", "set-collection", "tiles"],
  },

  createGame(config: RummikubConfig, ctx: ApplyContext) {
    return createRummikubState({ ...config, seed: config.seed ?? "rummikub" }, ctx);
  },

  continueMatch: continueRummikubMatch,

  validateAction(state, action) {
    return validateRummikubAction(state, action);
  },

  applyAction(state, action, ctx) {
    return applyRummikubAction(state, action, ctx);
  },

  checkVictory(state) {
    return checkRummikubVictory(state);
  },

  projectView(state, viewerId) {
    return projectRummikubView(state, viewerId);
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(payload) {
    return JSON.parse(payload) as RummikubState;
  },
};
