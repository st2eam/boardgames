import type { ApplyContext, GamePlugin } from "@bbge/core";
import {
  applyGoAction,
  checkGoVictory,
  createGoState,
  validateGoAction,
} from "./rules";
import { projectGoView } from "./projectView";
import type { GoAction, GoConfig, GoState } from "./state";

export const goPlugin: GamePlugin<GoState, GoAction, GoConfig> = {
  id: "go",
  name: "Go",
  version: "0.1.0",
  metadata: {
    minPlayers: 2,
    maxPlayers: 2,
    pacing: "turn",
    tags: ["abstract", "board", "go"],
  },

  createGame(config: GoConfig, ctx: ApplyContext) {
    return createGoState(config, ctx);
  },

  validateAction(state, action) {
    return validateGoAction(state, action as GoAction);
  },

  applyAction(state, action, ctx) {
    return applyGoAction(state, action as GoAction, ctx);
  },

  checkVictory(state) {
    return checkGoVictory(state);
  },

  projectView(state, viewerId) {
    return projectGoView(state, viewerId);
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(payload) {
    return JSON.parse(payload) as GoState;
  },
};
