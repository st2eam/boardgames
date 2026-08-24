import { describe, expect, it } from "vitest";
import type { GamePlugin } from "@bbge/core";
import { HostSession } from "@bbge/runtime";
import { ROOM_PROTOCOL_VERSION, type WireMessage } from "@bbge/network";
import { GuestRoomController, HostRoomController } from "./room-controller";

type State = { turn: string; played: string[] };
const plugin: GamePlugin<State> = {
  id: "test", name: "Test", version: "0.1.0",
  metadata: { minPlayers: 2, maxPlayers: 2, pacing: "turn" },
  createGame(config) { return { turn: (config as { playerIds: string[] }).playerIds[0]!, played: [] }; },
  validateAction(state, action) { return action.playerId === state.turn ? true : { error: "not your turn" }; },
  applyAction(state, action) { return { state: { turn: action.playerId === "host" ? "remote" : "host", played: [...state.played, action.playerId] }, events: [{ type: "played", payload: {} }] }; },
  checkVictory() { return null; },
  projectView(state, viewerId) { return { ...state, privateFor: viewerId }; },
  serialize: JSON.stringify,
  deserialize: JSON.parse,
};

function fakeHost() {
  const sent: { peerId: string; message: WireMessage }[] = [];
  let onMessage: ((msg: WireMessage, peerId: string) => void) | undefined;
  let onLeft: ((peerId: string) => void) | undefined;
  return {
    sent,
    transport: {
      roomId: "room",
      onMessage(cb: (msg: WireMessage, peerId: string) => void) { onMessage = cb; },
      onPeerLeft(cb: (peerId: string) => void) { onLeft = cb; },
      onStatus() {}, send(peerId: string, message: WireMessage) { sent.push({ peerId, message }); },
      broadcast(message: WireMessage) { sent.push({ peerId: "*", message }); }, destroy() {},
    },
    receive(message: WireMessage, peerId = "peer-a") { onMessage?.(message, peerId); },
    left(peerId = "peer-a") { onLeft?.(peerId); },
  };
}

describe("v2 room controller", () => {
  it("assigns the remote seat and ignores a forged action player id", async () => {
    const session = new HostSession(plugin, { seed: "test", hostPlayerId: "host" });
    session.addHumanSeat("host", "Host");
    session.setReady("host", true);
    const fake = fakeHost();
    new HostRoomController({ session, transport: fake.transport, maxSeats: 2 });
    fake.receive({ type: "joinRequest", protocolVersion: ROOM_PROTOCOL_VERSION, payload: { name: "Remote" } });
    const accepted = fake.sent.find((item) => item.message.type === "joinAccepted")!.message;
    expect(accepted.type).toBe("joinAccepted");
    if (accepted.type !== "joinAccepted") return;
    const remoteId = accepted.payload.playerId;
    await session.start();
    fake.sent.length = 0;
    fake.receive({
      type: "actionRequest", protocolVersion: ROOM_PROTOCOL_VERSION,
      payload: { clientActionId: "x", action: { type: "play", payload: { playerId: "host" } } },
    });
    const rejected = fake.sent.find((item) => item.message.type === "actionRejected")?.message;
    expect(rejected?.type).toBe("actionRejected");
    // Host's first turn makes remote action illegal, proving the connection—not payload—sets identity.
    expect(session.getView("host")).toMatchObject({ turn: "host", privateFor: "host" });
    expect(remoteId).not.toBe("host");
  });

  it("keeps the newest revision and persists a resume token", () => {
    const storage = new Map<string, string>();
    const store = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) };
    const guest = new GuestRoomController("uno", "room", store);
    const accepted = guest.handle({ type: "joinAccepted", protocolVersion: ROOM_PROTOCOL_VERSION, payload: { playerId: "p1", resumeToken: "resume-1234567890", state: { revision: 3, phase: "playing", lobby: {}, view: { hand: [1] } } } });
    expect(accepted?.type).toBe("joined");
    expect(guest.handle({ type: "stateSync", protocolVersion: ROOM_PROTOCOL_VERSION, payload: { revision: 2, phase: "lobby", lobby: {}, view: null } })).toBeNull();
    expect(guest.joinRequest("Player").payload.resumeToken).toBe("resume-1234567890");
  });
});
