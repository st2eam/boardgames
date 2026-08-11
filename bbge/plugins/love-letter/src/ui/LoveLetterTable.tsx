"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Action } from "@bbge/core";
import type { PluginTableProps } from "@bbge/ui";
import {
  MatchResultBar,
  PlayFeltFrame,
  PlayLogChatPanel,
  PlaySideSheet,
  PlayTableShell,
  useIsMobileLayout,
  useScrollActiveSeatIntoView,
  useSeatBubbles,
} from "@bbge/ui";
import type { LoveLetterAction } from "../state";
import { targetSpec, type ArenaView } from "./types";
import { cardFaceUrl, cardLabel } from "./cardArt";
import { CardTile } from "./bga/CardTile";
import { CardLightbox } from "./bga/CardLightbox";
import { PriestRevealModal } from "./bga/PriestRevealModal";
import { StatusBar } from "./bga/StatusBar";
import { PlayerPanels } from "./bga/PlayerPanels";

type ZoomCard = {
  rank: number;
  role?: string;
  name?: { en: string; zh: string };
  subtitle?: string;
};

function cardRole(c: { rank: number; role?: string } | null | undefined): string {
  return c?.role ?? "";
}

export function LoveLetterTable({
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
  const dispatch = (action: LoveLetterAction) => onAction(action as Action);
  // Defensive fallbacks — wire transport JSON round-trip may lose optional
  // fields (undefined → absent in JSON → missing on guest side).
  const raw = viewUnknown as ArenaView;
  const view: ArenaView = {
    ...raw,
    faceUp: Array.isArray(raw.faceUp) ? raw.faceUp : [],
    others: Array.isArray(raw.others) ? raw.others : [],
    you: raw.you ?? null,
    standings: Array.isArray(raw.standings) ? raw.standings : [],
    winners: Array.isArray(raw.winners) ? raw.winners : [],
    spyBonus: Array.isArray(raw.spyBonus) ? raw.spyBonus : undefined,
    pending: raw.pending ?? null,
    forcedTargetId: raw.forcedTargetId ?? null,
    jesterPick: raw.jesterPick ?? null,
    jesterPlayerId: raw.jesterPlayerId ?? null,
    matchOver: raw.matchOver ?? false,
    roundNumber: raw.roundNumber ?? 1,
    heartTarget: raw.heartTarget ?? 4,
    deckCount: raw.deckCount ?? 0,
    currentPlayerId: raw.currentPlayerId ?? "",
    phase: raw.phase ?? "playing",
    edition: raw.edition,
    endReason: raw.endReason ?? null,
    selfDiscarded: Array.isArray(raw.selfDiscarded) ? raw.selfDiscarded : [],
  };
  const zh = locale === "zh";
  const edition =
    view.edition === "classic" || view.edition === "premium"
      ? "classic"
      : view.edition === "expansion"
        ? "expansion"
        : "full";
  const maxGuess = edition === "classic" ? 8 : 9;
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [peekTargetId, setPeekTargetId] = useState<string | null>(null);
  const [guessRank, setGuessRank] = useState(9);
  const [zoom, setZoom] = useState<ZoomCard | null>(null);
  const [flyPlay, setFlyPlay] = useState<ZoomCard | null>(null);
  const [drawPulse, setDrawPulse] = useState(false);
  const [animBusy, setAnimBusy] = useState(false);
  const prevHandRef = useRef<Set<string>>(new Set());
  const [newCardIds, setNewCardIds] = useState<Set<string>>(new Set());
  const [sideOpen, setSideOpen] = useState(false);
  const mobile = useIsMobileLayout();
  const reduce = useReducedMotion();
  const roundKey = view.roundNumber ?? 1;
  const bubbles = useSeatBubbles({ playLog, chat, resetKey: roundKey });
  const handSize = mobile ? "md" : "xl";
  const feltMd = mobile ? "sm" : "md";
  const feltLg = mobile ? "md" : "lg";
  const seatsRailRef = useRef<HTMLDivElement>(null);
  const seatsStackRef = useRef<HTMLDivElement>(null);
  useScrollActiveSeatIntoView({
    activeSeatId: view.currentPlayerId,
    enabled: view.phase === "playing",
    smooth: !reduce,
    roots: [seatsRailRef, seatsStackRef],
    resetKey: roundKey,
  });
  // PlayShell switches myId among local hotseat humans only — never AI / remote.
  const actorId = myId;
  const lastDiscardIdRef = useRef<string | null>(null);
  const skipDiscardAnimRef = useRef(false);

  const priestPending =
    view.pending?.type === "priestReveal" ? view.pending : null;
  const baronessPending =
    view.pending?.type === "baronessReveal" ? view.pending : null;
  const bishopRedrawPending =
    view.pending?.type === "bishopRedraw" ? view.pending : null;
  const myPriestReveal =
    priestPending &&
    priestPending.playerId === actorId &&
    priestPending.rank !== undefined;
  const myBaronessReveal =
    baronessPending &&
    baronessPending.playerId === actorId &&
    (baronessPending.targets?.length ?? 0) > 0;
  const myBishopRedraw =
    bishopRedrawPending && bishopRedrawPending.playerId === actorId;

  const isMyTurn =
    view.currentPlayerId === actorId && view.phase === "playing";
  const blockingPending =
    view.pending?.type === "chancellor" ||
    view.pending?.type === "priestReveal" ||
    view.pending?.type === "baronessReveal" ||
    view.pending?.type === "bishopRedraw";
  const interactive = Boolean(
    isMyTurn && !disabled && !animBusy && !blockingPending,
  );

  // Detect newly drawn cards → entrance animation
  useEffect(() => {
    const hand = view.you?.hand ?? [];
    const ids = new Set(hand.map((c) => c.id));
    const prev = prevHandRef.current;
    const gained = [...ids].filter((id) => !prev.has(id));
    if (gained.length > 0 && prev.size > 0) {
      setNewCardIds(new Set(gained));
      setDrawPulse(true);
      const t = window.setTimeout(() => {
        setNewCardIds(new Set());
        setDrawPulse(false);
      }, 700);
      prevHandRef.current = ids;
      return () => window.clearTimeout(t);
    }
    prevHandRef.current = ids;
  }, [view.you?.hand]);

  const selected = useMemo(() => {
    if (!selectedCardId) return null;
    const held =
      view.pending?.type === "chancellor" ? view.pending.held : undefined;
    return (
      view.you?.hand.find((c) => c.id === selectedCardId) ??
      held?.find((c) => c.id === selectedCardId) ??
      null
    );
  }, [selectedCardId, view.you?.hand, view.pending]);

  const selectedRole = cardRole(selected);
  const tSpec = selectedRole ? targetSpec(selectedRole) : null;
  const needsTarget = tSpec != null;
  const needsGuess = Boolean(tSpec?.needsGuess);
  const needsPeek = Boolean(tSpec?.needsPeek);
  useEffect(() => {
    setGuessRank(maxGuess);
  }, [maxGuess]);
  const targetsOk =
    !tSpec ||
    (selectedTargetIds.length >= tSpec.min &&
      selectedTargetIds.length <= tSpec.max);
  const peekOk =
    !needsPeek ||
    (peekTargetId != null && selectedTargetIds.includes(peekTargetId));
  // Guard cannot guess 1; Bishop (and others with needsGuess) may guess any rank including 1.
  const guessOk =
    !needsGuess ||
    (selectedRole === "guard" ? guessRank !== 1 : guessRank >= 0);
  const canPlay =
    interactive && selectedCardId && targetsOk && peekOk && guessOk;

  const toggleTarget = (id: string) => {
    if (!tSpec) return;
    if (tSpec.max === 1) {
      setSelectedTargetIds([id]);
      setPeekTargetId(null);
      return;
    }
    setSelectedTargetIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        if (peekTargetId === id) setPeekTargetId(null);
        return next;
      }
      if (prev.length >= tSpec.max) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const status = useMemo(() => {
    if (view.phase === "finished") {
      const reason =
        view.endReason === "last_standing"
          ? zh
            ? "仅剩一人"
            : "Last standing"
          : view.endReason === "hand_compare"
            ? zh
              ? "牌堆耗尽 · 比点"
              : "Deck empty · compare"
            : view.endReason === "hearts"
              ? zh
                ? "情感标记达标"
                : "Favor tokens reached"
              : zh
                ? "本轮结束"
                : "Round over";
      const matchDone = Boolean(view.matchOver || view.endReason === "hearts");
      return {
        tone: "done" as const,
        text: zh
          ? matchDone
            ? `比赛结束 · ${reason} · ${view.winners.map((id) => nameOf?.(id) ?? id).join("、")} 获胜`
            : `第 ${view.roundNumber ?? 1} 轮结束 · ${reason} · 先到 ♥${view.heartTarget ?? 4}`
          : matchDone
            ? `Match over · ${reason} · ${view.winners.map((id) => nameOf?.(id) ?? id).join(", ")}`
            : `Round ${view.roundNumber ?? 1} · ${reason} · first to ♥${view.heartTarget ?? 4}`,
      };
    }
    if (priestPending) {
      if (myPriestReveal) {
        return {
          tone: "you" as const,
          text: zh
            ? "神父：查看偷看结果，确认后回合继续"
            : "Priest: review the peeked card, then confirm",
        };
      }
      return {
        tone: "wait" as const,
        text: zh
          ? `等待 ${nameOf?.(priestPending.playerId) ?? priestPending.playerId} 确认偷看…`
          : `Waiting for ${nameOf?.(priestPending.playerId) ?? priestPending.playerId} to finish peeking…`,
      };
    }
    if (view.pending?.type === "chancellor" && view.pending.playerId === actorId) {
      return {
        tone: "you" as const,
        text: zh
          ? "大臣：点击中央一张牌保留，其余沉入牌堆底"
          : "Chancellor: click a center card to keep",
      };
    }
    if (thinkingId) {
      return {
        tone: "wait" as const,
        text: zh
          ? `${nameOf?.(thinkingId) ?? thinkingId} 正在思考…`
          : `${nameOf?.(thinkingId) ?? thinkingId} is thinking…`,
      };
    }
    if (!isMyTurn) {
      return {
        tone: "wait" as const,
        text: zh
          ? `等待 ${nameOf?.(view.currentPlayerId) ?? view.currentPlayerId} 行动`
          : `Waiting for ${nameOf?.(view.currentPlayerId) ?? view.currentPlayerId}`,
      };
    }
    if (!selectedCardId) {
      return {
        tone: "you" as const,
        text: zh ? "轮到你了：点击手牌选择要打出的牌" : "Your turn: click a card in your hand",
      };
    }
    if (needsTarget && !targetsOk) {
      return {
        tone: "you" as const,
        text: zh
          ? `已选「${cardLabel(selected!, locale)}」— 选择 ${tSpec!.min}${tSpec!.max > tSpec!.min ? `–${tSpec!.max}` : ""} 名目标`
          : `Selected ${cardLabel(selected!, locale)} — pick ${tSpec!.min}${tSpec!.max > tSpec!.min ? `–${tSpec!.max}` : ""} target(s)`,
      };
    }
    if (needsPeek && !peekOk) {
      return {
        tone: "you" as const,
        text: zh
          ? "红衣主教：再点选要偷看的一名目标"
          : "Cardinal: choose which swapped hand to peek",
      };
    }
    if (needsGuess) {
      return {
        tone: "you" as const,
        text: zh
          ? `选择猜测的点数，然后打出`
          : `Pick a guess rank, then play`,
      };
    }
    return {
      tone: "you" as const,
      text: zh ? "确认无误后点击「打出」" : "Confirm, then press Play",
    };
  }, [
    view,
    actorId,
    thinkingId,
    isMyTurn,
    selectedCardId,
    selectedTargetIds,
    targetsOk,
    needsTarget,
    needsGuess,
    needsPeek,
    peekOk,
    tSpec,
    selected,
    locale,
    zh,
    nameOf,
    priestPending,
    myPriestReveal,
  ]);

  const playCard = () => {
    if (!selectedCardId || !canPlay || !selected) return;
    const multi = (tSpec?.max ?? 0) > 1 || selectedRole === "cardinal";
    const payload = {
      cardId: selectedCardId,
      targetId: multi ? undefined : selectedTargetIds[0],
      targetIds: multi ? selectedTargetIds : undefined,
      guessRank: needsGuess ? guessRank : undefined,
      peekTargetId: needsPeek ? (peekTargetId ?? undefined) : undefined,
    };
    const flying: ZoomCard = {
      rank: selected.rank,
      role: selected.role,
      name: selected.name,
      subtitle: zh ? "打出" : "Play",
    };
    setAnimBusy(true);
    setFlyPlay(flying);
    skipDiscardAnimRef.current = true;
    window.setTimeout(() => {
      dispatch({
        type: "playCard",
        playerId: actorId,
        payload,
      });
      setSelectedCardId(null);
      setSelectedTargetIds([]);
      setPeekTargetId(null);
      setFlyPlay(null);
      setAnimBusy(false);
    }, 480);
  };

  const acknowledgePriest = (redraw?: boolean) => {
    dispatch({
      type: "acknowledgePriest",
      playerId: actorId,
      payload: redraw === undefined ? {} : { redraw },
    });
  };

  const chancellorKeep = (cardId: string) => {
    if (view.pending?.type !== "chancellor") return;
    const held = view.pending.held ?? [];
    if (!held.some((c) => c.id === cardId)) return;
    const rest = held.filter((c) => c.id !== cardId);
    dispatch({
      type: "resolveChancellor",
      playerId: actorId,
      payload: {
        keepCardId: cardId,
        bottomOrderIds: rest.map((c) => c.id),
      },
    });
    setSelectedCardId(null);
  };

  const lastDiscard =
    view.selfDiscarded?.[view.selfDiscarded.length - 1] ??
    view.others.flatMap((o) => o.discarded).slice(-1)[0] ??
    null;

  // AI / remote play: brief land animation when a new discard appears
  useEffect(() => {
    const id = lastDiscard?.id ?? null;
    if (!id || id === lastDiscardIdRef.current) {
      lastDiscardIdRef.current = id;
      return;
    }
    lastDiscardIdRef.current = id;
    if (skipDiscardAnimRef.current) {
      skipDiscardAnimRef.current = false;
      return;
    }
    if (animBusy) return;
    setFlyPlay({
      rank: lastDiscard!.rank,
      role: lastDiscard!.role,
      name: lastDiscard!.name,
      subtitle: zh ? "出牌" : "Played",
    });
    const t = window.setTimeout(() => setFlyPlay(null), 520);
    return () => window.clearTimeout(t);
  }, [lastDiscard?.id, lastDiscard, animBusy, zh]);

  const tableTitle = zh
    ? edition === "classic"
      ? "情书经典版 · 在线桌"
      : edition === "expansion"
        ? "情书拓展版 · 在线桌"
        : "情书完整版 · 在线桌"
    : edition === "classic"
      ? "Love Letter Classic · Table"
      : edition === "expansion"
        ? "Love Letter Expansion · Table"
        : "Love Letter Full · Table";
  const rematchLabel =
    view.matchOver || view.endReason === "hearts"
      ? zh
        ? "再来一局"
        : "Play again"
      : zh
        ? "下一轮"
        : "Next round";
  const sidePanel = (
    <PlayLogChatPanel
      locale={locale}
      playLog={playLog}
      chat={chat}
      onChat={onChat}
      nameOf={nameOf}
      logVariant="chip"
      placeholder={zh ? "说一句…" : "Say…"}
    />
  );

  return (
    <>
      {myPriestReveal && priestPending.rank !== undefined && (
        <PriestRevealModal
          locale={locale}
          targetName={nameOf?.(priestPending.targetId) ?? priestPending.targetId}
          rank={priestPending.rank}
          name={priestPending.name}
          onConfirm={() => acknowledgePriest()}
          onZoom={() =>
            setZoom({
              rank: priestPending.rank!,
              name: priestPending.name,
              subtitle: zh
                ? `${nameOf?.(priestPending.targetId) ?? priestPending.targetId} 的手牌`
                : `${nameOf?.(priestPending.targetId) ?? priestPending.targetId}'s hand`,
            })
          }
        />
      )}
      {myBaronessReveal && baronessPending.targets && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-[#efe6d8] p-5 shadow-2xl">
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-accent-dark">
              {zh ? "女男爵 · 偷看" : "Baroness · Peek"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {baronessPending.targets.map((t) => (
                <button
                  key={t.targetId}
                  type="button"
                  className="cursor-pointer"
                  onClick={() =>
                    setZoom({
                      rank: t.rank,
                      name: t.name,
                      subtitle: nameOf?.(t.targetId) ?? t.targetId,
                    })
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cardFaceUrl(t.rank)}
                    alt=""
                    className="h-36 w-[100px] rounded-lg border-2 border-[#5D4037] object-cover"
                  />
                  <p className="mt-1 text-center text-xs font-bold">
                    {nameOf?.(t.targetId) ?? t.targetId}
                  </p>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => acknowledgePriest()}
              className="mt-5 w-full cursor-pointer rounded-xl bg-accent py-3.5 font-heading text-sm font-bold text-white"
            >
              {zh ? "我看完了，确认" : "Got it — continue"}
            </button>
          </div>
        </div>
      )}
      {myBishopRedraw && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-[#efe6d8] p-5 shadow-2xl">
            <p className="font-heading text-lg font-bold text-primary-dark">
              {zh ? "主教猜中了你" : "Bishop hit you"}
            </p>
            <p className="mt-2 text-sm text-stone-600">
              {zh
                ? "你可以弃掉当前手牌并重抽一张（弃公主仍会出局）。"
                : "You may discard your hand and redraw (Princess still knocks you out)."}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => acknowledgePriest(false)}
                className="cursor-pointer rounded-xl border border-border bg-white py-3 font-heading text-sm font-bold"
              >
                {zh ? "保留手牌" : "Keep hand"}
              </button>
              <button
                type="button"
                onClick={() => acknowledgePriest(true)}
                className="cursor-pointer rounded-xl bg-accent py-3 font-heading text-sm font-bold text-white"
              >
                {zh ? "弃牌重抽" : "Discard & redraw"}
              </button>
            </div>
          </div>
        </div>
      )}
      {zoom && (
        <CardLightbox
          locale={locale}
          rank={zoom.rank}
          role={zoom.role}
          name={zoom.name}
          subtitle={zoom.subtitle}
          onClose={() => setZoom(null)}
        />
      )}

      <PlayTableShell
        locale={locale}
        title={tableTitle}
        onOpenLog={mobile ? () => setSideOpen(true) : undefined}
        toolbarExtra={
          <>
            <span>
              {zh ? "牌堆" : "Deck"}{" "}
              <strong className="font-heading text-accent">{view.deckCount}</strong>
            </span>
            <span>
              {zh ? "公开牌" : "Face-up"} {view.faceUp.length}
            </span>
          </>
        }
      >
        {view.phase === "finished" ? (
          <div
            className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950 shadow-sm"
            role="status"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
              <p className="min-w-0 flex-1 font-heading text-sm font-semibold leading-snug sm:text-base">
                {status.text}
              </p>
              <MatchResultBar
                locale={locale}
                onRematch={onRematch}
                label={rematchLabel}
              />
            </div>
            {(view.standings?.length ?? 0) > 0 && (
              <div className="mt-2.5 overflow-x-auto rounded-lg border border-emerald-200/80 bg-white/70">
                <table className="w-full min-w-[280px] text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-emerald-100 text-[10px] uppercase tracking-wide text-emerald-800/70">
                      <th className="px-2 py-1.5 font-heading font-bold">
                        {zh ? "玩家" : "Player"}
                      </th>
                      <th className="px-2 py-1.5 font-heading font-bold">
                        {zh ? "♥" : "♥"}
                      </th>
                      <th className="px-2 py-1.5 font-heading font-bold">
                        {zh ? "终局手牌" : "Final hand"}
                      </th>
                      <th className="px-2 py-1.5 font-heading font-bold">
                        {zh ? "结果" : "Result"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.standings!.map((s) => {
                      const card =
                        s.handRank != null
                          ? `${s.handRank} · ${
                              zh
                                ? s.handName?.zh ?? String(s.handRank)
                                : s.handName?.en ?? String(s.handRank)
                            }`
                          : "—";
                      const result = s.eliminated
                        ? zh
                          ? "出局"
                          : "Out"
                        : [
                            s.won ? (zh ? "本轮胜" : "Round win") : null,
                            s.spyFavor
                              ? zh
                                ? "间谍好感"
                                : "Spy favor"
                              : null,
                            !s.won && !s.spyFavor
                              ? zh
                                ? "在局"
                                : "In"
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ");
                      return (
                        <tr
                          key={s.playerId}
                          className={
                            s.won
                              ? "bg-amber-50/80 text-amber-950"
                              : s.eliminated
                                ? "text-stone-400"
                                : "text-emerald-950"
                          }
                        >
                          <td className="px-2 py-1.5 font-heading font-semibold">
                            {nameOf?.(s.playerId) ?? s.name}
                          </td>
                          <td className="px-2 py-1.5 font-heading font-bold text-rose-700">
                            ♥{s.hearts ?? 0}
                          </td>
                          <td className="px-2 py-1.5">{card}</td>
                          <td className="px-2 py-1.5">{result}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="shrink-0">
            <StatusBar
              locale={locale}
              text={status.text}
              tone={status.tone}
              detail={thinkingId ? thinkingDetail : null}
            />
          </div>
        )}

        {/* Mobile: players rail on top · Desktop: left list · Center table · Right log */}
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden sm:gap-2.5 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_240px] lg:items-stretch">
          {mobile && (
            <div
              className={[
                "shrink-0 rounded-xl border bg-white/95 p-1.5 shadow-sm",
                interactive && needsTarget
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-border",
              ].join(" ")}
            >
              {interactive && needsTarget && (
                <p className="mb-1 px-1 font-heading text-[10px] font-bold text-accent-dark">
                  {zh ? "点选目标玩家" : "Tap a target"}
                </p>
              )}
              <PlayerPanels
                ref={seatsRailRef}
                locale={locale}
                view={view}
                actorId={actorId}
                selectedTargetIds={selectedTargetIds}
                thinkingId={thinkingId}
                targetMode={Boolean(interactive && needsTarget)}
                bubbles={bubbles}
                variant="rail"
                onSelectTarget={(id) => {
                  if (
                    needsPeek &&
                    selectedTargetIds.includes(id) &&
                    selectedTargetIds.length === 2
                  ) {
                    setPeekTargetId(id);
                    return;
                  }
                  toggleTarget(id);
                  if (needsPeek) setPeekTargetId(null);
                }}
                onZoomDiscard={(c, ownerName) =>
                  setZoom({
                    rank: c.rank,
                    role: c.role,
                    name: c.name,
                    subtitle: zh
                      ? `${ownerName} 的出牌`
                      : `${ownerName}'s discard`,
                  })
                }
              />
            </div>
          )}

          {/* Left — player list (desktop) */}
          <aside className="order-2 hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-white/95 p-2.5 shadow-sm lg:order-1 lg:flex">
            <div
              ref={seatsStackRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
              <PlayerPanels
                locale={locale}
                view={view}
                actorId={actorId}
                selectedTargetIds={selectedTargetIds}
                thinkingId={thinkingId}
                targetMode={Boolean(interactive && needsTarget)}
                bubbles={bubbles}
                variant="stack"
                onSelectTarget={(id) => {
                  if (needsPeek && selectedTargetIds.includes(id) && selectedTargetIds.length === 2) {
                    setPeekTargetId(id);
                    return;
                  }
                  toggleTarget(id);
                  if (needsPeek) setPeekTargetId(null);
                }}
                onZoomDiscard={(c, ownerName) =>
                  setZoom({
                    rank: c.rank,
                    role: c.role,
                    name: c.name,
                    subtitle: zh
                      ? `${ownerName} 的出牌`
                      : `${ownerName}'s discard`,
                  })
                }
              />
            </div>
          </aside>

          {/* Center — board + hand */}
          <div className="order-1 flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden sm:gap-2 lg:order-2">
            {/* Felt table */}
            <PlayFeltFrame className="min-h-[120px] flex-1">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 40%, #2e7d32 0%, #1b5e20 55%, #0d3b12 100%)",
                }}
              />
              <AnimatePresence>
                {flyPlay && (
                  <motion.div
                    key="fly-play"
                    className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.img
                      src={cardFaceUrl(flyPlay.rank, flyPlay.role)}
                      alt=""
                      className="h-[120px] w-[84px] rounded-xl border-2 border-accent object-cover shadow-2xl sm:h-[168px] sm:w-[118px]"
                      initial={{ y: 140, scale: 0.7, rotate: -8, opacity: 0.4 }}
                      animate={{ y: 0, scale: 1.05, rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {drawPulse && (
                  <motion.div
                    key="draw-pulse"
                    className="pointer-events-none absolute left-1/2 top-8 z-10 -translate-x-1/2"
                    initial={{ opacity: 0, y: -20, scale: 0.6 }}
                    animate={{ opacity: 1, y: 40, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                  >
                    <div className="rounded-full bg-black/45 px-3 py-1 font-heading text-xs font-bold text-amber-50 backdrop-blur">
                      {zh ? "摸牌" : "Draw"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='%23fff' stroke-width='.4'/%3E%3C/svg%3E\")",
                }}
              />

              <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-3 py-3 sm:py-4">
                {/* Face-up (2p) */}
                {view.faceUp.length > 0 && (
                  <div className="flex flex-col items-center gap-1.5">
                    <p className="font-heading text-[11px] font-semibold uppercase tracking-wider text-emerald-100/80">
                      {zh ? "公开牌" : "Removed from game"}
                    </p>
                    <div className="flex gap-2">
                      {view.faceUp.map((c) => (
                        <CardTile
                          key={c.id}
                          locale={locale}
                          rank={c.rank}
                          role={c.role}
                          name={c.name}
                          size={feltMd}
                          disabled
                          onZoom={() =>
                            setZoom({
                              rank: c.rank,
                              role: c.role,
                              name: c.name,
                              subtitle: zh ? "公开牌" : "Face-up",
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Center piles */}
                {view.pending?.type === "chancellor" && view.pending.held ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-heading text-xs font-bold text-amber-100">
                      {zh ? "大臣 — 点选保留" : "Chancellor — tap to keep"}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {view.pending.held.map((c) => (
                        <CardTile
                          key={c.id}
                          locale={locale}
                          rank={c.rank}
                          role={c.role}
                          name={c.name}
                          size={feltLg}
                          selected={selectedCardId === c.id}
                          disabled={
                            !(
                              isMyTurn &&
                              !disabled &&
                              view.pending?.playerId === actorId
                            )
                          }
                          onClick={() => setSelectedCardId(c.id)}
                          onZoom={() =>
                            setZoom({
                              rank: c.rank,
                              name: c.name,
                              subtitle: zh ? "大臣选留" : "Chancellor",
                            })
                          }
                        />
                      ))}
                    </div>
                    {selectedCardId &&
                      isMyTurn &&
                      !disabled &&
                      view.pending.playerId === actorId && (
                        <button
                          type="button"
                          onClick={() => chancellorKeep(selectedCardId)}
                          className="min-h-11 cursor-pointer rounded-xl bg-accent px-6 py-2.5 font-heading text-sm font-bold text-white shadow-card hover:bg-accent-dark"
                        >
                          {zh ? "确认保留这张" : "Keep this card"}
                        </button>
                      )}
                  </div>
                ) : (
                  <div className="flex items-end gap-4 sm:gap-6">
                    <div className="flex flex-col items-center gap-1">
                      <CardTile locale={locale} faceDown size={feltMd} disabled />
                      <span className="font-heading text-[11px] font-semibold text-emerald-50/90">
                        {zh ? "牌堆" : "Deck"} · {view.deckCount}
                      </span>
                    </div>
                    {lastDiscard && (
                      <div className="flex flex-col items-center gap-1">
                        <CardTile
                          locale={locale}
                          rank={lastDiscard.rank}
                          role={lastDiscard.role}
                          name={lastDiscard.name}
                          size={feltLg}
                          disabled
                          onZoom={() =>
                            setZoom({
                              rank: lastDiscard.rank,
                              role: lastDiscard.role,
                              name: lastDiscard.name,
                              subtitle: zh ? "最近弃牌" : "Last discard",
                            })
                          }
                        />
                        <span className="font-heading text-[11px] font-semibold text-emerald-50/90">
                          {zh ? "最近弃牌" : "Last discard"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PlayFeltFrame>

            {/* Hand dock */}
            <div className="shrink-0 rounded-xl border border-border bg-white/95 p-2 shadow-sm sm:rounded-2xl sm:p-3">
              <div className="mb-1 flex items-center justify-between gap-2 sm:mb-1.5">
                <p className="font-heading text-sm font-bold text-primary-dark">
                  {zh ? "你的手牌" : "Your hand"}
                </p>
                {isMyTurn && !disabled && (
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent-dark">
                    {zh ? "可操作" : "Active"}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-end justify-center gap-2 py-0.5 sm:gap-4 sm:py-1">
                <AnimatePresence mode="popLayout">
                  {(view.you?.hand ?? []).map((c) => {
                    const isNew = newCardIds.has(c.id);
                    return (
                      <motion.div
                        key={c.id}
                        layout
                        initial={
                          isNew
                            ? { y: -90, opacity: 0, scale: 0.45, rotate: -12 }
                            : false
                        }
                        animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ y: 40, opacity: 0, scale: 0.6 }}
                        transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      >
                        <CardTile
                          locale={locale}
                          rank={c.rank}
                          role={c.role}
                          name={c.name}
                          size={handSize}
                          selected={selectedCardId === c.id}
                          disabled={!interactive}
                          onClick={() => {
                            setSelectedCardId(c.id);
                            setSelectedTargetIds([]);
                            setPeekTargetId(null);
                          }}
                          onZoom={() =>
                            setZoom({
                              role: c.role,
                              rank: c.rank,
                              name: c.name,
                              subtitle: zh ? "你的手牌" : "Your hand",
                            })
                          }
                          title={`${cardLabel(c, locale)} (${c.rank})`}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {(view.you?.hand.length ?? 0) === 0 && (
                  <p className="py-4 text-sm text-stone-400 sm:py-8">
                    {zh ? "手牌为空" : "No cards in hand"}
                  </p>
                )}
              </div>

              {/* Action row */}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                  {needsTarget && tSpec?.allowSelf && (
                    <button
                      type="button"
                      onClick={() => toggleTarget(actorId)}
                      className={`min-h-9 cursor-pointer rounded-lg px-3 py-1.5 font-heading text-xs font-bold transition-colors ${
                        selectedTargetIds.includes(actorId)
                          ? "bg-accent text-white"
                          : "bg-surface text-primary-dark hover:bg-primary-light"
                      }`}
                    >
                      {zh ? "目标：自己" : "Target self"}
                    </button>
                  )}
                  {needsPeek &&
                    selectedTargetIds.map((id) => (
                      <button
                        key={`peek-${id}`}
                        type="button"
                        onClick={() => setPeekTargetId(id)}
                        className={`min-h-9 cursor-pointer rounded-lg px-3 py-1.5 font-heading text-xs font-bold ${
                          peekTargetId === id
                            ? "bg-accent text-white"
                            : "bg-surface text-primary-dark"
                        }`}
                      >
                        {zh ? `偷看 ${nameOf?.(id) ?? id}` : `Peek ${nameOf?.(id) ?? id}`}
                      </button>
                    ))}
                  {needsGuess &&
                    Array.from({ length: maxGuess + 1 }, (_, i) => i)
                      .filter((r) =>
                        selectedRole === "guard" ? r !== 1 : true,
                      )
                      .map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setGuessRank(r)}
                        className={`min-h-9 min-w-9 cursor-pointer rounded-md px-2 py-1 font-heading text-sm font-bold transition-colors ${
                          guessRank === r
                            ? "bg-accent text-white"
                            : "bg-surface text-primary-dark hover:bg-primary-light"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                </div>
                <button
                  type="button"
                  disabled={!canPlay}
                  onClick={playCard}
                  className="min-h-11 w-full cursor-pointer rounded-xl bg-accent px-7 py-2.5 font-heading text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-accent-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
                >
                  {zh ? "打出此牌" : "Play card"}
                </button>
              </div>
            </div>
          </div>

          {/* Right — log + chat (desktop) */}
          <aside className="order-3 hidden min-h-0 flex-col overflow-hidden lg:flex">
            {sidePanel}
          </aside>
        </div>

        <PlaySideSheet
          locale={locale}
          open={Boolean(mobile && sideOpen)}
          onClose={() => setSideOpen(false)}
          title={zh ? "战报 / 聊天" : "Log / Chat"}
        >
          {sidePanel}
        </PlaySideSheet>
      </PlayTableShell>
    </>
  );
}

export type { ArenaView } from "./types";
