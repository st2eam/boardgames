import { describe, expect, it } from "vitest";
import { nextPendingLocalSeat } from "./hotseat";

describe("simultaneous hotseat selection", () => {
  it("keeps the current player while they still have a choice", () => {
    expect(
      nextPendingLocalSeat("host", [
        { id: "host", pending: true },
        { id: "p-1", pending: true },
      ]),
    ).toBe("host");
  });

  it("passes control to the next local player after a response", () => {
    expect(
      nextPendingLocalSeat("host", [
        { id: "host", pending: false },
        { id: "p-1", pending: true },
        { id: "remote", pending: true },
      ]),
    ).toBe("p-1");
  });

  it("returns null after all local players respond", () => {
    expect(
      nextPendingLocalSeat("host", [
        { id: "host", pending: false },
        { id: "p-1", pending: false },
      ]),
    ).toBeNull();
  });
});
