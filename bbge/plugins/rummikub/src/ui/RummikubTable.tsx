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
  useIsMobileLayout,
  useSeatBubbles,
} from "@bbge/ui";
import { RummikubTileBack, RummikubTileView, tileLabel } from "./RummikubTile";

type TileV = {
  id: string;
  color: string | null;
  number: number | null;
  joker: boolean;
};

type RummikubView = {
  phase: string;
  currentPlayerId: string | null;
  winners: string[];
  matchOver: boolean;
  round: number;
  poolCount: number;
  endReason: "emptyRack" | "depleted" | null;
  table: { id: string; tiles: TileV[] }[];
  you: {
    id: string;
    rack: TileV[];
    initialMeldDone: boolean;
    score: number;
    meldThisTurn: number;
    rackPoints: number;
  } | null;
  seats: {
    id: string;
    name: string;
    rackCount: number;
    score: number;
    initialMeldDone: boolean;
    isYou: boolean;
  }[];
  legal: { type: string; payload?: Record<string, unknown> }[];
};

const INITIAL_MELD = 30;

export function RummikubTable({
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
  const view = viewUnknown as RummikubView;
  const mobile = useIsMobileLayout();
  const [sideOpen, setSideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const bubbles = useSeatBubbles({ playLog, chat, durationMs: 4000 });

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

  const selectedSet = useMemo(
    () => new Set(selectedIds),
    [selectedIds],
  );

  // A "playNewSet" suggestion that exactly matches the current selection.
  const matchingNewSet = useMemo(() => {
    if (selectedIds.length === 0) return null;
    return view.legal.find(
      (a) =>
        a.type === "playNewSet" &&
        (a.payload?.tileIds as string[]).length === selectedIds.length &&
        (a.payload?.tileIds as string[]).every((id) => selectedIds.includes(id)),
    );
  }, [view.legal, selectedIds]);

  // A single-selected tile that can extend a specific set.
  const extendTargets = useMemo(() => {
    if (selectedIds.length !== 1) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const a of view.legal) {
      if (
        a.type === "extendSet" &&
        (a.payload?.tileIds as string[]).length === 1 &&
        (a.payload?.tileIds as string[])[0] === selectedIds[0]
      ) {
        map.set(a.payload?.targetSetId as string, selectedIds[0]!);
      }
    }
    return map;
  }, [view.legal, selectedIds]);

  const dispatch = (action: Action) => {
    onAction(action);
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const status = useMemo(() => {
    if (view.phase === "finished") {
      const w = view.winners.map((id) => nameOf?.(id) ?? id).join(", ");
      return zh
        ? view.endReason === "depleted"
          ? `牌堆耗尽 · ${w} 点数最低获胜`
          : `Rummikub！${w} 获胜`
        : view.endReason === "depleted"
          ? `Pool empty · ${w} wins on lowest total`
          : `Rummikub! ${w} wins`;
    }
    if (thinkingId) {
      return zh
        ? `${nameOf?.(thinkingId) ?? thinkingId} 思考中…`
        : `${nameOf?.(thinkingId) ?? thinkingId} thinking…`;
    }
    if (!isMyTurn) {
      return zh
        ? `等待 ${nameOf?.(view.currentPlayerId ?? "") ?? ""}`
        : `Waiting for ${nameOf?.(view.currentPlayerId ?? "") ?? ""}`;
    }
    if (view.you && !view.you.initialMeldDone) {
      const need = Math.max(0, INITIAL_MELD - view.you.meldThisTurn);
      return zh
        ? `你的回合 · 首次出牌需 ${INITIAL_MELD} 分（还差 ${need}）`
        : `Your turn · initial meld ${INITIAL_MELD} (${need} to go)`;
    }
    return zh ? "你的回合 · 出牌或抽牌" : "Your turn · meld or draw";
  }, [view, thinkingId, isMyTurn, zh, nameOf]);

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
      title={`拉密 · ${zh ? "第" : "R"}${view.round}${zh ? "轮" : ""}`}
      onOpenLog={() => setSideOpen(true)}
      toolbarExtra={
        <>
          <span className="truncate text-amber-100/80">{status}</span>
          <span>
            {zh ? "牌堆" : "Pool"}{" "}
            <strong className="text-accent">{view.poolCount}</strong>
          </span>
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
          <div className="flex shrink-0 gap-2 overflow-x-auto overscroll-contain px-1 pb-1 lg:flex-wrap lg:justify-center">
            {others.map((s) => {
              const active = view.currentPlayerId === s.id;
              return (
                <div
                  key={s.id}
                  data-seat-id={s.id}
                  className={`relative flex min-w-[5.5rem] shrink-0 flex-col items-center rounded-xl border px-2 py-1.5 ${
                    active
                      ? "border-sky-400 bg-sky-50"
                      : "border-border bg-white/90"
                  }`}
                >
                  <SeatSpeechSlot bubble={bubbles[s.id]} />
                  <p className="max-w-[6rem] truncate text-xs font-semibold text-primary-dark">
                    {nameOf?.(s.id) ?? s.name}
                  </p>
                  <div className="mt-1 flex items-end gap-0.5">
                    {Array.from({ length: Math.min(s.rackCount, 8) }).map(
                      (_, i) => (
                        <div key={i} className="-ml-3 first:ml-0">
                          <RummikubTileBack size="sm" />
                        </div>
                      ),
                    )}
                    {s.rackCount > 8 && (
                      <span className="ml-1 text-[10px] text-stone-500">
                        +{s.rackCount - 8}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-stone-500">
                    {s.rackCount} {zh ? "张" : "tiles"} · {s.score}
                  </p>
                  {s.initialMeldDone ? (
                    <span className="mt-0.5 rounded bg-emerald-100 px-1 text-[9px] text-emerald-700">
                      {zh ? "已破冰" : "Melded"}
                    </span>
                  ) : (
                    <span className="mt-0.5 rounded bg-stone-100 px-1 text-[9px] text-stone-500">
                      {zh ? "未破冰" : "—"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Center: table sets + pool */}
          <div className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto px-2 py-1">
            <div className="flex w-full items-center justify-center gap-3">
              <button
                type="button"
                disabled={!legalTypes.has("drawTile")}
                onClick={() =>
                  dispatch({ type: "drawTile", playerId: actorId, payload: {} })
                }
                className="flex flex-col items-center gap-1 disabled:opacity-40"
              >
                <RummikubTileBack size="lg" />
                <span className="text-[10px] font-semibold text-primary-dark">
                  {zh ? "抽牌" : "Draw"}
                </span>
              </button>
            </div>

            {view.table.length === 0 ? (
              <p className="text-xs text-stone-400">
                {zh ? "桌面暂无组合" : "No melds on the table yet"}
              </p>
            ) : (
              <div className="flex w-full max-w-2xl flex-col gap-1.5">
                {view.table.map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center gap-1 rounded-lg border border-border bg-white/70 px-2 py-1.5"
                  >
                    <div className="flex items-center gap-0.5 overflow-x-auto">
                      {set.tiles.map((t) => (
                        <RummikubTileView key={t.id} tile={t} size="sm" />
                      ))}
                    </div>
                    {extendTargets.has(set.id) && (
                      <button
                        type="button"
                        className="ml-auto shrink-0 rounded-md bg-accent px-2 py-1 text-[10px] font-bold text-[#1a120e]"
                        onClick={() =>
                          dispatch({
                            type: "extendSet",
                            playerId: actorId,
                            payload: {
                              targetSetId: set.id,
                              tileIds: [extendTargets.get(set.id)!],
                            },
                          })
                        }
                      >
                        {zh ? "加入" : "Add"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* You */}
          {youSeat && view.you && (
            <div
              data-seat-id={youSeat.id}
              className="relative shrink-0 rounded-xl border border-border bg-white/95 px-2 py-2 shadow-sm"
            >
              <SeatSpeechSlot bubble={bubbles[youSeat.id]} />
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-primary-dark">
                  {nameOf?.(youSeat.id) ?? youSeat.name} · {view.you.score}
                  {!view.you.initialMeldDone && (
                    <span className="ml-2 text-stone-500">
                      {zh
                        ? `未破冰（需 ${INITIAL_MELD}）`
                        : `Need ${INITIAL_MELD}`}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1">
                  {matchingNewSet && (
                    <button
                      type="button"
                      className="rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-[#1a120e]"
                      onClick={() =>
                        dispatch({
                          type: "playNewSet",
                          playerId: actorId,
                          payload: { tileIds: selectedIds },
                        })
                      }
                    >
                      {zh ? "打出组合" : "Play set"}
                    </button>
                  )}
                  {legalTypes.has("passTurn") && (
                    <button
                      type="button"
                      className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold"
                      onClick={() =>
                        dispatch({
                          type: "passTurn",
                          playerId: actorId,
                          payload: {},
                        })
                      }
                    >
                      {zh ? "结束回合" : "Pass"}
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto pb-1">
                <div className="mx-auto flex w-max min-w-full justify-center gap-1">
                  {view.you.rack.map((t) => (
                    <RummikubTileView
                      key={t.id}
                      tile={t}
                      size={mobile ? "sm" : "md"}
                      selected={selectedSet.has(t.id)}
                      onClick={
                        isMyTurn ? () => toggleSelect(t.id) : undefined
                      }
                    />
                  ))}
                </div>
              </div>
              {selectedIds.length > 0 && (
                <p className="mt-1 text-center text-[10px] text-stone-500">
                  {zh
                    ? `已选 ${selectedIds.length} 张：${selectedIds
                        .map((id) => {
                          const t = view.you?.rack.find((x) => x.id === id);
                          return t ? tileLabel(t, zh) : id;
                        })
                        .join(" · ")}`
                    : `Selected ${selectedIds.length}: ${selectedIds
                        .map((id) => {
                          const t = view.you?.rack.find((x) => x.id === id);
                          return t ? tileLabel(t, zh) : id;
                        })
                        .join(" · ")}`}
                </p>
              )}
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
                label={zh ? "再来一局" : "New round"}
              />
            </div>
          ) : (
            <p className="text-center text-[11px] text-stone-500">
              {zh
                ? "点牌选中 · 打出同点数组或同色顺子 · 首次需 30 分破冰"
                : "Select tiles · make runs or groups · initial meld 30"}
            </p>
          )}
        </div>
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
