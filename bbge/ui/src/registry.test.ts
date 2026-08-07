import { describe, it, expect, beforeEach } from "vitest";
import {
  registerPlayModule,
  getPlayModule,
  requirePlayModule,
  listPlayModuleIds,
} from "./registry";
import type { PluginPlayModule } from "./plugin-types";

function stubModule(id: string): PluginPlayModule {
  return {
    id,
    plugin: {
      id,
      name: id,
      version: "0.0.0",
      metadata: { minPlayers: 2, maxPlayers: 4, pacing: "turn" },
      createGame: () => ({}),
      validateAction: () => true,
      applyAction: (s) => ({ state: s, events: [] }),
      checkVictory: () => null,
      serialize: () => "{}",
      deserialize: () => ({}),
    },
    Table: () => null,
    formatEvents: () => [],
    createMockSeat: (seatId) => ({
      id: seatId,
      think: async () => ({ type: "noop", playerId: seatId, payload: {} }),
    }),
  };
}

describe("play module registry", () => {
  beforeEach(() => {
    // registry is module-global; overwrite with stubs for isolation
    registerPlayModule(stubModule("test-a"));
    registerPlayModule(stubModule("test-b"));
  });

  it("registers and resolves by id", () => {
    expect(getPlayModule("test-a")?.id).toBe("test-a");
    expect(requirePlayModule("test-b").id).toBe("test-b");
    expect(listPlayModuleIds()).toEqual(
      expect.arrayContaining(["test-a", "test-b"]),
    );
  });

  it("throws on unknown id", () => {
    expect(() => requirePlayModule("no-such-plugin")).toThrow(/Unknown BBGE/);
  });
});
