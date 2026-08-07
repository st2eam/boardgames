"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Action } from "@bbge/core";
import type { PluginTableProps } from "@bbge/ui";
import {
  MatchResultBar,
  PlayLogChatPanel,
  PlaySideSheet,
  PlayTableShell,
  SeatSpeechSlot,
  ThinkingStatusBanner,
  useIsMobileLayout,
  useSeatBubbles,
} from "@bbge/ui";
import { cardBackUrl, cardFaceUrl } from "./cardArt";

type SlotV = {
  slotIndex: number;
  value: number | null;
  faceUp: boolean;
  cardId: string | null;
  knownToYou?: boolean;
};

type ArenaView = {
  phase: string;
  round: number;
  targetScore: number;
  matchOver: boolean;
  currentPlayerId: string | null;
  caboCallerId: string | null;
  finalTurnQueue: string[];
  winners: string[];
  deckCount: number;
  discardTop: number | null;
  discardCount: number;
  pendingDraw: {
    source: string;
    value: number | null;
    cardId: string | null;
  } | null;
  pendingAbility: { kind: string } | null;
  pendingModal: {
    type: string;
    slotIndex?: number;
    slotIndices?: number[];
    targetPlayerId?: string;
    value?: number;
    values?: number[];
    waiting?: boolean;
  } | null;
  roundScores: Record<string, number> | null;
  setupPeeksDone: boolean;
  legal: { type: string; payload?: Record<string, unknown> }[];
  you: {
    id: string;
    cumulativeScore: number;
    scoreResetUsed: boolean;
    tableauSum: number;
    slots: SlotV[];
  } | null;
  seats: {
    id: string;
    name: string;
    cumulativeScore: number;
    scoreResetUsed: boolean;
    slotCount: number;
    tableauSum: number | null;
    isYou: boolean;
    isCaller: boolean;
    needsFinalTurn: boolean;
    slots: SlotV[];
  }[];
};

