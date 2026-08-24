"use client";

import { useMemo, useState } from "react";
import type { Action } from "@bbge/core";
import type { PluginTableProps } from "@bbge/ui";
import {
  MatchResultBar,
  PlayActionDock,
  PlayHorizontalRail,
  PlayLogChatPanel,
  PlayScrollableRegion,
  PlaySideSheet,
  PlayTableShell,
  SeatSpeechSlot,
  ThinkingStatusBanner,
  useIsMobileLayout,
  useSeatBubbles,
} from "@bbge/ui";
import { TrioCard } from "./TrioCard";

type TrioView = {
  phase: string;
  mode: string;
  currentPlayerId: string | null;
  winners: string[];
  matchOver: boolean;
  pendingResolution: "bust" | "trio" | null;
  turnReveals: {
    source: string;
    value: number;
    slotIndex?: number;
    ownerId?: string;
    end?: string;
  }[];
  center: {
    empty?: boolean;
    faceUp?: boolean;
    value?: number;
    slotIndex?: number;
  }[];
  you: {
    id: string;
    hand: { id: string; value: number }[];
    trios: number[];
  } | null;
  seats: {
    id: string;
    name: string;
    handCount: number;
    trios: number[];
    isYou: boolean;
  }[];
  legal: { type: string; payload?: Record<string, unknown> }[];
};

