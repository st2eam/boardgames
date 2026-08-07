"use client";

import { useMemo, useState } from "react";
import type { PluginTableProps } from "@bbge/ui";
import {
  MatchResultBar,
  PlayLogChatPanel,
  PlaySideSheet,
  SeatSpeechSlot,
  useSeatBubbles,
} from "@bbge/ui";
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
  const view = viewUnknown as GoView;
  const [confirmResign, setConfirmResign] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const bubbles = useSeatBubbles({ playLog, chat, durationMs: 4200 });

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
    <PlayLogChatPanel
      locale={locale}
      playLog={playLog}
      chat={chat}
      onChat={onChat}
      nameOf={nameOf}
    />
  );

  const chatCount =
    (playLog?.length ?? 0) + (chat?.length ?? 0);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      {/* Compact chrome — seats + status only */}
      <div className="flex h-[4.25rem] shrink-0 items-center gap-1.5 border-b border-border/70 bg-white/90 px-1.5 sm:h-[4.5rem] sm:gap-2 sm:px-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-visible text-[11px] sm:text-xs">
          {view.seats.map((s) => {
            const bubble = bubbles[s.id];
            const active =
              view.currentPlayerId === s.id && view.phase === "playing";
            return (
              <div
                key={s.id}
                data-seat-id={s.id}
                className={`relative inline-flex h-[3.75rem] w-[6.5rem] shrink-0 flex-col justify-end rounded-md px-1.5 pb-0.5 ${
                  active ? "bg-sky-100 text-sky-950" : "text-stone-600"
                }`}
              >
                <SeatSpeechSlot bubble={bubble} />
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

        {view.phase === "finished" && (
          <MatchResultBar
            locale={locale}
            onRematch={onRematch}
            label={zh ? "再来" : "Again"}
            className="!min-h-0 shrink-0 [&_button]:min-h-8 [&_button]:px-3 [&_button]:py-1 [&_button]:text-[11px] sm:[&_button]:text-xs"
          />
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-1 sm:p-1.5 [container-type:size]">
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

      {/* Bottom actions: pass / resign / chat */}
      <div className="shrink-0 border-t border-border/70 bg-white/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3">
        {confirmResign ? (
          <div className="mx-auto flex max-w-md gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmResign(false);
                onAction({ type: "resign", playerId: myId, payload: {} });
              }}
              className="min-h-11 flex-1 cursor-pointer touch-manipulation rounded-xl bg-red-600 text-sm font-semibold text-white active:scale-[0.98]"
            >
              {zh ? "确认认输" : "Confirm resign"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmResign(false)}
              className="min-h-11 flex-1 cursor-pointer touch-manipulation rounded-xl border border-border bg-white text-sm font-semibold text-primary-dark active:scale-[0.98]"
            >
              {zh ? "取消" : "Cancel"}
            </button>
          </div>
        ) : (
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
            <button
              type="button"
              disabled={!isMyTurn}
              onClick={() =>
                onAction({ type: "pass", playerId: myId, payload: {} })
              }
              className="min-h-11 cursor-pointer touch-manipulation rounded-xl border border-border bg-white text-sm font-semibold text-primary-dark hover:bg-stone-50 disabled:opacity-35 active:scale-[0.98]"
            >
              {zh ? "停棋" : "Pass"}
              {view.consecutivePasses > 0
                ? ` ${view.consecutivePasses}/2`
                : ""}
            </button>
            <button
              type="button"
              disabled={view.phase !== "playing" || !!disabled}
              onClick={() => setConfirmResign(true)}
              className="min-h-11 cursor-pointer touch-manipulation rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-35 active:scale-[0.98]"
            >
              {zh ? "认输" : "Resign"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPanelOpen(false);
                setSideOpen(true);
              }}
              className="min-h-11 cursor-pointer touch-manipulation rounded-xl border border-border bg-white text-sm font-semibold text-primary-dark hover:bg-stone-50 active:scale-[0.98]"
            >
              {zh ? "聊天" : "Chat"}
              {chatCount > 0 ? ` ${chatCount}` : ""}
            </button>
          </div>
        )}
      </div>

      <PlaySideSheet
        locale={locale}
        open={sideOpen}
        onClose={() => setSideOpen(false)}
        title={zh ? "战报 / 聊天" : "Log / Chat"}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          <div className="flex shrink-0 justify-end">
            <button
              type="button"
              onClick={() => {
                setSideOpen(false);
                setPanelOpen(true);
              }}
              className="cursor-pointer rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold text-primary-dark hover:bg-stone-50 sm:text-xs"
            >
              {zh ? "围棋老师" : "Go Tutor"}
            </button>
          </div>
          {logPanel}
        </div>
      </PlaySideSheet>

      {/* Teacher drawer — off by default so the board stays huge */}
      {panelOpen && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-20 cursor-pointer bg-stone-900/20"
            aria-label={zh ? "关闭老师面板" : "Close tutor"}
            onClick={() => setPanelOpen(false)}
          />
          <aside className="absolute bottom-[4.5rem] right-0 top-[4.25rem] z-30 flex w-full max-w-full flex-col border-l border-border bg-white shadow-xl sm:top-[4.5rem] sm:w-[min(100%,22rem)]">
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
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
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
