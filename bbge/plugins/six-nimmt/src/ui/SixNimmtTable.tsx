"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Action } from "@bbge/core";
import type { PluginTableProps } from "@bbge/ui";
import { useIsMobileLayout } from "@bbge/ui";
import { NimmtCard } from "./NimmtCard";

type CardV = {
  id: string;
  value: number;
  bullheads: number;
  flipTo?: number | null;
};

type ArenaView = {
  phase: string;
  mode: string;
  round: number;
  trick: number;
  targetScore: number;
  currentPlayerId: string | null;
  winners: string[];
  buffaloWon: boolean | null;
  rows: CardV[][];
  rowMods: { take7: boolean; stopped: boolean }[];
  parityMarker: { rowIndex: number; parity: "even" | "odd" } | null;
  mountain: { rowIndex: number; direction: 1 | -1 } | null;
  jumpingCowRow: number | null;
  draftPool: CardV[] | null;
  draftTurn: string | null;
  revealed: {
    playerId: string;
    card: CardV;
    placeValue?: number;
    usedFlip?: boolean;
    isBuffalo?: boolean;
    pending?: boolean;
    placingNext?: boolean;
  }[] | null;
  resolveRemaining?: number;
  pending: {
    type: string;
    playerId: string;
    card: CardV;
  } | null;
  buffalo: {
    handCount: number;
    revealed: CardV | null;
    takenBullheads: number;
    teamBullheads: number;
    faceUpSpecials: (string | null)[];
    specialDeckCount: number;
  } | null;
  legal: {
    type: string;
    cardId?: string;
    rowIndex?: number;
    kind?: string;
    faceIndex?: number;
    flip?: boolean;
  }[];
  you: {
    id: string;
    hand: CardV[];
    taken: CardV[];
    takenBullheads: number;
    score: number;
    hasPlayed: boolean;
    selectedCardId: string | null;
    selectedFlip?: boolean;
    hasFlipToken: boolean;
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

const MODE_LABEL: Record<string, { en: string; zh: string }> = {
  classic: { en: "Classic", zh: "经典" },
  pro: { en: "Pro draft", zh: "进阶选牌" },
  "fan-even-odd": { en: "Even/Odd", zh: "奇偶" },
  "fan-mountain": { en: "Mountain", zh: "登山" },
  "fan-jumping-cow": { en: "Jumping Cow", zh: "跳牛" },
  "fan-flippin": { en: "Flippin’ Digits", zh: "翻数字" },
  buffalo: { en: "Beat the Buffalo", zh: "击败水牛" },
};

const SPECIAL_LABEL: Record<string, { en: string; zh: string }> = {
  take7: { en: "Take 7!", zh: "拿 7！" },
  stop: { en: "Stop!", zh: "停！" },
  replace: { en: "Replace!", zh: "替换！" },
  insert: { en: "Insert!", zh: "插入！" },
  push: { en: "Push!", zh: "推！" },
  first: { en: "First", zh: "先出" },
  last: { en: "Last", zh: "后出" },
  sort: { en: "Sort", zh: "排序" },
};

export function SixNimmtTable({
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
  const [pickId, setPickId] = useState<string | null>(null);
  const [useFlip, setUseFlip] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [specialKind, setSpecialKind] = useState<string | null>(null);
  const [specialFace, setSpecialFace] = useState<number | null>(null);
  const cardSize = mobile ? "md" : "lg";
  const thinkingSet = useMemo(() => {
    const ids = thinkingIds?.length
      ? thinkingIds
      : thinkingId
        ? [thinkingId]
        : [];
    return new Set(ids);
  }, [thinkingId, thinkingIds]);

  useEffect(() => {
    setPickId(null);
    setUseFlip(false);
    setSpecialKind(null);
    setSpecialFace(null);
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
  const canDraft =
    view.phase === "drafting" &&
    view.draftTurn === myId &&
    !disabled;
  const canSpecial = view.phase === "specials" && !disabled;

  const modeTitle = MODE_LABEL[view.mode] ?? MODE_LABEL.classic!;

  const status = useMemo(() => {
    if (view.phase === "finished") {
      if (view.mode === "buffalo") {
        return view.buffaloWon
          ? zh
            ? "胜利 · 击败水牛！"
            : "Victory · Beat the Buffalo!"
          : zh
            ? "失败 · 水牛分更低"
            : "Defeat · Buffalo scored lower";
      }
      return zh
        ? `对局结束 · 胜者 ${view.winners.map((id) => nameOf?.(id) ?? id).join("、")}`
        : `Match over · ${view.winners.map((id) => nameOf?.(id) ?? id).join(", ")}`;
    }
    if (view.phase === "drafting") {
      const who = view.draftTurn
        ? (nameOf?.(view.draftTurn) ?? view.draftTurn)
        : "";
      return view.draftTurn === myId
        ? zh
          ? "进阶选牌 · 点选一张加入手牌"
          : "Pro draft · pick a card for your hand"
        : zh
          ? `等待 ${who} 选牌…`
          : `Waiting for ${who} to draft…`;
    }
    if (view.phase === "specials") {
      return zh
        ? "特殊牌阶段 · 使用后点「开始放置」"
        : "Specials · then tap Begin placing";
    }
    if (view.phase === "resolving") {
      const left = view.resolveRemaining ?? 0;
      return zh
        ? `入行中 · 还剩 ${left} 张`
        : `Placing · ${left} left`;
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
    if (thinkingSet.size > 1) {
      return zh
        ? `${thinkingSet.size} 名 AI 同时选牌…`
        : `${thinkingSet.size} AIs choosing…`;
    }
    if (thinkingSet.size === 1) {
      const id = [...thinkingSet][0]!;
      return zh
        ? `${nameOf?.(id) ?? id} 思考中…`
        : `${nameOf?.(id) ?? id} thinking…`;
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
  }, [view, thinkingSet, zh, nameOf, myId]);

  const dispatch = (action: Action) => onAction(action);

  const rowBadge = (ri: number) => {
    const bits: string[] = [];
    if (view.parityMarker?.rowIndex === ri) {
      bits.push(
        view.parityMarker.parity === "even"
          ? zh
            ? "偶"
            : "Even"
          : zh
            ? "奇"
            : "Odd",
      );
    }
    if (view.mountain?.rowIndex === ri) {
      bits.push(zh ? "↓登山" : "↓Mtn");
    }
    if (view.jumpingCowRow === ri) bits.push(zh ? "跳牛" : "Cow");
    if (view.rowMods[ri]?.take7) bits.push(zh ? "拿7" : "T7");
    if (view.rowMods[ri]?.stopped) bits.push(zh ? "停" : "Stop");
    return bits.join(" · ");
  };

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
              thinkingSet.has(s.id) ? "ring-1 ring-sky-400" : "",
            ].join(" ")}
          >
            <span className="truncate font-heading font-bold text-primary-dark">
              {s.isYou ? (zh ? "你" : "You") : s.name}
              {view.phase === "selecting" &&
                (s.hasPlayed ? (zh ? " · 已出" : " · locked") : "")}
            </span>
            <span className="tabular-nums text-stone-600">
              {view.mode === "buffalo" ? "—" : s.score}
              {s.takenBullheads > 0 ? (
                <span className="text-rose-600"> +{s.takenBullheads}</span>
              ) : null}
            </span>
          </div>
        ))}
        {view.buffalo && (
          <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-amber-950">
            <p className="font-heading font-bold">
              {zh ? "水牛" : "Buffalo"} · {view.buffalo.handCount}
              {zh ? " 张" : " left"}
            </p>
            <p>
              {zh ? "队伍" : "Team"} {view.buffalo.teamBullheads} ·{" "}
              {zh ? "水牛" : "Buffalo"} {view.buffalo.takenBullheads}
            </p>
          </div>
        )}
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
          {zh ? "谁是牛头王" : "6 nimmt!"} ·{" "}
          {zh ? modeTitle.zh : modeTitle.en}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-amber-100/85 sm:gap-3">
          {view.mode !== "buffalo" && (
            <span>
              {zh ? "目标" : "Target"}{" "}
              <strong className="text-accent">{view.targetScore}</strong>
            </span>
          )}
          <span>
            {zh ? "轮" : "R"} {view.round}
            {view.trick > 0
              ? ` · ${zh ? "拍" : "T"} ${view.trick}`
              : ""}
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
            thinkingSet.size > 0 && thinkingDetail
              ? setStatusOpen((v) => !v)
              : undefined
          }
          className={[
            "flex min-h-11 shrink-0 flex-col justify-center rounded-xl border px-3 py-1.5 text-left text-sm shadow-sm",
            view.phase === "finished"
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : canChoose || canDraft || canSpecial
                ? "border-accent bg-amber-50 text-amber-950"
                : "border-border bg-white/90 text-primary-dark",
            thinkingSet.size > 0 && thinkingDetail
              ? "cursor-pointer"
              : "cursor-default",
          ].join(" ")}
        >
          <p className="truncate font-heading font-semibold">{status}</p>
          {statusOpen && thinkingDetail && (
            <pre className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap break-words border-t border-border/50 pt-1 font-sans text-[11px] text-stone-700">
              {thinkingDetail}
            </pre>
          )}
        </button>

        {canSpecial && view.buffalo && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2">
            <span className="text-xs font-bold text-amber-950">
              {zh ? "特殊牌" : "Specials"}
            </span>
            {view.buffalo.faceUpSpecials.map((kind, i) =>
              kind ? (
                <button
                  key={`${kind}-${i}`}
                  type="button"
                  onClick={() => {
                    setSpecialKind(kind);
                    setSpecialFace(i);
                  }}
                  className={[
                    "cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-bold",
                    specialFace === i
                      ? "border-accent bg-accent text-white"
                      : "border-amber-300 bg-white text-amber-950",
                  ].join(" ")}
                >
                  {zh
                    ? (SPECIAL_LABEL[kind]?.zh ?? kind)
                    : (SPECIAL_LABEL[kind]?.en ?? kind)}
                </button>
              ) : null,
            )}
            {specialKind === "take7" || specialKind === "stop" ? (
              <span className="text-[11px] text-amber-900">
                {zh ? "再点选一行" : "Then tap a row"}
              </span>
            ) : null}
            {(specialKind === "replace" ||
              specialKind === "insert" ||
              specialKind === "first" ||
              specialKind === "last") && (
              <div className="flex flex-wrap gap-1">
                {view.seats.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (specialFace == null || !specialKind) return;
                      dispatch({
                        type: "useSpecial",
                        playerId: myId,
                        payload: {
                          kind: specialKind,
                          faceIndex: specialFace,
                          targetPlayerId: s.id,
                          rowIndex:
                            specialKind === "insert" ? 0 : undefined,
                          insertAt: 0,
                          cardId:
                            specialKind === "replace"
                              ? view.seats.find((x) => x.id === s.id) &&
                                undefined
                              : undefined,
                        },
                      } as Action);
                      setSpecialKind(null);
                      setSpecialFace(null);
                    }}
                    className="cursor-pointer rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-primary-dark ring-1 ring-border"
                  >
                    {s.isYou ? (zh ? "你" : "You") : s.name}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "beginPlace",
                  playerId: myId,
                  payload: {},
                })
              }
              className="ml-auto cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white"
            >
              {zh ? "开始放置" : "Begin placing"}
            </button>
          </div>
        )}

        <div className="grid min-h-0 flex-1 gap-2 overflow-hidden lg:grid-cols-[1fr_220px]">
          <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden">
            {view.phase === "drafting" && view.draftPool && (
              <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-white/95 p-2">
                <p className="mb-2 font-heading text-sm font-bold text-primary-dark">
                  {zh ? "选牌池" : "Draft pool"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {view.draftPool.map((c) => (
                    <NimmtCard
                      key={c.id}
                      value={c.value}
                      bullheads={c.bullheads}
                      size="sm"
                      disabled={!canDraft}
                      onClick={() =>
                        canDraft &&
                        dispatch({
                          type: "draftPick",
                          playerId: myId,
                          payload: { cardId: c.id },
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {view.phase !== "drafting" && (
              <div className="relative min-h-0 flex-1 overflow-y-auto rounded-xl border-[4px] border-[#4E342E] p-2 sm:rounded-2xl sm:border-[6px] sm:p-3">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 40%, #2e7d32 0%, #1b5e20 55%, #0d3b12 100%)",
                  }}
                />
                <div className="relative z-10 space-y-2">
                  {view.rows.map((row, ri) => {
                    const cap = view.rowMods[ri]?.take7 ? 6 : 5;
                    const slots =
                      row.length + (view.jumpingCowRow === ri ? 1 : 0);
                    const rowClickable =
                      canChoose ||
                      (canSpecial &&
                        specialFace != null &&
                        (specialKind === "take7" ||
                          specialKind === "stop"));
                    return (
                      <button
                        key={ri}
                        type="button"
                        disabled={!rowClickable || view.rowMods[ri]?.stopped}
                        onClick={() => {
                          if (canChoose) {
                            dispatch({
                              type: "chooseRow",
                              playerId: myId,
                              payload: { rowIndex: ri },
                            });
                            return;
                          }
                          if (
                            canSpecial &&
                            specialFace != null &&
                            (specialKind === "take7" ||
                              specialKind === "stop")
                          ) {
                            dispatch({
                              type: "useSpecial",
                              playerId: myId,
                              payload: {
                                kind: specialKind,
                                faceIndex: specialFace,
                                rowIndex: ri,
                              },
                            } as Action);
                            setSpecialKind(null);
                            setSpecialFace(null);
                          }
                        }}
                        className={[
                          "flex w-full flex-wrap items-center gap-1 rounded-xl px-2 py-1.5 text-left",
                          rowClickable
                            ? "cursor-pointer bg-black/25 ring-2 ring-accent/80 hover:bg-black/35"
                            : "bg-black/15",
                          view.rowMods[ri]?.stopped
                            ? "opacity-50 ring-2 ring-rose-400"
                            : "",
                        ].join(" ")}
                      >
                        <span className="mr-1 w-5 shrink-0 font-heading text-xs font-bold text-amber-100/80">
                          {ri + 1}
                        </span>
                        {rowBadge(ri) ? (
                          <span className="rounded bg-black/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-100">
                            {rowBadge(ri)}
                          </span>
                        ) : null}
                        <AnimatePresence mode="popLayout">
                          {row.map((c) => (
                            <motion.div
                              key={c.id}
                              layout
                              initial={{
                                y: -56,
                                scale: 0.55,
                                opacity: 0,
                                rotate: -8,
                              }}
                              animate={{
                                y: 0,
                                scale: 1,
                                opacity: 1,
                                rotate: 0,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 420,
                                damping: 24,
                                mass: 0.85,
                              }}
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
                          {slots}/{cap}
                        </span>
                      </button>
                    );
                  })}

                  {view.revealed && view.revealed.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-2 border-t border-white/10 pt-2">
                      {view.revealed.map((r) => (
                        <motion.div
                          key={r.card.id}
                          className={[
                            "text-center rounded-lg p-0.5",
                            r.placingNext
                              ? "ring-2 ring-accent bg-black/30"
                              : r.pending
                                ? "opacity-95"
                                : "opacity-40",
                          ].join(" ")}
                          animate={
                            r.placingNext
                              ? { y: [0, -4, 0], scale: [1, 1.06, 1] }
                              : undefined
                          }
                          transition={
                            r.placingNext
                              ? { duration: 0.7, repeat: Infinity }
                              : undefined
                          }
                        >
                          <NimmtCard
                            value={r.card.value}
                            bullheads={r.card.bullheads}
                            size="sm"
                          />
                          <p className="mt-0.5 max-w-[3.5rem] truncate text-[9px] text-amber-50/80">
                            {r.isBuffalo
                              ? zh
                                ? "水牛"
                                : "Buffalo"
                              : (nameOf?.(r.playerId) ?? r.playerId)}
                            {r.usedFlip ? ` →${r.placeValue}` : ""}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="shrink-0 rounded-xl border border-border bg-white/95 p-2 shadow-sm sm:p-2.5">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-heading text-sm font-bold text-primary-dark">
                  {zh ? "你的手牌" : "Your hand"}
                  {view.you ? (
                    <span className="ml-2 text-[11px] font-semibold text-stone-500">
                      {view.mode === "buffalo"
                        ? zh
                          ? `队伍牛头 ${view.buffalo?.teamBullheads ?? 0}`
                          : `Team ${view.buffalo?.teamBullheads ?? 0}`
                        : `${zh ? "总分" : "Score"} ${view.you.score}${
                            view.you.takenBullheads > 0
                              ? ` · +${view.you.takenBullheads}`
                              : ""
                          }`}
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
                {(view.you?.hand.length ?? 0) === 0 &&
                  view.phase !== "drafting" && (
                    <p className="py-4 text-sm text-stone-400">
                      {zh ? "手牌已打完" : "Hand empty"}
                    </p>
                  )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2">
                {view.mode === "fan-flippin" &&
                  view.you?.hasFlipToken &&
                  canPlay && (
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary-dark">
                      <input
                        type="checkbox"
                        checked={useFlip}
                        onChange={(e) => setUseFlip(e.target.checked)}
                      />
                      {zh ? "翻数字" : "Flip digits"}
                      {pickId &&
                        (() => {
                          const c = view.you?.hand.find((x) => x.id === pickId);
                          return c?.flipTo != null && c.flipTo !== c.value
                            ? ` (${c.value}→${c.flipTo})`
                            : "";
                        })()}
                    </label>
                  )}
                <button
                  type="button"
                  disabled={!canPlay || !pickId}
                  onClick={() => {
                    if (!pickId) return;
                    const card = view.you?.hand.find((c) => c.id === pickId);
                    const flip =
                      useFlip &&
                      card?.flipTo != null &&
                      card.flipTo !== card.value;
                    dispatch({
                      type: "playCard",
                      playerId: myId,
                      payload: { cardId: pickId, flip: Boolean(flip) },
                    });
                    setPickId(null);
                    setUseFlip(false);
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
