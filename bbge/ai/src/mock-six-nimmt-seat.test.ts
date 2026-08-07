import { describe, expect, it } from "vitest";
import { createMockSixNimmtSeat } from "./mock-six-nimmt-seat";

describe("createMockSixNimmtSeat", () => {
  it("avoids completing a 4-card row when a safer fit exists", async () => {
    const seat = createMockSixNimmtSeat("ai1");
    const { action } = await seat.think({
      phase: "playing",
      rows: [
        [
          { value: 10, bullheads: 1 },
          { value: 11, bullheads: 1 },
          { value: 12, bullheads: 1 },
          { value: 13, bullheads: 1 },
        ],
        [{ value: 40, bullheads: 1 }],
        [{ value: 70, bullheads: 1 }],
        [{ value: 90, bullheads: 1 }],
      ],
      you: {
        id: "ai1",
        hand: [
          { id: "c14", value: 14, bullheads: 1 },
          { id: "c45", value: 45, bullheads: 2 },
        ],
      },
      legal: [
        { type: "playCard", cardId: "c14" },
        { type: "playCard", cardId: "c45" },
      ],
    });
    expect(action.type).toBe("playCard");
    expect((action.payload as { cardId: string }).cardId).toBe("c45");
  });

  it("chooses the lowest-bullhead row when forced", async () => {
    const seat = createMockSixNimmtSeat("ai1");
    const { action } = await seat.think({
      phase: "chooseRow",
      rows: [
        [
          { value: 1, bullheads: 5 },
          { value: 2, bullheads: 2 },
        ],
        [{ value: 10, bullheads: 1 }],
        [
          { value: 20, bullheads: 3 },
          { value: 21, bullheads: 3 },
        ],
        [{ value: 30, bullheads: 7 }],
      ],
      legal: [
        { type: "chooseRow", rowIndex: 0 },
        { type: "chooseRow", rowIndex: 1 },
        { type: "chooseRow", rowIndex: 2 },
        { type: "chooseRow", rowIndex: 3 },
      ],
    });
    expect(action.type).toBe("chooseRow");
    expect((action.payload as { rowIndex: number }).rowIndex).toBe(1);
  });
});
