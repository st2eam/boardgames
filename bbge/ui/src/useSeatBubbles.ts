"use client";

import { useEffect, useRef, useState } from "react";
import type { AiChatMessage } from "@bbge/runtime";
import type { PlayLogEntry } from "./formatPlayLog";

export type SeatBubble = { id: string; text: string };

const DEFAULT_BUBBLE_MS = 4200;

export type UseSeatBubblesOptions = {
  playLog?: PlayLogEntry[];
  chat?: AiChatMessage[];
  /** Auto-clear delay; default 4200ms. */
  durationMs?: number;
  /** Clear all bubbles when this key changes (e.g. hand/round number). */
  resetKey?: string | number;
};

/**
 * Shared seat speech bubbles driven by play-log `bubble` + table chat.
 */
export function useSeatBubbles({
  playLog = [],
  chat = [],
  durationMs = DEFAULT_BUBBLE_MS,
  resetKey,
}: UseSeatBubblesOptions): Record<string, SeatBubble> {
  const [bubbles, setBubbles] = useState<Record<string, SeatBubble>>({});
  const seenLogIds = useRef(new Set<string>());
  const seenChat = useRef(new Set<string>());
  const timers = useRef(new Map<string, number>());

  const showBubble = (seatId: string, id: string, text: string) => {
    const prev = timers.current.get(seatId);
    if (prev) window.clearTimeout(prev);
    setBubbles((m) => ({ ...m, [seatId]: { id, text } }));
    const t = window.setTimeout(() => {
      setBubbles((m) => {
        if (m[seatId]?.id !== id) return m;
        const next = { ...m };
        delete next[seatId];
        return next;
      });
      timers.current.delete(seatId);
    }, durationMs);
    timers.current.set(seatId, t);
  };

  useEffect(() => {
    if (resetKey === undefined) return;
    for (const t of timers.current.values()) window.clearTimeout(t);
    timers.current.clear();
    queueMicrotask(() => setBubbles({}));
  }, [resetKey]);

  useEffect(() => {
    for (const e of playLog) {
      if (seenLogIds.current.has(e.id)) continue;
      seenLogIds.current.add(e.id);
      if (e.speakerId && e.bubble) {
        queueMicrotask(() => showBubble(e.speakerId!, e.id, e.bubble!));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- showBubble is stable enough for log appends
  }, [playLog]);

  useEffect(() => {
    for (const m of chat) {
      const key = `${m.playerId}-${m.at}-${m.text}`;
      if (seenChat.current.has(key)) continue;
      seenChat.current.add(key);
      queueMicrotask(() => showBubble(m.playerId, `chat-${key}`, m.text));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat]);

  useEffect(
    () => () => {
      for (const t of timers.current.values()) window.clearTimeout(t);
    },
    [],
  );

  return bubbles;
}
