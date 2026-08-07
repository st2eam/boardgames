"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HostSession, type AiChatMessage, type LobbyState } from "@bbge/runtime";
import { loveLetterPlugin, type LoveLetterAction } from "@bbge/love-letter";
import { createMockLoveLetterSeat } from "@bbge/ai";
import type { AiSeat } from "@bbge/ai";
import { LobbyView } from "./LobbyView";
import { LoveLetterTable } from "../../plugins/love-letter/src/ui/LoveLetterTable";
import { TableChrome } from "./TableChrome";

export interface PlayShellProps {
  locale: string;
  slug: string;
  gameName: string;
  pluginId: string;
  roomIdFromUrl?: string | null;
  loadApiKey: () => Promise<string | null>;
  createDeepSeekSeat?: (id: string, apiKey: string) => AiSeat;
}

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
      // Host hotseat: show active seat's private view
      setView(s.getView(isHost ? current : myId));
    }
  }, [myId, isHost]);

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
              // send each peer their view — map peer by playerId convention peerId===playerId for guests
              host.broadcast({ type: "events", payload: result.events });
              host.broadcast({ type: "phase", payload: { phase: s.getPhase() } });
              host.send(pid, { type: "view", payload: v });
            }
            // also update host UI
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
            setChat((c) => [...c, msg.payload]);
          }
          if (msg.type === "aiPresence") {
            const p = msg.payload as { type: string; playerId: string; started?: boolean };
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

  const runAiIfNeeded = async () => {
    const s = sessionRef.current;
    if (!s || s.getPhase() !== "playing") return;
    const current = s.getCurrentPlayerId();
    if (!current || !s.getAiSeatIds().includes(current)) return;
    let seat = aiRef.current.get(current);
    if (!seat) {
      const key = await loadApiKey();
      if (key && createDeepSeekSeat) {
        seat = createDeepSeekSeat(current, key);
      } else {
        seat = createMockLoveLetterSeat(current);
      }
      aiRef.current.set(current, seat);
    }
    setThinkingId(current);
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
      const line = seat.speak
        ? await seat.speak({ view: v, lastEvents: result.events, locale })
        : null;
      if (line) {
        s.pushChat(line);
        tick();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI failed");
    } finally {
      setThinkingId(null);
    }
    // chain if still AI
    await runAiIfNeeded();
  };

  const onAddAi = () => {
    const s = sessionRef.current;
    if (!s) return;
    const id = `ai-${s.getLobby().seats.length}`;
    s.addAiSeat(id, locale === "zh" ? `AI ${id}` : `AI ${id}`);
    aiRef.current.set(id, createMockLoveLetterSeat(id));
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
    // ready all humans for hotseat convenience
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
      const guest = peerRef.current as { send?: (m: unknown) => void } | null;
      guest?.send?.({ type: "action", payload: action });
      return;
    }
    const s = sessionRef.current;
    if (!s) return;
    // hotseat: allow acting as current player
    const result = s.submitAction(action);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    tick();
    void runAiIfNeeded();
  };

  const onChat = (text: string) => {
    const msg = { playerId: myId, text, at: Date.now() };
    if (isHost) {
      sessionRef.current?.pushChat(msg);
      tick();
    } else {
      (peerRef.current as { send?: (m: unknown) => void } | null)?.send?.({
        type: "chat",
        payload: msg,
      });
    }
  };

  const shareUrl =
    typeof window !== "undefined" && roomId
      ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
      : "";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
        <h1 className="font-heading text-2xl font-bold text-primary-dark">
          {gameName}
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          {isHost
            ? locale === "zh"
              ? "你是房主（Host）。分享链接邀请好友，或同设备热座。"
              : "You are the host. Share the link or play hotseat."
            : locale === "zh"
              ? "已加入房间"
              : "Joined room"}
        </p>
        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

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
        <div className="rounded-2xl border border-border bg-white p-4 shadow-card text-sm text-stone-600">
          {locale === "zh" ? "等待房主开始…" : "Waiting for host to start…"}
          <ul className="mt-2 list-disc pl-5">
            {(lobby?.seats ?? []).map((s) => (
              <li key={s.id}>
                {s.name} ({s.kind})
              </li>
            ))}
          </ul>
        </div>
      )}

      {(phase === "playing" || phase === "finished") && view != null ? (
        <>
          <TableChrome
            locale={locale}
            chat={chat}
            thinkingId={thinkingId}
            onSend={onChat}
          />
          <LoveLetterTable
            locale={locale}
            view={view}
            myId={myId}
            hotseat={isHost}
            disabled={Boolean(thinkingId)}
            onAction={onDispatch}
          />
        </>
      ) : null}
    </div>
  );
}
