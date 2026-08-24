import type { WireMessage } from "./messages";
import { parseWireMessage } from "./messages";

export type PeerConnectionStatus =
  | "connecting"
  | "open"
  | "disconnected"
  | "failed";

type DataConn = {
  peer: string;
  open?: boolean;
  send: (data: unknown) => void;
  on: (ev: string, fn: (...args: never[]) => void) => void;
  close: () => void;
};

type StatusHandler = (status: PeerConnectionStatus, reason?: string) => void;

export type PeerRoomHost = {
  roomId: string;
  onMessage: (cb: (msg: WireMessage, fromPeer: string) => void) => void;
  onPeerLeft: (cb: (peerId: string) => void) => void;
  onStatus: (cb: StatusHandler) => void;
  send: (peerId: string, msg: WireMessage) => void;
  broadcast: (msg: WireMessage, except?: string) => void;
  destroy: () => void;
};

export type PeerRoomGuest = {
  peerId: string;
  onMessage: (cb: (msg: WireMessage) => void) => void;
  onStatus: (cb: StatusHandler) => void;
  send: (msg: WireMessage) => void;
  destroy: () => void;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error(`${label} timed out`)),
      timeoutMs,
    );
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** PeerJS adapter. It deliberately knows nothing about game rules or seats. */
export async function createPeerRoomHost(
  roomId: string,
  opts: { timeoutMs?: number } = {},
): Promise<PeerRoomHost> {
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const { default: Peer } = await import("peerjs");
  const peer = new Peer(roomId);
  await withTimeout(
    new Promise<void>((resolve, reject) => {
      peer.on("open", () => resolve());
      peer.on("error", (err) => reject(err));
    }),
    timeoutMs,
    "Creating room",
  );

  const conns = new Map<string, DataConn>();
  let messageHandler: ((msg: WireMessage, fromPeer: string) => void) | null = null;
  let peerLeftHandler: ((peerId: string) => void) | null = null;
  let statusHandler: StatusHandler | null = null;
  const pending: { msg: WireMessage; fromPeer: string }[] = [];
  const emitStatus = (status: PeerConnectionStatus, reason?: string) =>
    statusHandler?.(status, reason);
  const deliver = (msg: WireMessage, fromPeer: string) => {
    if (messageHandler) messageHandler(msg, fromPeer);
    else pending.push({ msg, fromPeer });
  };

  peer.on("connection", (conn) => {
    const c = conn as unknown as DataConn;
    const early: WireMessage[] = [];
    let attached = false;
    const attach = () => {
      if (attached) return;
      attached = true;
      conns.set(c.peer, c);
      for (const msg of early.splice(0)) deliver(msg, c.peer);
    };
    c.on(
      "data",
      ((data: unknown) => {
        const msg = parseWireMessage(data);
        if (!msg) return;
        if (attached) deliver(msg, c.peer);
        else early.push(msg);
      }) as never,
    );
    c.on("open", (() => attach()) as never);
    if (c.open) attach();
    c.on(
      "close",
      (() => {
        if (!attached) return;
        attached = false;
        conns.delete(c.peer);
        peerLeftHandler?.(c.peer);
      }) as never,
    );
    c.on("error", ((err: Error) => emitStatus("failed", err.message)) as never);
  });
  peer.on(
    "disconnected",
    (() => emitStatus("disconnected", "Signalling connection lost")) as never,
  );
  peer.on("error", ((err: Error) => emitStatus("failed", err.message)) as never);

  return {
    roomId,
    onMessage(cb) {
      messageHandler = cb;
      for (const item of pending.splice(0)) cb(item.msg, item.fromPeer);
    },
    onPeerLeft(cb) {
      peerLeftHandler = cb;
    },
    onStatus(cb) {
      statusHandler = cb;
      cb("open");
    },
    send(peerId, msg) {
      conns.get(peerId)?.send(msg);
    },
    broadcast(msg, except) {
      for (const [id, c] of conns) if (id !== except) c.send(msg);
    },
    destroy() {
      peer.destroy();
    },
  };
}

export async function createPeerRoomGuest(
  roomId: string,
  opts: { timeoutMs?: number } = {},
): Promise<PeerRoomGuest> {
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const { default: Peer } = await import("peerjs");
  const peer = new Peer();
  await withTimeout(
    new Promise<void>((resolve, reject) => {
      peer.on("open", () => resolve());
      peer.on("error", (err) => reject(err));
    }),
    timeoutMs,
    "Connecting to PeerJS",
  );
  const conn = peer.connect(roomId, { reliable: true }) as unknown as DataConn;
  await withTimeout(
    new Promise<void>((resolve, reject) => {
      conn.on("open", (() => resolve()) as never);
      conn.on("error", ((err: Error) => reject(err)) as never);
      peer.on("error", (err) => reject(err));
    }),
    timeoutMs,
    "Connecting to host",
  );

  let messageHandler: ((msg: WireMessage) => void) | null = null;
  let statusHandler: StatusHandler | null = null;
  const pending: WireMessage[] = [];
  const emitStatus = (status: PeerConnectionStatus, reason?: string) =>
    statusHandler?.(status, reason);
  conn.on(
    "data",
    ((data: unknown) => {
      const msg = parseWireMessage(data);
      if (!msg) return;
      if (messageHandler) messageHandler(msg);
      else pending.push(msg);
    }) as never,
  );
  conn.on("close", (() => emitStatus("disconnected", "Host connection closed")) as never);
  conn.on("error", ((err: Error) => emitStatus("failed", err.message)) as never);
  peer.on(
    "disconnected",
    (() => emitStatus("disconnected", "Signalling connection lost")) as never,
  );
  peer.on("error", ((err: Error) => emitStatus("failed", err.message)) as never);

  return {
    peerId: peer.id ?? "",
    onMessage(cb) {
      messageHandler = cb;
      for (const msg of pending.splice(0)) cb(msg);
    },
    onStatus(cb) {
      statusHandler = cb;
      cb("open");
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
