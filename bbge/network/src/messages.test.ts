import { describe, it, expect } from "vitest";
import { parseWireMessage } from "./messages";

describe("parseWireMessage", () => {
  it("accepts hello", () => {
    const msg = parseWireMessage({
      type: "hello",
      payload: { playerId: "a", name: "A" },
    });
    expect(msg?.type).toBe("hello");
  });

  it("rejects garbage", () => {
    expect(parseWireMessage({ type: "nope" })).toBeNull();
  });
});
