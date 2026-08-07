import { describe, expect, it } from "vitest";
import { createAggressiveHoldemSeat } from "../src/mockSeat";

describe("createAggressiveHoldemSeat", () => {
  it("bets pot with a flush when checked to (never open-checks)", async () => {
    const seat = createAggressiveHoldemSeat("ai1");
    const { action } = await seat.think({
      phase: "playing",
      street: "river",
      bigBlind: 2,
      minRaiseTo: 2,
      potTotal: 20,
      currentBet: 0,
      you: {
        id: "ai1",
        toCall: 0,
        stack: 180,
        streetBet: 0,
        hole: [
          { id: "Ah", rank: 14, suit: "h" },
          { id: "Kh", rank: 13, suit: "h" },
        ],
      },
      board: [
        { id: "2h", rank: 2, suit: "h" },
        { id: "7h", rank: 7, suit: "h" },
        { id: "9h", rank: 9, suit: "h" },
        { id: "3c", rank: 3, suit: "c" },
        { id: "4d", rank: 4, suit: "d" },
      ],
      legal: [
        { type: "fold" },
        { type: "check" },
        { type: "raise", toAmount: 2 },
      ],
    });
    expect(action.type).toBe("raise");
    expect((action.payload as { toAmount: number }).toAmount).toBeGreaterThan(
      2,
    );
  });

  it("jams or re-raises with a flush when facing a bet", async () => {
    const seat = createAggressiveHoldemSeat("ai1");
    const { action } = await seat.think({
      phase: "playing",
      street: "river",
      bigBlind: 2,
      minRaiseTo: 20,
      potTotal: 40,
      currentBet: 10,
      you: {
        id: "ai1",
        toCall: 10,
        stack: 150,
        streetBet: 0,
        hole: [
          { id: "Ah", rank: 14, suit: "h" },
          { id: "9h", rank: 9, suit: "h" },
        ],
      },
      board: [
        { id: "2h", rank: 2, suit: "h" },
        { id: "7h", rank: 7, suit: "h" },
        { id: "5h", rank: 5, suit: "h" },
        { id: "3c", rank: 3, suit: "c" },
        { id: "4d", rank: 4, suit: "d" },
      ],
      legal: [
        { type: "fold" },
        { type: "call", callAmount: 10 },
        { type: "raise", toAmount: 20 },
      ],
    });
    expect(action.type).toBe("raise");
    const to = (action.payload as { toAmount: number }).toAmount;
    expect(to).toBeGreaterThanOrEqual(20);
  });

  it("still folds trash to a big bet", async () => {
    const seat = createAggressiveHoldemSeat("ai1");
    const { action } = await seat.think({
      phase: "playing",
      street: "flop",
      bigBlind: 2,
      minRaiseTo: 40,
      potTotal: 30,
      currentBet: 20,
      you: {
        id: "ai1",
        toCall: 20,
        stack: 180,
        streetBet: 0,
        hole: [
          { id: "2c", rank: 2, suit: "c" },
          { id: "7d", rank: 7, suit: "d" },
        ],
      },
      board: [
        { id: "As", rank: 14, suit: "s" },
        { id: "Kd", rank: 13, suit: "d" },
        { id: "Qh", rank: 12, suit: "h" },
      ],
      legal: [
        { type: "fold" },
        { type: "call", callAmount: 20 },
        { type: "raise", toAmount: 40 },
      ],
    });
    expect(action.type).toBe("fold");
  });
});