export function TrioTable({
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
  const view = viewUnknown as TrioView;
  const mobile = useIsMobileLayout();
  const [sideOpen, setSideOpen] = useState(false);
  const bubbles = useSeatBubbles({ playLog, chat, durationMs: 4000 });

  const isMyTurn =
    view.currentPlayerId === myId &&
    !disabled &&
    !thinkingId &&
    view.phase !== "finished";

  const legalCenter = useMemo(() => {
    const s = new Set<number>();
    for (const a of view.legal) {
      if (a.type === "revealCenter" && typeof a.payload?.slotIndex === "number") {
        s.add(a.payload.slotIndex);
      }
    }
    return s;
  }, [view.legal]);

  const canRevealExtreme = (targetId: string, end: "low" | "high") =>
    view.legal.some(
      (a) =>
        a.type === "revealExtreme" &&
        a.payload?.targetPlayerId === targetId &&
        a.payload?.end === end,
    );

  const canConfirmTurn = view.legal.some((a) => a.type === "confirmTurn");

  const dispatch = (action: Action) => onAction(action);

  const status = useMemo(() => {
    if (view.phase === "finished") {
      const w = view.winners.map((id) => nameOf?.(id) ?? id).join(", ");
      return zh ? `${w} 获胜！` : `${w} wins!`;
    }
    if (thinkingId) {
      return zh
        ? `${nameOf?.(thinkingId) ?? thinkingId} 思考中…`
        : `${nameOf?.(thinkingId) ?? thinkingId} thinking…`;
    }
    const chain = view.turnReveals.map((r) => r.value).join(" · ");
    if (view.pendingResolution === "bust") {
      return zh
        ? `翻到不同数字：${chain}，确认后结束本回合`
        : `Different values: ${chain}. Confirm to end this turn.`;
    }
    if (view.pendingResolution === "trio") {
      return zh
        ? `三条 ${chain}！确认后收走`
        : `Trio ${chain}! Confirm to collect it.`;
    }
    if (!isMyTurn) {
      return zh
        ? `等待 ${nameOf?.(view.currentPlayerId ?? "") ?? ""}${chain ? ` · ${chain}` : ""}`
        : `Waiting ${nameOf?.(view.currentPlayerId ?? "") ?? ""}${chain ? ` · ${chain}` : ""}`;
    }
    return chain
      ? zh
        ? `继续找 ${view.turnReveals[0]?.value}（已翻 ${chain}）`
        : `Chase ${view.turnReveals[0]?.value} (${chain})`
      : zh
        ? "翻开一张牌开始"
        : "Reveal a card to start";
  }, [view, thinkingId, isMyTurn, zh, nameOf]);

  const others = view.seats.filter((s) => !s.isYou);
  const youSeat = view.seats.find((s) => s.isYou);
  const modeLabel =
    view.mode === "spicy" ? (zh ? "辣味" : "Spicy") : zh ? "简单" : "Simple";

  const logPanel = (
    <PlayLogChatPanel
      locale={locale}
      playLog={playLog}
      chat={chat}
      onChat={onChat}
      nameOf={nameOf}
    />
  );

  const seatBlock = (
    s: TrioView["seats"][number],
    opts?: { showHand?: boolean },
  ) => {
    const active = view.currentPlayerId === s.id;
    return (
      <div
        key={s.id}
        data-seat-id={s.id}
        className={`relative flex min-w-[7rem] shrink-0 flex-col rounded-xl border px-2 py-1.5 ${
          active ? "border-sky-400 bg-sky-50" : "border-border bg-white/90"
        }`}
      >
        <SeatSpeechSlot bubble={bubbles[s.id]} />
        <div className="flex items-center justify-between gap-1">
          <p className="max-w-[5rem] truncate text-xs font-semibold text-primary-dark">
            {nameOf?.(s.id) ?? s.name}
          </p>
          <p className="text-[10px] text-stone-500">
            {s.trios.length
              ? s.trios.map((t) => t).join("·")
              : zh
                ? "无三条"
                : "0"}
          </p>
        </div>
        {opts?.showHand && view.you ? (
          <div className="mt-1 overflow-x-auto overscroll-x-contain">
            <div className="mx-auto flex w-max min-w-full justify-center gap-0.5">
              {view.you.hand.map((c) => (
                <TrioCard key={c.id} value={c.value} size="sm" />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-1 flex items-end justify-center gap-0.5">
            {Array.from({ length: Math.min(s.handCount, 7) }).map((_, i) => (
              <div key={i} className="-ml-3 first:ml-0">
                <TrioCard faceDown size="sm" />
              </div>
            ))}
            {s.handCount > 7 && (
              <span className="ml-1 text-[10px] text-stone-500">
                +{s.handCount - 7}
              </span>
            )}
          </div>
        )}
        <div className="mt-1 flex justify-center gap-1">
          <button
            type="button"
            disabled={!canRevealExtreme(s.id, "low")}
            onClick={() =>
              dispatch({
                type: "revealExtreme",
                playerId: myId,
                payload: { targetPlayerId: s.id, end: "low" },
              })
            }
            className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-bold disabled:opacity-30"
          >
            {zh ? "最小" : "Low"}
          </button>
          <button
            type="button"
            disabled={!canRevealExtreme(s.id, "high")}
            onClick={() =>
              dispatch({
                type: "revealExtreme",
                playerId: myId,
                payload: { targetPlayerId: s.id, end: "high" },
              })
            }
            className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-bold disabled:opacity-30"
          >
            {zh ? "最大" : "High"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <PlayTableShell
      locale={locale}
      title={`TRIO · ${modeLabel}`}
      onOpenLog={() => setSideOpen(true)}
      toolbarExtra={
        <>
          <span className="truncate text-amber-100/80">{status}</span>
          {view.turnReveals.length > 0 && (
            <span className="font-bold text-accent">
              {view.turnReveals.map((r) => r.value).join(" · ")}
            </span>
          )}
        </>
      }
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden sm:gap-2">
        <ThinkingStatusBanner
          locale={locale}
          text={status}
          detail={thinkingDetail}
          className="!min-h-9 !py-1 sm:!min-h-11"
        />

        <PlayHorizontalRail data-testid="trio-seat-rail" className="shrink-0">
          {others.map((s) => seatBlock(s))}
        </PlayHorizontalRail>

        {/* Center row */}
        <PlayScrollableRegion
          data-testid="trio-center-region"
          className="flex flex-col items-center gap-2 px-2 py-1"
        >
          <p className="text-[11px] font-semibold text-primary-dark">
            {zh ? "桌面中央" : "Center"}
          </p>
          <div className="grid w-full max-w-md grid-cols-4 justify-items-center gap-1.5 sm:flex sm:max-w-full sm:flex-wrap sm:justify-center">
            {view.center.map((slot, i) => {
              if (slot.empty) {
                return (
                  <div
                    key={`empty-${i}`}
                    className={
                      mobile
                        ? "h-14 w-[2.55rem] rounded-lg border border-dashed border-stone-300"
                        : "h-20 w-[3.65rem] rounded-lg border border-dashed border-stone-300"
                    }
                  />
                );
              }
              return (
                <TrioCard
                  key={`c-${i}`}
                  value={slot.faceUp ? slot.value : null}
                  faceDown={!slot.faceUp}
                  size={mobile ? "sm" : "md"}
                  selected={legalCenter.has(slot.slotIndex ?? i)}
                  onClick={
                    legalCenter.has(slot.slotIndex ?? i)
                      ? () =>
                          dispatch({
                            type: "revealCenter",
                            playerId: myId,
                            payload: { slotIndex: slot.slotIndex ?? i },
                          })
                      : undefined
                  }
                />
              );
            })}
          </div>
          {view.turnReveals.length > 0 && (
            <div className="mt-1 flex max-w-full items-center gap-1 overflow-x-auto overscroll-x-contain">
              <span className="text-[10px] text-stone-500">
                {zh ? "本回合" : "This turn"}
              </span>
              {view.turnReveals.map((r, i) => (
                <TrioCard key={`tr-${i}`} value={r.value} size="sm" />
              ))}
            </div>
          )}
        </PlayScrollableRegion>

        {youSeat && seatBlock(youSeat, { showHand: true })}

        <PlayActionDock className="rounded-xl border border-border px-2.5 py-1.5 shadow-sm">
          {view.phase === "finished" ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-primary-dark">{status}</p>
              <MatchResultBar
                locale={locale}
                onRematch={onRematch}
                label={zh ? "再来一局" : "Play again"}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <p className="text-center text-[11px] text-stone-500">
                {view.pendingResolution
                  ? zh
                    ? "先查看翻开的牌，再确认继续"
                    : "Review the revealed cards, then confirm."
                  : zh
                    ? "点中央牌或「最小/最大」翻牌 · 凑齐三张相同数字"
                    : "Tap center or Low/High · find three of a kind"}
              </p>
              {canConfirmTurn && (
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "confirmTurn",
                      playerId: myId,
                      payload: {},
                    })
                  }
                  className={`min-h-11 shrink-0 rounded-lg px-3 text-xs font-bold text-white shadow-sm ${
                    view.pendingResolution === "trio"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-primary hover:bg-primary-dark"
                  }`}
                >
                  {view.pendingResolution === "trio"
                    ? zh
                      ? "确认收走"
                      : "Collect"
                    : zh
                      ? "确认继续"
                      : "Continue"}
                </button>
              )}
            </div>
          )}
        </PlayActionDock>
      </div>

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
