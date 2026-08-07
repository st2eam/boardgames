import type { PlayerId } from "@bbge/core";
import type { AiSeat } from "@bbge/ai";
import { chooseGoPolicyAction, type GoPolicyView } from "./policy";

/**
 * Local Go seat driven by the mathematical policy (liberties / atari / area).
 */
export function createStrategicGoSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const choice = chooseGoPolicyAction(viewUnknown as GoPolicyView, id);
      opts?.onProgress?.({ note: choice.note });
      return { action: choice.action };
    },
  };
}
