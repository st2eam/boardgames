export { sixNimmtPlugin } from "./plugin";
export { sixNimmtPlayModule } from "./playModule";
export {
  createNimmtState,
  continueNimmtMatch,
  applyNimmtAction,
  validateNimmtAction,
  legalActions,
  bestRowIndex,
  currentActorId,
} from "./rules";
export { projectNimmtView } from "./projectView";
export type { NimmtAction, NimmtConfig, NimmtState } from "./state";
export { bullheads, buildNimmtDeck } from "./cards";
