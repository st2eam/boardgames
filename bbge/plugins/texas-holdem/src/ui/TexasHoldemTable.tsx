"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Action } from "@bbge/core";
import type { PluginTableProps } from "@bbge/ui";
import { PlayingCard } from "./PlayingCard";

type SeatBubble = { id: string; text: string };

type ArenaView = {
  phase: string;
  street: string;
  smallBlind: number;
  bigBlind: number;
  currentPlayerId: string | null;
  currentBet: number;
  minRaiseTo: number;
  potTotal: number;
  board: { id: string; rank?: number; suit?: string }[];
  winners: string[];
  you: {
    id: string;
    hole: { id: string; rank?: number; suit?: string }[];
    stack: number;
    streetBet: number;
    toCall: number;
    folded: boolean;
    allIn: boolean;
  } | null;
  seats: {
    id: string;
    name: string;
    index: number;
    isButton: boolean;
    stack: number;
    streetBet: number;
    folded: boolean;
    allIn: boolean;
    hole: { id: string; rank?: number; suit?: string }[];
    handCategory?: { en: string; zh: string } | null;
  }[];
  legal: { type: string; toAmount?: number; callAmount?: number }[];
};

const BUBBLE_MS = 3800;

export function TexasHoldemTable({
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
  const view = viewUnknown as ArenaView;
  const zh = locale === "zh";
  const reduce = useReducedMotion();
  const actorId = myId;
  const [raiseTo, setRaiseTo] = useState(view.minRaiseTo ?? view.bigBlind * 2);
  const [chatText, setChatText] = useState("");
  const [bubbles, setBubbles] = useState<Record<string, SeatBubble>>({});
  const seenLogIds = useRef(new Set<string>());
  const seenChat = useRef(new Set<string>());
  const timers = useRef(new Map<string, number>());
  const boardKey = view.board.map((c) => c.id).join(",");
  const [boardPulse, setBoardPulse] = useState(0);

  useEffect(() => {
    setRaiseTo(Math.max(view.minRaiseTo, view.currentBet + view.bigBlind));
  }, [view.minRaiseTo, view.currentBet, view.bigBlind]);

  useEffect(() => {
    setBoardPulse((n) => n + 1);
  }, [boardKey]);

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
    }, BUBBLE_MS);
    timers.current.set(seatId, t);
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
      for (const t of timers.current.values()) window.clearTimeout(t);
    },
    [],
  );

  const isMyTurn =
    view.phase === "playing" && view.currentPlayerId === actorId;
  const interactive = isMyTurn && !disabled;
  const toCall = view.you?.toCall ?? 0;
  const maxRaise = (view.you?.streetBet ?? 0) + (view.you?.stack ?? 0);

  const status = useMemo(() => {
    if (view.phase === "finished") {
      return zh
        ? `本手结束 · 胜者 ${view.winners.map((id) => nameOf?.(id) ?? id).join("、")}`
        : `Hand over · ${view.winners.map((id) => nameOf?.(id) ?? id).join(", ")}`;
    }
    if (thinkingId) {
      return zh
        ? `${nameOf?.(thinkingId) ?? thinkingId} 思考中…`
        : `${nameOf?.(thinkingId) ?? thinkingId} thinking…`;
    }
    if (!isMyTurn) {
      return zh
        ? `等待 ${nameOf?.(view.currentPlayerId ?? "") ?? "…"} · ${view.street}`
        : `Waiting for ${nameOf?.(view.currentPlayerId ?? "") ?? "…"} · ${view.street}`;
    }
    return zh
      ? `轮到你 · ${view.street}${toCall ? ` · 需跟 ${toCall}` : ""}`
      : `Your turn · ${view.street}${toCall ? ` · to call ${toCall}` : ""}`;
  }, [view, thinkingId, isMyTurn, toCall, zh, nameOf]);

  const dispatch = (action: Action) => onAction(action);

  const seatsAround = view.seats;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#3E2723]/25 bg-[#efe6d8] shadow-card">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#3E2723]/15 bg-[#5D4037] px-4 py-2.5 text-amber-50">
        <p className="font-heading text-sm font-bold tracking-wide">
          {zh ? "德州扑克 · 现金桌" : "Texas Hold'em · Cash"}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-amber-100/85">
          <span>
            {zh ? "盲注" : "Blinds"}{" "}
            <strong className="text-accent">
              {view.smallBlind}/{view.bigBlind}
            </strong>
          </span>
          <span>
            {zh ? "底池" : "Pot"}{" "}
            <strong className="text-accent">{view.potTotal}</strong>
          </span>
          <span className="uppercase tracking-wide">{view.street}</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2.5 sm:p-3">
        {view.phase === "finished" ? (
          <div className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950">
            <div className="flex flex-wrap items-center gap-3">
              <p className="min-w-0 flex-1 font-heading text-sm font-semibold">
                {status}
              </p>
              {onRematch ? (
                <button
                  type="button"
                  onClick={onRematch}
                  className="cursor-pointer rounded-xl bg-accent px-5 py-2 font-heading text-sm font-bold text-white hover:bg-accent-dark"
                >
                  {zh ? "再来一局" : "Play again"}
                </button>
              ) : (
                <span className="text-xs text-emerald-800/70">
                  {zh ? "等待房主…" : "Waiting for host…"}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-14 shrink-0 flex-col justify-center overflow-hidden rounded-xl border border-border bg-white/90 px-3 text-sm text-primary-dark shadow-sm">
            <p className="truncate font-heading font-semibold leading-tight">
              {status}
            </p>
            <p className="mt-0.5 h-4 truncate text-[11px] leading-tight text-stone-500">
              {thinkingId && thinkingDetail ? thinkingDetail : "\u00a0"}
            </p>
          </div>
        )}

        <div className="grid min-h-0 flex-1 gap-2 overflow-hidden lg:grid-cols-[1fr_220px]">
          {/* Felt */}
          <div className="relative min-h-0 overflow-hidden rounded-2xl border-[6px] border-[#4E342E] shadow-inner">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 45%, #2e7d32 0%, #1b5e20 50%, #0d3b12 100%)",
              }}
            />
            {/* Seats */}
            <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-between p-3">
              <div className="flex flex-wrap justify-center gap-2">
                {seatsAround
                  .filter((s) => s.id !== actorId)
                  .map((s) => (
                    <SeatChip
                      key={s.id}
                      seat={s}
                      locale={locale}
                      active={view.currentPlayerId === s.id}
                      thinking={thinkingId === s.id}
                      bubble={bubbles[s.id]}
                      foldedAnim={s.folded}
                    />
                  ))}
              </div>

              {/* Board */}
              <div className="flex flex-col items-center gap-2 py-2">
                <motion.div
                  key={boardPulse}
                  className="flex flex-wrap justify-center gap-1.5"
                  initial={reduce ? false : { scale: 0.92 }}
                  animate={{ scale: 1 }}
                >
                  <AnimatePresence mode="popLayout">
                    {view.board.map((c, i) => (
                      <PlayingCard
                        key={c.id}
                        rank={c.rank}
                        suit={c.suit}
                        size="lg"
                        flip
                        dealDelay={reduce ? 0 : i * 0.08}
                      />
                    ))}
                  </AnimatePresence>
                  {view.board.length === 0 && (
                    <p className="font-heading text-sm font-bold text-emerald-100/70">
                      {zh ? "等待翻牌" : "Waiting for flop"}
                    </p>
                  )}
                </motion.div>
                <motion.div
                  className="rounded-full bg-black/35 px-4 py-1 font-heading text-sm font-bold text-amber-100 backdrop-blur"
                  animate={
                    reduce
                      ? undefined
                      : { scale: [1, 1.04, 1] }
                  }
                  transition={{ duration: 0.45 }}
                  key={view.potTotal}
                >
                  {zh ? "底池" : "Pot"} {view.potTotal}
                </motion.div>
              </div>

              {/* Hero */}
              <div className="flex flex-col items-center gap-2">
                {view.you && (
                  <SeatChip
                    seat={{
                      ...view.seats.find((s) => s.id === actorId)!,
                      name: zh ? "你" : "You",
                    }}
                    locale={locale}
                    active={view.currentPlayerId === actorId}
                    thinking={thinkingId === actorId}
                    bubble={bubbles[actorId]}
                    foldedAnim={view.you.folded}
                    you
                  />
                )}
                <div className="flex gap-2">
                  {(view.you?.hole ?? []).map((c, i) => (
                    <PlayingCard
                      key={c.id}
                      rank={c.rank}
                      suit={c.suit}
                      size="lg"
                      folded={view.you?.folded}
                      dealDelay={reduce ? 0 : 0.05 * i}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side panel */}
          <aside className="flex min-h-0 flex-col gap-2 overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-white/95 p-2 text-[11px]">
              <p className="mb-1 font-heading text-xs font-bold text-stone-500">
                {zh ? "战报" : "Log"}
              </p>
              {playLog.map((e) => (
                <p
                  key={e.id}
                  className={
                    e.tone === "win"
                      ? "text-emerald-700"
                      : e.tone === "warn"
                        ? "text-amber-700"
                        : "text-stone-600"
                  }
                >
                  {e.text}
                </p>
              ))}
            </div>
            {onChat && (
              <form
                className="flex gap-1"
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
                  className="cursor-pointer rounded-lg bg-primary px-2 py-1.5 text-xs font-bold text-white"
                >
                  {zh ? "发送" : "Send"}
                </button>
              </form>
            )}
          </aside>
        </div>

        {/* Action bar */}
        {view.phase === "playing" && (
          <div className="shrink-0 rounded-xl border border-border bg-white/95 p-2.5 shadow-sm">
            <div className="flex flex-wrap items-end gap-2">
              <button
                type="button"
                disabled={!interactive}
                onClick={() =>
                  dispatch({ type: "fold", playerId: actorId, payload: {} })
                }
                className="cursor-pointer rounded-xl bg-stone-700 px-4 py-2.5 font-heading text-sm font-bold text-white hover:bg-stone-800 disabled:opacity-35"
              >
                {zh ? "弃牌" : "Fold"}
              </button>
              {toCall <= 0 ? (
                <button
                  type="button"
                  disabled={!interactive}
                  onClick={() =>
                    dispatch({ type: "check", playerId: actorId, payload: {} })
                  }
                  className="cursor-pointer rounded-xl bg-emerald-700 px-4 py-2.5 font-heading text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-35"
                >
                  {zh ? "过牌" : "Check"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!interactive}
                  onClick={() =>
                    dispatch({ type: "call", playerId: actorId, payload: {} })
                  }
                  className="cursor-pointer rounded-xl bg-emerald-700 px-4 py-2.5 font-heading text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-35"
                >
                  {zh ? `跟注 ${toCall}` : `Call ${toCall}`}
                </button>
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  type="range"
                  min={Math.min(view.minRaiseTo, maxRaise)}
                  max={Math.max(maxRaise, view.minRaiseTo)}
                  value={Math.min(raiseTo, maxRaise)}
                  disabled={!interactive || maxRaise <= view.currentBet}
                  onChange={(e) => setRaiseTo(Number(e.target.value))}
                  className="w-28 accent-[#C4952A]"
                />
                <button
                  type="button"
                  disabled={!interactive || maxRaise <= view.currentBet}
                  onClick={() =>
                    dispatch({
                      type: "raise",
                      playerId: actorId,
                      payload: {
                        toAmount: Math.min(
                          Math.max(raiseTo, view.minRaiseTo),
                          maxRaise,
                        ),
                      },
                    })
                  }
                  className="cursor-pointer rounded-xl bg-accent px-4 py-2.5 font-heading text-sm font-bold text-white hover:bg-accent-dark disabled:opacity-35"
                >
                  {zh
                    ? `加注至 ${Math.min(raiseTo, maxRaise)}`
                    : `Raise to ${Math.min(raiseTo, maxRaise)}`}
                </button>
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={!interactive}
                    onClick={() =>
                      setRaiseTo(
                        Math.min(view.potTotal + toCall * n, maxRaise),
                      )
                    }
                    className="cursor-pointer rounded-lg bg-surface px-2 py-1.5 text-[11px] font-bold text-primary-dark hover:bg-primary-light disabled:opacity-35"
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SeatChip({
  seat,
  locale,
  active,
  thinking,
  bubble,
  foldedAnim,
  you,
}: {
  seat: ArenaView["seats"][0];
  locale: string;
  active: boolean;
  thinking: boolean;
  bubble?: SeatBubble;
  foldedAnim: boolean;
  you?: boolean;
}) {
  const zh = locale === "zh";
  const reduce = useReducedMotion();
  return (
    <motion.div
      layout
      className={[
        "relative min-w-[7.5rem] rounded-xl border px-2.5 py-2 shadow-sm",
        you ? "bg-amber-50/95" : "bg-white/90",
        active ? "border-accent ring-2 ring-accent/40" : "border-border",
        foldedAnim ? "opacity-50" : "",
      ].join(" ")}
      animate={
        reduce
          ? undefined
          : foldedAnim
            ? { x: [0, -6, 0], opacity: 0.5 }
            : active
              ? { scale: [1, 1.02, 1] }
              : undefined
      }
      transition={{ duration: 0.35 }}
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#3E2723] px-2.5 py-1 font-heading text-[11px] font-bold text-amber-50 shadow-md"
          >
            {bubble.text}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between gap-1">
        <p className="truncate font-heading text-xs font-bold text-primary-dark">
          {seat.isButton ? "Ⓓ " : ""}
          {seat.name}
        </p>
        {thinking && (
          <span className="text-[10px] text-accent-dark">…</span>
        )}
      </div>
      <p className="text-[11px] text-stone-600">
        {zh ? "筹码" : "Stack"} {seat.stack}
        {seat.streetBet > 0 ? ` · bet ${seat.streetBet}` : ""}
      </p>
      {seat.allIn && (
        <p className="text-[10px] font-bold text-red-700">ALL-IN</p>
      )}
      {seat.handCategory && (
        <p className="text-[10px] font-semibold text-emerald-800">
          {zh ? seat.handCategory.zh : seat.handCategory.en}
        </p>
      )}
      {!you && (
        <div className="mt-1 flex gap-0.5">
          {(seat.hole ?? []).map((c) => (
            <PlayingCard
              key={c.id}
              rank={c.rank}
              suit={c.suit}
              faceDown={c.rank == null}
              size="sm"
              folded={foldedAnim}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
