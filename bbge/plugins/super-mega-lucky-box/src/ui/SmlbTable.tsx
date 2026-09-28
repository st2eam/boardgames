"use client";

import { useState } from "react";
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
  ThinkingStatusBanner,
} from "@bbge/ui";
import { soloScoreRating } from "../rules";
import styles from "./SmlbTable.module.css";

type Reward = {
  kind: "number" | "wild" | "lightning" | "star" | "moon" | "none";
  value?: number;
  count?: number;
};
type SmlbCard = {
  id: string;
  grid: number[];
  rows: Reward[];
  columns: Reward[];
  marked?: boolean[];
  claimedRows?: boolean[];
  claimedColumns?: boolean[];
  completed?: boolean;
};
type PendingBonus = {
  id: string;
  cardId: string;
  line: "row" | "column";
  index: number;
  reward: Reward;
};
type SmlbView = {
  phase: string;
  stage: "startingDraft" | "roundDraft" | "number" | "advancing" | "finished";
  advanceKind?: string | null;
  round: number;
  numberIndex: number;
  currentNumber: number | null;
  revealedNumbers: number[];
  currentPlayerId: string | null;
  winners: string[];
  luckyDeckCount: number;
  seats: {
    id: string;
    name: string;
    cardsCount: number;
    lightning: number;
    moons: number;
    starsThisRound: number;
    score: number;
    roundScores: number[];
    hasPlayed: boolean;
    isYou: boolean;
  }[];
  players: {
    id: string;
    name: string;
    cards: SmlbCard[];
    lightning: number;
    moons: number;
    starsThisRound: number;
    score: number;
    roundScores: number[];
    incompletePoints: number;
    moonPoints: number;
    finalScore: number;
    hasPlayed: boolean;
    isYou: boolean;
  }[];
  you: {
    id: string;
    lightning: number;
    moons: number;
    starsThisRound: number;
    score: number;
    roundScores: number[];
    numberDone: boolean;
    hasPlayed: boolean;
    cards: SmlbCard[];
    pendingBonuses: PendingBonus[];
    startingOffers: SmlbCard[] | null;
    roundOffers: SmlbCard[] | null;
    pickedRoundCardId: string | null;
    incompletePoints: number;
    moonPoints: number;
    finalScore: number;
  } | null;
  legal: { type: string; bonusId?: string }[];
  luckyDiscard: { id: string; grid: number[] }[];
};

function adjustNumber(number: number, adjustments: (-1 | 1)[]): number {
  return adjustments.reduce(
    (n, step) => ((n - 1 + step + 9) % 9) + 1,
    number,
  );
}

function distance(a: number, b: number): number {
  const forward = (b - a + 9) % 9;
  return Math.min(forward, (9 - forward) % 9);
}

function RewardMark({ reward }: { reward: Reward }) {
  if (reward.kind === "none") return null;
  if (reward.kind === "number") {
    return <span className="font-heading text-sm font-black">{reward.value}</span>;
  }
  if (reward.kind === "wild") {
    return <span className="font-heading text-base font-black">?</span>;
  }
  if (reward.kind === "lightning") {
    return (
      <span className="flex items-center gap-0.5">
        <svg aria-hidden="true" viewBox="0 0 16 20" className="h-4 w-3 fill-current">
          <path d="M9.4 0 1 11h5l-.4 9L15 7.5H9.8L9.4 0Z" />
        </svg>
        <span className="text-[10px] font-black">{reward.count}</span>
      </span>
    );
  }
  return reward.kind === "star" ? (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={styles.rewardIcon}>
      <path d="m16 2 3.5 9.4L30 12l-8.2 6.6 2.8 10.2L16 23l-8.6 5.8 2.8-10.2L2 12l10.5-.6L16 2Z" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={styles.rewardIcon}>
      <path d="M20.5 2.5a13.5 13.5 0 1 0 9 22.3A13.8 13.8 0 0 1 20.5 2.5Z" />
    </svg>
  );
}

function rewardLabel(reward: Reward, zh: boolean): string {
  if (reward.kind === "none") return zh ? "无奖励" : "No reward";
  if (reward.kind === "number") return (zh ? "数字 " : "Number ") + reward.value;
  if (reward.kind === "wild") return zh ? "万能奖励" : "Wild reward";
  if (reward.kind === "lightning") return (zh ? "闪电 " : "Lightning ") + reward.count;
  return reward.kind === "star" ? (zh ? "星星" : "Star") : (zh ? "月亮" : "Moon");
}

