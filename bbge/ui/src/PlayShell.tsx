"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Action, Event } from "@bbge/core";
import { createRng } from "@bbge/core";
import { HostSession, type AiChatMessage, type LobbyState } from "@bbge/runtime";
import type { AiSeat } from "@bbge/ai";
import {
  maxPlayersForMode,
  minPlayersForMode,
  normalizeNimmtMode,
  type NimmtMode,
} from "../../plugins/six-nimmt/src/modes";
import { normalizeGoEdition } from "../../plugins/go/src/state";
import { goEditionOptions } from "../../plugins/go/src/rules";
import { LobbyView } from "./LobbyView";
import { requirePlayModule } from "./registry";
import type { PlayLogEntry, PluginPlayModule } from "./plugin-types";

export interface PlayShellProps {
  locale: string;
  slug: string;
  gameName: string;
  pluginId: string;
  /** Initial Love Letter edition (lobby can change). */
  edition?: string;
  roomIdFromUrl?: string | null;
  loadApiKey: () => Promise<string | null>;
  /** Shelf-provided LLM seat factory for this plugin (Action + optional speak). */
  createDeepSeekSeat?: (id: string, apiKey: string) => AiSeat;
}

type LoveLetterEditionId = "classic" | "full" | "expansion";

function normalizeLlEdition(v: string | undefined): LoveLetterEditionId {
  if (v === "premium" || v === "classic") return "classic";
  if (v === "expansion") return "expansion";
  return "full";
}

function maxSeatsForLlEdition(edition: LoveLetterEditionId): number {
  if (edition === "classic") return 4;
  if (edition === "expansion") return 8;
  return 6;
}

/** Strip UI-only log lines; keep recent action/result text for LLM context. */
function battleLogLinesForAi(entries: PlayLogEntry[], max = 100): string[] {
  return entries
    .filter(
      (e) =>
        !/^(think-|think-parallel-|fallback-|illegal)/.test(e.id) &&
        e.text.trim().length > 0,
    )
    .slice(-max)
    .map((e) => e.text);
}

const NIMMT_MODE_OPTIONS: {
  id: NimmtMode;
  label: { en: string; zh: string };
  hint: { en: string; zh: string };
}[] = [
  {
    id: "classic",
    label: { en: "Classic", zh: "经典" },
    hint: { en: "2–10 · base rules", zh: "2–10 人 · 基础规则" },
  },
  {
    id: "pro",
    label: { en: "Pro draft", zh: "进阶选牌" },
    hint: { en: "2–6 · draft hands face-up", zh: "2–6 人 · 正面轮流选牌" },
  },
  {
    id: "fan-even-odd",
    label: { en: "Fan: Even/Odd", zh: "粉丝：奇偶" },
    hint: { en: "Parity-locked row", zh: "奇偶限制行" },
  },
  {
    id: "fan-mountain",
    label: { en: "Fan: Mountain", zh: "粉丝：登山" },
    hint: { en: "One descending row", zh: "一行改为降序" },
  },
  {
    id: "fan-jumping-cow",
    label: { en: "Fan: Jumping Cow", zh: "粉丝：跳牛" },
    hint: { en: "Cow fills a slot", zh: "跳牛占位并跳跃" },
  },
  {
    id: "fan-flippin",
    label: { en: "Fan: Flippin’ Digits", zh: "粉丝：翻数字" },
    hint: { en: "Flip tens/ones once", zh: "可翻一次个位十位" },
  },
  {
    id: "buffalo",
    label: { en: "Beat the Buffalo", zh: "击败水牛" },
    hint: { en: "1–6 coop vs buffalo", zh: "1–6 人合作对抗水牛" },
  },
];

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

type AiActorView = {
  phase?: string;
  you?: { hasPlayed?: boolean };
  pending?: { type?: string; playerId?: string } | null;
  legal?: unknown[];
  draftTurn?: string | null;
  currentPlayerId?: string | null;
};

/**
 * AI seats that still need to act.
 * - Plugins with `legal[]` (holdem / 6 nimmt): filter by legal + phase
 * - Plugins without (love-letter): currentPlayerId / pending.playerId
 */
