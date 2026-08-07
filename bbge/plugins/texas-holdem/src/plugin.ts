import type { ApplyContext, GamePlugin } from "@bbge/core";
import {
  applyHoldemAction,
  checkHoldemVictory,
  createHoldemState,
  validateHoldemAction,
} from "./rules";
import { projectHoldemView } from "./projectView";
import type { HoldemAction, HoldemConfig, HoldemState } from "./state";

export const texasHoldemPlugin: GamePlugin<
  HoldemState,
  HoldemAction,
  HoldemConfig
> = {
  id: "texas-holdem",
  name: "Texas Hold'em",
  version: "0.1.0",
  metadata: {
    minPlayers: 2,
    maxPlayers: 9,
    pacing: "turn",
    tags: ["cards", "poker"],
  },

  createGame(config: HoldemConfig, ctx: ApplyContext) {
    return createHoldemState(
      { ...config, seed: config.seed ?? "texas-holdem" },
      ctx,
    );
  },

  validateAction(state, action) {
    return validateHoldemAction(state, action);
  },

  applyAction(state, action, ctx) {
    return applyHoldemAction(state, action, ctx);
  },

  checkVictory(state) {
    return checkHoldemVictory(state);
  },

  projectView(state, viewerId) {
    return projectHoldemView(state, viewerId);
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(payload) {
    return JSON.parse(payload) as HoldemState;
  },
};
