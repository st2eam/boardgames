import { describe, expect, it } from "vitest";
import type { Card, Rank, Suit } from "../src/cards";
import { bestHandScore, compareScores, scoreFive } from "../src/handEval";

function C(rank: Rank, suit: Suit, id = `${rank}${suit}`): Card {
  return { id, rank, suit };
}

describe("handEval", () => {
  it("ranks royal flush over quads", () => {
    const rf = scoreFive([
      C(14, "s"),
      C(13, "s"),
      C(12, "s"),
      C(11, "s"),
      C(10, "s"),
    ]);
    const quads = scoreFive([
      C(9, "h"),
      C(9, "d"),
      C(9, "c"),
      C(9, "s"),
      C(2, "h"),
    ]);
    expect(compareScores(rf, quads)).toBeGreaterThan(0);
  });

  it("detects wheel straight", () => {
    const sc = scoreFive([
      C(14, "h"),
      C(2, "d"),
      C(3, "c"),
      C(4, "s"),
      C(5, "h"),
    ]);
    expect(sc[0]).toBe(4);
    expect(sc[1]).toBe(5);
  });

  it("picks best 5 of 7", () => {
    const { category } = bestHandScore([
      C(14, "h"),
      C(14, "d"),
      C(14, "c"),
      C(2, "s"),
      C(2, "h"),
      C(9, "d"),
      C(3, "c"),
    ]);
    expect(category).toBe(6); // full house
  });
});
