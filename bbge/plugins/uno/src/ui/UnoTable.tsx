"use client";

import { useMemo, useState } from "react";
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
import { UnoCardBack, UnoCardView } from "./UnoCardView";

type CardV = {
  id: string;
  color: "red" | "yellow" | "green" | "blue" | null;
  kind: string;
  number?: number | null;
  drawN?: number | null;
  label: string;
};

type UnoView = {
  phase: string;
  edition: string;
  side: "light" | "dark";
  currentPlayerId: string | null;
  currentColor: string;
  direction: number;
  deckCount: number;
  discardTop: CardV;
  pending: {
    type: string;
    playerId: string;
    amount?: number;
    purpose?: string;
  } | null;
  unoVulnerableId: string | null;
  winners: string[];
  matchOver: boolean;
  round: number;
  targetScore: number;
  drawnCard: CardV | null;
  you: {
    id: string;
    hand: CardV[];
    score: number;
    eliminated: boolean;
    saidUno: boolean;
  } | null;
  seats: {
    id: string;
    name: string;
    handCount: number;
    score: number;
    eliminated: boolean;
    isYou: boolean;
  }[];
  legal: { type: string; payload?: Record<string, unknown> }[];
};

const COLOR_BTN: Record<string, string> = {
  red: "bg-red-600",
  yellow: "bg-amber-400 text-stone-900",
  green: "bg-emerald-600",
  blue: "bg-sky-600",
};

