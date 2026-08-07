"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { PluginTableProps } from "@bbge/ui";
import { BattleLogList, PlaySideSheet, useIsMobileLayout } from "@bbge/ui";
import { GoTutorPanel } from "@/components/chat/GoTutorPanel";
import {
  formatGoPlayContext,
  goTutorSuggestedPrompts,
} from "@/lib/go/boardContext";
import { GoBoard } from "./GoBoard";

type GoView = {
  phase: string;
  edition: string;
  size: number;
  komi: number;
  currentPlayerId: string | null;
  toActColor: "black" | "white" | null;
  consecutivePasses: number;
  ko: { row: number; col: number } | null;
  lastMove: { row: number; col: number; color: string } | null;
  lastMoveLabel: string | null;
  winners: string[];
  scores: {
    black: number;
    white: number;
    blackTerritory: number;
    whiteTerritory: number;
    komi: number;
  } | null;
  endReason: string | null;
  stones: Record<string, "black" | "white">;
  boardAscii: string;
  legal: { type: string; row?: number; col?: number }[];
  you: {
    id: string;
    color: "black" | "white";
    captures: number;
    resigned: boolean;
  } | null;
  seats: {
    id: string;
    name: string;
    color: "black" | "white";
    captures: number;
    resigned: boolean;
  }[];
};

type SeatBubble = { id: string; text: string };

const BUBBLE_MS = 4200;

