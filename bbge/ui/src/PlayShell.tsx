"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { HostSession, type AiChatMessage, type LobbyState } from "@bbge/runtime";
import { loveLetterPlugin, type LoveLetterAction } from "@bbge/love-letter";
import { createMockLoveLetterSeat } from "@bbge/ai";
import type { AiSeat } from "@bbge/ai";
import { LobbyView } from "./LobbyView";
import { TableChrome } from "./TableChrome";

const LoveLetterTable = dynamic(
  () =>
    import("../../plugins/love-letter/src/ui/LoveLetterTable").then(
      (m) => m.LoveLetterTable,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-[1.5rem] border-4 border-[#3E2723] bg-[#1a120e]">
        <p className="font-heading text-sm font-semibold text-accent animate-pulse">
          Loading table…
        </p>
      </div>
    ),
  },
);

export interface PlayShellProps {
  locale: string;
  slug: string;
  gameName: string;
  pluginId: string;
  roomIdFromUrl?: string | null;
  loadApiKey: () => Promise<string | null>;
  createDeepSeekSeat?: (id: string, apiKey: string) => AiSeat;
}

type PeerHost = {
  destroy: () => void;
  broadcast?: (m: unknown) => void;
  send?: (peerId: string, m: unknown) => void;
  onMessage?: (
    cb: (msg: { type: string; payload: unknown }, fromPeer?: string) => void,
  ) => void;
};

type PeerGuest = {
  destroy: () => void;
  send?: (m: unknown) => void;
  onMessage?: (cb: (msg: { type: string; payload: unknown }) => void) => void;
};

