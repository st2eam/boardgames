import { describe, expect, it } from "vitest";
import { createAggressiveHoldemSeat } from "../src/mockSeat";

describe("createAggressiveHoldemSeat (aggressive + pot odds)", () => {
  it("value-bets a flush when checked to", async () => {
    const seat = createAggressiveHoldemSeat("ai1");
    const { action } = await seat.think({
      phase: "playing",
      street: "river",
      bigBlind: 2,
      minRaiseTo: 2,
      potTotal: 20,
      currentBet: 0,
      seats: [{ id: "h" }, { id: "ai1" }],
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

  it("raises a flush for value when facing a bet", async () => {
    const seat = createAggressiveHoldemSeat("ai1");
    const { action } = await seat.think({
      phase: "playing",
      street: "river",
      bigBlind: 2,
      minRaiseTo: 20,
      potTotal: 40,
      currentBet: 10,
      seats: [{ id: "h" }, { id: "ai1" }],
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

  it("folds trash when the price is bad (no odds)", async () => {
    const seat = createAggressiveHoldemSeat("ai1");
    const { action } = await seat.think({
      phase: "playing",
      street: "flop",
      bigBlind: 2,
      minRaiseTo: 40,
      potTotal: 30,
      currentBet: 20,
      seats: [{ id: "h" }, { id: "ai1" }],
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
    // toCall 20 into pot 30 → need 40% equity; 72o air folds
    expect(action.type).toBe("fold");
  });

  it("peels cheap pots with air when pot odds are good", async () => {
    const seat = createAggressiveHoldemSeat("ai1");
    const { action } = await seat.think({
      phase: "playing",
      street: "flop",
      bigBlind: 2,
      minRaiseTo: 6,
      potTotal: 40,
      currentBet: 4,
      seats: [{ id: "h" }, { id: "ai1" }],
      you: {
        id: "ai1",
        toCall: 4,
        stack: 196,
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
        { type: "call", callAmount: 4 },
        { type: "raise", toAmount: 6 },
      ],
    });
    // price ≈ 4/44 ≈ 9% — peel or poke
    expect(["call", "raise"]).toContain(action.type);
  });

  it("can river-bluff with an ace blocker when checked to", async () => {
    const seat = createAggressiveHoldemSeat("ai10");
    const { action } = await seat.think({
      phase: "playing",
      street: "river",
      bigBlind: 2,
      minRaiseTo: 2,
      potTotal: 24,
      currentBet: 0,
      seats: [{ id: "h" }, { id: "ai10" }],
      you: {
        id: "ai10",
        toCall: 0,
        stack: 160,
        streetBet: 0,
        hole: [
          { id: "Ac", rank: 14, suit: "c" },
          { id: "2d", rank: 2, suit: "d" },
        ],
      },
      board: [
        { id: "Kh", rank: 13, suit: "h" },
        { id: "7h", rank: 7, suit: "h" },
        { id: "3h", rank: 3, suit: "h" },
        { id: "9s", rank: 9, suit: "s" },
        { id: "Td", rank: 10, suit: "d" },
      ],
      legal: [
        { type: "fold" },
        { type: "check" },
        { type: "raise", toAmount: 2 },
      ],
    });
    expect(action.type).toBe("raise");
  });

  it("opens premiums hard preflop", async () => {
    const seat = createAggressiveHoldemSeat("ai1");
    const { action } = await seat.think({
      phase: "playing",
      street: "preflop",
      bigBlind: 2,
      minRaiseTo: 4,
      potTotal: 3,
      currentBet: 2,
      seats: [{ id: "h" }, { id: "ai1" }],
      you: {
        id: "ai1",
        toCall: 0,
        stack: 198,
        streetBet: 2,
        hole: [
          { id: "As", rank: 14, suit: "s" },
          { id: "Kd", rank: 13, suit: "d" },
        ],
      },
      board: [],
      legal: [
        { type: "fold" },
        { type: "check" },
        { type: "raise", toAmount: 4 },
      ],
    });
    expect(action.type).toBe("raise");
  });
});
