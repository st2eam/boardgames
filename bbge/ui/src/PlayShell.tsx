"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Action, Event } from "@bbge/core";
import { HostSession, type AiChatMessage, type LobbyState } from "@bbge/runtime";
import type { AiSeat } from "@bbge/ai";
import { LobbyView } from "./LobbyView";
import { requirePlayModule } from "./registry";
import type { PlayLogEntry, PluginPlayModule } from "./plugin-types";

export interface PlayShellProps {
  locale: string;
  slug: string;
  gameName: string;
  pluginId: string;
  roomIdFromUrl?: string | null;
  loadApiKey: () => Promise<string | null>;
  /** Shelf-provided LLM seat factory for this plugin (Actions only). */
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

function newRoomId(prefix: string): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `${prefix}-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

function newSeed(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Timeout based on **idle** time (no progress), not wall-clock from start.
 * Call `ping()` whenever the model streams thinking / content.
 */
function withIdleTimeout<T>(
  run: (ctl: { ping: () => void }) => Promise<T>,
  idleMs: number,
  label: string,
  absoluteMaxMs?: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let absoluteTimer: ReturnType<typeof setTimeout> | undefined;
    let settled = false;

    const clearAll = () => {
      if (idleTimer !== undefined) clearTimeout(idleTimer);
      if (absoluteTimer !== undefined) clearTimeout(absoluteTimer);
    };

    const fail = (msg: string) => {
      if (settled) return;
      settled = true;
      clearAll();
      reject(new Error(msg));
    };

    const armIdle = () => {
      if (idleTimer !== undefined) clearTimeout(idleTimer);
      idleTimer = setTimeout(
        () => fail(`${label} idle timeout`),
        idleMs,
      );
    };

    armIdle();
    if (absoluteMaxMs != null && absoluteMaxMs > 0) {
      absoluteTimer = setTimeout(
        () => fail(`${label} absolute timeout`),
        absoluteMaxMs,
      );
    }

    run({ ping: armIdle }).then(
      (v) => {
        if (settled) return;
        settled = true;
        clearAll();
        resolve(v);
      },
      (e) => {
        if (settled) return;
        settled = true;
        clearAll();
        reject(e);
      },
    );
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function aiThinkPaceMs(): number {
  return 1400 + Math.floor(Math.random() * 1600);
}

function aiBetweenPlaysMs(): number {
  return 700 + Math.floor(Math.random() * 900);
}

export function PlayShell({
  locale,
  gameName,
  pluginId,
  roomIdFromUrl,
  loadApiKey,
  createDeepSeekSeat,
}: PlayShellProps) {
  const mod = useMemo(() => requirePlayModule(pluginId), [pluginId]);
  const isHost = !roomIdFromUrl;
  const hostId = useMemo(() => "host", []);
  const [roomId, setRoomId] = useState(roomIdFromUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [phase, setPhase] = useState<"lobby" | "playing" | "finished">("lobby");
  const [view, setView] = useState<unknown>(null);
  const [chat, setChat] = useState<AiChatMessage[]>([]);
  const [thinkingId, setThinkingId] = useState<string | null>(null);
  const [thinkingDetail, setThinkingDetail] = useState<string | null>(null);
  const [playLog, setPlayLog] = useState<PlayLogEntry[]>([]);
  const [myId, setMyId] = useState(hostId);
  const [controllingId, setControllingId] = useState(hostId);
  const [displayName, setDisplayName] = useState(
    locale === "zh" ? "房主" : "Host",
  );
  const sessionRef = useRef<HostSession | null>(null);
  const modRef = useRef<PluginPlayModule>(mod);
  modRef.current = mod;
  const aiRef = useRef<Map<string, AiSeat>>(new Map());
  const llmSeatIdsRef = useRef<Set<string>>(new Set());
  const peerRef = useRef<{ destroy: () => void } | null>(null);
  const aiRunning = useRef(false);
  const localSeatIdsRef = useRef<Set<string>>(new Set([hostId]));

  const seatNames = useCallback((): Record<string, string> => {
    const seats = sessionRef.current?.getLobby().seats ?? lobby?.seats ?? [];
    return Object.fromEntries(seats.map((s) => [s.id, s.name]));
  }, [lobby]);

  const appendEvents = useCallback(
    (events: Event[]) => {
      const lines = modRef.current.formatEvents(events, locale, seatNames());
      if (lines.length === 0) return;
      setPlayLog((prev) => [...prev, ...lines].slice(-200));
    },
    [locale, seatNames],
  );

  const tick = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;
    setLobby(s.getLobby());
    setPhase(s.getPhase());
    setChat(s.getPublicChat());
    if (s.getPhase() !== "lobby") {
      const current = s.getCurrentPlayerId();
      const local = localSeatIdsRef.current;
      const viewer =
        isHost && current && local.has(current) ? current : myId;
      setControllingId(viewer);
      setView(s.getView(viewer));
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
        setChat((c) => [...c, msg]);
      }
    },
    [isHost, tick],
  );

  useEffect(() => {
    if (!isHost) return;
    const prefix = mod.roomIdPrefix ?? "bbge";
    const rid = newRoomId(prefix);
    setRoomId(rid);
    const session = new HostSession(mod.plugin, {
      seed: newSeed(),
      hostPlayerId: hostId,
      canStartAi: async () => true,
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
            const { playerId, name } = msg.payload as {
              playerId: string;
              name: string;
            };
            s.addHumanSeat(playerId, name);
            host.broadcast({ type: "lobby", payload: s.getLobby() });
            tick();
          } else if (msg.type === "action") {
            const result = s.submitAction(msg.payload as Action);
            if (!result.ok) {
              if (fromPeer) {
                host.send(fromPeer, {
                  type: "actionReject",
                  payload: { error: result.error },
                });
              }
              return;
            }
            appendEvents(result.events);
            for (const [pid, v] of result.views) {
              host.broadcast({ type: "events", payload: result.events });
              host.broadcast({ type: "phase", payload: { phase: s.getPhase() } });
              host.send(pid, { type: "view", payload: v });
            }
            tick();
            void runAiIfNeeded();
          } else if (msg.type === "chat") {
            s.pushChat(msg.payload as AiChatMessage);
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
      sessionRef.current = null;
      aiRef.current.clear();
      llmSeatIdsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, pluginId]);

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
          if (msg.type === "events") {
            appendEvents(msg.payload as Event[]);
          }
          if (msg.type === "chat") {
            const line = msg.payload as AiChatMessage;
            setChat((c) => {
              if (
                c.some(
                  (x) =>
                    x.at === line.at &&
                    x.playerId === line.playerId &&
                    x.text === line.text,
                )
              ) {
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
          if (msg.type === "actionReject")
            setError((msg.payload as { error: string }).error);
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
  }, [isHost, roomIdFromUrl, pluginId]);

  const resolveAiSeat = async (
    seatId: string,
  ): Promise<{ seat: AiSeat; isLlm: boolean }> => {
    const existing = aiRef.current.get(seatId);
    if (existing) {
      return { seat: existing, isLlm: llmSeatIdsRef.current.has(seatId) };
    }
    const key = await loadApiKey();
    if (key && createDeepSeekSeat) {
      const seat = createDeepSeekSeat(seatId, key);
      aiRef.current.set(seatId, seat);
      llmSeatIdsRef.current.add(seatId);
      return { seat, isLlm: true };
    }
    const seat = modRef.current.createMockSeat(seatId);
    aiRef.current.set(seatId, seat);
    return { seat, isLlm: false };
  };

  const runAiIfNeeded = async () => {
    if (aiRunning.current) return;
    const s = sessionRef.current;
    if (!s || s.getPhase() !== "playing") return;
    const current = s.getCurrentPlayerId();
    if (!current || !s.getAiSeatIds().includes(current)) return;

    aiRunning.current = true;
    const host = peerRef.current as PeerHost | null;
    const paceMs = aiThinkPaceMs();
    const thinkStarted = Date.now();
    setThinkingId(current);
    setThinkingDetail(
      locale === "zh" ? "准备决策…" : "Preparing decision…",
    );
    host?.broadcast?.({
      type: "aiPresence",
      payload: { type: "ai/thinking", playerId: current, started: true },
    });
    setPlayLog((prev) => [
      ...prev,
      {
        id: `think-${current}-${thinkStarted}`,
        at: thinkStarted,
        text:
          locale === "zh"
            ? `${seatNames()[current] ?? current} 正在思考…`
            : `${seatNames()[current] ?? current} is thinking…`,
      },
    ]);

    const pushThinkProgress = (p: {
      note?: string;
      thinkingText?: string;
      draftText?: string;
    }) => {
      // Prefer model reasoning; fall back to note + truncated draft JSON
      const parts: string[] = [];
      if (p.thinkingText?.trim()) parts.push(p.thinkingText.trim());
      else if (p.note) parts.push(p.note);
      if (p.draftText?.trim()) {
        const d = p.draftText.trim();
        parts.push(
          parts.length
            ? `---\n${d.slice(-400)}`
            : d.slice(-600),
        );
      }
      if (parts.length) setThinkingDetail(parts.join("\n"));
    };

    try {
      const v = s.getView(current);
      const auto = modRef.current.tryAutoAiAction?.(v, current) ?? null;
      if (auto) {
        setThinkingDetail(
          locale === "zh"
            ? `自动步骤：${auto.type}`
            : `Auto step: ${auto.type}`,
        );
        await sleep(1600 + Math.floor(Math.random() * 1200));
        const result = s.submitAction(auto);
        if (result.ok) {
          appendEvents(result.events);
          tick();
          await sleep(aiBetweenPlaysMs());
        } else {
          setError(result.error);
        }
      } else {
        const { seat, isLlm } = await resolveAiSeat(current);
        // Idle: no stream progress for this long → fallback.
        // Streaming thinking/content calls ping() and resets the idle clock.
        const idleMs = isLlm ? 90_000 : 8_000;
        const absoluteMaxMs = isLlm ? 15 * 60_000 : undefined;
        let action: Action;
        try {
          const decide = withIdleTimeout(
            ({ ping }) =>
              seat.think(v, {
                onProgress: (p) => {
                  ping();
                  pushThinkProgress(p);
                },
              }),
            idleMs,
            "AI think",
            absoluteMaxMs,
          );
          const [, decided] = await Promise.all([sleep(paceMs), decide]);
          action = decided;
        } catch (err) {
          const mock = modRef.current.createMockSeat(current);
          const remaining = Math.max(0, paceMs - (Date.now() - thinkStarted));
          const [decided] = await Promise.all([
            mock.think(s.getView(current), { onProgress: pushThinkProgress }),
            remaining > 0 ? sleep(remaining) : Promise.resolve(),
          ]);
          action = decided;
          const why =
            err instanceof Error && /idle timeout/i.test(err.message)
              ? locale === "zh"
                ? "LLM 长时间无响应"
                : "LLM idle (no response)"
              : err instanceof Error && /timeout/i.test(err.message)
                ? locale === "zh"
                  ? "LLM 出牌超时"
                  : "LLM play timed out"
                : locale === "zh"
                  ? "LLM 出牌失败"
                  : "LLM play failed";
          setPlayLog((prev) => [
            ...prev,
            {
              id: `fallback-${Date.now()}`,
              at: Date.now(),
              text:
                locale === "zh"
                  ? `${seatNames()[current] ?? current}：${why}，本回合暂用本地决策（下回合仍走 LLM）`
                  : `${seatNames()[current] ?? current}: ${why}; local decision this turn only`,
              tone: "warn",
            },
          ]);
        }

        let result = s.submitAction(action);
        if (!result.ok) {
          const mock = modRef.current.createMockSeat(current);
          await sleep(400 + Math.floor(Math.random() * 400));
          const retry = await mock.think(s.getView(current));
          result = s.submitAction(retry);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setPlayLog((prev) => [
            ...prev,
            {
              id: `illegal-${Date.now()}`,
              at: Date.now(),
              text:
                locale === "zh"
                  ? `${seatNames()[current] ?? current}：LLM 出牌非法，本回合改本地补救`
                  : `${seatNames()[current] ?? current}: illegal LLM action; local fix this turn`,
              tone: "warn",
            },
          ]);
        }
        appendEvents(result.events);
        tick();

        await sleep(350 + Math.floor(Math.random() * 350));
        setThinkingId(null);
        setThinkingDetail(null);
        host?.broadcast?.({
          type: "aiPresence",
          payload: { type: "ai/thinking", playerId: current, started: false },
        });

        await sleep(aiBetweenPlaysMs());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI failed");
    } finally {
      setThinkingId(null);
      setThinkingDetail(null);
      host?.broadcast?.({
        type: "aiPresence",
        payload: { type: "ai/thinking", playerId: current, started: false },
      });
      aiRunning.current = false;
    }
    await runAiIfNeeded();
  };

  const onAddAi = () => {
    const s = sessionRef.current;
    if (!s) return;
    const n = s.getLobby().seats.filter((x) => x.kind === "ai").length + 1;
    const id = `ai-${n}`;
    s.addAiSeat(id, locale === "zh" ? `AI ${n}` : `AI ${n}`);
    tick();
  };

  const onAddHotseat = () => {
    const s = sessionRef.current;
    if (!s) return;
    const n = s.getLobby().seats.length;
    const id = `p-${n}`;
    s.addHumanSeat(id, `${locale === "zh" ? "玩家" : "Player"} ${n}`);
    localSeatIdsRef.current.add(id);
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
    setPlayLog([
      {
        id: `start-${Date.now()}`,
        at: Date.now(),
        text: locale === "zh" ? "对局开始" : "Match started",
        tone: "win",
      },
    ]);
    tick();
    await runAiIfNeeded();
  };

  const onRematch = () => {
    if (!isHost) return;
    const s = sessionRef.current;
    if (!s) return;
    const result = s.rematch(newSeed());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    aiRunning.current = false;
    setThinkingId(null);
    setThinkingDetail(null);
    setPlayLog([
      {
        id: `rematch-${Date.now()}`,
        at: Date.now(),
        text: locale === "zh" ? "再来一局 · 重新发牌" : "Play again · new deal",
        tone: "win",
      },
    ]);
    const host = peerRef.current as PeerHost | null;
    host?.broadcast?.({ type: "phase", payload: { phase: s.getPhase() } });
    for (const [pid, v] of result.views) {
      host?.send?.(pid, { type: "view", payload: v });
    }
    tick();
    void runAiIfNeeded();
  };

  const onDispatch = (action: Action) => {
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
    appendEvents(result.events);
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

  const Table = mod.Table;

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
        <Table
          locale={locale}
          view={view}
          myId={controllingId}
          disabled={Boolean(thinkingId)}
          thinkingId={thinkingId}
          thinkingDetail={thinkingDetail}
          onAction={onDispatch}
          onRematch={isHost ? onRematch : undefined}
          playLog={playLog}
          chat={chat}
          onChat={onChat}
          nameOf={nameOf}
        />
      ) : null}
    </div>
  );
}