export function UnoTable({
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
  const view = viewUnknown as UnoView;
  const [sideOpen, setSideOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const bubbles = useSeatBubbles({ playLog, chat, durationMs: 3800 });

  const actorId = myId;
  const isMyTurn =
    view.currentPlayerId === actorId &&
    !disabled &&
    !thinkingId &&
    view.phase !== "finished";

  const legalTypes = useMemo(
    () => new Set(view.legal.map((a) => a.type)),
    [view.legal],
  );

  const playableIds = useMemo(() => {
    const s = new Set<string>();
    for (const a of view.legal) {
      if (a.type === "playCard" && typeof a.payload?.cardId === "string") {
        s.add(a.payload.cardId);
      }
    }
    return s;
  }, [view.legal]);

  const dispatch = (action: Action) => onAction(action);

  const playCard = (cardId: string) => {
    const card = view.you?.hand.find((c) => c.id === cardId);
    const needsColor =
      card &&
      (card.color == null ||
        card.kind.startsWith("wild") ||
        card.kind === "wild");
    dispatch({
      type: "playCard",
      playerId: actorId,
      payload: {
        cardId,
        saidUno: (view.you?.hand.length ?? 0) <= 2,
        chosenColor: needsColor ? undefined : undefined,
      },
    });
    setSelectedId(null);
  };

  const editionLabel =
    view.edition === "flip"
      ? "UNO Flip"
      : view.edition === "no-mercy"
        ? zh
          ? "毫不留情"
          : "No Mercy"
        : zh
          ? "经典 UNO"
          : "Classic UNO";

  const status = useMemo(() => {
    if (view.phase === "finished") {
      const w = view.winners.map((id) => nameOf?.(id) ?? id).join(", ");
      return view.matchOver
        ? zh
          ? `整局结束 · ${w}`
          : `Match over · ${w}`
        : zh
          ? `本轮结束 · ${w}`
          : `Round over · ${w}`;
    }
    if (thinkingId) {
      return zh
        ? `${nameOf?.(thinkingId) ?? thinkingId} 思考中…`
        : `${nameOf?.(thinkingId) ?? thinkingId} thinking…`;
    }
    if (view.pending?.type === "chooseColor" && view.pending.playerId === actorId) {
      return zh ? "选择颜色" : "Choose a color";
    }
    if (view.pending?.type === "chooseTarget" && view.pending.playerId === actorId) {
      return zh ? "选择交换对象" : "Choose swap target";
    }
    if (view.pending?.type === "challenge" && view.pending.playerId === actorId) {
      return zh ? "接受或质疑 +4" : "Accept or challenge +4";
    }
    if (view.pending?.type === "stackResponse" && view.pending.playerId === actorId) {
      return zh
        ? `叠加或抽 ${view.pending.amount} 张`
        : `Stack or draw ${view.pending.amount}`;
    }
    if (view.pending?.type === "drawnDecision" && view.pending.playerId === actorId) {
      return zh ? "打出或留下抽到的牌" : "Play or keep drawn card";
    }
    if (!isMyTurn) {
      return zh
        ? `等待 ${nameOf?.(view.currentPlayerId ?? "") ?? ""}`
        : `Waiting for ${nameOf?.(view.currentPlayerId ?? "") ?? ""}`;
    }
    return zh ? "你的回合 — 出牌或抽牌" : "Your turn — play or draw";
  }, [view, thinkingId, isMyTurn, zh, nameOf, actorId]);

  const others = view.seats.filter((s) => !s.isYou);
  const youSeat = view.seats.find((s) => s.isYou);

  const logPanel = (
    <PlayLogChatPanel
      locale={locale}
      playLog={playLog}
      chat={chat}
      onChat={onChat}
      nameOf={nameOf}
    />
  );

  return (
    <PlayTableShell
      locale={locale}
      title={`${editionLabel} · ${zh ? "第" : "R"}${view.round}${zh ? "轮" : ""}`}
      onOpenLog={() => setSideOpen(true)}
      toolbarExtra={
        <>
          <span className="truncate text-amber-100/80">{status}</span>
          <span>
            {zh ? "牌堆" : "Deck"}{" "}
            <strong className="text-accent">{view.deckCount}</strong>
          </span>
          <span>
            {view.direction === 1 ? "→" : "←"}{" "}
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                COLOR_BTN[view.currentColor]?.split(" ")[0] ?? "bg-stone-400"
              }`}
            />
          </span>
          {view.edition === "flip" && (
            <span className="rounded bg-black/30 px-1.5 py-0.5 text-[10px]">
              {view.side === "dark"
                ? zh
                  ? "黑暗面"
                  : "Dark"
                : zh
                  ? "光明面"
                  : "Light"}
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
          className="!min-h-9 !py-1 sm:!min-h-11 sm:!py-1.5"
        />

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {/* Opponents */}
          <div className="flex shrink-0 flex-wrap justify-center gap-2 px-1">
            {others.map((s) => {
              const active = view.currentPlayerId === s.id;
              return (
                <div
                  key={s.id}
                  data-seat-id={s.id}
                  className={`relative flex min-w-[5.5rem] flex-col items-center rounded-xl border px-2 py-1.5 ${
                    s.eliminated
                      ? "border-stone-300 opacity-40"
                      : active
                        ? "border-sky-400 bg-sky-50"
                        : "border-border bg-white/90"
                  }`}
                >
                  <SeatSpeechSlot bubble={bubbles[s.id]} />
                  <p className="max-w-[6rem] truncate text-xs font-semibold text-primary-dark">
                    {nameOf?.(s.id) ?? s.name}
                  </p>
                  <div className="mt-1 flex items-end gap-0.5">
                    {Array.from({ length: Math.min(s.handCount, 8) }).map(
                      (_, i) => (
                        <div key={i} className="-ml-4 first:ml-0">
                          <UnoCardBack size="sm" />
                        </div>
                      ),
                    )}
                    {s.handCount > 8 && (
                      <span className="ml-1 text-[10px] text-stone-500">
                        +{s.handCount - 8}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-stone-500">
                    {s.handCount} · {s.score}/{view.targetScore}
                  </p>
                  {view.pending?.type === "chooseTarget" &&
                    view.pending.playerId === actorId &&
                    !s.eliminated && (
                      <button
                        type="button"
                        className="mt-1 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-[#1a120e]"
                        onClick={() =>
                          dispatch({
                            type: "chooseTarget",
                            playerId: actorId,
                            payload: { targetPlayerId: s.id },
                          })
                        }
                      >
                        {zh ? "交换" : "Swap"}
                      </button>
                    )}
                </div>
              );
            })}
          </div>

          {/* Center: discard + deck */}
          <div className="flex min-h-0 flex-1 items-center justify-center gap-4">
            <button
              type="button"
              disabled={!legalTypes.has("drawCard")}
              onClick={() =>
                dispatch({ type: "drawCard", playerId: actorId, payload: {} })
              }
              className="flex flex-col items-center gap-1 disabled:opacity-40"
            >
              <UnoCardBack size="lg" />
              <span className="text-[10px] font-semibold text-primary-dark">
                {zh ? "抽牌" : "Draw"}
              </span>
            </button>
            <div className="flex flex-col items-center gap-1">
              <UnoCardView card={view.discardTop} size="lg" />
              <span className="text-[10px] text-stone-500">
                {zh ? "弃牌" : "Discard"}
              </span>
            </div>
            {view.drawnCard && (
              <div className="flex flex-col items-center gap-1">
                <UnoCardView card={view.drawnCard} size="lg" selected />
                <div className="flex gap-1">
                  {legalTypes.has("playDrawn") && (
                    <button
                      type="button"
                      className="rounded-md bg-accent px-2 py-1 text-[10px] font-bold"
                      onClick={() =>
                        dispatch({
                          type: "playDrawn",
                          playerId: actorId,
                          payload: { saidUno: true },
                        })
                      }
                    >
                      {zh ? "打出" : "Play"}
                    </button>
                  )}
                  {legalTypes.has("keepDrawn") && (
                    <button
                      type="button"
                      className="rounded-md border border-border bg-white px-2 py-1 text-[10px] font-bold"
                      onClick={() =>
                        dispatch({
                          type: "keepDrawn",
                          playerId: actorId,
                          payload: {},
                        })
                      }
                    >
                      {zh ? "留下" : "Keep"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* You */}
          {youSeat && (
            <div
              data-seat-id={youSeat.id}
              className="relative shrink-0 rounded-xl border border-border bg-white/95 px-2 py-2 shadow-sm"
            >
              <SeatSpeechSlot bubble={bubbles[youSeat.id]} />
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-primary-dark">
                  {nameOf?.(youSeat.id) ?? youSeat.name} · {youSeat.score}/
                  {view.targetScore}
                  {view.unoVulnerableId === actorId && (
                    <span className="ml-2 text-red-600">
                      {zh ? "未喊 UNO！" : "No UNO!"}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1">
                  {legalTypes.has("callUno") && (
                    <button
                      type="button"
                      className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white"
                      onClick={() =>
                        dispatch({
                          type: "callUno",
                          playerId: actorId,
                          payload: {},
                        })
                      }
                    >
                      UNO!
                    </button>
                  )}
                  {legalTypes.has("catchUno") && view.unoVulnerableId && (
                    <button
                      type="button"
                      className="rounded-lg border border-red-300 px-2 py-1 text-[10px] font-bold text-red-700"
                      onClick={() =>
                        dispatch({
                          type: "catchUno",
                          playerId: actorId,
                          payload: {
                            targetPlayerId: view.unoVulnerableId,
                          },
                        })
                      }
                    >
                      {zh ? "抓住 UNO" : "Catch UNO"}
                    </button>
                  )}
                  {legalTypes.has("takeStack") && (
                    <button
                      type="button"
                      className="rounded-lg border border-border px-2 py-1 text-[10px] font-bold"
                      onClick={() =>
                        dispatch({
                          type: "takeStack",
                          playerId: actorId,
                          payload: {},
                        })
                      }
                    >
                      {zh
                        ? `抽 ${view.pending?.amount ?? ""}`
                        : `Draw ${view.pending?.amount ?? ""}`}
                    </button>
                  )}
                  {legalTypes.has("acceptWildDraw") && (
                    <button
                      type="button"
                      className="rounded-lg border border-border px-2 py-1 text-[10px] font-bold"
                      onClick={() =>
                        dispatch({
                          type: "acceptWildDraw",
                          playerId: actorId,
                          payload: {},
                        })
                      }
                    >
                      {zh ? "接受 +4" : "Accept"}
                    </button>
                  )}
                  {legalTypes.has("challengeWildDraw") && (
                    <button
                      type="button"
                      className="rounded-lg bg-amber-600 px-2 py-1 text-[10px] font-bold text-white"
                      onClick={() =>
                        dispatch({
                          type: "challengeWildDraw",
                          playerId: actorId,
                          payload: {},
                        })
                      }
                    >
                      {zh ? "质疑" : "Challenge"}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-center gap-1 overflow-x-auto pb-1">
                {(view.you?.hand ?? []).map((c) => (
                  <UnoCardView
                    key={c.id}
                    card={c}
                    size="md"
                    selected={selectedId === c.id}
                    dimmed={!playableIds.has(c.id) && view.phase === "playing"}
                    onClick={
                      playableIds.has(c.id)
                        ? () => {
                            if (
                              c.color == null ||
                              c.kind.startsWith("wild")
                            ) {
                              setSelectedId(c.id);
                            } else {
                              playCard(c.id);
                            }
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 rounded-xl border border-border bg-white/95 px-2.5 py-1.5 shadow-sm">
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
            <p className="text-center text-[11px] text-stone-500">
              {zh
                ? "点手牌出牌 · 点牌堆抽牌 · 剩一张记得 UNO"
                : "Tap hand to play · deck to draw · call UNO at 1"}
            </p>
          )}
        </div>
      </div>

      {/* Color picker modal */}
      {(view.pending?.type === "chooseColor" &&
        view.pending.playerId === actorId) ||
      (selectedId &&
        (view.you?.hand.find((c) => c.id === selectedId)?.color == null ||
          view.you?.hand
            .find((c) => c.id === selectedId)
            ?.kind.startsWith("wild"))) ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xs rounded-2xl border border-border bg-white p-4 shadow-card">
            <p className="mb-3 text-center font-heading font-bold text-primary-dark">
              {zh ? "选择颜色" : "Choose color"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["red", "yellow", "green", "blue"] as const).map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`min-h-12 rounded-xl font-bold text-white ${COLOR_BTN[color]}`}
                  onClick={() => {
                    if (
                      view.pending?.type === "chooseColor" &&
                      view.pending.playerId === actorId
                    ) {
                      dispatch({
                        type: "chooseColor",
                        playerId: actorId,
                        payload: { color },
                      });
                    } else if (selectedId) {
                      dispatch({
                        type: "playCard",
                        playerId: actorId,
                        payload: {
                          cardId: selectedId,
                          chosenColor: color,
                          saidUno: (view.you?.hand.length ?? 0) <= 2,
                        },
                      });
                      setSelectedId(null);
                    }
                  }}
                >
                  {zh
                    ? { red: "红", yellow: "黄", green: "绿", blue: "蓝" }[
                        color
                      ]
                    : color}
                </button>
              ))}
            </div>
            {selectedId && view.pending?.type !== "chooseColor" && (
              <button
                type="button"
                className="mt-3 w-full text-xs text-stone-500"
                onClick={() => setSelectedId(null)}
              >
                {zh ? "取消" : "Cancel"}
              </button>
            )}
          </div>
        </div>
      ) : null}

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