function collectPendingAiIds(
  s: HostSession,
  aiIds: string[],
): string[] {
  const fromLegal = aiIds.filter((id) => {
    const v = s.getView(id) as AiActorView;
    if (!Array.isArray(v.legal)) return false;
    if (!v.legal.length) return false;
    if (v.phase === "resolving") return false;
    if (v.phase === "chooseRow") return v.pending?.playerId === id;
    if (v.phase === "drafting") return v.draftTurn === id;
    if (v.phase === "selecting") return !v.you?.hasPlayed;
    if (v.phase === "specials") return true;
    return true;
  });
  if (fromLegal.length > 0) return fromLegal;

  // Love Letter etc.: no legal[] on the projected view
  const out: string[] = [];
  for (const id of aiIds) {
    const v = s.getView(id) as AiActorView;
    if (v.phase === "finished") continue;
    if (v.pending?.playerId === id) {
      out.push(id);
      continue;
    }
    if (!v.pending && v.currentPlayerId === id) {
      out.push(id);
    }
  }
  return out;
}

export function PlayShell({
  locale,
  gameName,
  pluginId,
  edition: editionProp,
  roomIdFromUrl,
  loadApiKey,
  createDeepSeekSeat,
}: PlayShellProps) {
  const mod = useMemo(() => requirePlayModule(pluginId), [pluginId]);
  const isHost = !roomIdFromUrl;
  const hostId = useMemo(() => "host", []);
  const isHoldem = pluginId === "texas-holdem";
  const isNimmt = pluginId === "six-nimmt";
  const isLoveLetter = pluginId === "love-letter";
  const isGo = pluginId === "go";
  const [edition, setEdition] = useState(() => {
    if (isNimmt) return normalizeNimmtMode(editionProp ?? "classic");
    if (isGo) return normalizeGoEdition(editionProp ?? "9x9");
    return normalizeLlEdition(editionProp ?? "full");
  });
  const [stakes, setStakes] = useState({
    smallBlind: 1,
    bigBlind: 2,
    startingStack: 200,
  });
  const maxSeats = isHoldem
    ? 9
    : isGo
      ? 2
      : isNimmt
        ? maxPlayersForMode(normalizeNimmtMode(edition))
        : maxSeatsForLlEdition(normalizeLlEdition(edition));
  const showEditions = isLoveLetter || isNimmt || isGo;
  const [roomId, setRoomId] = useState(roomIdFromUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [phase, setPhase] = useState<"lobby" | "playing" | "finished">("lobby");
  const [view, setView] = useState<unknown>(null);
  const [chat, setChat] = useState<AiChatMessage[]>([]);
  const [thinkingId, setThinkingId] = useState<string | null>(null);
  const [thinkingIds, setThinkingIds] = useState<string[]>([]);
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
  const playLogRef = useRef<PlayLogEntry[]>([]);
  playLogRef.current = playLog;
  const aiRef = useRef<Map<string, AiSeat>>(new Map());
  const llmSeatIdsRef = useRef<Set<string>>(new Set());
  const peerRef = useRef<{ destroy: () => void } | null>(null);
  const aiRunning = useRef(false);
  const autoAdvanceRunning = useRef(false);
  const localSeatIdsRef = useRef<Set<string>>(new Set([hostId]));

  const seatNames = useCallback((): Record<string, string> => {
    const seats = sessionRef.current?.getLobby().seats ?? lobby?.seats ?? [];
    return Object.fromEntries(seats.map((s) => [s.id, s.name]));
  }, [lobby]);

  /** Push post-action state to remote seats (views are per-player). */
  const publishActionResult = useCallback(
    (result: { events: Event[]; views: Map<string, unknown> }) => {
      const s = sessionRef.current;
      const host = peerRef.current as PeerHost | null;
      if (!s || !host?.send) return;
      host.broadcast?.({ type: "events", payload: result.events });
      host.broadcast?.({ type: "phase", payload: { phase: s.getPhase() } });
      for (const [pid, v] of result.views) {
        host.send(pid, { type: "view", payload: v });
      }
    },
    [],
  );

  const appendEvents = useCallback(
    (events: Event[], opts?: { stripBubbleFor?: string }) => {
      const lines = modRef.current.formatEvents(events, locale, seatNames());
      if (lines.length === 0) return lines;
      const stripped = opts?.stripBubbleFor
        ? lines.map((l) =>
            l.speakerId === opts.stripBubbleFor
              ? { ...l, bubble: undefined }
              : l,
          )
        : lines;
      setPlayLog((prev) => [...prev, ...stripped]);
      return lines;
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

  /** AI table talk: LLM speak, else first-person event bubble (e.g. Guard guess). */
  const publishAiSpeak = useCallback(
    (playerId: string, events: Event[], speak?: string) => {
      const lines = modRef.current.formatEvents(events, locale, seatNames());
      const fallback = lines.find(
        (l) => l.speakerId === playerId && l.bubble,
      )?.bubble;
      const spoken = speak?.trim();
      const text = spoken || fallback;
      if (!text) return;
      // Record model speak in battle log (action bubbles stay on formatEvents).
      if (spoken) {
        const name = seatNames()[playerId] ?? playerId;
        const at = Date.now();
        setPlayLog((prev) => [
          ...prev,
          {
            id: `speak-${playerId}-${at}`,
            at,
            text:
              locale === "zh" ? `${name}：${spoken}` : `${name}: ${spoken}`,
            tone: "info",
            speakerId: playerId,
          },
        ]);
      }
      publishChat({ playerId, text, at: Date.now() });
    },
    [locale, seatNames, publishChat],
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
      gameConfig: isHoldem
        ? { ...stakes }
        : { edition },
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
            publishActionResult(result);
            tick();
            void (async () => {
              await runAutoAdvanceIfNeeded();
              await runAiIfNeeded();
            })();
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

  // Keep session gameConfig in sync when lobby options change (do not remount room).
  useEffect(() => {
    if (!isHost) return;
    if (isHoldem) {
      sessionRef.current?.setGameConfig({ ...stakes });
      return;
    }
    sessionRef.current?.setGameConfig({ edition });
    if (typeof window !== "undefined" && !roomIdFromUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("edition", edition);
      window.history.replaceState({}, "", url.toString());
    }
  }, [edition, stakes, isHost, isHoldem, roomIdFromUrl]);

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
          if (msg.type === "lobby") {
            const lb = msg.payload as LobbyState;
            setLobby(lb);
            if (typeof lb.edition === "string" && lb.edition) {
              setEdition(
                pluginId === "six-nimmt"
                  ? normalizeNimmtMode(lb.edition)
                  : pluginId === "go"
                    ? normalizeGoEdition(lb.edition)
                    : normalizeLlEdition(lb.edition),
              );
            }
            const gc = lb.gameConfig;
            if (
              gc &&
              typeof gc.smallBlind === "number" &&
              typeof gc.bigBlind === "number" &&
              typeof gc.startingStack === "number"
            ) {
              setStakes({
                smallBlind: gc.smallBlind,
                bigBlind: gc.bigBlind,
                startingStack: gc.startingStack,
              });
            }
          }
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
              setThinkingIds((prev) => {
                const next = p.started
                  ? prev.includes(p.playerId)
                    ? prev
                    : [...prev, p.playerId]
                  : prev.filter((id) => id !== p.playerId);
                setThinkingId(next[0] ?? null);
                return next;
              });
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

  /** Paced host advances (e.g. 6 nimmt! one card per beat). */
  const runAutoAdvanceIfNeeded = async () => {
    if (!isHost || autoAdvanceRunning.current || aiRunning.current) return;
    const s = sessionRef.current;
    if (!s || s.getPhase() !== "playing") return;
    const stub = modRef.current.tryAutoAdvance?.(s.getView(hostId));
    if (!stub) return;

    autoAdvanceRunning.current = true;
    try {
      const snap = s.getView(hostId) as { resolveRemaining?: number };
      const remaining = snap.resolveRemaining ?? 1;
      // Longer beat when many cards left (right after reveal)
      const delay =
        remaining >= 3
          ? 1050 + Math.floor(Math.random() * 400)
          : 850 + Math.floor(Math.random() * 350);
      await sleep(delay);
      if (!modRef.current.tryAutoAdvance?.(s.getView(hostId))) return;
      const action = { ...stub, playerId: hostId };
      const result = s.submitAction(action);
      if (result.ok) {
        appendEvents(result.events);
        publishActionResult(result);
        tick();
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "auto advance failed");
    } finally {
      autoAdvanceRunning.current = false;
    }
    await runAutoAdvanceIfNeeded();
    await runAiIfNeeded();
  };

  const runAiIfNeeded = async () => {
    if (aiRunning.current || autoAdvanceRunning.current) return;
    const s = sessionRef.current;
    if (!s || s.getPhase() !== "playing") return;

    // Prefer stepped resolve over AI turns
    if (modRef.current.tryAutoAdvance?.(s.getView(hostId))) {
      await runAutoAdvanceIfNeeded();
      return;
    }

    const pending = collectPendingAiIds(s, s.getAiSeatIds());
    if (pending.length === 0) return;

    const actorPhase = (s.getView(pending[0]!) as AiActorView).phase;
    // Coop specials: humans decide; AI only auto-closes when the table is AI-only.
    if (actorPhase === "specials") {
      const hasHuman = s
        .getLobby()
        .seats.some((seat) => seat.kind === "human");
      if (hasHuman) return;
    }

    const host = peerRef.current as PeerHost | null;
    const parallelSelect =
      modRef.current.plugin.metadata.pacing === "simultaneous" &&
      actorPhase === "selecting" &&
      pending.length > 1;

    const actors = parallelSelect ? pending : [pending[0]!];

    aiRunning.current = true;

    const markThinking = (ids: string[], detail: string) => {
      setThinkingIds(ids);
      setThinkingId(ids[0] ?? null);
      setThinkingDetail(detail);
      for (const id of ids) {
        host?.broadcast?.({
          type: "aiPresence",
          payload: { type: "ai/thinking", playerId: id, started: true },
        });
      }
    };

    const clearThinking = (ids: string[]) => {
      setThinkingIds([]);
      setThinkingId(null);
      setThinkingDetail(null);
      for (const id of ids) {
        host?.broadcast?.({
          type: "aiPresence",
          payload: { type: "ai/thinking", playerId: id, started: false },
        });
      }
    };

    const pushThinkProgress = (p: {
      note?: string;
      thinkingText?: string;
      draftText?: string;
    }) => {
      const parts: string[] = [];
      if (p.thinkingText?.trim()) parts.push(p.thinkingText.trim());
      else if (p.note) parts.push(p.note);
      if (p.draftText?.trim()) {
        const d = p.draftText.trim();
        parts.push(
          parts.length ? `---\n${d.slice(-400)}` : d.slice(-600),
        );
      }
      if (parts.length) setThinkingDetail(parts.join("\n"));
    };

    /** Action / result lines only — skip “thinking…” / fallback UI noise. */
    const battleLog = battleLogLinesForAi(playLogRef.current);

    /** Decide without submitting (safe to run in parallel). */
    const decideForSeat = async (
      current: string,
    ): Promise<{
      playerId: string;
      action: Action;
      speak?: string;
      isLlm: boolean;
      seat: AiSeat;
      auto: boolean;
    }> => {
      const paceMs = aiThinkPaceMs();
      const thinkStarted = Date.now();
      const v = s.getView(current);
      const auto = modRef.current.tryAutoAiAction?.(v, current) ?? null;
      if (auto) {
        await sleep(1600 + Math.floor(Math.random() * 1200));
        const { seat, isLlm } = await resolveAiSeat(current);
        return {
          playerId: current,
          action: auto,
          isLlm,
          seat,
          auto: true,
        };
      }

      const { seat, isLlm } = await resolveAiSeat(current);
      const idleMs = isLlm ? 90_000 : 8_000;
      const absoluteMaxMs = isLlm ? 15 * 60_000 : undefined;
      let action: Action;
      let speak: string | undefined;
      try {
        const decide = withIdleTimeout(
          ({ ping }) =>
            seat.think(v, {
              battleLog,
              onProgress: (p) => {
                ping();
                if (!parallelSelect || actors[0] === current) {
                  pushThinkProgress(p);
                }
              },
            }),
          idleMs,
          "AI think",
          absoluteMaxMs,
        );
        const [, decided] = await Promise.all([sleep(paceMs), decide]);
        action = decided.action;
        speak = decided.speak;
      } catch (err) {
        const mock = modRef.current.createMockSeat(current);
        const remaining = Math.max(0, paceMs - (Date.now() - thinkStarted));
        const [decided] = await Promise.all([
          mock.think(s.getView(current), {
            battleLog,
            onProgress: (p) => {
              if (!parallelSelect || actors[0] === current) {
                pushThinkProgress(p);
              }
            },
          }),
          remaining > 0 ? sleep(remaining) : Promise.resolve(),
        ]);
        action = decided.action;
        speak = decided.speak;
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
            id: `fallback-${current}-${Date.now()}`,
            at: Date.now(),
            text:
              locale === "zh"
                ? `${seatNames()[current] ?? current}：${why}，本回合暂用本地决策（下回合仍走 LLM）`
                : `${seatNames()[current] ?? current}: ${why}; local decision this turn only`,
            tone: "warn",
          },
        ]);
      }
      return {
        playerId: current,
        action,
        speak,
        isLlm,
        seat,
        auto: false,
      };
    };

    const submitDecided = async (decided: {
      playerId: string;
      action: Action;
      speak?: string;
      isLlm: boolean;
      seat: AiSeat;
    }): Promise<boolean> => {
      const current = decided.playerId;
      const fresh = s.getView(current) as AiActorView;
      // Only games that expose `legal[]` (holdem / 6 nimmt) use this skip.
      // Love Letter has no legal[] — `!undefined?.length` used to return true
      // without submitAction, so AI spun forever appending “正在思考…”.
      if (Array.isArray(fresh.legal)) {
        if (!fresh.legal.length) return true;
        if (fresh.phase === "selecting" && fresh.you?.hasPlayed) return true;
      }

      let action = decided.action;
      let speak = decided.speak;
      let result = s.submitAction(action);

      if (!result.ok && decided.isLlm) {
        const rejectErr = result.error;
        const rejected = action;
        setPlayLog((prev) => [
          ...prev,
          {
            id: `illegal-retry-${Date.now()}`,
            at: Date.now(),
            text:
              locale === "zh"
                ? `${seatNames()[current] ?? current}：出牌非法（${rejectErr}），把错误反馈给 LLM 重试…`
                : `${seatNames()[current] ?? current}: illegal (${rejectErr}); retrying LLM with feedback…`,
            tone: "warn",
          },
        ]);
        setThinkingDetail(
          locale === "zh"
            ? `非法：${rejectErr} · 重新请求 LLM…`
            : `Illegal: ${rejectErr} · re-asking LLM…`,
        );
        try {
          const retryDecided = await withIdleTimeout(
            ({ ping }) =>
              decided.seat.think(s.getView(current), {
                battleLog: battleLogLinesForAi(playLogRef.current),
                illegalRetry: {
                  rejectedAction: rejected,
                  error: rejectErr,
                },
                onProgress: (p) => {
                  ping();
                  pushThinkProgress(p);
                },
              }),
            90_000,
            "AI illegal retry",
          );
          action = retryDecided.action;
          speak = retryDecided.speak;
          result = s.submitAction(action);
        } catch {
          result = { ok: false, error: rejectErr };
        }
      }

      if (!result.ok) {
        const mock = modRef.current.createMockSeat(current);
        await sleep(400 + Math.floor(Math.random() * 400));
        const retry = await mock.think(s.getView(current));
        action = retry.action;
        speak = retry.speak;
        result = s.submitAction(action);
        if (!result.ok) {
          setError(result.error);
          return false;
        }
        setPlayLog((prev) => [
          ...prev,
          {
            id: `illegal-${Date.now()}`,
            at: Date.now(),
            text:
              locale === "zh"
                ? `${seatNames()[current] ?? current}：LLM 重试仍非法，本回合改本地补救`
                : `${seatNames()[current] ?? current}: LLM retry still illegal; local fix this turn`,
            tone: "warn",
          },
        ]);
      }

      appendEvents(result.events, { stripBubbleFor: current });
      publishActionResult(result);
      publishAiSpeak(current, result.events, speak);
      tick();
      return true;
    };

    try {
      const thinkStarted = Date.now();
      if (parallelSelect) {
        markThinking(
          actors,
          locale === "zh"
            ? `${actors.length} 名 AI 同时选牌…`
            : `${actors.length} AIs choosing cards…`,
        );
        setPlayLog((prev) => [
          ...prev,
          {
            id: `think-parallel-${thinkStarted}`,
            at: thinkStarted,
            text:
              locale === "zh"
                ? `${actors.map((id) => seatNames()[id] ?? id).join("、")} 同时选牌…`
                : `${actors.map((id) => seatNames()[id] ?? id).join(", ")} choosing…`,
          },
        ]);
        const decidedList = await Promise.all(
          actors.map((id) => decideForSeat(id)),
        );
        for (const decided of decidedList) {
          const ok = await submitDecided(decided);
          if (!ok) return;
        }
        await sleep(aiBetweenPlaysMs());
      } else {
        const current = actors[0]!;
        markThinking(
          [current],
          locale === "zh" ? "准备决策…" : "Preparing decision…",
        );
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
        const decided = await decideForSeat(current);
        if (decided.auto) {
          setThinkingDetail(
            locale === "zh"
              ? `自动步骤：${decided.action.type}`
              : `Auto step: ${decided.action.type}`,
          );
        }
        const ok = await submitDecided(decided);
        if (!ok) return;
        await sleep(350 + Math.floor(Math.random() * 350));
        await sleep(aiBetweenPlaysMs());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI failed");
    } finally {
      clearThinking(actors);
      aiRunning.current = false;
    }
    await runAutoAdvanceIfNeeded();
    await runAiIfNeeded();
  };

  const onEditionChange = (id: string) => {
    const next = isNimmt
      ? normalizeNimmtMode(id)
      : isGo
        ? normalizeGoEdition(id)
        : normalizeLlEdition(id);
    if (next === edition) return;
    const s = sessionRef.current;
    if (!s || s.getPhase() !== "lobby") return;
    const cap = isNimmt
      ? maxPlayersForMode(next as NimmtMode)
      : isGo
        ? 2
        : maxSeatsForLlEdition(next as LoveLetterEditionId);
    // Trim overflow seats when switching to a smaller edition (keep host).
    while (s.getLobby().seats.length > cap) {
      const seats = s.getLobby().seats;
      const drop = [...seats].reverse().find((x) => x.id !== hostId);
      if (!drop) break;
      s.removeSeat(drop.id);
      localSeatIdsRef.current.delete(drop.id);
      aiRef.current.delete(drop.id);
      llmSeatIdsRef.current.delete(drop.id);
    }
    s.setGameConfig({ edition: next });
    setEdition(next);
    setError(null);
    tick();
    const host = peerRef.current as PeerHost | null;
    host?.broadcast?.({ type: "lobby", payload: s.getLobby() });
  };

  const onStakesChange = (patch: {
    smallBlind?: number;
    bigBlind?: number;
    startingStack?: number;
  }) => {
    const s = sessionRef.current;
    if (!s || s.getPhase() !== "lobby") return;
    setStakes((prev) => {
      const next = { ...prev, ...patch };
      if (next.bigBlind < next.smallBlind * 2) {
        next.bigBlind = next.smallBlind * 2;
      }
      if (next.startingStack < next.bigBlind * 20) {
        next.startingStack = next.bigBlind * 20;
      }
      if (next.startingStack > 100_000) next.startingStack = 100_000;
      s.setGameConfig({ ...next });
      const host = peerRef.current as PeerHost | null;
      host?.broadcast?.({ type: "lobby", payload: s.getLobby() });
      return next;
    });
    setError(null);
    tick();
  };

  const onAddAi = () => {
    const s = sessionRef.current;
    if (!s) return;
    if (s.getLobby().seats.length >= maxSeats) {
      setError(
        locale === "zh"
          ? `该版本最多 ${maxSeats} 人`
          : `This edition allows at most ${maxSeats} players`,
      );
      return;
    }
    const n = s.getLobby().seats.filter((x) => x.kind === "ai").length + 1;
    const id = `ai-${n}`;
    s.addAiSeat(id, locale === "zh" ? `AI ${n}` : `AI ${n}`);
    tick();
  };

  const onAddHotseat = () => {
    const s = sessionRef.current;
    if (!s) return;
    if (s.getLobby().seats.length >= maxSeats) {
      setError(
        locale === "zh"
          ? `该版本最多 ${maxSeats} 人`
          : `This edition allows at most ${maxSeats} players`,
      );
      return;
    }
    const n = s.getLobby().seats.length;
    const id = `p-${n}`;
    s.addHumanSeat(id, `${locale === "zh" ? "玩家" : "Player"} ${n}`);
    localSeatIdsRef.current.add(id);
    tick();
  };

  const broadcastLobby = () => {
    const s = sessionRef.current;
    if (!s) return;
    tick();
    const host = peerRef.current as PeerHost | null;
    host?.broadcast?.({ type: "lobby", payload: s.getLobby() });
  };

  const onMoveSeat = (id: string, delta: -1 | 1) => {
    const s = sessionRef.current;
    if (!s || s.getPhase() !== "lobby") return;
    if (!s.moveSeat(id, delta)) return;
    broadcastLobby();
  };

  const onShuffleSeats = () => {
    const s = sessionRef.current;
    if (!s || s.getPhase() !== "lobby") return;
    s.shuffleSeats(createRng(`lobby-shuffle-${Date.now()}`));
    broadcastLobby();
  };

  const onStart = async () => {
    const s = sessionRef.current;
    if (!s) return;
    if (isNimmt) {
      const mode = normalizeNimmtMode(edition);
      const n = s.getLobby().seats.length;
      const minP = minPlayersForMode(mode);
      const maxP = maxPlayersForMode(mode);
      if (n < minP || n > maxP) {
        setError(
          locale === "zh"
            ? `该模式需要 ${minP}–${maxP} 人（当前 ${n}）`
            : `This mode needs ${minP}–${maxP} players (now ${n})`,
        );
        return;
      }
    }
    if (isGo) {
      const n = s.getLobby().seats.length;
      if (n !== 2) {
        setError(
          locale === "zh"
            ? `围棋需要恰好 2 人（当前 ${n}）· 请再加一个 AI 或热座`
            : `Go needs exactly 2 players (now ${n}) — add AI or hotseat`,
        );
        return;
      }
    }
    for (const seat of s.getLobby().seats) {
      if (seat.kind === "human") s.setReady(seat.id, true);
    }
    let r: { ok: true } | { ok: false; error: string };
    try {
      r = await s.start();
    } catch (e) {
      setError(e instanceof Error ? e.message : "start failed");
      return;
    }
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
    await runAutoAdvanceIfNeeded();
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
    autoAdvanceRunning.current = false;
    setThinkingId(null);
    setThinkingDetail(null);
    const isLoveLetter = pluginId === "love-letter";
    const keepSessionLog = isHoldem || isLoveLetter;
    const line = {
      id: `rematch-${Date.now()}`,
      at: Date.now(),
      text: isHoldem
        ? locale === "zh"
          ? "下一手 · 房主发牌"
          : "Next hand · host dealt"
        : isLoveLetter
          ? locale === "zh"
            ? "下一轮 · 房主发牌"
            : "Next round · host dealt"
          : locale === "zh"
            ? "再来一局 · 重新发牌"
            : "Play again · new deal",
      tone: "win" as const,
    };
    if (keepSessionLog) {
      setPlayLog((prev) => [...prev, line]);
    } else {
      setPlayLog([line]);
      setChat([]);
    }
    const host = peerRef.current as PeerHost | null;
    host?.broadcast?.({ type: "phase", payload: { phase: s.getPhase() } });
    for (const [pid, v] of result.views) {
      host?.send?.(pid, { type: "view", payload: v });
    }
    tick();
    void (async () => {
      await runAutoAdvanceIfNeeded();
      await runAiIfNeeded();
    })();
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
    publishActionResult(result);
    tick();
    void (async () => {
      await runAutoAdvanceIfNeeded();
      await runAiIfNeeded();
    })();
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
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      {error && (
        <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
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
        <div className="min-h-0 flex-1 overflow-hidden">
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
            onMoveSeat={onMoveSeat}
            onShuffleSeats={onShuffleSeats}
            editions={
              showEditions
                ? isNimmt
                  ? NIMMT_MODE_OPTIONS.map((m) => ({
                      id: m.id,
                      label: locale === "zh" ? m.label.zh : m.label.en,
                      hint: locale === "zh" ? m.hint.zh : m.hint.en,
                    }))
                  : isGo
                    ? goEditionOptions().map((m) => ({
                        id: m.id,
                        label: locale === "zh" ? m.label.zh : m.label.en,
                        hint: locale === "zh" ? m.hint.zh : m.hint.en,
                      }))
                    : [
                        {
                          id: "classic",
                          label:
                            locale === "zh"
                              ? "经典版（16 张）"
                              : "Classic (16 cards)",
                          hint:
                            locale === "zh"
                              ? "2–4 人 · 公主 = 8 · 无间谍/大臣"
                              : "2–4 players · Princess = 8 · no Spy/Chancellor",
                        },
                        {
                          id: "full",
                          label:
                            locale === "zh"
                              ? "完整版（21 张）"
                              : "Full Game (21 cards)",
                          hint:
                            locale === "zh"
                              ? "2–6 人 · 间谍、大臣 · 公主 = 9"
                              : "2–6 players · Spy & Chancellor · Princess = 9",
                        },
                        {
                          id: "expansion",
                          label:
                            locale === "zh"
                              ? "拓展版（37 张）"
                              : "Expansion (37 cards)",
                          hint:
                            locale === "zh"
                              ? "2–8 人 · 完整版 + 主教/太后/警官等"
                              : "2–8 players · Full + Bishop, Dowager, Constable…",
                        },
                      ]
                : undefined
            }
            edition={edition}
            onEditionChange={
              showEditions && isHost ? onEditionChange : undefined
            }
            stakes={isHoldem ? stakes : undefined}
            onStakesChange={isHoldem && isHost ? onStakesChange : undefined}
            maxSeats={maxSeats}
          />
        </div>
      )}

      {phase === "lobby" && !isHost && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-card">
          <p className="shrink-0 font-heading text-lg font-bold text-primary-dark">
            {locale === "zh" ? `加入「${gameName}」` : `Joined “${gameName}”`}
          </p>
          <p className="mt-1 shrink-0 text-sm text-stone-500">
            {locale === "zh" ? "等待房主开战…" : "Waiting for the host to start…"}
          </p>
          <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
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
        <div className="min-h-0 flex-1 overflow-hidden">
          <Table
            locale={locale}
            view={view}
            myId={controllingId}
            disabled={
              thinkingIds.length > 0 &&
              !(
                mod.plugin.metadata.pacing === "simultaneous" &&
                (view as AiActorView).phase === "selecting"
              )
            }
            thinkingId={thinkingId}
            thinkingIds={thinkingIds}
            thinkingDetail={thinkingDetail}
            onAction={onDispatch}
            onRematch={isHost ? onRematch : undefined}
            playLog={playLog}
            chat={chat}
            onChat={onChat}
            nameOf={nameOf}
          />
        </div>
      ) : null}
    </div>
  );
}