function newRoomId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `ll-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

function newSeed(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function PlayShell({
  locale,
  gameName,
  roomIdFromUrl,
  loadApiKey,
  createDeepSeekSeat,
}: PlayShellProps) {
  const isHost = !roomIdFromUrl;
  const hostId = useMemo(() => "host", []);
  const [roomId, setRoomId] = useState(roomIdFromUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [phase, setPhase] = useState<"lobby" | "playing" | "finished">("lobby");
  const [view, setView] = useState<unknown>(null);
  const [chat, setChat] = useState<AiChatMessage[]>([]);
  const [thinkingId, setThinkingId] = useState<string | null>(null);
  const [myId, setMyId] = useState(hostId);
  const [displayName, setDisplayName] = useState(
    locale === "zh" ? "房主" : "Host",
  );
  const sessionRef = useRef<HostSession | null>(null);
  const aiRef = useRef<Map<string, AiSeat>>(new Map());
  const peerRef = useRef<{ destroy: () => void } | null>(null);

  const tick = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;
    setLobby(s.getLobby());
    setPhase(s.getPhase());
    setChat(s.getPublicChat());
    if (s.getPhase() !== "lobby") {
      const current = s.getCurrentPlayerId() ?? myId;
      setView(s.getView(isHost ? current : myId));
    }
  }, [myId, isHost]);

  const publishChat = useCallback(
    (msg: AiChatMessage) => {
      if (isHost) {
        sessionRef.current?.pushChat(msg);
        const host = peerRef.current as PeerHost | null;
        host?.broadcast?.({ type: "chat", payload: msg });
        tick();
      } else {
        (peerRef.current as PeerGuest | null)?.send?.({
          type: "chat",
          payload: msg,
        });
        // optimistic local echo until host rebroadcasts
        setChat((c) => [...c, msg]);
      }
    },
    [isHost, tick],
  );

  // Host init
  useEffect(() => {
    if (!isHost) return;
    const rid = newRoomId();
    setRoomId(rid);
    const session = new HostSession(loveLetterPlugin, {
      seed: newSeed(),
      hostPlayerId: hostId,
      canStartAi: async () => {
        const seats = sessionRef.current?.getLobby().seats ?? [];
        if (!seats.some((x) => x.kind === "ai")) return true;
        const key = await loadApiKey();
        return Boolean(key);
      },
    });
    session.addHumanSeat(hostId, displayName);
    session.setReady(hostId, true);
    sessionRef.current = session;
    setMyId(hostId);
    tick();

    let cancelled = false;
    (async () => {
      try {
        const { createPeerRoomHost } = await import("@bbge/network");
        const host = await createPeerRoomHost(rid);
        if (cancelled) {
          host.destroy();
          return;
        }
        peerRef.current = host;
        host.onMessage((msg, fromPeer) => {
          const s = sessionRef.current;
          if (!s) return;
          if (msg.type === "hello") {
            const { playerId, name } = msg.payload;
            s.addHumanSeat(playerId, name);
            host.broadcast({ type: "lobby", payload: s.getLobby() });
            tick();
          } else if (msg.type === "action") {
            const result = s.submitAction(msg.payload as LoveLetterAction);
            if (!result.ok) {
              if (fromPeer) {
                host.send(fromPeer, {
                  type: "actionReject",
                  payload: { error: result.error },
                });
              }
              return;
            }
            for (const [pid, v] of result.views) {
              host.broadcast({ type: "events", payload: result.events });
              host.broadcast({ type: "phase", payload: { phase: s.getPhase() } });
              host.send(pid, { type: "view", payload: v });
            }
            tick();
            void runAiIfNeeded();
          } else if (msg.type === "chat") {
            s.pushChat(msg.payload);
            host.broadcast({ type: "chat", payload: msg.payload });
            tick();
          }
        });
      } catch (e) {
        setError(
          e instanceof Error
            ? `PeerJS: ${e.message}`
            : "PeerJS connection failed",
        );
      }
    })();

    return () => {
      cancelled = true;
      peerRef.current?.destroy();
      peerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost]);

  // Guest init
  useEffect(() => {
    if (isHost || !roomIdFromUrl) return;
    let cancelled = false;
    const guestId = `g-${Math.random().toString(36).slice(2, 8)}`;
    setMyId(guestId);
    (async () => {
      try {
        const { createPeerRoomGuest } = await import("@bbge/network");
        const guest = await createPeerRoomGuest(roomIdFromUrl);
        if (cancelled) {
          guest.destroy();
          return;
        }
        peerRef.current = guest;
        guest.send({
          type: "hello",
          payload: { playerId: guestId, name: displayName || guestId },
        });
        guest.onMessage((msg) => {
          if (msg.type === "lobby") setLobby(msg.payload as LobbyState);
          if (msg.type === "view") setView(msg.payload);
          if (msg.type === "phase")
            setPhase(msg.payload.phase as "lobby" | "playing" | "finished");
          if (msg.type === "chat") {
            const line = msg.payload as AiChatMessage;
            setChat((c) => {
              // de-dupe optimistic echo
              if (c.some((x) => x.at === line.at && x.playerId === line.playerId && x.text === line.text)) {
                return c;
              }
              return [...c, line];
            });
          }
          if (msg.type === "aiPresence") {
            const p = msg.payload as {
              type: string;
              playerId: string;
              started?: boolean;
            };
            if (p.type === "ai/thinking") {
              setThinkingId(p.started ? p.playerId : null);
            }
          }
          if (msg.type === "actionReject") setError(msg.payload.error);
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "join failed");
      }
    })();
    return () => {
      cancelled = true;
      peerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, roomIdFromUrl]);

  const resolveAiSeat = async (seatId: string): Promise<AiSeat> => {
    const existing = aiRef.current.get(seatId);
    if (existing) return existing;
    const key = await loadApiKey();
    const seat =
      key && createDeepSeekSeat
        ? createDeepSeekSeat(seatId, key)
        : createMockLoveLetterSeat(seatId);
    aiRef.current.set(seatId, seat);
    return seat;
  };

  const runAiIfNeeded = async () => {
    const s = sessionRef.current;
    if (!s || s.getPhase() !== "playing") return;
    const current = s.getCurrentPlayerId();
    if (!current || !s.getAiSeatIds().includes(current)) return;
    const seat = await resolveAiSeat(current);
    setThinkingId(current);
    const host = peerRef.current as PeerHost | null;
    host?.broadcast?.({
      type: "aiPresence",
      payload: { type: "ai/thinking", playerId: current, started: true },
    });
    try {
      const v = s.getView(current);
      const action = (await seat.think(v)) as LoveLetterAction;
      const result = s.submitAction(action);
      if (!result.ok) {
        setError(result.error);
        setThinkingId(null);
        return;
      }
      tick();
      let line: AiChatMessage | null = null;
      if (seat.speak) {
        try {
          line = await seat.speak({ view: v, lastEvents: result.events, locale });
        } catch {
          line = null;
        }
      }
      if (!line) {
        // Always surface something so the table talk panel is never silent after AI acts
        line = {
          playerId: current,
          text: locale === "zh" ? "出完了。" : "Played.",
          at: Date.now(),
        };
      }
      publishChat(line);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI failed");
    } finally {
      setThinkingId(null);
      host?.broadcast?.({
        type: "aiPresence",
        payload: { type: "ai/thinking", playerId: current, started: false },
      });
    }
    await runAiIfNeeded();
  };

  const onAddAi = () => {
    const s = sessionRef.current;
    if (!s) return;
    const id = `ai-${s.getLobby().seats.length}`;
    s.addAiSeat(id, locale === "zh" ? `AI ${id}` : `AI ${id}`);
    tick();
  };

  const onAddHotseat = () => {
    const s = sessionRef.current;
    if (!s) return;
    const id = `p-${s.getLobby().seats.length}`;
    s.addHumanSeat(id, `${locale === "zh" ? "玩家" : "Player"} ${id}`);
    tick();
  };

  const onStart = async () => {
    const s = sessionRef.current;
    if (!s) return;
    for (const seat of s.getLobby().seats) {
      if (seat.kind === "human") s.setReady(seat.id, true);
    }
    const r = await s.start();
    if (!r.ok) {
      setError(r.error);
      return;
    }
    tick();
    await runAiIfNeeded();
  };

  const onDispatch = (action: LoveLetterAction) => {
    if (!isHost) {
      (peerRef.current as PeerGuest | null)?.send?.({
        type: "action",
        payload: action,
      });
      return;
    }
    const s = sessionRef.current;
    if (!s) return;
    const result = s.submitAction(action);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    tick();
    void runAiIfNeeded();
  };

  const onChat = (text: string) => {
    publishChat({ playerId: myId, text, at: Date.now() });
  };

  const nameOf = (playerId: string) => {
    const seat = lobby?.seats.find((s) => s.id === playerId);
    return seat?.name ?? playerId;
  };

  const shareUrl =
    typeof window !== "undefined" && roomId
      ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
      : "";

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {error}
          <button
            type="button"
            className="ml-3 cursor-pointer text-xs font-semibold underline"
            onClick={() => setError(null)}
          >
            {locale === "zh" ? "关闭" : "Dismiss"}
          </button>
        </div>
      )}

      {phase === "lobby" && isHost && (
        <LobbyView
          locale={locale}
          lobby={lobby}
          shareUrl={shareUrl}
          displayName={displayName}
          onDisplayName={setDisplayName}
          onAddAi={onAddAi}
          onAddHotseat={onAddHotseat}
          onStart={() => void onStart()}
          onReady={() => {
            sessionRef.current?.setReady(hostId, true);
            tick();
          }}
        />
      )}

      {phase === "lobby" && !isHost && (
        <div className="rounded-3xl border border-border bg-white p-6 shadow-card">
          <p className="font-heading text-lg font-bold text-primary-dark">
            {locale === "zh" ? `加入「${gameName}」` : `Joined “${gameName}”`}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {locale === "zh" ? "等待房主开战…" : "Waiting for the host to start…"}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {(lobby?.seats ?? []).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-white">
                  {s.name.slice(0, 1)}
                </span>
                <span className="text-sm font-medium text-primary-dark">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(phase === "playing" || phase === "finished") && view != null ? (
        <LoveLetterTable
          locale={locale}
          view={view}
          myId={myId}
          hotseat={isHost}
          disabled={Boolean(thinkingId)}
          thinkingId={thinkingId}
          onAction={onDispatch}
          overlay={
            <TableChrome
              locale={locale}
              chat={chat}
              thinkingId={thinkingId}
              onSend={onChat}
              nameOf={nameOf}
            />
          }
        />
      ) : null}
    </div>
  );
}
