import { describe, expect, it } from "vitest";
import { createMockCaboSeat } from "../src/mockSeat";

describe("createMockCaboSeat", () => {
  it("returns setup peek for setup phase", async () => {
    const seat = createMockCaboSeat("ai1");
    const d = await seat.think({
      phase: "setupPeek",
      currentPlayerId: "ai1",
      you: { slots: [{}, {}, {}, {}] },
      legal: [{ type: "setupPeek", payload: { slotIndices: [] } }],
    });
    expect(d.action.type).toBe("setupPeek");
    expect((d.action.payload as { slotIndices: number[] }).slotIndices.length).toBe(2);
  });

  it("acknowledges peek modal", async () => {
    const seat = createMockCaboSeat("ai1");
    const d = await seat.think({
      phase: "playing",
      currentPlayerId: "ai1",
      pendingModal: { type: "peekOwn", value: 5 },
      legal: [{ type: "acknowledgeModal" }],
    });
    expect(d.action.type).toBe("acknowledgeModal");
  });

  it("draws from deck when legal", async () => {
    const seat = createMockCaboSeat("ai1");
    const d = await seat.think({
      phase: "playing",
      currentPlayerId: "ai1",
      you: { slots: [{ value: 1, knownToYou: true }, {}, {}, {}] },
      legal: [{ type: "drawDeck" }, { type: "callCabo" }],
    });
    expect(["drawDeck", "callCabo"]).toContain(d.action.type);
  });
});
