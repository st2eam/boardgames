"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  evaluateCommit,
  INITIAL_MELD,
  type CommitTile,
} from "../commit";
import type { RummikubTile } from "../cards";
import { isValidSet, setPoints } from "../sets";
import { RummikubTileBack, RummikubTileView } from "./RummikubTile";

type TileV = {
  id: string;
  color: string | null;
  number: number | null;
  joker: boolean;
};

type GroupV = { id: string; tiles: TileV[] };

type Draft = {
  groups: GroupV[];
  rack: TileV[];
};

type RummikubView = {
  phase: string;
  currentPlayerId: string | null;
  winners: string[];
  matchOver: boolean;
  round: number;
  poolCount: number;
  endReason: "emptyRack" | "depleted" | null;
  table: GroupV[];
  you: {
    id: string;
    rack: TileV[];
    initialMeldDone: boolean;
    score: number;
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

type DragState = {
  tile: TileV;
  x: number;
  y: number;
};

type DropTarget =
  | { type: "group"; groupId: string; index: number }
  | { type: "rack"; index: number }
  | { type: "new" };

function asTiles(tiles: TileV[]): RummikubTile[] {
  return tiles as RummikubTile[];
}

function membershipKey(ids: string[]): string {
  return ids.slice().sort().join(",");
}

function snapshotKey(view: RummikubView): string {
  const rack = view.you?.rack.map((t) => t.id).join(",") ?? "";
  const table = view.table
    .map((s) => `${s.id}:${s.tiles.map((t) => t.id).join(",")}`)
    .join("|");
  return `${view.round}:${view.currentPlayerId}:${rack}:${table}`;
}

function fromView(view: RummikubView): Draft {
  return {
    groups: view.table.map((s) => ({
      id: s.id,
      tiles: s.tiles.slice(),
    })),
    rack: view.you?.rack.slice() ?? [],
  };
}

function cloneDraft(d: Draft): Draft {
  return {
    groups: d.groups.map((g) => ({ id: g.id, tiles: g.tiles.slice() })),
    rack: d.rack.slice(),
  };
}

function isDirty(draft: Draft, snap: Draft): boolean {
  if (draft.rack.length !== snap.rack.length) return true;
  if (draft.groups.length !== snap.groups.length) return true;
  const rackA = draft.rack.map((t) => t.id).join(",");
  const rackB = snap.rack.map((t) => t.id).join(",");
  if (rackA !== rackB) return true;
  for (let i = 0; i < draft.groups.length; i++) {
    const a = draft.groups[i]!.tiles.map((t) => t.id).join(",");
    const b = snap.groups[i]!.tiles.map((t) => t.id).join(",");
    if (a !== b) return true;
  }
  return false;
}

function readDrop(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const node = (el as HTMLElement).closest("[data-rk-drop]") as HTMLElement | null;
  if (!node) return null;
  const kind = node.dataset.rkDrop;
  if (kind === "slot") {
    return {
      type: "group",
      groupId: node.dataset.groupId ?? "",
      index: Number(node.dataset.index ?? 0),
    };
  }
  if (kind === "rack-slot") {
    return { type: "rack", index: Number(node.dataset.index ?? 0) };
  }
  if (kind === "rack") return { type: "rack", index: Number(node.dataset.index ?? 9999) };
  if (kind === "group") {
    return {
      type: "group",
      groupId: node.dataset.groupId ?? "",
      index: Number(node.dataset.index ?? 9999),
    };
  }
  if (kind === "new") return { type: "new" };
  return null;
}

function moveTile(draft: Draft, tileId: string, dest: DropTarget, nextId: () => string): Draft {
  const next = cloneDraft(draft);
  let tile: TileV | undefined;
  let fromGroup: { gi: number; ti: number } | null = null;

  const rackIdx = next.rack.findIndex((t) => t.id === tileId);
  if (rackIdx >= 0) {
    tile = next.rack.splice(rackIdx, 1)[0];
  } else {
    for (let gi = 0; gi < next.groups.length; gi++) {
      const ti = next.groups[gi]!.tiles.findIndex((t) => t.id === tileId);
      if (ti >= 0) {
        tile = next.groups[gi]!.tiles.splice(ti, 1)[0];
        fromGroup = { gi, ti };
        break;
      }
    }
  }
  if (!tile) return draft;

  if (dest.type === "rack") {
    const idx = Math.max(0, Math.min(dest.index, next.rack.length));
    next.rack.splice(idx, 0, tile);
  } else if (dest.type === "new") {
    next.groups.push({ id: nextId(), tiles: [tile] });
  } else {
    let gi = next.groups.findIndex((g) => g.id === dest.groupId);
    if (gi < 0) {
      next.groups.push({ id: dest.groupId || nextId(), tiles: [tile] });
    } else {
      let index = dest.index;
      if (fromGroup && fromGroup.gi === gi && fromGroup.ti < index) index -= 1;
      index = Math.max(0, Math.min(index, next.groups[gi]!.tiles.length));
      next.groups[gi]!.tiles.splice(index, 0, tile);
    }
  }

  next.groups = next.groups.filter((g) => g.tiles.length > 0);
  return next;
}

function icePoints(draft: Draft, snap: Draft): number {
  const orig = new Set(
    snap.groups.map((s) => membershipKey(s.tiles.map((t) => t.id))),
  );
  let pts = 0;
  for (const g of draft.groups) {
    const key = membershipKey(g.tiles.map((t) => t.id));
    if (orig.has(key)) continue;
    const tiles = asTiles(g.tiles);
    if (isValidSet(tiles)) pts += setPoints(tiles);
  }
  return pts;
}

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
  const bubbles = useSeatBubbles({ playLog, chat, durationMs: 4000 });

  const key = snapshotKey(view);
  const [draft, setDraft] = useState<Draft>(() => fromView(view));
  const [drag, setDrag] = useState<DragState | null>(null);
  const seqRef = useRef(0);
  const viewKeyRef = useRef(key);

  if (viewKeyRef.current !== key) {
    viewKeyRef.current = key;
    setDraft(fromView(view));
    setDrag(null);
  }

  const snap = useMemo(() => fromView(view), [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const actorId = myId;
  const isMyTurn =
    view.currentPlayerId === actorId &&
    !disabled &&
    !thinkingId &&
    view.phase !== "finished";

  const iced = Boolean(view.you?.initialMeldDone);
  const snapRackIds = useMemo(
    () => new Set(snap.rack.map((t) => t.id)),
    [snap],
  );
  const snapTableIds = useMemo(() => {
    const s = new Set<string>();
    for (const g of snap.groups) for (const t of g.tiles) s.add(t.id);
    return s;
  }, [snap]);

  const dirty = isDirty(draft, snap);
  const legalTypes = useMemo(
    () => new Set(view.legal.map((a) => a.type)),
    [view.legal],
  );

  const commit = useMemo(() => {
    if (!view.you) return { ok: false as const, error: "no you" };
    const groups = draft.groups
      .map((g) => g.tiles.map((t) => t.id))
      .filter((g) => g.length > 0);
    return evaluateCommit({
      table: snap.groups as { id: string; tiles: CommitTile[] }[],
      rack: snap.rack as CommitTile[],
      initialMeldDone: iced,
      groups,
    });
  }, [draft, snap, iced, view.you]);

  const nextGroupId = useCallback(() => {
    seqRef.current += 1;
    return `local-${seqRef.current}`;
  }, []);

  const canDragTile = useCallback(
    (tileId: string) => {
      if (!isMyTurn) return false;
      if (!iced && snapTableIds.has(tileId)) return false;
      return true;
    },
    [isMyTurn, iced, snapTableIds],
  );

  const finishDrag = useCallback(
    (x: number, y: number, tile: TileV) => {
      const dest = readDrop(x, y);
      setDrag(null);
      if (!dest) return;
      if (dest.type === "rack" && snapTableIds.has(tile.id) && !snapRackIds.has(tile.id)) {
        return;
      }
      setDraft((d) => moveTile(d, tile.id, dest, nextGroupId));
    },
    [nextGroupId, snapRackIds, snapTableIds],
  );

  useEffect(() => {
    if (!drag) return;
    const tile = drag.tile;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
    };
    const up = (e: PointerEvent) => {
      finishDrag(e.clientX, e.clientY, tile);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [drag, finishDrag]);

  const startDrag = (tile: TileV, e: React.PointerEvent) => {
    if (!canDragTile(tile.id)) return;
    e.preventDefault();
    e.stopPropagation();
    setDrag({ tile, x: e.clientX, y: e.clientY });
  };

  const dispatch = (action: Action) => {
    onAction(action);
    setDrag(null);
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
      const have = icePoints(draft, snap);
      const need = Math.max(0, INITIAL_MELD - have);
      return zh
        ? `你的回合 · 首次出牌需 ${INITIAL_MELD} 分（已组 ${have}，还差 ${need}）`
        : `Your turn · initial meld ${INITIAL_MELD} (have ${have}, ${need} to go)`;
    }
    return zh ? "你的回合 · 拖牌组牌，全合法后结束" : "Your turn · drag tiles, end when valid";
  }, [view, thinkingId, isMyTurn, zh, nameOf, draft, snap]);

  const others = view.seats.filter((s) => !s.isYou);
  const youSeat = view.seats.find((s) => s.isYou);
  const tileSize = mobile ? "sm" : "md";

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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden select-none sm:gap-2">
        <ThinkingStatusBanner
          locale={locale}
          text={status}
          detail={thinkingDetail}
          className="!min-h-9 !py-1 sm:!min-h-11 sm:!py-1.5"
        />

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
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

          <div className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto px-2 py-1">
            <div className="flex w-full items-center justify-center gap-3">
              <button
                type="button"
                disabled={!legalTypes.has("drawTile") || dirty || !isMyTurn}
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

            <div className="flex w-full max-w-3xl flex-wrap gap-2">
              {draft.groups.length === 0 && !drag ? (
                <p className="w-full text-center text-xs text-stone-400">
                  {zh ? "桌面暂无组合 · 把手牌拖到这里" : "No melds · drag tiles here"}
                </p>
              ) : null}
              {draft.groups.map((set) => {
                const valid = isValidSet(asTiles(set.tiles));
                return (
                  <div
                    key={set.id}
                    data-rk-drop="group"
                    data-group-id={set.id}
                    data-index={set.tiles.length}
                    className={`flex min-w-0 basis-[calc(50%-0.25rem)] items-center gap-0.5 overflow-x-auto rounded-lg border-2 px-2 py-1.5 ${
                      valid
                        ? "border-emerald-400 bg-emerald-50/80"
                        : "border-red-400 bg-red-50/80"
                    }`}
                  >
                    {set.tiles.map((t, i) => (
                      <div key={t.id} className="relative flex items-center">
                        <div
                          data-rk-drop="slot"
                          data-group-id={set.id}
                          data-index={i}
                          className={`self-stretch ${drag ? "w-2.5" : "w-0.5"}`}
                        />
                        <RummikubTileView
                          tile={t}
                          size="sm"
                          dimmed={drag?.tile.id === t.id}
                          onPointerDown={
                            canDragTile(t.id)
                              ? (e) => startDrag(t, e)
                              : undefined
                          }
                        />
                      </div>
                    ))}
                    <div
                      data-rk-drop="slot"
                      data-group-id={set.id}
                      data-index={set.tiles.length}
                      className={`min-h-8 ${drag ? "w-3" : "w-1"}`}
                    />
                  </div>
                );
              })}
              {drag && (
                <div
                  data-rk-drop="new"
                  className="flex min-h-10 min-w-0 basis-[calc(50%-0.25rem)] items-center justify-center rounded-lg border-2 border-dashed border-accent/70 bg-amber-50/70 px-2 py-1.5 text-[11px] font-semibold text-primary-dark"
                >
                  {zh ? "放到这里成为新组合" : "Drop to start a new set"}
                </div>
              )}
            </div>
          </div>

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
                  {dirty && isMyTurn && (
                    <button
                      type="button"
                      className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold"
                      onClick={() => setDraft(fromView(view))}
                    >
                      {zh ? "重置" : "Reset"}
                    </button>
                  )}
                  {legalTypes.has("passTurn") && isMyTurn && !dirty && (
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
                      {zh ? "结束对局" : "End game"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!isMyTurn || !commit.ok}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                      isMyTurn && commit.ok
                        ? "bg-accent text-[#1a120e] shadow-sm"
                        : "bg-stone-200 text-stone-400"
                    }`}
                    onClick={() => {
                      if (!commit.ok) return;
                      dispatch({
                        type: "commitTurn",
                        playerId: actorId,
                        payload: {
                          groups: draft.groups.map((g) =>
                            g.tiles.map((t) => t.id),
                          ),
                        },
                      });
                    }}
                  >
                    {zh ? "结束回合" : "End turn"}
                  </button>
                </div>
              </div>
              <div
                data-rk-drop="rack"
                data-index={draft.rack.length}
                className="overflow-x-auto pb-1"
              >
                <div className="mx-auto flex w-max min-w-full items-center justify-center">
                  {draft.rack.map((t, i) => (
                    <div key={t.id} className="relative flex items-center">
                      <div
                        data-rk-drop="rack-slot"
                        data-index={i}
                        className={drag ? "w-2.5 min-h-8" : "w-1 min-h-6"}
                      />
                      <RummikubTileView
                        tile={t}
                        size={tileSize}
                        dimmed={drag?.tile.id === t.id}
                        onPointerDown={
                          canDragTile(t.id)
                            ? (e) => startDrag(t, e)
                            : undefined
                        }
                      />
                    </div>
                  ))}
                  <div
                    data-rk-drop="rack-slot"
                    data-index={draft.rack.length}
                    className={drag ? "w-3 min-h-8" : "w-1 min-h-6"}
                  />
                </div>
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
                label={zh ? "再来一局" : "New round"}
              />
            </div>
          ) : (
            <p className="text-center text-[11px] text-stone-500">
              {zh
                ? "拖动手牌或桌面牌组牌 · 每组独立校验，全部合法后结束回合 · 乱了就重置 · 抽牌则本回合结束"
                : "Drag rack or table tiles · each set is checked · end when all are valid · reset if stuck · drawing ends the turn"}
            </p>
          )}
        </div>
      </div>

      {drag && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y }}
        >
          <RummikubTileView tile={drag.tile} size={tileSize} dragging />
        </div>
      )}

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
