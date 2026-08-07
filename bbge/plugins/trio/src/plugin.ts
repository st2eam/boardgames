import type { ApplyContext, GamePlugin } from "@bbge/core";
import {
  applyTrioAction,
  checkTrioVictory,
  continueTrioMatch,
  createTrioState,
  validateTrioAction,
} from "./rules";
import { projectTrioView } from "./projectView";
import type { TrioAction, TrioConfig, TrioState } from "./state";

export const trioPlugin: GamePlugin<TrioState, TrioAction, TrioConfig> & {
  continueMatch: typeof continueTrioMatch;
} = {
  id: "trio",
  name: "TRIO",
  version: "0.1.0",
  metadata: {
    minPlayers: 3,
    maxPlayers: 6,
    pacing: "turn",
    tags: ["cards", "memory", "deduction"],
  },

  createGame(config: TrioConfig, ctx: ApplyContext) {
    return createTrioState(
      { ...config, seed: config.seed ?? "trio" },
      ctx,
    );
  },

  continueMatch: continueTrioMatch,

  validateAction(state, action) {
    return validateTrioAction(state, action);
  },

  applyAction(state, action, ctx) {
    return applyTrioAction(state, action, ctx);
  },

  checkVictory(state) {
    return checkTrioVictory(state);
  },

  projectView(state, viewerId) {
    return projectTrioView(state, viewerId);
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(payload) {
    return JSON.parse(payload) as TrioState;
  },
};
