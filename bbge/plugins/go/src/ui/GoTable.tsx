"use client";

import { useMemo, useState } from "react";
import type { PluginTableProps } from "@bbge/ui";
import { ChatToggle } from "@/components/chat/ChatToggle";
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
  const [chatText, setChatText] = useState("");
  const [confirmResign, setConfirmResign] = useState(false);

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

  const status = useMemo(() => {
    if (view.phase === "finished") {
      const names = view.winners.map((id) => nameOf?.(id) ?? id).join(zh ? "、" : ", ");
      if (view.scores) {
        return zh
          ? `终局 · 黑 ${view.scores.black} · 白 ${view.scores.white} · ${names} 胜`
          : `Done · B ${view.scores.black} · W ${view.scores.white} · ${names}`;
      }
      return zh ? `对局结束 · ${names} 胜` : `Game over · ${names}`;
    }
    if (thinkingId) {
      return zh
        ? `${nameOf?.(thinkingId) ?? thinkingId} 正在思考…`
        : `${nameOf?.(thinkingId) ?? thinkingId} is thinking…`;
    }
    if (!isMyTurn) {
      return zh
        ? `等待 ${nameOf?.(view.currentPlayerId ?? "") ?? view.currentPlayerId}（${view.toActColor === "black" ? "黑" : "白"}）`
        : `Waiting for ${nameOf?.(view.currentPlayerId ?? "") ?? view.currentPlayerId}`;
    }
    return zh
      ? `轮到你了（${view.you?.color === "black" ? "黑" : "白"}）· 点交叉点落子`
      : `Your turn (${view.you?.color}) · click an intersection`;
  }, [view, thinkingId, isMyTurn, zh, nameOf]);

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
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden lg:flex-row">
      <div className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto rounded-2xl border border-border bg-surface/80 p-3 shadow-card">
        <div className="flex w-full max-w-[480px] flex-wrap items-center justify-between gap-2 text-xs">
          {view.seats.map((s) => (
            <div
              key={s.id}
              className={`rounded-lg border px-2.5 py-1.5 ${
                view.currentPlayerId === s.id && view.phase === "playing"
                  ? "border-sky-400 bg-sky-50"
                  : "border-border bg-white"
              }`}
            >
              <span
                className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full ${
                  s.color === "black" ? "bg-stone-900" : "bg-white ring-1 ring-stone-400"
                }`}
              />
              <span className="font-semibold text-primary-dark">
                {nameOf?.(s.id) ?? s.name}
              </span>
              <span className="ml-1.5 text-stone-500">
                {zh ? "提" : "cap"} {s.captures}
              </span>
            </div>
          ))}
        </div>

        <p className="w-full max-w-[480px] rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-950">
          {status}
          {thinkingDetail && thinkingId ? (
            <span className="mt-1 block text-[10px] font-normal text-amber-800/80 line-clamp-2">
              {thinkingDetail}
            </span>
          ) : null}
        </p>

        <GoBoard
          size={view.size}
          stones={view.stones}
          onIntersectionClick={onPoint}
          disabled={!isMyTurn}
          lastMove={view.lastMove}
          ko={view.ko}
        />

        <div className="flex w-full max-w-[480px] flex-wrap gap-2">
          <button
            type="button"
            disabled={!isMyTurn}
            onClick={() =>
              onAction({ type: "pass", playerId: myId, payload: {} })
            }
            className="cursor-pointer rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-primary-dark hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {zh ? "停着" : "Pass"}
            {view.consecutivePasses > 0
              ? ` (${view.consecutivePasses}/2)`
              : ""}
          </button>
          {!confirmResign ? (
            <button
              type="button"
              disabled={view.phase !== "playing" || !!disabled}
              onClick={() => setConfirmResign(true)}
              className="cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40"
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
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                {zh ? "确认认输" : "Confirm resign"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmResign(false)}
                className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm"
              >
                {zh ? "取消" : "Cancel"}
              </button>
            </>
          )}
          {view.phase === "finished" && onRematch && (
            <button
              type="button"
              onClick={onRematch}
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              {zh ? "再来一局" : "Rematch"}
            </button>
          )}
        </div>

        <p className="max-w-[480px] text-center text-[11px] leading-relaxed text-stone-500">
          {zh
            ? "右下角「围棋老师」可边下边问；老师能看到当前棋盘。双方停着后按数目法估算胜负（教学简化）。"
            : "Use Go Teacher (bottom-right) while you play — it sees this board. Two passes → simplified area score."}
        </p>
      </div>

      <aside className="flex min-h-0 w-full shrink-0 flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-card lg:w-72">
        <p className="shrink-0 font-heading text-xs font-bold text-stone-500">
          {zh ? "战报" : "Log"}
        </p>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto text-[11px] leading-snug">
          {playLog.length === 0 && (
            <p className="text-stone-400">{zh ? "对局开始" : "Game start"}</p>
          )}
          {playLog.map((e) => (
            <div
              key={e.id}
              className={`whitespace-pre-wrap rounded-md px-1.5 py-1 ${
                e.tone === "win"
                  ? "bg-emerald-50 text-emerald-900"
                  : e.tone === "warn"
                    ? "bg-amber-50 text-amber-950"
                    : "bg-surface text-primary-dark"
              }`}
            >
              {e.text}
            </div>
          ))}
        </div>

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
              className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1.5 text-xs"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder={zh ? "桌边闲聊…" : "Table chat…"}
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-white"
            >
              {zh ? "发送" : "Send"}
            </button>
          </form>
        )}
        {chat.length > 0 && (
          <div className="max-h-20 shrink-0 overflow-y-auto text-[10px] text-stone-500">
            {chat.slice(-6).map((m, i) => (
              <p key={`${m.at}-${i}`}>
                <span className="font-semibold">
                  {nameOf?.(m.playerId) ?? m.playerId}
                </span>
                : {m.text}
              </p>
            ))}
          </div>
        )}
      </aside>

      <ChatToggle
        scope={{
          type: "game",
          slug: "go",
          gameName: zh ? "围棋" : "Go",
          boardContext,
          suggestedPrompts: goTutorSuggestedPrompts(locale, "play"),
        }}
        locale={locale}
      />
    </div>
  );
}