export function GoTable({
  locale,
  view: viewUnknown,
  myId,
  disabled,
  thinkingId,
  thinkingDetail,
  onAction,
  onRematch,
  playLog = [],
  chat = [],
  onChat,
  nameOf,
}: PluginTableProps) {
  const zh = locale === "zh";
  const mobile = useIsMobileLayout();
  const view = viewUnknown as GoView;
  const [confirmResign, setConfirmResign] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [bubbles, setBubbles] = useState<Record<string, SeatBubble>>({});
  const seenLogIds = useRef(new Set<string>());
  const seenChat = useRef(new Set<string>());
  const bubbleTimers = useRef(new Map<string, number>());
  const chatRef = useRef<HTMLDivElement>(null);

  const isMyTurn =
    view.phase === "playing" &&
    view.currentPlayerId === myId &&
    !disabled &&
    !thinkingId;

  const legalPlaySet = useMemo(() => {
    const s = new Set<string>();
    for (const a of view.legal ?? []) {
      if (a.type === "play" && a.row != null && a.col != null) {
        s.add(`${a.row},${a.col}`);
      }
    }
    return s;
  }, [view.legal]);

  const boardContext = useMemo(() => {
    const blackCap =
      view.seats.find((s) => s.color === "black")?.captures ?? 0;
    const whiteCap =
      view.seats.find((s) => s.color === "white")?.captures ?? 0;
    return formatGoPlayContext({
      size: view.size,
      boardAscii: view.boardAscii,
      toActColor: view.toActColor,
      lastMoveLabel: view.lastMoveLabel,
      captures: { black: blackCap, white: whiteCap },
      komi: view.komi,
      phase: view.phase,
      scores: view.scores,
      locale,
    });
  }, [view, locale]);

  const suggestedPrompts = useMemo(
    () => goTutorSuggestedPrompts(locale, "play"),
    [locale],
  );

  const showBubble = (seatId: string, id: string, text: string) => {
    const prev = bubbleTimers.current.get(seatId);
    if (prev) window.clearTimeout(prev);
    setBubbles((m) => ({ ...m, [seatId]: { id, text } }));
    const t = window.setTimeout(() => {
      setBubbles((m) => {
        if (m[seatId]?.id !== id) return m;
        const next = { ...m };
        delete next[seatId];
        return next;
      });
      bubbleTimers.current.delete(seatId);
    }, BUBBLE_MS);
    bubbleTimers.current.set(seatId, t);
  };

  useEffect(() => {
    for (const e of playLog) {
      if (seenLogIds.current.has(e.id)) continue;
      seenLogIds.current.add(e.id);
      if (e.speakerId && e.bubble) showBubble(e.speakerId, e.id, e.bubble);
    }
  }, [playLog]);

  useEffect(() => {
    for (const m of chat) {
      const key = `${m.playerId}-${m.at}-${m.text}`;
      if (seenChat.current.has(key)) continue;
      seenChat.current.add(key);
      showBubble(m.playerId, `chat-${key}`, m.text);
    }
  }, [chat]);

  useEffect(
    () => () => {
      for (const t of bubbleTimers.current.values()) window.clearTimeout(t);
    },
    [],
  );

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat]);

  const status = useMemo(() => {
    if (view.phase === "finished") {
      const names = view.winners
        .map((id) => nameOf?.(id) ?? id)
        .join(zh ? "、" : ", ");
      if (view.scores) {
        return zh
          ? `终局 黑${view.scores.black} 白${view.scores.white} · ${names}`
          : `End B${view.scores.black} W${view.scores.white} · ${names}`;
      }
      return zh ? `结束 · ${names}` : `Done · ${names}`;
    }
    if (thinkingId) {
      const detail =
        thinkingDetail && thinkingDetail.length < 40
          ? ` · ${thinkingDetail}`
          : "";
      return zh
        ? `${nameOf?.(thinkingId) ?? thinkingId} 思考中${detail}`
        : `${nameOf?.(thinkingId) ?? thinkingId} thinking${detail}`;
    }
    if (!isMyTurn) {
      return zh
        ? `等待 ${nameOf?.(view.currentPlayerId ?? "") ?? ""}（${view.toActColor === "black" ? "黑" : "白"}）`
        : `Wait ${nameOf?.(view.currentPlayerId ?? "") ?? ""}`;
    }
    return zh
      ? `你的回合（${view.you?.color === "black" ? "黑" : "白"}）`
      : `Your turn (${view.you?.color})`;
  }, [view, thinkingId, thinkingDetail, isMyTurn, zh, nameOf]);

  const onPoint = (c: { row: number; col: number }) => {
    if (!isMyTurn) return;
    if (!legalPlaySet.has(`${c.row},${c.col}`)) return;
    onAction({
      type: "play",
      playerId: myId,
      payload: { row: c.row, col: c.col },
    });
  };

  const logPanel = (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <BattleLogList
        locale={locale}
        entries={playLog ?? []}
        title={zh ? "战报" : "Log"}
        className="rounded-xl border border-border bg-white/95 p-2"
      />
      {onChat && (
        <form
          className="flex shrink-0 gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const t = chatText.trim();
            if (!t) return;
            onChat(t);
            setChatText("");
          }}
        >
          <input
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-border px-2 py-2 text-xs"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder={zh ? "桌边闲聊…" : "Table chat…"}
          />
          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
          >
            {zh ? "发送" : "Send"}
          </button>
        </form>
      )}
      {(chat ?? []).length > 0 && (
        <div
          ref={chatRef}
          className="max-h-28 shrink-0 touch-pan-y overflow-y-auto overscroll-contain rounded-lg border border-border bg-white/80 px-2 py-1 text-[11px] text-stone-600"
        >
          {(chat ?? []).slice(-12).map((m, i) => (
            <p key={`${m.playerId}-${m.at}-${i}`}>
              <span className="font-semibold">
                {nameOf?.(m.playerId) ?? m.playerId}
              </span>
              : {m.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      {/* Compact chrome — board gets the rest */}
      <div className="flex h-[4.25rem] shrink-0 items-center gap-1.5 border-b border-border/70 bg-white/90 px-1.5 sm:h-[4.5rem] sm:gap-2 sm:px-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-visible text-[11px] sm:text-xs">
          {view.seats.map((s) => {
            const bubble = bubbles[s.id];
            const active =
              view.currentPlayerId === s.id && view.phase === "playing";
            return (
              <div
                key={s.id}
                className={`relative inline-flex h-[3.75rem] w-[6.5rem] shrink-0 flex-col justify-end rounded-md px-1.5 pb-0.5 ${
                  active ? "bg-sky-100 text-sky-950" : "text-stone-600"
                }`}
              >
                {/* Fixed slot so speak on/off does not resize the chrome */}
                <div className="relative mb-0.5 h-8 w-full shrink-0">
                  <AnimatePresence>
                    {bubble && (
                      <motion.div
                        key={bubble.id}
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-[#3E2723] px-1 text-center font-heading text-[10px] font-bold leading-tight text-amber-50 shadow-sm"
                      >
                        <span className="line-clamp-2 break-words">
                          {bubble.text}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <span className="inline-flex h-4 items-center gap-1">
                  <span
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                      s.color === "black"
                        ? "bg-stone-900"
                        : "bg-white ring-1 ring-stone-400"
                    }`}
                  />
                  <span className="max-w-[3.75rem] truncate font-medium">
                    {nameOf?.(s.id) ?? s.name}
                  </span>
                  <span className="text-stone-400">{s.captures}</span>
                  {thinkingId === s.id && (
                    <span className="text-[10px] text-sky-700">…</span>
                  )}
                </span>
              </div>
            );
          })}
          <span className="min-w-0 self-center truncate font-medium text-amber-950">
            {status}
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setSideOpen(true)}
            className="cursor-pointer rounded-md border border-border bg-white px-2 py-1 text-[11px] font-semibold text-primary-dark hover:bg-stone-50 sm:text-xs"
          >
            {zh ? "战报" : "Log"}
            {(playLog?.length ?? 0) > 0 || (chat?.length ?? 0) > 0
              ? ` ${(playLog?.length ?? 0) + (chat?.length ?? 0)}`
              : ""}
          </button>

          <button
            type="button"
            disabled={!isMyTurn}
            onClick={() =>
              onAction({ type: "pass", playerId: myId, payload: {} })
            }
            className="cursor-pointer rounded-md border border-border bg-white px-2 py-1 text-[11px] font-semibold text-primary-dark hover:bg-stone-50 disabled:opacity-35 sm:text-xs"
          >
            {zh ? "停着" : "Pass"}
            {view.consecutivePasses > 0 ? ` ${view.consecutivePasses}/2` : ""}
          </button>

          {!confirmResign ? (
            <button
              type="button"
              disabled={view.phase !== "playing" || !!disabled}
              onClick={() => setConfirmResign(true)}
              className="cursor-pointer rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 disabled:opacity-35 sm:text-xs"
            >
              {zh ? "认输" : "Resign"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setConfirmResign(false);
                  onAction({ type: "resign", playerId: myId, payload: {} });
                }}
                className="cursor-pointer rounded-md bg-red-600 px-2 py-1 text-[11px] font-semibold text-white sm:text-xs"
              >
                {zh ? "确认" : "OK"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmResign(false)}
                className="cursor-pointer rounded-md border border-border px-2 py-1 text-[11px] sm:text-xs"
              >
                {zh ? "取消" : "No"}
              </button>
            </>
          )}

          {view.phase === "finished" && onRematch && (
            <button
              type="button"
              onClick={onRematch}
              className="cursor-pointer rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-white sm:text-xs"
            >
              {zh ? "再来" : "Again"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className={`cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold sm:text-xs ${
              panelOpen
                ? "bg-accent text-white"
                : "border border-border bg-white text-primary-dark hover:bg-stone-50"
            }`}
            aria-expanded={panelOpen}
          >
            {zh ? "老师" : "Tutor"}
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-2 overflow-hidden p-1 sm:p-1.5 lg:grid-cols-[1fr_220px]">
        <div className="min-h-0 [container-type:size]">
          <div className="flex h-full w-full items-center justify-center">
            <div className="aspect-square w-[min(100cqw,100cqh)] max-h-full max-w-full">
              <GoBoard
                size={view.size}
                stones={view.stones}
                onIntersectionClick={onPoint}
                disabled={!isMyTurn}
                lastMove={view.lastMove}
                ko={view.ko}
              />
            </div>
          </div>
        </div>
        {!mobile && (
          <aside className="hidden min-h-0 overflow-hidden lg:block">
            {logPanel}
          </aside>
        )}
      </div>

      <PlaySideSheet
        locale={locale}
        open={Boolean(mobile && sideOpen)}
        onClose={() => setSideOpen(false)}
        title={zh ? "战报 / 聊天" : "Log / Chat"}
      >
        {logPanel}
      </PlaySideSheet>

      {/* Teacher drawer — off by default so the board stays huge */}
      {panelOpen && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-20 cursor-pointer bg-stone-900/20 sm:bg-transparent"
            aria-label={zh ? "关闭老师面板" : "Close tutor"}
            onClick={() => setPanelOpen(false)}
          />
          <aside className="absolute inset-y-9 right-0 z-30 flex w-[min(100%,22rem)] flex-col border-l border-border bg-white shadow-xl sm:inset-y-9">
            <div className="flex h-8 shrink-0 items-center justify-between border-b border-border px-2">
              <span className="text-xs font-bold text-primary-dark">
                {zh ? "围棋老师" : "Go Teacher"}
              </span>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="cursor-pointer rounded px-2 py-0.5 text-xs text-stone-500 hover:bg-stone-100"
              >
                {zh ? "收起" : "Close"}
              </button>
            </div>
            <div className="min-h-0 flex-1 p-2">
              <GoTutorPanel
                locale={locale}
                boardContext={boardContext}
                suggestedPrompts={suggestedPrompts}
              />
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
