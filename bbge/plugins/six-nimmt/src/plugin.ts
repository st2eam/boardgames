import type { ApplyContext, GamePlugin } from "@bbge/core";
import {
  applyNimmtAction,
  checkNimmtVictory,
  continueNimmtMatch,
  createNimmtState,
  validateNimmtAction,
} from "./rules";
import { projectNimmtView } from "./projectView";
import type { NimmtAction, NimmtConfig, NimmtState } from "./state";

export const sixNimmtPlugin: GamePlugin<
  NimmtState,
  NimmtAction,
  NimmtConfig
> & {
  continueMatch: typeof continueNimmtMatch;
} = {
  id: "six-nimmt",
  name: "6 nimmt!",
  version: "0.1.0",
  metadata: {
    minPlayers: 2,
    maxPlayers: 10,
    pacing: "simultaneous",
    tags: ["cards", "family"],
  },

  createGame(config: NimmtConfig, ctx: ApplyContext) {
    return createNimmtState(
      { ...config, seed: config.seed ?? "six-nimmt" },
      ctx,
    );
  },

  continueMatch: continueNimmtMatch,

  validateAction(state, action) {
    return validateNimmtAction(state, action);
  },

  applyAction(state, action, ctx) {
    return applyNimmtAction(state, action, ctx);
  },

  checkVictory(state) {
    return checkNimmtVictory(state);
  },

  projectView(state, viewerId) {
    return projectNimmtView(state, viewerId);
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(payload) {
    return JSON.parse(payload) as NimmtState;
  },
};