function CaboCard({
  locale,
  value,
  faceDown,
  selected,
  disabled,
  size = "md",
  onClick,
}: {
  locale: string;
  value: number | null;
  faceDown: boolean;
  selected?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  const zh = locale === "zh";
  const showBack = faceDown || value == null;
  const src = showBack ? cardBackUrl() : cardFaceUrl(value);
  const sz =
    size === "sm" ? "h-[72px] w-[50px]" : "h-[96px] w-[68px]";

  return (
    <button
      type="button"
      disabled={disabled || !onClick}
      onClick={onClick}
      className={[
        "relative shrink-0 overflow-hidden rounded-lg border-2 bg-[#2a1814] shadow-md transition-all",
        sz,
        selected ? "border-accent ring-2 ring-accent/40 -translate-y-1" : "border-[#5D4037]/70",
        onClick && !disabled ? "cursor-pointer hover:border-accent" : "cursor-default",
        disabled ? "opacity-40" : "",
      ].join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={showBack ? (zh ? "牌背" : "Back") : String(value)} className="h-full w-full object-cover" draggable={false} />
      {!showBack && value != null && (
        <span className="absolute left-1 top-1 rounded bg-black/70 px-1 font-heading text-[10px] font-bold text-white">
          {value}
        </span>
      )}
    </button>
  );
}

export function CaboTable({
  locale,
  view: viewUnknown,
  myId,
  disabled,
  thinkingId,
  thinkingIds,
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
  const [sideOpen, setSideOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const bubbles = useSeatBubbles({
    playLog,
    chat,
    durationMs: 4200,
    resetKey: view.round,
  });

  const actorId = myId;
  const isMyTurn = view.currentPlayerId === actorId;
  const thinkingSet = useMemo(() => {
    const ids = thinkingIds?.length ? thinkingIds : thinkingId ? [thinkingId] : [];
    return new Set(ids);
  }, [thinkingId, thinkingIds]);

  useEffect(() => {
    setSelectedSlots([]);
  }, [
    view.phase,
    view.round,
    view.pendingDraw?.cardId,
    view.currentPlayerId,
    view.pendingModal?.type,
  ]);

  const dispatch = (action: Action) => onAction(action);

  const toggleSlot = (idx: number) => {
    setSelectedSlots((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx].sort((a, b) => a - b),
    );
  };

  const modalValues =
    view.pendingModal?.values?.length
      ? view.pendingModal.values
      : view.pendingModal?.value != null
        ? [view.pendingModal.value]
        : [];
  const modalVisible =
    Boolean(view.pendingModal) &&
    !view.pendingModal?.waiting &&
    modalValues.length > 0;

  const phaseLabel = useMemo(() => {
    if (view.phase === "setupPeek") return zh ? "开局偷看 2 张" : "Setup peek (2)";
    if (view.phase === "caboFinalTurns") return zh ? "CABO 最终回合" : "CABO final turns";
    if (view.phase === "finished") return zh ? "本轮结束" : "Round over";
    if (view.pendingDraw) return zh ? "处理摸到的牌" : "Resolve drawn card";
    if (view.pendingAbility) return zh ? "特殊能力" : "Special ability";
    return zh ? "你的回合" : "Your turn";
  }, [view.phase, view.pendingDraw, view.pendingAbility, zh]);

  const status = useMemo(() => {
    if (view.phase === "finished") {
      if (view.matchOver) {
        const names = view.winners.map((w) => nameOf?.(w) ?? w).join(zh ? "、" : ", ");
        return zh ? `对局结束 · 胜者 ${names}` : `Match over · ${names}`;
      }
      return zh ? "本轮结束 — 继续下一局" : "Round over — continue match";
    }
    if (thinkingSet.size > 0) {
      const id = thinkingId ?? [...thinkingSet][0];
      return zh
        ? `${nameOf?.(id ?? "") ?? id} 思考中…`
        : `${nameOf?.(id ?? "") ?? id} thinking…`;
    }
    if (isMyTurn && !disabled) {
      return phaseLabel;
    }
    const who = nameOf?.(view.currentPlayerId ?? "") ?? view.currentPlayerId ?? "…";
    return zh ? `等待 ${who} · ${phaseLabel}` : `Waiting for ${who} · ${phaseLabel}`;
  }, [view, thinkingSet, thinkingId, isMyTurn, disabled, zh, nameOf, phaseLabel]);

  const statusTone = useMemo(() => {
    if (view.phase === "finished") return "done" as const;
    if (thinkingSet.size > 0) return "wait" as const;
    if (isMyTurn && !disabled) return "you" as const;
    return "idle" as const;
  }, [view.phase, thinkingSet.size, isMyTurn, disabled]);

  const logPanel = (
    <PlayLogChatPanel
      locale={locale}
      playLog={playLog}
      chat={chat}
      onChat={onChat}
      nameOf={nameOf}
    />
  );

  const renderSeat = (seat: ArenaView["seats"][0]) => {
    const active = view.currentPlayerId === seat.id;
    const thinking = thinkingSet.has(seat.id);
    return (
      <div
        key={seat.id}
        data-seat-id={seat.id}
        className={[
          "relative min-w-0 overflow-hidden rounded-2xl border bg-white/95 p-3 shadow-card transition-all",
          seat.isYou ? "border-accent/50 ring-1 ring-accent/20" : "border-border",
          active ? "ring-2 ring-accent/60" : "",
        ].join(" ")}
      >
        <SeatSpeechSlot bubble={bubbles[seat.id]} variant="cream" />
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-bold text-primary">
              {seat.name}
              {seat.isYou ? (zh ? "（你）" : " (you)") : ""}
            </p>
            <p className="text-[11px] text-stone-500">
              {zh ? "累计" : "Total"} {seat.cumulativeScore}
              <span className="mx-1">/</span>
              <span className="text-accent">{view.targetScore}</span>
              {seat.isCaller && (
                <span className="ml-1 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                  CABO
                </span>
              )}
              {seat.needsFinalTurn && (
                <span className="ml-1 text-[10px] text-amber-700">
                  {zh ? "最终回合" : "final"}
                </span>
              )}
            </p>
          </div>
          <div
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-heading text-xs font-bold",
              thinking ? "border-accent animate-pulse bg-amber-50" : "border-border bg-surface",
            ].join(" ")}
          >
            {seat.name.slice(0, 1).toUpperCase()}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {seat.slots.map((slot) => {
            const faceDown = !slot.faceUp && slot.value == null;
            const canSelect = Boolean(
              seat.isYou &&
                isMyTurn &&
                !disabled &&
                !view.pendingModal &&
                ((view.phase === "setupPeek" && !view.setupPeeksDone) ||
                  (view.pendingDraw && !slot.faceUp) ||
                  (view.pendingAbility?.kind === "peek" && !slot.faceUp)),
            );
            return (
              <CaboCard
                key={slot.slotIndex}
                locale={locale}
                value={slot.value}
                faceDown={faceDown}
                selected={canSelect && selectedSlots.includes(slot.slotIndex)}
                disabled={!canSelect}
                size={mobile ? "sm" : "md"}
                onClick={canSelect ? () => toggleSlot(slot.slotIndex) : undefined}
              />
            );
          })}
        </div>
        {view.phase === "finished" && seat.tableauSum != null && (
          <p className="mt-2 text-center text-xs font-medium text-stone-600">
            {zh ? "本轮" : "Round"}: {seat.tableauSum}
            {view.roundScores?.[seat.id] != null && (
              <span className="ml-1 text-accent">
                → {view.roundScores[seat.id]}
              </span>
            )}
          </p>
        )}
      </div>
    );
  };

  const actionBar = () => {
    if (disabled || !isMyTurn) return null;
    const legal = view.legal;

    if (view.phase === "setupPeek" && !view.setupPeeksDone) {
      return (
        <button
          type="button"
          disabled={selectedSlots.length !== 2}
          onClick={() => {
            dispatch({
              type: "setupPeek",
              playerId: actorId,
              payload: { slotIndices: selectedSlots },
            });
          }}
          className="rounded-xl bg-accent px-4 py-2 font-heading text-sm font-bold text-[#1a120e] disabled:opacity-40"
        >
          {zh ? "确认偷看 2 张" : "Confirm peek (2)"}
        </button>
      );
    }

    if (view.pendingModal && modalValues.length > 0) {
      // Modal overlay owns the confirm CTA.
      return null;
    }

    if (view.pendingAbility) {
      const kind = view.pendingAbility.kind;
      if (kind === "peek" && selectedSlots.length === 1) {
        return (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "resolveAbilityPeek",
                  playerId: actorId,
                  payload: { slotIndex: selectedSlots[0]! },
                })
              }
              className="rounded-xl bg-accent px-4 py-2 font-heading text-sm font-bold text-[#1a120e]"
            >
              {zh ? "偷看选中" : "Peek selected"}
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "skipAbility", playerId: actorId, payload: {} })
              }
              className="rounded-xl border border-border px-4 py-2 text-sm"
            >
              {zh ? "跳过" : "Skip"}
            </button>
          </div>
        );
      }
      return (
        <button
          type="button"
          onClick={() =>
            dispatch({ type: "skipAbility", playerId: actorId, payload: {} })
          }
          className="rounded-xl border border-border px-4 py-2 text-sm"
        >
          {zh ? "跳过能力" : "Skip ability"}
        </button>
      );
    }

    if (view.pendingDraw) {
      const drawn = view.pendingDraw.value;
      return (
        <div className="flex flex-wrap items-center gap-2">
          {drawn != null && (
            <CaboCard locale={locale} value={drawn} faceDown={false} size="sm" />
          )}
          {legal.some((a) => a.type === "discardDrawn") && (
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "discardDrawn",
                  playerId: actorId,
                  payload: {},
                })
              }
              className="rounded-xl border border-border px-3 py-2 text-sm"
            >
              {zh ? "弃牌" : "Discard"}
            </button>
          )}
          {legal.some(
            (a) => a.type === "discardDrawn" && a.payload?.useAbility,
          ) && (
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "discardDrawn",
                  playerId: actorId,
                  payload: { useAbility: true },
                })
              }
              className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white"
            >
              {zh ? "弃牌+能力" : "Discard + ability"}
            </button>
          )}
          {selectedSlots.length > 0 && (
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "swapWithDrawn",
                  playerId: actorId,
                  payload: { slotIndices: selectedSlots },
                })
              }
              className="rounded-xl bg-accent px-3 py-2 font-heading text-sm font-bold text-[#1a120e]"
            >
              {zh ? `交换 (${selectedSlots.length})` : `Swap (${selectedSlots.length})`}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {legal.some((a) => a.type === "drawDeck") && (
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "drawDeck", playerId: actorId, payload: {} })
            }
            className="rounded-xl bg-accent px-4 py-2 font-heading text-sm font-bold text-[#1a120e]"
          >
            {zh ? "摸牌堆" : "Draw deck"}
          </button>
        )}
        {legal.some((a) => a.type === "drawDiscard") && (
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "drawDiscard", playerId: actorId, payload: {} })
            }
            className="rounded-xl border border-border px-4 py-2 text-sm"
          >
            {zh ? `拿弃牌 ${view.discardTop ?? ""}` : `Take discard ${view.discardTop ?? ""}`}
          </button>
        )}
        {legal.some((a) => a.type === "callCabo") && (
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "callCabo", playerId: actorId, payload: {} })
            }
            className="rounded-xl bg-primary px-4 py-2 font-heading text-sm font-bold text-white"
          >
            CABO!
          </button>
        )}
      </div>
    );
  };

  const others = view.seats.filter((s) => !s.isYou);
  const youSeat = view.seats.find((s) => s.isYou);

  return (
    <PlayTableShell
      locale={locale}
      title={`CABO · ${zh ? "第" : "R"}${view.round}${zh ? "轮" : ""}`}
      onOpenLog={() => setSideOpen(true)}
      toolbarExtra={
        <>
          <span className="truncate text-amber-100/80">{phaseLabel}</span>
          <span>
            {zh ? "牌堆" : "Deck"}{" "}
            <strong className="text-accent">{view.deckCount}</strong>
          </span>
          {view.discardTop != null && (
            <span className="inline-flex items-center gap-1.5">
              <span>{zh ? "弃牌" : "Discard"}</span>
              <CaboCard
                locale={locale}
                value={view.discardTop}
                faceDown={false}
                size="sm"
              />
            </span>
          )}
        </>
      }
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
        <ThinkingStatusBanner
          locale={locale}
          text={status}
          tone={statusTone}
          detail={thinkingSet.size > 0 ? thinkingDetail : null}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {others.map(renderSeat)}
          </div>
          {youSeat && (
            <div className="mt-auto min-w-0 border-t border-border pt-3">
              {renderSeat(youSeat)}
            </div>
          )}
        </div>

        <div className="shrink-0 rounded-xl border border-border bg-white/95 px-3 py-2 shadow-sm">
          {view.phase === "finished" ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-primary-dark">{status}</p>
              <MatchResultBar
                locale={locale}
                onRematch={onRematch}
                label={
                  view.matchOver
                    ? zh
                      ? "再来一局"
                      : "New match"
                    : zh
                      ? "下一轮"
                      : "Next round"
                }
              />
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {view.seats.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface px-2 py-0.5 text-[10px] font-medium text-primary-dark"
                  >
                    {s.name.slice(0, 3)}
                    <span className="text-rose-600" aria-label="score">
                      ♥
                    </span>
                    {s.cumulativeScore}/{view.targetScore}
                  </span>
                ))}
              </div>
              {actionBar()}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <div className="max-w-sm rounded-2xl border border-border bg-white p-5 shadow-card">
              <h3 className="font-heading text-lg font-bold text-primary">
                {view.pendingModal!.type === "spyOther"
                  ? zh
                    ? "间谍偷看"
                    : "Spy"
                  : view.pendingModal!.type === "setupPeek"
                    ? zh
                      ? "开局偷看"
                      : "Setup peek"
                    : zh
                      ? "偷看"
                      : "Peek"}
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                {zh ? "记住这些牌，确认后会盖回：" : "Memorize, then cover:"}{" "}
                <strong className="text-lg text-accent">
                  {modalValues.join(zh ? "、" : ", ")}
                </strong>
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {modalValues.map((v, i) => (
                  <CaboCard
                    key={`peek-${i}-${v}`}
                    locale={locale}
                    value={v}
                    faceDown={false}
                    size="md"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "acknowledgeModal",
                    playerId: actorId,
                    payload: {},
                  })
                }
                className="mt-4 min-h-11 w-full cursor-pointer touch-manipulation rounded-xl bg-accent py-2.5 font-heading font-bold text-[#1a120e] active:scale-[0.98]"
              >
                {zh ? "确认并盖回" : "Confirm & cover"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PlaySideSheet
        open={sideOpen}
        onClose={() => setSideOpen(false)}
        locale={locale}
        title={zh ? "战报 / 聊天" : "Log / Chat"}
      >
        {logPanel}
      </PlaySideSheet>
    </PlayTableShell>
  );
}
