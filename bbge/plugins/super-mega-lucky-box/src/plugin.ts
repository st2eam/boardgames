import type { ApplyContext, GamePlugin } from "@bbge/core";
import {
  applySmlbAction,
  checkSmlbVictory,
  createSmlbState,
  validateSmlbAction,
} from "./rules";
import { projectSmlbView } from "./projectView";
import type { SmlbAction, SmlbConfig, SmlbState } from "./state";

export const superMegaLuckyBoxPlugin: GamePlugin<
  SmlbState,
  SmlbAction,
  SmlbConfig
> = {
  id: "super-mega-lucky-box",
  name: "Super Mega Lucky Box",
  version: "0.1.0",
  metadata: {
    minPlayers: 1,
    maxPlayers: 6,
    pacing: "simultaneous",
    tags: ["cards", "family", "bingo"],
  },

  createGame(config: SmlbConfig, ctx: ApplyContext) {
    return createSmlbState(
      { ...config, seed: config.seed ?? "super-mega-lucky-box" },
      ctx,
    );
  },

  validateAction(state, action) {
    return validateSmlbAction(state, action);
  },

  applyAction(state, action, ctx) {
    return applySmlbAction(state, action, ctx);
  },

  checkVictory(state) {
    return checkSmlbVictory(state);
  },

  projectView(state, viewerId) {
    return projectSmlbView(state, viewerId);
  },

  serialize(state) {
    return JSON.stringify(state);
  },

  deserialize(payload) {
    return JSON.parse(payload) as SmlbState;
  },
};
