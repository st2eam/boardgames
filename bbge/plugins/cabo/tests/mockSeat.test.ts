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

  it("acknowledges setup peek modal before another peek", async () => {
    const seat = createMockCaboSeat("ai1");
    const d = await seat.think({
      phase: "setupPeek",
      setupPeeksDone: true,
      currentPlayerId: "ai1",
      pendingModal: { type: "setupPeek", values: [2, 7] },
      legal: [{ type: "acknowledgeModal" }],
    });
    expect(d.action.type).toBe("acknowledgeModal");
  });

  it("draws from deck when legal", async () => {
    const seat = createMockCaboSeat("ai1");
    const d = await seat.think({
      phase: "playing",
      currentPlayerId: "ai1",
      you: {
        slots: [
          { value: 1, faceUp: false, knownToYou: true },
          { value: null, faceUp: false },
          { value: null, faceUp: false },
          { value: null, faceUp: false },
        ],
      },
      legal: [{ type: "drawDeck" }, { type: "callCabo" }],
    });
    expect(["drawDeck", "callCabo"]).toContain(d.action.type);
  });

  it("never discards a drawn 0 — swaps onto highest slot", async () => {
    const seat = createMockCaboSeat("ai1");
    const d = await seat.think({
      phase: "playing",
      currentPlayerId: "ai1",
      pendingDraw: { source: "deck", value: 0 },
      you: {
        slots: [
          { value: 0, faceUp: true },
          { value: 2, faceUp: false, knownToYou: true },
          { value: 11, faceUp: false, knownToYou: true },
          { value: null, faceUp: false },
        ],
      },
      legal: [
        { type: "discardDrawn", payload: {} },
        { type: "swapWithDrawn", payload: { slotIndices: [0] } },
      ],
    });
    expect(d.action.type).toBe("swapWithDrawn");
    expect(
      (d.action.payload as { slotIndices: number[] }).slotIndices,
    ).toEqual([2]);
  });

  it("discards junk 12 instead of replacing a known 0", async () => {
    const seat = createMockCaboSeat("ai1");
    const d = await seat.think({
      phase: "playing",
      currentPlayerId: "ai1",
      pendingDraw: { source: "deck", value: 12 },
      you: {
        slots: [
          { value: 0, faceUp: true },
          { value: 1, faceUp: false, knownToYou: true },
          { value: 2, faceUp: false, knownToYou: true },
          { value: 3, faceUp: false, knownToYou: true },
        ],
      },
      legal: [
        { type: "discardDrawn", payload: {} },
        { type: "swapWithDrawn", payload: { slotIndices: [0] } },
      ],
    });
    expect(d.action.type).toBe("discardDrawn");
  });
});
