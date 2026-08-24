import { describe, it, expect } from "vitest";
import { ROOM_PROTOCOL_VERSION, parseWireMessage } from "./messages";

describe("parseWireMessage", () => {
  it("accepts a versioned join request", () => {
    const msg = parseWireMessage({
      type: "joinRequest",
      protocolVersion: ROOM_PROTOCOL_VERSION,
      payload: { name: "A" },
    });
    expect(msg?.type).toBe("joinRequest");
  });

  it("requires protocol v2", () => {
    expect(
      parseWireMessage({
        type: "joinRequest",
        protocolVersion: 1,
        payload: { name: "A" },
      }),
    ).toBeNull();
  });

  it("accepts atomic state sync", () => {
    const msg = parseWireMessage({
      type: "stateSync",
      protocolVersion: ROOM_PROTOCOL_VERSION,
      payload: { revision: 2, phase: "playing", lobby: {}, view: { hand: [] } },
    });
    expect(msg?.type).toBe("stateSync");
  });

  it("rejects garbage", () => {
    expect(parseWireMessage({ type: "nope" })).toBeNull();
  });
});