function soloRatingLabel(score: number, zh: boolean): string {
  const rating = soloScoreRating(score);
  const labels: Record<string, { en: string; zh: string }> = {
    unlucky: { en: "Super Mega Unlucky", zh: "超级巨型不走运" },
    goodStart: { en: "A good start", zh: "不错的开始" },
    onTrolley: { en: "On the trolley", zh: "渐入佳境" },
    greatGame: { en: "A great game", zh: "好成绩" },
    superScore: { en: "A super score", zh: "超级高分" },
    megaGame: { en: "A mega game", zh: "巨型好局" },
    luckyChampion: { en: "Super Mega Lucky Champion", zh: "超级巨型幸运冠军" },
  };
  return rating ? labels[rating]?.[zh ? "zh" : "en"] ?? rating : "";
}

function BoxCard({
  card,
  zh,
  canSelectCell,
  onSelectCell,
  pendingBonuses,
  selectedBonusId,
  onSelectBonus,
  disabled = false,
  compact = false,
}: {
  card: SmlbCard;
  zh: boolean;
  canSelectCell?: (cellIndex: number) => boolean;
  onSelectCell?: (cellIndex: number) => void;
  pendingBonuses?: PendingBonus[];
  selectedBonusId?: string | null;
  onSelectBonus?: (bonus: PendingBonus) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const rowBonus = (index: number) =>
    pendingBonuses?.find(
      (bonus) => bonus.cardId === card.id && bonus.line === "row" && bonus.index === index,
    );
  const columnBonus = (index: number) =>
    pendingBonuses?.find(
      (bonus) => bonus.cardId === card.id && bonus.line === "column" && bonus.index === index,
    );
  const rewardButton = (
    reward: Reward,
    index: number,
    line: "row" | "column",
    pending?: PendingBonus,
  ) => {
    if (reward.kind === "none") {
      return <span key={line + index} className={styles.emptyReward} aria-hidden="true" />;
    }
    const claimed =
      line === "row" ? card.claimedRows?.[index] : card.claimedColumns?.[index];
    const active = pending?.id === selectedBonusId;
    return (
      <button
        key={line + index}
        type="button"
        aria-label={rewardLabel(reward, zh)}
        aria-pressed={Boolean(pending && active)}
        disabled={disabled || !pending || !onSelectBonus}
        onClick={() => pending && onSelectBonus?.(pending)}
        className={styles.rewardButton}
        data-kind={reward.kind}
        data-claimed={Boolean(claimed)}
        data-active={active}
      >
        <RewardMark reward={reward} />
      </button>
    );
  };

  return (
    <div className={`${styles.boxCard} ${compact ? styles.boxCardCompact : ""}`}>
      <div className={styles.boxCardHeader}>
        <span className={styles.boxCardId}>
          {card.id}
        </span>
        {card.completed && (
          <span className={styles.completedStamp}>
            ✓ <span>{zh ? "已完成" : "COMPLETE"}</span>
          </span>
        )}
      </div>
      <div className={styles.boxGrid}>
        {card.grid.map((value, cellIndex) => {
          const marked = Boolean(card.marked?.[cellIndex]);
          const available = canSelectCell?.(cellIndex) ?? false;
          return (
            <button
              key={cellIndex}
              type="button"
              aria-label={zh
                ? `盒子 ${card.id}，第 ${cellIndex + 1} 格：${value}`
                : `Box ${card.id}, square ${cellIndex + 1}: ${value}`}
              aria-pressed={marked}
              disabled={disabled || marked || !available || !onSelectCell}
              onClick={() => onSelectCell?.(cellIndex)}
              className={styles.numberCell}
              data-tone={value <= 3 ? "low" : value <= 6 ? "mid" : "high"}
              data-marked={marked}
              data-available={available && !disabled}
            >
              {value}
              {marked && (
                <span
                  aria-hidden="true"
                  className={styles.crossMark}
                >
                  ×
                </span>
              )}
            </button>
          );
        })}
        <div className={styles.rowRewards}>
          {card.rows.map((reward, index) =>
            rewardButton(reward, index, "row", rowBonus(index)),
          )}
        </div>
      </div>
      <div className={styles.columnRewards}>
        {card.columns.map((reward, index) =>
          rewardButton(reward, index, "column", columnBonus(index)),
        )}
        <span aria-hidden="true" />
      </div>
    </div>
  );
}

function StatsChip({
  value,
  label,
  title,
}: {
  value: string | number;
  label: string;
  title: string;
}) {
  return (
    <div
      title={title}
      className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-primary/15 bg-white/80 px-2.5 text-primary-dark"
    >
      <span className="font-heading text-base font-black">{value}</span>
      <span className="text-[10px] font-semibold text-primary/75">{label}</span>
    </div>
  );
}

const ROUND_CARD_POINTS = [15, 12, 10, 8] as const;

function ScoreSheet({
  player,
  round,
  finished,
  zh,
}: {
  player: SmlbView["players"][number];
  round: number;
  finished: boolean;
  zh: boolean;
}) {
  const roundTotal = player.roundScores.reduce((sum, points) => sum + points, 0);
  const starCount = Math.min(3, player.starsThisRound);
  return (
    <section
      className={styles.scoreSheet}
      aria-label={zh ? "幸运盒计分板" : "Lucky Box score sheet"}
    >
      <div className={styles.scoreHeading}>
        <h3>{zh ? "幸运盒计分板" : "LUCKY BOX SCORE"}</h3>
        <span>{zh ? "每轮完整盒子 + 星星" : "Full boxes + stars each round"}</span>
      </div>
      <div className={styles.scoreLayout}>
        <div className={styles.roundRows}>
          {ROUND_CARD_POINTS.map((multiplier, index) => {
            const settled = finished || index < round - 1;
            const current = !finished && index === round - 1;
            return (
              <div className={styles.roundRow} data-current={current} key={multiplier}>
                <span className={styles.roundNumber}>
                  <small>{zh ? "轮" : "ROUND"}</small>
                  {index + 1}
                </span>
                <div className={styles.roundBox}>
                  <span className={styles.roundMultiplier}>{multiplier}<small>×</small></span>
                  <span
                    className={styles.roundScore}
                    aria-label={
                      zh
                        ? `第 ${index + 1} 轮得分：${settled ? player.roundScores[index] : "待结算"}`
                        : `Round ${index + 1} score: ${settled ? player.roundScores[index] : "pending"}`
                    }
                  >
                    {settled ? player.roundScores[index] : "—"}
                  </span>
                </div>
                <div className={styles.starPanel}>
                  <div className={styles.starIcons} aria-hidden="true">
                    {[1, 2, 3].map((star) => (
                      <span key={star} data-earned={current && star <= starCount}>
                        <RewardMark reward={{ kind: "star" }} />
                      </span>
                    ))}
                  </div>
                  <span className={styles.starLegend}>1 / 4 / 9</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.endScores}>
          <div className={`${styles.endTile} ${styles.endTilePink}`}>
            <span className={styles.endTileLabel}>{zh ? "四轮合计" : "GAME END"}</span>
            <span className={styles.endTileValue}>{roundTotal}</span>
          </div>
          <div className={`${styles.endTile} ${styles.endTileYellow}`}>
            <span className={styles.endTileLabel}>{zh ? "未完成格" : "INCOMPLETE"}<small>2 × = 1</small></span>
            <span className={styles.endTileValue}>{finished ? `+${player.incompletePoints}` : "—"}</span>
          </div>
          <div className={`${styles.endTile} ${styles.endTileBlue}`}>
            <span className={styles.endTileLabel}>{zh ? "月亮" : "MOONS"}<small>↑ +6 / ↓ −6</small></span>
            <span className={styles.endTileValue}>
              {finished ? `${player.moonPoints >= 0 ? "+" : ""}${player.moonPoints}` : "—"}
            </span>
          </div>
          <div className={styles.megaTotal}>
            <span>{finished ? "MEGA TOTAL" : zh ? "当前积分" : "LIVE SCORE"}</span>
            <strong>{finished ? player.finalScore : player.score}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SmlbTable({
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
  const zh = locale !== "en";
  const view = viewUnknown as SmlbView;
  const [sideOpen, setSideOpen] = useState(false);
  const [adjustmentState, setAdjustmentState] = useState<{
    key: string;
    value: (-1 | 1)[];
  }>({ key: "", value: [] });
  const [bonusState, setBonusState] = useState<{ key: string; id: string | null }>({
    key: "",
    id: null,
  });
  const [startingState, setStartingState] = useState<{ key: string; ids: string[] }>({
    key: "",
    ids: [],
  });
  const you = view.you;
  const ownPlayer = view.players.find((player) => player.id === you?.id);
  const ownCards = you?.cards ?? [];
  const pending = you?.pendingBonuses ?? [];
  const phaseKey = [
    view.stage,
    view.round,
    view.numberIndex,
    view.currentNumber,
    myId,
    you?.numberDone,
    pending.map((bonus) => bonus.id).join(","),
  ].join(":");
  const adjustments =
    adjustmentState.key === phaseKey ? adjustmentState.value : [];
  const selectedBonusId =
    bonusState.key === phaseKey ? bonusState.id : pending[0]?.id ?? null;
  const startingPicks = startingState.key === phaseKey ? startingState.ids : [];
  const selectedBonus =
    pending.find((bonus) => bonus.id === selectedBonusId) ?? null;
  const currentNumber = view.currentNumber;
  const effectiveNumber =
    currentNumber == null ? null : adjustNumber(currentNumber, adjustments);
  const setAdjustments = (
    update: (-1 | 1)[] | ((previous: (-1 | 1)[]) => (-1 | 1)[]),
  ) => {
    setAdjustmentState((previous) => {
      const current = previous.key === phaseKey ? previous.value : [];
      return {
        key: phaseKey,
        value: typeof update === "function" ? update(current) : update,
      };
    });
  };
  const setSelectedBonusId = (id: string | null) =>
    setBonusState({ key: phaseKey, id });
  const setStartingPicks = (update: (ids: string[]) => string[]) => {
    setStartingState((previous) => ({
      key: phaseKey,
      ids: update(previous.key === phaseKey ? previous.ids : []),
    }));
  };

  const send = (type: string, payload: Record<string, unknown>) => {
    onAction({ type, playerId: myId, payload } as Action);
  };

  const targetPredicate =
    selectedBonus?.reward.kind === "number"
      ? (value: number) => value === selectedBonus.reward.value
      : selectedBonus?.reward.kind === "wild"
        ? () => true
        : null;

  const selectedBonusTargets = targetPredicate
    ? ownCards.flatMap((card) =>
        card.grid.flatMap((value, cellIndex) =>
          !card.marked?.[cellIndex] && targetPredicate(value)
            ? [{ cardId: card.id, cellIndex }]
            : [],
        ),
      )
    : [];
  const canMarkNumber =
    currentNumber != null &&
    ownCards.some((card) =>
      card.grid.some(
        (value, cellIndex) =>
          !card.marked?.[cellIndex] &&
          distance(currentNumber, value) <= (you?.lightning ?? 0),
      ),
    );

  const selectBonus = (bonus: PendingBonus) => {
    const kind = bonus.reward.kind;
    const hasTarget =
      kind === "number"
        ? ownCards.some((card) =>
            card.grid.some(
              (value, cellIndex) =>
                !card.marked?.[cellIndex] && value === bonus.reward.value,
            ),
          )
        : kind === "wild"
          ? ownCards.some((card) => card.marked?.some((marked) => !marked))
          : false;
    if ((kind === "number" || kind === "wild") && hasTarget) {
      setSelectedBonusId(bonus.id);
    } else {
      send("resolveBonus", { bonusId: bonus.id });
      setSelectedBonusId(null);
    }
  };

  const selectBonusCell = (cardId: string, cellIndex: number) => {
    if (!selectedBonus) return;
    send("resolveBonus", {
      bonusId: selectedBonus.id,
      cardId,
      cellIndex,
    });
    setSelectedBonusId(null);
  };

  const canSelectNumberCell = (card: SmlbCard, cellIndex: number) =>
    view.stage === "number" &&
    !you?.numberDone &&
    effectiveNumber != null &&
    !card.marked?.[cellIndex] &&
    card.grid[cellIndex] === effectiveNumber;

  const onSelectNumberCell = (card: SmlbCard, cellIndex: number) => {
    if (!canSelectNumberCell(card, cellIndex)) return;
    send("markNumber", { cardId: card.id, cellIndex, adjustments });
  };

  const resultNames = view.winners.map((id) => nameOf?.(id) ?? id);
  const status =
    view.stage === "startingDraft"
      ? zh
        ? "从 5 张幸运盒卡中选 3 张"
        : "Keep 3 of your 5 starting cards"
      : view.stage === "roundDraft"
        ? zh
          ? "每人从 3 张牌中选 1 张"
          : "Choose 1 of your 3 new cards"
        : view.stage === "advancing"
          ? zh
            ? view.advanceKind === "scoreRound"
              ? "正在结算本轮…"
              : "准备翻开下一张数字牌…"
            : view.advanceKind === "scoreRound"
              ? "Scoring this round…"
              : "Preparing the next number…"
          : view.stage === "finished"
            ? zh
              ? resultNames.join("、") + " 获胜"
              : resultNames.join(", ") + " win"
            : thinkingId
              ? zh
                ? (nameOf?.(thinkingId) ?? thinkingId) + " 思考中…"
                : (nameOf?.(thinkingId) ?? thinkingId) + " thinking…"
              : you?.numberDone && pending.length
                ? zh
                  ? "选择并结算任一行列奖励"
                  : "Choose and resolve any unlocked bonus"
                : you?.numberDone
                  ? zh
                    ? "已完成，等待其他玩家"
                    : "Done; waiting for the other players"
                  : zh
                    ? "划掉一个匹配数字"
                    : "Cross off one matching number";

  return (
    <PlayTableShell
      locale={locale}
      title={zh ? "超级巨型幸运盒子" : "Super Mega Lucky Box"}
      onOpenLog={() => setSideOpen(true)}
      toolbarExtra={
        <>
          <span className="truncate text-amber-100/80">{status}</span>
          {view.stage === "number" && currentNumber != null && (
            <span
              aria-label={zh ? "当前数字" : "Current number"}
              className="flex h-9 min-w-9 items-center justify-center rounded-full bg-amber-100 px-2 font-heading text-lg font-black text-primary-dark"
            >
              {currentNumber}
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
          className="!min-h-9 !py-1 sm:!min-h-10"
        />

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <StatsChip
            value={view.round}
            label={zh ? "/ 4 轮" : "/ 4 rounds"}
            title={zh ? "固定四轮" : "The match lasts four rounds"}
          />
          <StatsChip
            value={view.numberIndex + "/9"}
            label={zh ? "数字牌" : "numbers"}
            title={zh ? "本轮共翻九张数字牌" : "Nine number cards each round"}
          />
          {you && (
            <>
              <StatsChip
                value={you.lightning}
                label={zh ? "闪电" : "lightning"}
                title={zh ? "每个闪电调整一步" : "Each lightning shifts one step"}
              />
              <StatsChip
                value={you.moons}
                label={zh ? "月亮" : "moons"}
                title={zh ? "月亮在终局计分" : "Moon tokens score at game end"}
              />
              <StatsChip
                value={you.score}
                label={zh ? "分" : "points"}
                title={zh ? "本轮星星暂计在内" : "Includes this round's star total"}
              />
            </>
          )}
        </div>

        <PlayHorizontalRail
          data-testid="smlb-seat-rail"
          className="shrink-0"
          aria-label={zh ? "玩家分数" : "Player scores"}
        >
          {view.seats.map((seat) => (
            <div
              key={seat.id}
              className={[
                "flex min-w-28 shrink-0 items-center gap-2 rounded-xl border px-2.5 py-1.5",
                seat.id === view.currentPlayerId
                  ? "border-amber-400 bg-amber-50"
                  : "border-border bg-white/90",
              ].join(" ")}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {(nameOf?.(seat.id) ?? seat.name).slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="max-w-24 truncate text-[11px] font-semibold text-primary-dark">
                  {nameOf?.(seat.id) ?? seat.name}
                  {seat.isYou && <span className="ml-1 text-accent">{zh ? "你" : "you"}</span>}
                </p>
                <p className="text-[10px] text-stone-500">
                  {seat.score} {zh ? "分" : "pts"} · {seat.moons} ☾ · {seat.lightning} L
                  {seat.hasPlayed && view.stage === "number" ? (zh ? " · 已完成" : " · done") : ""}
                </p>
              </div>
            </div>
          ))}
        </PlayHorizontalRail>

        <PlayScrollableRegion
          data-testid="smlb-board-region"
          className="min-h-0 flex-1 rounded-xl border border-[#3E2723]/15 bg-[#f8f2e7] p-2 sm:p-3"
        >
          {view.stage === "startingDraft" && you?.startingOffers ? (
            <div className="mx-auto max-w-4xl">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="font-heading text-sm font-bold text-primary-dark">
                  {zh ? "选择起始幸运盒卡" : "Choose starting Lucky Box cards"}
                </h2>
                <span className="text-xs text-stone-600">
                  {startingPicks.length}/3 {zh ? "已选" : "selected"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {you.startingOffers.map((card) => {
                  const picked = startingPicks.includes(card.id);
                  const cardStyle = picked
                    ? "border-accent bg-amber-100 ring-2 ring-amber-300"
                    : "border-border bg-white";
                  return (
                    <div key={card.id} className={"rounded-xl border p-2 " + cardStyle}>
                      <BoxCard card={card} zh={zh} compact disabled />
                      <button
                        type="button"
                        aria-pressed={picked}
                        disabled={disabled || (!picked && startingPicks.length >= 3)}
                        onClick={() =>
                          setStartingPicks((prev) =>
                            picked
                              ? prev.filter((id) => id !== card.id)
                              : [...prev, card.id],
                          )
                        }
                        className="mt-1 min-h-11 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold text-primary-dark hover:bg-amber-50 disabled:opacity-45"
                      >
                        {picked ? (zh ? "已选" : "Selected") : (zh ? "点选" : "Tap to keep")}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : view.stage === "roundDraft" && you?.roundOffers ? (
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-2 font-heading text-sm font-bold text-primary-dark">
                {zh ? "从三张幸运盒卡中选择一张" : "Choose one of the three Lucky Box cards"}
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {you.roundOffers.map((card) => (
                  <div key={card.id} className="rounded-xl border border-border bg-white p-2">
                    <BoxCard card={card} zh={zh} compact disabled />
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => send("pickRoundCard", { cardId: card.id })}
                      className="mt-1 min-h-11 w-full rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-50"
                    >
                      {zh ? "选这张" : "Choose this card"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : view.stage === "finished" ? (
            <div className="mx-auto max-w-3xl space-y-3">
              <MatchResultBar
                locale={locale}
                onRematch={onRematch}
                label={zh ? "再玩一局" : "Play again"}
              />
              <div className="grid gap-3">
                {view.players
                  .slice()
                  .sort((a, b) => b.finalScore - a.finalScore)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={[
                        "rounded-xl border p-3",
                        view.winners.includes(player.id)
                          ? "border-amber-400 bg-amber-50"
                          : "border-border bg-white",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-primary-dark">
                          {index + 1}. {nameOf?.(player.id) ?? player.name}
                        </span>
                        <strong className="font-heading text-xl text-primary">
                          {player.finalScore}
                        </strong>
                      </div>
                      <div className="mt-2">
                        <ScoreSheet player={player} round={view.round} finished zh={zh} />
                      </div>
                      {view.players.length === 1 && (
                        <p className="mt-2 rounded-lg bg-primary/5 px-2 py-1.5 text-xs font-bold text-primary-dark">
                          {zh ? "单人评价：" : "Solo rating: "}
                          {soloRatingLabel(player.finalScore, zh)}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl">
              {view.stage === "number" && (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary/50 bg-white font-heading text-2xl font-black text-primary-dark">
                      {view.currentNumber}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-primary-dark">
                        {zh ? "本轮数字" : "Number this turn"}
                      </p>
                      <p className="text-[11px] text-stone-600">
                        {zh ? "已翻开" : "Revealed"}: {view.revealedNumbers.join(" · ")}
                      </p>
                    </div>
                  </div>
                  {!you?.numberDone && (
                    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-white px-2 py-1.5">
                      <span className="mr-1 text-[11px] font-semibold text-stone-600">
                        {zh ? "闪电调整" : "Adjust"}
                      </span>
                      <button
                        type="button"
                        aria-label={zh ? "数字减一" : "Shift down one"}
                        disabled={disabled || adjustments.length >= (you?.lightning ?? 0)}
                        onClick={() => setAdjustments((prev) => [...prev, -1])}
                        className="min-h-11 min-w-11 rounded-lg border border-border bg-white text-lg font-bold text-primary-dark hover:bg-amber-50 disabled:opacity-40"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        aria-label={zh ? "数字加一" : "Shift up one"}
                        disabled={disabled || adjustments.length >= (you?.lightning ?? 0)}
                        onClick={() => setAdjustments((prev) => [...prev, 1])}
                        className="min-h-11 min-w-11 rounded-lg border border-border bg-white text-lg font-bold text-primary-dark hover:bg-amber-50 disabled:opacity-40"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        disabled={disabled || adjustments.length === 0}
                        onClick={() => setAdjustments([])}
                        className="min-h-11 rounded-lg border border-border px-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                      >
                        {zh ? "重置" : "Reset"}
                      </button>
                      <span className="min-w-16 text-center text-xs text-primary-dark">
                        {view.currentNumber}
                        {adjustments.length
                          ? " → " + effectiveNumber + " (" + adjustments.length + " L)"
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {view.stage === "number" && you?.numberDone && pending.length > 0 && (
                <div className="mb-2 rounded-xl border border-amber-300 bg-amber-50 p-2">
                  <p className="mb-1 text-xs font-bold text-primary-dark">
                    {zh
                      ? "奖励可按任意顺序结算；新完成的行列会加入队列。"
                      : "Resolve bonuses in any order. Newly completed lines join this queue."}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pending.map((bonus) => (
                      <button
                        key={bonus.id}
                        type="button"
                        aria-pressed={selectedBonusId === bonus.id}
                        onClick={() => selectBonus(bonus)}
                        disabled={disabled}
                        className={[
                          "flex min-h-11 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold",
                          selectedBonusId === bonus.id
                            ? "border-amber-500 bg-amber-200 text-primary-dark"
                            : "border-amber-200 bg-white text-primary-dark",
                        ].join(" ")}
                      >
                        <RewardMark reward={bonus.reward} />
                        {zh
                          ? (bonus.line === "row" ? "横行 " : "竖列 ") + (bonus.index + 1)
                          : (bonus.line === "row" ? "Row " : "Column ") + (bonus.index + 1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {view.stage === "number" && you?.numberDone && pending.length === 0 && (
                <p className="mb-2 rounded-lg bg-white/75 px-2 py-1.5 text-xs text-stone-600">
                  {zh ? "你已完成本张数字牌的选择。" : "You have completed this number card."}
                </p>
              )}

              {ownCards.length ? (
                <PlayHorizontalRail
                  data-testid="smlb-own-cards"
                  aria-label={zh ? "你的幸运盒卡" : "Your Lucky Box cards"}
                  className="pb-2"
                >
                  {ownCards.map((card) => {
                    const selectForBonus = Boolean(
                      selectedBonus &&
                        (selectedBonus.reward.kind === "number" ||
                          selectedBonus.reward.kind === "wild"),
                    );
                    return (
                      <BoxCard
                        key={card.id}
                        card={card}
                        zh={zh}
                        pendingBonuses={pending}
                        selectedBonusId={selectedBonusId}
                        onSelectBonus={selectBonus}
                        disabled={Boolean(disabled)}
                        canSelectCell={(cellIndex) => {
                          if (selectForBonus && targetPredicate) {
                            return (
                              !card.marked?.[cellIndex] &&
                              targetPredicate(card.grid[cellIndex]!)
                            );
                          }
                          return canSelectNumberCell(card, cellIndex);
                        }}
                        onSelectCell={(cellIndex) => {
                          if (selectForBonus) selectBonusCell(card.id, cellIndex);
                          else onSelectNumberCell(card, cellIndex);
                        }}
                      />
                    );
                  })}
                </PlayHorizontalRail>
              ) : (
                <p className="rounded-xl border border-dashed border-border bg-white/70 p-5 text-center text-sm text-stone-600">
                  {zh ? "你的幸运盒卡会显示在这里。" : "Your Lucky Box cards will appear here."}
                </p>
              )}

              {ownPlayer && (
                <div className="mt-3">
                  <ScoreSheet
                    player={ownPlayer}
                    round={view.round}
                    finished={false}
                    zh={zh}
                  />
                </div>
              )}

              {view.players.some((player) => player.id !== myId && player.cards.length > 0) && (
                <div className="mt-2 space-y-2">
                  <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-stone-500">
                    {zh ? "其他玩家的公开牌面" : "Other players' public cards"}
                  </h2>
                  {view.players
                    .filter((player) => player.id !== myId)
                    .map((player) => (
                      <details
                        key={player.id}
                        className="rounded-xl border border-border bg-white/80"
                      >
                        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-primary-dark">
                          <span>{nameOf?.(player.id) ?? player.name}</span>
                          <span className="text-stone-500">
                            {player.score} {zh ? "分" : "pts"} · {player.moons} ☾ · {player.cards.length}
                            {zh ? " 张卡" : " cards"}
                          </span>
                        </summary>
                        <PlayHorizontalRail
                          aria-label={(nameOf?.(player.id) ?? player.name) + (zh ? "的幸运盒卡" : "'s Lucky Box cards")}
                          className="px-2 pb-2"
                        >
                          {player.cards.map((card) => (
                            <BoxCard key={card.id} card={card} zh={zh} disabled />
                          ))}
                        </PlayHorizontalRail>
                      </details>
                    ))}
                </div>
              )}

              {view.stage === "number" &&
                !you?.numberDone &&
                !canMarkNumber &&
                currentNumber != null && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => send("skipNumber", {})}
                    className="mt-2 min-h-11 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    {zh ? "没有可达数字，跳过" : "No reachable square · Skip"}
                  </button>
                )}
              {view.stage === "number" &&
                you?.numberDone &&
                pending.length > 0 &&
                selectedBonus &&
                (selectedBonus.reward.kind === "number" ||
                  selectedBonus.reward.kind === "wild") &&
                selectedBonusTargets.length === 0 && (
                  <p className="mt-2 text-xs text-stone-600">
                    {zh ? "没有可用格；点击奖励可直接结算。" : "No open target; tap the reward to resolve it."}
                  </p>
                )}
            </div>
          )}
        </PlayScrollableRegion>

        <PlayActionDock className="shrink-0">
          {view.stage === "startingDraft" && you?.startingOffers && (
            <button
              type="button"
              disabled={disabled || startingPicks.length !== 3}
              onClick={() => send("keepStartingCards", { cardIds: startingPicks })}
              className="min-h-11 w-full rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-45"
            >
              {zh ? "保留这 3 张" : "Keep these 3 cards"}
            </button>
          )}
          {view.stage === "number" &&
            !you?.numberDone &&
            canMarkNumber && (
              <p className="px-2 py-1 text-center text-xs text-stone-600">
                {zh
                  ? "点亮高亮的格子；调整数字只影响你。"
                  : "Tap a highlighted square. Adjustments affect only you."}
              </p>
            )}
          {view.stage === "number" &&
            you?.numberDone &&
            pending.length > 0 && (
              <p className="px-2 py-1 text-center text-xs text-stone-600">
                {zh
                  ? "点选任一已解锁奖励，完成连锁后进入下一张。"
                  : "Choose any unlocked bonus; the next number appears after the chain resolves."}
              </p>
            )}
          {view.stage === "advancing" && (
            <p className="px-2 py-1 text-center text-xs text-stone-600" aria-live="polite">
              {status}
            </p>
          )}
        </PlayActionDock>
      </div>

      <PlaySideSheet
        open={sideOpen}
        onClose={() => setSideOpen(false)}
        locale={locale}
        title={zh ? "战报 / 聊天" : "Log / Chat"}
      >
        <PlayLogChatPanel
          locale={locale}
          playLog={playLog}
          chat={chat}
          onChat={onChat}
          nameOf={nameOf}
        />
        {view.luckyDiscard.length > 0 && (
          <details className="mt-3 rounded-xl border border-border bg-white p-3">
            <summary className="cursor-pointer text-xs font-semibold text-primary-dark">
              {zh ? "幸运盒弃牌堆" : "Lucky Box discard"} · {view.luckyDiscard.length}
            </summary>
            <div className="mt-2 flex flex-wrap gap-1">
              {view.luckyDiscard.map((card) => (
                <span key={card.id} className="rounded-md bg-stone-100 px-1.5 py-1 text-[10px]">
                  {card.id}
                </span>
              ))}
            </div>
          </details>
        )}
      </PlaySideSheet>
    </PlayTableShell>
  );
}
