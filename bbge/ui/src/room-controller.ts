import type { Action, Event, PlayerId } from "@bbge/core";
import type { PeerRoomHost } from "@bbge/network";
import { ROOM_PROTOCOL_VERSION, type RoomStateSync, type WireMessage } from "@bbge/network";
import {
  HostSession,
  type AiChatMessage,
  type SubmitOk,
} from "@bbge/runtime";

const RECONNECT_GRACE_MS = 30_000;

type RemoteSeat = {
  playerId: PlayerId;
  resumeToken: string;
  actionIds: Set<string>;
};

function token(prefix: string): string {
  const bytes = new Uint8Array(18);
  globalThis.crypto.getRandomValues(bytes);
  return `${prefix}-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export type HostRoomControllerOptions = {
  session: HostSession;
  transport: PeerRoomHost;
  maxSeats: number;
  onLobbyChanged?: () => void;
  onActionAccepted?: (result: SubmitOk, playerId: PlayerId) => void;
  onChat?: (message: AiChatMessage) => void;
  onGraceExpired?: (playerId: PlayerId) => void;
};

/**
 * Host-authoritative v2 room controller. Transport only gives peer ids; this
 * controller binds them to host-owned seats and is the single synchronization
 * point for lobby, game state, and private projected views.
 */
export class HostRoomController {
  private revision = 0;
  private readonly peers = new Map<string, RemoteSeat>();
  private readonly tokenToPlayer = new Map<string, PlayerId>();
  private readonly peerForPlayer = new Map<PlayerId, string>();
  private readonly disconnectTimers = new Map<PlayerId, number>();

  constructor(private readonly opts: HostRoomControllerOptions) {
    opts.transport.onMessage((message, peerId) => this.onMessage(message, peerId));
    opts.transport.onPeerLeft((peerId) => this.onPeerLeft(peerId));
  }

  private snapshot(playerId: PlayerId, events?: Event[]): RoomStateSync {
    const phase = this.opts.session.getPhase();
    return {
      revision: this.revision,
      phase,
      lobby: this.opts.session.getLobby(),
      view: phase === "lobby" ? null : this.opts.session.getView(playerId),
      chat: this.opts.session.getPublicChat(),
      ...(events?.length ? { events } : {}),
    };
  }

  private sendState(peerId: string, playerId: PlayerId, events?: Event[]): void {
    this.opts.transport.send(peerId, {
      type: "stateSync",
      protocolVersion: ROOM_PROTOCOL_VERSION,
      payload: this.snapshot(playerId, events),
    });
  }

  /** Call after every host-authoritative mutation, including lobby changes. */
  publishState(events?: Event[]): number {
    this.revision += 1;
    for (const [peerId, remote] of this.peers) {
      this.sendState(peerId, remote.playerId, events);
    }
    return this.revision;
  }

  broadcastAiPresence(payload: unknown): void {
    this.opts.transport.broadcast({
      type: "aiPresence",
      protocolVersion: ROOM_PROTOCOL_VERSION,
      payload,
    });
  }

  broadcastChat(message: AiChatMessage): void {
    this.opts.transport.broadcast({
      type: "chatSync",
      protocolVersion: ROOM_PROTOCOL_VERSION,
      payload: message,
    });
  }

  forgetPlayer(playerId: PlayerId): void {
    const peerId = this.peerForPlayer.get(playerId);
    if (peerId) this.peers.delete(peerId);
    this.peerForPlayer.delete(playerId);
    for (const [resumeToken, id] of this.tokenToPlayer) {
      if (id === playerId) this.tokenToPlayer.delete(resumeToken);
    }
    const timer = this.disconnectTimers.get(playerId);
    if (timer) window.clearTimeout(timer);
    this.disconnectTimers.delete(playerId);
  }

  private reject(peerId: string, code: "room-full" | "match-in-progress" | "protocol-mismatch" | "invalid-resume" | "room-unavailable", error: string) {
    this.opts.transport.send(peerId, {
      type: "joinRejected",
      protocolVersion: ROOM_PROTOCOL_VERSION,
      payload: { code, error },
    });
  }

  private onJoin(peerId: string, message: Extract<WireMessage, { type: "joinRequest" }>): void {
    const rawName = message.payload.name.trim();
    const name = rawName || "Player";
    const resumeToken = message.payload.resumeToken;
    if (resumeToken) {
      const playerId = this.tokenToPlayer.get(resumeToken);
      if (!playerId || !this.opts.session.getLobby().seats.some((seat) => seat.id === playerId)) {
        this.reject(peerId, "invalid-resume", "This restore link is no longer valid. Ask the host for a new invitation.");
        return;
      }
      const previousPeer = this.peerForPlayer.get(playerId);
      if (previousPeer && previousPeer !== peerId) this.peers.delete(previousPeer);
      const timer = this.disconnectTimers.get(playerId);
      if (timer) window.clearTimeout(timer);
      this.disconnectTimers.delete(playerId);
      this.opts.session.convertToHuman(playerId, name);
      this.peers.set(peerId, { playerId, resumeToken, actionIds: new Set() });
      this.peerForPlayer.set(playerId, peerId);
      this.revision += 1;
      this.opts.transport.send(peerId, {
        type: "joinAccepted",
        protocolVersion: ROOM_PROTOCOL_VERSION,
        payload: { playerId, resumeToken, state: this.snapshot(playerId) },
      });
      this.publishState();
      this.opts.onLobbyChanged?.();
      return;
    }

    if (this.opts.session.getPhase() !== "lobby") {
      this.reject(peerId, "match-in-progress", "The match has already started. Only its original players can reconnect.");
      return;
    }
    if (this.opts.session.getLobby().seats.length >= this.opts.maxSeats) {
      this.reject(peerId, "room-full", "The room is full.");
      return;
    }
    let playerId = token("p").slice(0, 14);
    while (this.opts.session.getLobby().seats.some((seat) => seat.id === playerId)) playerId = token("p").slice(0, 14);
    const issuedToken = token("resume");
    this.opts.session.addHumanSeat(playerId, name);
    this.opts.session.setReady(playerId, true);
    this.peers.set(peerId, { playerId, resumeToken: issuedToken, actionIds: new Set() });
    this.peerForPlayer.set(playerId, peerId);
    this.tokenToPlayer.set(issuedToken, playerId);
    this.revision += 1;
    this.opts.transport.send(peerId, {
      type: "joinAccepted",
      protocolVersion: ROOM_PROTOCOL_VERSION,
      payload: { playerId, resumeToken: issuedToken, state: this.snapshot(playerId) },
    });
    this.publishState();
    this.opts.onLobbyChanged?.();
  }

  private onAction(peerId: string, message: Extract<WireMessage, { type: "actionRequest" }>): void {
    const remote = this.peers.get(peerId);
    if (!remote) return;
    const { clientActionId } = message.payload;
    if (remote.actionIds.has(clientActionId)) {
      this.opts.transport.send(peerId, {
        type: "actionAccepted",
        protocolVersion: ROOM_PROTOCOL_VERSION,
        payload: { clientActionId, revision: this.revision },
      });
      return;
    }
    remote.actionIds.add(clientActionId);
    if (remote.actionIds.size > 100) remote.actionIds.delete(remote.actionIds.values().next().value as string);
    // Do not accept a remote playerId. The connection binding is authority.
    const result = this.opts.session.submitAction({
      type: message.payload.action.type,
      payload: message.payload.action.payload,
      playerId: remote.playerId,
      clientActionId,
    } as Action);
    if (!result.ok) {
      this.opts.transport.send(peerId, {
        type: "actionRejected",
        protocolVersion: ROOM_PROTOCOL_VERSION,
        payload: { clientActionId, error: result.error },
      });
      return;
    }
    const revision = this.publishState(result.events);
    this.opts.transport.send(peerId, {
      type: "actionAccepted",
      protocolVersion: ROOM_PROTOCOL_VERSION,
      payload: { clientActionId, revision },
    });
    this.opts.onActionAccepted?.(result, remote.playerId);
  }

  private onChat(peerId: string, message: Extract<WireMessage, { type: "chatRequest" }>): void {
    const remote = this.peers.get(peerId);
    if (!remote) return;
    const chat: AiChatMessage = { playerId: remote.playerId, text: message.payload.text, at: message.payload.at };
    this.opts.session.pushChat(chat);
    this.broadcastChat(chat);
    this.opts.onChat?.(chat);
  }

  private onMessage(message: WireMessage, peerId: string): void {
    if (message.type === "joinRequest") this.onJoin(peerId, message);
    else if (message.type === "actionRequest") this.onAction(peerId, message);
    else if (message.type === "chatRequest") this.onChat(peerId, message);
  }

  private onPeerLeft(peerId: string): void {
    const remote = this.peers.get(peerId);
    if (!remote) return;
    this.peers.delete(peerId);
    this.peerForPlayer.delete(remote.playerId);
    const existing = this.disconnectTimers.get(remote.playerId);
    if (existing) window.clearTimeout(existing);
    this.disconnectTimers.set(remote.playerId, window.setTimeout(() => {
      this.disconnectTimers.delete(remote.playerId);
      if (this.opts.session.getPhase() === "lobby") {
        this.opts.session.removeSeat(remote.playerId);
        this.forgetPlayer(remote.playerId);
      } else if (this.opts.session.getPhase() === "playing") {
        this.opts.session.convertToAi(remote.playerId);
      }
      this.publishState();
      this.opts.onGraceExpired?.(remote.playerId);
      this.opts.onLobbyChanged?.();
    }, RECONNECT_GRACE_MS));
  }

  destroy(): void {
    for (const timer of this.disconnectTimers.values()) window.clearTimeout(timer);
    this.disconnectTimers.clear();
  }
}

export type GuestRoomUpdate =
  | { type: "joined"; playerId: string; sync: RoomStateSync }
  | { type: "sync"; sync: RoomStateSync }
  | { type: "accepted"; clientActionId: string }
  | { type: "rejected"; clientActionId: string; error: string }
  | { type: "joinRejected"; error: string }
  | { type: "chat"; message: AiChatMessage }
  | { type: "aiPresence"; payload: unknown }
  | null;

type TokenStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Guest-side protocol state: revision gate + refresh-safe resume token. */
export class GuestRoomController {
  private revision = -1;
  private resumeToken?: string;
  private readonly storageKey: string;

  constructor(private readonly pluginId: string, private readonly roomId: string, storage?: TokenStorage) {
    this.storage = storage ?? (typeof window === "undefined" ? undefined : window.sessionStorage);
    this.storageKey = `bbge:v2:${pluginId}:${roomId}:resume`;
    this.resumeToken = this.storage?.getItem(this.storageKey) ?? undefined;
  }

  private readonly storage?: TokenStorage;

  joinRequest(name: string): Extract<WireMessage, { type: "joinRequest" }> {
    return {
      type: "joinRequest",
      protocolVersion: ROOM_PROTOCOL_VERSION,
      payload: { name: name.trim().slice(0, 80), ...(this.resumeToken ? { resumeToken: this.resumeToken } : {}) },
    };
  }

  actionRequest(action: Action): Extract<WireMessage, { type: "actionRequest" }> {
    const clientActionId = action.clientActionId || token("a");
    return {
      type: "actionRequest",
      protocolVersion: ROOM_PROTOCOL_VERSION,
      payload: { clientActionId, action: { type: action.type, payload: action.payload } },
    };
  }

  chatRequest(text: string, at: number): Extract<WireMessage, { type: "chatRequest" }> {
    return { type: "chatRequest", protocolVersion: ROOM_PROTOCOL_VERSION, payload: { text, at } };
  }

  handle(message: WireMessage): GuestRoomUpdate {
    if (message.type === "joinAccepted") {
      this.resumeToken = message.payload.resumeToken;
      this.storage?.setItem(this.storageKey, message.payload.resumeToken);
      this.revision = message.payload.state.revision;
      return { type: "joined", playerId: message.payload.playerId, sync: message.payload.state };
    }
    if (message.type === "stateSync") {
      if (message.payload.revision <= this.revision) return null;
      this.revision = message.payload.revision;
      return { type: "sync", sync: message.payload };
    }
    if (message.type === "actionAccepted") return { type: "accepted", clientActionId: message.payload.clientActionId };
    if (message.type === "actionRejected") return { type: "rejected", ...message.payload };
    if (message.type === "joinRejected") return { type: "joinRejected", error: message.payload.error };
    if (message.type === "chatSync") return { type: "chat", message: message.payload };
    if (message.type === "aiPresence") return { type: "aiPresence", payload: message.payload };
    return null;
  }
}
