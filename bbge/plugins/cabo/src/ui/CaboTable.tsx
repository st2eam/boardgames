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
  size?: "xs" | "sm" | "md" | "fluid";
  onClick?: () => void;
}) {
  const zh = locale === "zh";
  const showBack = faceDown || value == null;
  const src = showBack ? cardBackUrl() : cardFaceUrl(value);
  const sz =
    size === "xs"
      ? "h-12 w-[34px]"
      : size === "sm"
        ? "h-[64px] w-[44px]"
        : size === "fluid"
          ? "h-[clamp(2.5rem,58cqh,5.25rem)] w-[clamp(1.75rem,40cqh,3.7rem)]"
          : "h-[84px] w-[60px]";

  return (
    <button
      type="button"
      disabled={disabled || !onClick}
      onClick={onClick}
      className={[
        "relative shrink-0 overflow-hidden rounded-lg border-2 bg-[#2a1814] shadow-md transition-all",
        sz,
        selected ? "border-accent ring-2 ring-accent/40 -translate-y-0.5" : "border-[#5D4037]/70",
        onClick && !disabled ? "cursor-pointer hover:border-accent" : "cursor-default",
        disabled ? "opacity-40" : "",
      ].join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={showBack ? (zh ? "牌背" : "Back") : String(value)} className="h-full w-full object-cover" draggable={false} />
      {!showBack && value != null && (
        <span className="absolute left-0.5 top-0.5 rounded bg-black/70 px-1 font-heading text-[9px] font-bold text-white sm:text-[10px]">
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
  const [sideOpen, setSideOpen] = useState(false);
  type SlotPick = { seatId: string; slotIndex: number };
  const [picks, setPicks] = useState<SlotPick[]>([]);
  const bubbles = useSeatBubbles({
    playLog,
    chat,
    durationMs: 4200,
    resetKey: view.round,
  });

  const actorId = myId;
  const isMyTurn = view.currentPlayerId === actorId;
  const abilityKind = view.pendingAbility?.kind ?? null;
  const thinkingSet = useMemo(() => {
    const ids = thinkingIds?.length ? thinkingIds : thinkingId ? [thinkingId] : [];
    return new Set(ids);
  }, [thinkingId, thinkingIds]);

  useEffect(() => {
    setPicks([]);
  }, [
    view.phase,
    view.round,
    view.pendingDraw?.cardId,
    view.currentPlayerId,
    view.pendingModal?.type,
    abilityKind,
  ]);

  const dispatch = (action: Action) => onAction(action);

  const isPicked = (seatId: string, slotIndex: number) =>
    picks.some((p) => p.seatId === seatId && p.slotIndex === slotIndex);

  const ownPicks = picks.filter((p) => p.seatId === actorId);
  const otherPick = picks.find((p) => p.seatId !== actorId) ?? null;

  const togglePick = (seatId: string, slotIndex: number) => {
    const key = { seatId, slotIndex };
    if (abilityKind === "peek" || abilityKind === "spy") {
      setPicks([key]);
      return;
    }
    if (abilityKind === "swap") {
      const isOwn = seatId === actorId;
      setPicks((prev) => {
        const own = prev.find((p) => p.seatId === actorId);
        const other = prev.find((p) => p.seatId !== actorId);
        if (isOwn) {
          const same =
            own?.seatId === seatId && own.slotIndex === slotIndex;
          if (same) return other ? [other] : [];
          return other ? [key, other] : [key];
        }
        const same =
          other?.seatId === seatId && other.slotIndex === slotIndex;
        if (same) return own ? [own] : [];
        return own ? [own, key] : [key];
      });
      return;
    }
    // setup peek / drawn-card swap: own multi-select
    setPicks((prev) => {
      const exists = prev.some(
        (p) => p.seatId === seatId && p.slotIndex === slotIndex,
      );
      if (exists) {
        return prev.filter(
          (p) => !(p.seatId === seatId && p.slotIndex === slotIndex),
        );
      }
      return [...prev, key].sort((a, b) => a.slotIndex - b.slotIndex);
    });
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

  const canSelectSlot = (
    seat: ArenaView["seats"][0],
    slot: ArenaView["seats"][0]["slots"][0],
  ) => {
    if (!isMyTurn || disabled || view.pendingModal) return false;
    if (view.phase === "setupPeek" && !view.setupPeeksDone) return seat.isYou;
    if (view.pendingDraw) return seat.isYou;
    if (abilityKind === "peek") return seat.isYou && !slot.faceUp;
    if (abilityKind === "spy") return !seat.isYou && !slot.faceUp;
    if (abilityKind === "swap") return true;
    return false;
  };

  const renderSeat = (seat: ArenaView["seats"][0]) => {
    const active = view.currentPlayerId === seat.id;
    const thinking = thinkingSet.has(seat.id);
    return (
      <div
        key={seat.id}
        data-seat-id={seat.id}
        className={[
          "relative flex min-h-0 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border bg-white/95 px-2 py-1 shadow-card transition-all sm:gap-3 sm:px-3 sm:py-1.5",
          seat.isYou ? "border-accent/50 ring-1 ring-accent/20" : "border-border",
          active ? "ring-2 ring-accent/60" : "",
        ].join(" ")}
      >
        <SeatSpeechSlot
          bubble={bubbles[seat.id]}
          variant="cream"
          overlay
        />
        <div className="flex w-[5.25rem] shrink-0 items-center gap-1.5 sm:w-28">
          <div
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-heading text-[11px] font-bold sm:h-8 sm:w-8 sm:text-xs",
              thinking ? "border-accent animate-pulse bg-amber-50" : "border-border bg-surface",
            ].join(" ")}
          >
            {seat.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-heading text-xs font-bold text-primary sm:text-sm">
              {seat.isYou ? (zh ? "你" : "You") : seat.name}
            </p>
            <p className="truncate text-[10px] text-stone-500">
              {seat.cumulativeScore}
              <span className="text-accent">/{view.targetScore}</span>
              {seat.isCaller ? " · CABO" : ""}
            </p>
          </div>
        </div>
        <div className="flex h-full min-h-0 min-w-0 flex-1 items-center gap-1 overflow-hidden [container-type:size] sm:gap-1.5">
          {seat.slots.map((slot) => {
            // Visual face uses faceUp only — known memory values stay hidden.
            const faceDown = !slot.faceUp;
            const canSelect = canSelectSlot(seat, slot);
            return (
              <CaboCard
                key={slot.slotIndex}
                locale={locale}
                value={faceDown ? null : slot.value}
                faceDown={faceDown}
                selected={canSelect && isPicked(seat.id, slot.slotIndex)}
                disabled={!canSelect}
                size="fluid"
                onClick={
                  canSelect
                    ? () => togglePick(seat.id, slot.slotIndex)
                    : undefined
                }
              />
            );
          })}
          {view.phase === "finished" && seat.tableauSum != null && (
            <span className="ml-1 shrink-0 text-[11px] font-medium text-stone-600">
              {zh ? "本轮" : "Round"} {seat.tableauSum}
              {view.roundScores?.[seat.id] != null
                ? ` → ${view.roundScores[seat.id]}`
                : ""}
            </span>
          )}
        </div>
      </div>
    );
  };

  const actionBar = () => {
    if (disabled || !isMyTurn) return null;
    const legal = view.legal;
    const ownSlotIndices = ownPicks.map((p) => p.slotIndex);

    if (view.phase === "setupPeek" && !view.setupPeeksDone) {
      return (
        <button
          type="button"
          disabled={ownSlotIndices.length !== 2}
          onClick={() => {
            dispatch({
              type: "setupPeek",
              playerId: actorId,
              payload: { slotIndices: ownSlotIndices },
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
      const skipBtn = (
        <button
          type="button"
          onClick={() =>
            dispatch({ type: "skipAbility", playerId: actorId, payload: {} })
          }
          className="rounded-xl border border-border px-4 py-2 text-sm"
        >
          {zh ? "跳过" : "Skip"}
        </button>
      );

      if (kind === "peek") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-stone-500">
              {zh ? "点选自己的 1 张面朝下牌" : "Pick 1 of your face-down cards"}
            </span>
            <button
              type="button"
              disabled={ownPicks.length !== 1}
              onClick={() =>
                dispatch({
                  type: "resolveAbilityPeek",
                  playerId: actorId,
                  payload: { slotIndex: ownPicks[0]!.slotIndex },
                })
              }
              className="rounded-xl bg-accent px-4 py-2 font-heading text-sm font-bold text-[#1a120e] disabled:opacity-40"
            >
              {zh ? "偷看选中" : "Peek selected"}
            </button>
            {skipBtn}
          </div>
        );
      }

      if (kind === "spy") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-stone-500">
              {zh ? "点选对手的 1 张面朝下牌" : "Pick 1 opponent face-down card"}
            </span>
            <button
              type="button"
              disabled={!otherPick}
              onClick={() => {
                if (!otherPick) return;
                dispatch({
                  type: "resolveAbilitySpy",
                  playerId: actorId,
                  payload: {
                    targetPlayerId: otherPick.seatId,
                    slotIndex: otherPick.slotIndex,
                  },
                });
              }}
              className="rounded-xl bg-accent px-4 py-2 font-heading text-sm font-bold text-[#1a120e] disabled:opacity-40"
            >
              {zh ? "间谍偷看" : "Spy selected"}
            </button>
            {skipBtn}
          </div>
        );
      }

      if (kind === "swap") {
        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-stone-500">
              {zh
                ? "先点自己 1 张，再点对手 1 张"
                : "Pick 1 of yours, then 1 opponent card"}
            </span>
            <button
              type="button"
              disabled={ownPicks.length !== 1 || !otherPick}
              onClick={() => {
                if (ownPicks.length !== 1 || !otherPick) return;
                dispatch({
                  type: "resolveAbilitySwap",
                  playerId: actorId,
                  payload: {
                    ownSlotIndex: ownPicks[0]!.slotIndex,
                    targetPlayerId: otherPick.seatId,
                    targetSlotIndex: otherPick.slotIndex,
                  },
                });
              }}
              className="rounded-xl bg-accent px-4 py-2 font-heading text-sm font-bold text-[#1a120e] disabled:opacity-40"
            >
              {zh ? "盲换选中" : "Blind swap"}
            </button>
            {skipBtn}
          </div>
        );
      }

      return skipBtn;
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
          {ownSlotIndices.length > 0 && (
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "swapWithDrawn",
                  playerId: actorId,
                  payload: { slotIndices: ownSlotIndices },
                })
              }
              className="rounded-xl bg-accent px-3 py-2 font-heading text-sm font-bold text-[#1a120e]"
            >
              {zh
                ? `交换 (${ownSlotIndices.length})`
                : `Swap (${ownSlotIndices.length})`}
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden sm:gap-2">
        <ThinkingStatusBanner
          locale={locale}
          text={status}
          tone={statusTone}
          detail={thinkingSet.size > 0 ? thinkingDetail : null}
          className="!min-h-9 !py-1 sm:!min-h-11 sm:!py-1.5"
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden sm:gap-2">
          {others.map((s) => renderSeat(s))}
          {youSeat ? renderSeat(youSeat) : null}
        </div>

        <div className="shrink-0 rounded-xl border border-border bg-white/95 px-2.5 py-1.5 shadow-sm sm:px-3 sm:py-2">
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
