"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Action } from "@bbge/core";
import type { PluginTableProps } from "@bbge/ui";
import { useIsMobileLayout } from "@bbge/ui";
import { NimmtCard } from "./NimmtCard";

type CardV = { id: string; value: number; bullheads: number };

type ArenaView = {
  phase: string;
  round: number;
  trick: number;
  targetScore: number;
  currentPlayerId: string | null;
  winners: string[];
  rows: CardV[][];
  revealed: { playerId: string; card: CardV }[] | null;
  pending: {
    type: string;
    playerId: string;
    card: CardV;
  } | null;
  legal: { type: string; cardId?: string; rowIndex?: number }[];
  you: {
    id: string;
    hand: CardV[];
    taken: CardV[];
    takenBullheads: number;
    score: number;
    hasPlayed: boolean;
    selectedCardId: string | null;
  } | null;
  seats: {
    id: string;
    name: string;
    score: number;
    handCount: number;
    takenBullheads: number;
    hasPlayed: boolean;
    isYou: boolean;
  }[];
};

export function SixNimmtTable({
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
  const mobile = useIsMobileLayout();
  const [pickId, setPickId] = useState<string | null>(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const cardSize = mobile ? "md" : "lg";

  useEffect(() => {
    setPickId(null);
  }, [view.trick, view.round, view.phase]);

  const canPlay =
    view.phase === "selecting" &&
    !disabled &&
    view.you &&
    !view.you.hasPlayed;
  const canChoose =
    view.phase === "chooseRow" &&
    view.pending?.playerId === myId &&
    !disabled;

  const status = useMemo(() => {
    if (view.phase === "finished") {
      return zh
        ? `对局结束 · 胜者 ${view.winners.map((id) => nameOf?.(id) ?? id).join("、")}`
        : `Match over · ${view.winners.map((id) => nameOf?.(id) ?? id).join(", ")}`;
    }
    if (view.phase === "chooseRow" && view.pending) {
      const who = nameOf?.(view.pending.playerId) ?? view.pending.playerId;
      return view.pending.playerId === myId
        ? zh
          ? `过小 · 点选一行收走（牌 ${view.pending.card.value}）`
          : `Too low · tap a row to take (card ${view.pending.card.value})`
        : zh
          ? `等待 ${who} 选择收行…`
          : `Waiting for ${who} to choose a row…`;
    }
    if (thinkingId) {
      return zh
        ? `${nameOf?.(thinkingId) ?? thinkingId} 思考中…`
        : `${nameOf?.(thinkingId) ?? thinkingId} thinking…`;
    }
    if (view.you?.hasPlayed) {
      const waiting = view.seats.filter((s) => !s.hasPlayed).length;
      return zh
        ? `已锁定 · 等待其余 ${waiting} 人`
        : `Locked · waiting for ${waiting}`;
    }
    return zh
      ? `第 ${view.round} 轮 · 第 ${view.trick} 拍 · 选一张手牌`
      : `Round ${view.round} · trick ${view.trick} · pick a card`;
  }, [view, thinkingId, zh, nameOf, myId]);

  const dispatch = (action: Action) => onAction(action);

  const sidePanel = (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded-xl border border-border bg-white/95 p-2 text-[11px]">
        <p className="mb-1 font-heading text-xs font-bold text-stone-500">
          {zh ? "玩家 / 分数" : "Players / scores"}
        </p>
        {view.seats.map((s) => (
          <div
            key={s.id}
            className={[
              "flex items-center justify-between rounded-lg px-2 py-1.5",
              s.hasPlayed && view.phase === "selecting"
                ? "bg-emerald-50"
                : "bg-surface",
              thinkingId === s.id ? "ring-1 ring-sky-400" : "",
            ].join(" ")}
          >
            <span className="truncate font-heading font-bold text-primary-dark">
              {s.isYou ? (zh ? "你" : "You") : s.name}
              {view.phase === "selecting" &&
                (s.hasPlayed ? (zh ? " · 已出" : " · locked") : "")}
            </span>
            <span className="tabular-nums text-stone-600">
              {s.score}
              {s.takenBullheads > 0 ? (
                <span className="text-rose-600"> +{s.takenBullheads}</span>
              ) : null}
            </span>
          </div>
        ))}
        <p className="mb-1 mt-3 font-heading text-xs font-bold text-stone-500">
          {zh ? "战报" : "Log"}
        </p>
        {(playLog ?? []).slice(-40).map((e) => (
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
            className="min-h-10 min-w-0 flex-1 rounded-lg border border-border px-2 py-2 text-xs"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder={zh ? "桌边闲聊…" : "Table chat…"}
          />
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
          >
            {zh ? "发送" : "Send"}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#3E2723]/25 bg-[#efe6d8] shadow-card">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#3E2723]/15 bg-[#5D4037] px-3 py-2 text-amber-50 sm:px-4 sm:py-2.5">
        <p className="font-heading text-sm font-bold tracking-wide">
          {zh ? "谁是牛头王 · 经典桌" : "6 nimmt! · Classic"}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-amber-100/85 sm:gap-3">
          <span>
            {zh ? "目标" : "Target"}{" "}
            <strong className="text-accent">{view.targetScore}</strong>
          </span>
          <span>
            {zh ? "轮" : "R"} {view.round} · {zh ? "拍" : "T"} {view.trick}
          </span>
          {mobile && (
            <button
              type="button"
              onClick={() => setSideOpen(true)}
              className="cursor-pointer rounded-lg bg-white/15 px-2.5 py-1 font-heading text-[11px] font-bold"
            >
              {zh ? "战报" : "Log"}
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5 sm:gap-2 sm:p-3">
        <button
          type="button"
          onClick={() =>
            thinkingId && thinkingDetail
              ? setStatusOpen((v) => !v)
              : undefined
          }
          className={[
            "flex min-h-11 shrink-0 flex-col justify-center rounded-xl border px-3 py-1.5 text-left text-sm shadow-sm",
            view.phase === "finished"
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : canChoose
                ? "border-accent bg-amber-50 text-amber-950"
                : "border-border bg-white/90 text-primary-dark",
            thinkingId && thinkingDetail ? "cursor-pointer" : "cursor-default",
          ].join(" ")}
        >
          <p className="truncate font-heading font-semibold">{status}</p>
          {statusOpen && thinkingDetail && (
            <pre className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap break-words border-t border-border/50 pt-1 font-sans text-[11px] text-stone-700">
              {thinkingDetail}
            </pre>
          )}
        </button>

        <div className="grid min-h-0 flex-1 gap-2 overflow-hidden lg:grid-cols-[1fr_220px]">
          <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden">
            {/* Rows */}
            <div className="relative min-h-0 flex-1 overflow-y-auto rounded-xl border-[4px] border-[#4E342E] p-2 sm:rounded-2xl sm:border-[6px] sm:p-3">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 40%, #2e7d32 0%, #1b5e20 55%, #0d3b12 100%)",
                }}
              />
              <div className="relative z-10 space-y-2">
                {view.rows.map((row, ri) => (
                  <button
                    key={ri}
                    type="button"
                    disabled={!canChoose}
                    onClick={() =>
                      canChoose &&
                      dispatch({
                        type: "chooseRow",
                        playerId: myId,
                        payload: { rowIndex: ri },
                      })
                    }
                    className={[
                      "flex w-full flex-wrap items-center gap-1 rounded-xl px-2 py-1.5 text-left",
                      canChoose
                        ? "cursor-pointer bg-black/25 ring-2 ring-accent/80 hover:bg-black/35"
                        : "bg-black/15",
                    ].join(" ")}
                  >
                    <span className="mr-1 w-5 shrink-0 font-heading text-xs font-bold text-amber-100/80">
                      {ri + 1}
                    </span>
                    <AnimatePresence mode="popLayout">
                      {row.map((c) => (
                        <motion.div
                          key={c.id}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          <NimmtCard
                            value={c.value}
                            bullheads={c.bullheads}
                            size="sm"
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <span className="ml-auto text-[10px] font-bold text-emerald-100/70">
                      {row.length}/5
                    </span>
                  </button>
                ))}

                {view.revealed && view.revealed.length > 0 && (
                  <div className="mt-2 flex flex-wrap justify-center gap-2 border-t border-white/10 pt-2">
                    {view.revealed.map((r) => (
                      <div key={r.card.id} className="text-center">
                        <NimmtCard
                          value={r.card.value}
                          bullheads={r.card.bullheads}
                          size="sm"
                        />
                        <p className="mt-0.5 max-w-[3rem] truncate text-[9px] text-amber-50/80">
                          {nameOf?.(r.playerId) ?? r.playerId}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hand dock */}
            <div className="shrink-0 rounded-xl border border-border bg-white/95 p-2 shadow-sm sm:p-2.5">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-heading text-sm font-bold text-primary-dark">
                  {zh ? "你的手牌" : "Your hand"}
                  {view.you ? (
                    <span className="ml-2 text-[11px] font-semibold text-stone-500">
                      {zh ? "总分" : "Score"} {view.you.score}
                      {view.you.takenBullheads > 0
                        ? ` · +${view.you.takenBullheads}`
                        : ""}
                    </span>
                  ) : null}
                </p>
                {canPlay && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
                    {zh ? "可出牌" : "Your play"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 py-1">
                {(view.you?.hand ?? []).map((c) => (
                  <NimmtCard
                    key={c.id}
                    value={c.value}
                    bullheads={c.bullheads}
                    size={cardSize}
                    selected={
                      pickId === c.id || view.you?.selectedCardId === c.id
                    }
                    disabled={!canPlay}
                    onClick={() => canPlay && setPickId(c.id)}
                  />
                ))}
                {(view.you?.hand.length ?? 0) === 0 && (
                  <p className="py-4 text-sm text-stone-400">
                    {zh ? "手牌已打完" : "Hand empty"}
                  </p>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2">
                <button
                  type="button"
                  disabled={!canPlay || !pickId}
                  onClick={() => {
                    if (!pickId) return;
                    dispatch({
                      type: "playCard",
                      playerId: myId,
                      payload: { cardId: pickId },
                    });
                    setPickId(null);
                  }}
                  className="min-h-11 flex-1 cursor-pointer rounded-xl bg-accent px-5 py-2.5 font-heading text-sm font-bold text-white hover:bg-accent-dark disabled:opacity-35 sm:flex-none"
                >
                  {zh ? "确认出牌" : "Lock card"}
                </button>
                {view.phase === "finished" && (
                  <div className="ml-auto">
                    {onRematch ? (
                      <button
                        type="button"
                        onClick={onRematch}
                        className="min-h-11 cursor-pointer rounded-xl bg-emerald-700 px-5 py-2.5 font-heading text-sm font-bold text-white hover:bg-emerald-800"
                      >
                        {zh ? "再来一局" : "Play again"}
                      </button>
                    ) : (
                      <span className="text-xs text-stone-500">
                        {zh ? "等待房主…" : "Waiting…"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="hidden min-h-0 lg:flex">{sidePanel}</aside>
        </div>
      </div>

      {mobile && sideOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/45">
          <button
            type="button"
            aria-label="close"
            className="absolute inset-0 cursor-pointer"
            onClick={() => setSideOpen(false)}
          />
          <div className="relative z-10 flex max-h-[72dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-[#efe6d8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-heading text-sm font-bold">
                {zh ? "战报 / 分数" : "Log / scores"}
              </p>
              <button
                type="button"
                onClick={() => setSideOpen(false)}
                className="cursor-pointer rounded-lg bg-surface px-3 py-1.5 text-xs font-bold"
              >
                {zh ? "关闭" : "Close"}
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden p-3">{sidePanel}</div>
          </div>
        </div>
      )}
    </div>
  );
}
