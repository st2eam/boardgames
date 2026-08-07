import type { WireMessage } from "./messages";
import { parseWireMessage } from "./messages";

type DataConn = {
  peer: string;
  send: (data: unknown) => void;
  on: (ev: string, fn: (...args: never[]) => void) => void;
  close: () => void;
};

type Handler = (msg: WireMessage, fromPeer?: string) => void;

/** PeerJS-backed room. Loaded dynamically so Next SSR never touches peerjs. */
export async function createPeerRoomHost(roomId: string): Promise<{
  roomId: string;
  onMessage: (cb: Handler) => void;
  send: (peerId: string, msg: WireMessage) => void;
  broadcast: (msg: WireMessage, except?: string) => void;
  destroy: () => void;
}> {
  const { default: Peer } = await import("peerjs");
  const peer = new Peer(roomId);
  await new Promise<void>((resolve, reject) => {
    peer.on("open", () => resolve());
    peer.on("error", (err) => reject(err));
  });
  const conns = new Map<string, DataConn>();
  let handler: Handler | null = null;

  peer.on("connection", (conn) => {
    const c = conn as unknown as DataConn;
    c.on("open", (() => {
      conns.set(c.peer, c);
      c.on("data", ((data: unknown) => {
        const msg = parseWireMessage(data);
        if (msg && handler) handler(msg, c.peer);
      }) as never);
    }) as never);
    c.on("close", (() => conns.delete(c.peer)) as never);
  });

  return {
    roomId,
    onMessage(cb) {
      handler = cb;
    },
    send(peerId, msg) {
      conns.get(peerId)?.send(msg);
    },
    broadcast(msg, except) {
      for (const [id, c] of conns) {
        if (id === except) continue;
        c.send(msg);
      }
    },
    destroy() {
      peer.destroy();
    },
  };
}

export async function createPeerRoomGuest(roomId: string): Promise<{
  peerId: string;
  onMessage: (cb: (msg: WireMessage) => void) => void;
  send: (msg: WireMessage) => void;
  destroy: () => void;
}> {
  const { default: Peer } = await import("peerjs");
  const peer = new Peer();
  await new Promise<void>((resolve, reject) => {
    peer.on("open", () => resolve());
    peer.on("error", (err) => reject(err));
  });
  const conn = peer.connect(roomId, { reliable: true }) as unknown as DataConn & {
    on: (ev: string, fn: (...args: never[]) => void) => void;
  };
  await new Promise<void>((resolve, reject) => {
    conn.on("open", (() => resolve()) as never);
    conn.on("error", ((err: Error) => reject(err)) as never);
    peer.on("error", (err) => reject(err));
  });
  let handler: ((msg: WireMessage) => void) | null = null;
  conn.on("data", ((data: unknown) => {
    const msg = parseWireMessage(data);
    if (msg && handler) handler(msg);
  }) as never);
  return {
    peerId: peer.id!,
    onMessage(cb) {
      handler = cb;
    },
    send(msg) {
      conn.send(msg);
    },
    destroy() {
      conn.close();
      peer.destroy();
    },
  };
}
