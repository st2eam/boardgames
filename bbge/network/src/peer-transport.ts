import type { WireMessage } from "./messages";
import { parseWireMessage } from "./messages";

type DataConn = {
  peer: string;
  send: (data: unknown) => void;
  on: (ev: string, fn: (...args: never[]) => void) => void;
  close: () => void;
};

type Handler = (msg: WireMessage, fromPeer?: string) => void;

/**
 * PeerJS-backed room. Loaded dynamically so Next SSR never touches peerjs.
 * Inbound messages are buffered until `onMessage` is registered (avoids the
 * classic race: guest hello → host lobby reply before guest handler exists).
 */
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
  const pending: { msg: WireMessage; fromPeer?: string }[] = [];

  const deliver = (msg: WireMessage, fromPeer?: string) => {
    if (handler) handler(msg, fromPeer);
    else pending.push({ msg, fromPeer });
  };

  peer.on("connection", (conn) => {
    const c = conn as unknown as DataConn;
    const earlyData: { msg: WireMessage; fromPeer: string }[] = [];
    let attached = false;

    // Listen immediately — before "open" fires — so no guest hello is
    // lost.  Buffer until the conn is tracked in `conns`.
    c.on("data", ((data: unknown) => {
      const msg = parseWireMessage(data);
      if (!msg) return;
      if (attached) {
        deliver(msg, c.peer);
      } else {
        earlyData.push({ msg, fromPeer: c.peer });
      }
    }) as never);

    const attach = () => {
      if (attached) return;
      attached = true;
      conns.set(c.peer, c);
      for (const item of earlyData) deliver(item.msg, item.fromPeer);
      earlyData.length = 0;
    };

    c.on("open", (() => attach()) as never);
    queueMicrotask(() => {
      if (!attached) {
        try { attach(); } catch { /* wait for open */ }
      }
    });
    c.on("close", (() => {
      conns.delete(c.peer);
      attached = false;
    }) as never);
  });

  return {
    roomId,
    onMessage(cb) {
      handler = cb;
      if (pending.length) {
        const batch = pending.splice(0, pending.length);
        for (const item of batch) cb(item.msg, item.fromPeer);
      }
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
  const pending: WireMessage[] = [];
  conn.on("data", ((data: unknown) => {
    const msg = parseWireMessage(data);
    if (!msg) return;
    if (handler) handler(msg);
    else pending.push(msg);
  }) as never);
  return {
    peerId: peer.id!,
    onMessage(cb) {
      handler = cb;
      if (pending.length) {
        const batch = pending.splice(0, pending.length);
        for (const msg of batch) cb(msg);
      }
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
