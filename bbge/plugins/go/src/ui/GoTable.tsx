"use client";

import { useMemo, useState } from "react";
import type { PluginTableProps } from "@bbge/ui";
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
  nameOf,
}: PluginTableProps) {
  const zh = locale === "zh";
  const view = viewUnknown as GoView;
  const [confirmResign, setConfirmResign] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

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

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      {/* Compact chrome — board gets the rest */}
      <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-border/70 bg-white/90 px-1.5 sm:gap-2 sm:px-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-[11px] sm:text-xs">
          {view.seats.map((s) => (
            <span
              key={s.id}
              className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 ${
                view.currentPlayerId === s.id && view.phase === "playing"
                  ? "bg-sky-100 text-sky-950"
                  : "text-stone-600"
              }`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  s.color === "black"
                    ? "bg-stone-900"
                    : "bg-white ring-1 ring-stone-400"
                }`}
              />
              <span className="max-w-[4.5rem] truncate font-medium">
                {nameOf?.(s.id) ?? s.name}
              </span>
              <span className="text-stone-400">{s.captures}</span>
            </span>
          ))}
          <span className="min-w-0 truncate font-medium text-amber-950">
            {status}
          </span>
        </div>

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

      {/* Board fills remaining viewport */}
      <div className="min-h-0 flex-1 [container-type:size]">
        <div className="flex h-full w-full items-center justify-center p-1 sm:p-1.5">
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
