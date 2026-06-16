"use client";

import type { ScoreConfig } from "@/types/game";
import { useScoreState } from "@/lib/score/useScoreState";
import { CardSelector } from "./CardSelector";
import { FeatureInput } from "./FeatureInput";
import { ColorCounter } from "./ColorCounter";
import { ScoreDisplay } from "./ScoreDisplay";

interface Props {
  slug: string;
  config: ScoreConfig;
  locale: string;
}

export function ScoreTracker({ slug, config, locale }: Props) {
  const {
    session,
    loaded,
    setPlayerCount,
    updateSelection,
    currentBreakdown,
    cumulativeTotal,
    confirmRound,
    getTarget,
    reset,
    roundEndMode,
    setRoundEndMode,
  } = useScoreState(slug, config);

  if (!loaded || !session) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-accent" />
      </div>
    );
  }

  const target = getTarget();
  const allCards = config.cards
    ?? config.cardGroups?.flatMap((g) => g.cards)
    ?? config.cardTypes?.map((ct) => ({
      id: ct.id,
      name: ct.name,
      count: 99,
      group: ct.group,
      points: ct.value,
    }))
    ?? config.categories?.map((c) => ({
      id: c.id,
      name: c.name,
      count: c.max ?? 99,
      group: undefined,
      points: c.value,
    }))
    ?? [];

  return (
    <div className="space-y-4">
      {/* Player count selector for targetByPlayers */}
      {config.targetByPlayers && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-700">
              {locale === "zh" ? "游戏人数" : "Player Count"}
            </span>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: config.players.max - config.players.min + 1 },
                (_, i) => config.players.min + i
              ).map((n) => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                    session.playerCount === n
                      ? "bg-accent text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {target && (
            <div className="mt-2 text-xs text-stone-400">
              {locale === "zh"
                ? `${session.playerCount} 人局目标：${target} 分`
                : `Target for ${session.playerCount} players: ${target} pts`}
            </div>
          )}
        </div>
      )}

      {/* Round end mode selector (FIRST for Sea Salt style games) */}
      {config.colorDist && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">
            {locale === "zh" ? "本轮结算方式" : "Round End Mode"}
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              onClick={() => setRoundEndMode("stop")}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                roundEndMode === "stop"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-stone-200 text-stone-500 hover:bg-stone-50"
              }`}
            >
              <div className="font-semibold">{locale === "zh" ? "停止 (STOP)" : "STOP"}</div>
              <div className="mt-0.5 text-[10px] opacity-70">
                {locale === "zh" ? "所有人计算卡牌分数" : "All score card points"}
              </div>
            </button>
            <button
              onClick={() => setRoundEndMode("last-chance-win")}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                roundEndMode === "last-chance-win"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-stone-200 text-stone-500 hover:bg-stone-50"
              }`}
            >
              <div className="font-semibold">{locale === "zh" ? "最后机会 ✓" : "LAST CHANCE ✓"}</div>
              <div className="mt-0.5 text-[10px] opacity-70">
                {locale === "zh" ? "卡牌分数 + 颜色奖励" : "Cards + color bonus"}
              </div>
            </button>
            <button
              onClick={() => setRoundEndMode("last-chance-lose")}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                roundEndMode === "last-chance-lose"
                  ? "border-red-400 bg-red-50 text-red-600"
                  : "border-stone-200 text-stone-500 hover:bg-stone-50"
              }`}
            >
              <div className="font-semibold">{locale === "zh" ? "最后机会 ✗" : "LAST CHANCE ✗"}</div>
              <div className="mt-0.5 text-[10px] opacity-70">
                {locale === "zh" ? "仅颜色奖励" : "Color bonus only"}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Color distribution (for color bonus + mermaid scoring) */}
      {config.colorDist && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">
            {locale === "zh" ? "颜色分布" : "Color Distribution"}
          </h3>
          <p className="mb-3 text-xs text-stone-400">
            {locale === "zh"
              ? "填入你持有的各颜色卡牌数量，用于颜色奖励和美人鱼计分"
              : "Enter card counts per color for color bonus and mermaid scoring"}
          </p>
          <ColorCounter
            colors={config.colorDist}
            selections={session.currentSelections}
            onUpdate={updateSelection}
            locale={locale}
          />
        </div>
      )}

      {/* Card/item selector */}
      {config.features ? (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">
            {locale === "zh" ? "输入得分项" : "Enter Scoring Items"}
          </h3>
          <FeatureInput
            features={config.features}
            selections={session.currentSelections}
            onUpdate={updateSelection}
            locale={locale}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">
            {locale === "zh" ? "选择你的卡牌" : "Select Your Cards"}
          </h3>
          <CardSelector
            cards={allCards}
            selections={session.currentSelections}
            onUpdate={updateSelection}
            filters={config.filters}
            locale={locale}
          />
        </div>
      )}

      {/* Score display (result at the bottom) */}
      <ScoreDisplay
        breakdown={currentBreakdown}
        rounds={session.rounds}
        cumulativeTotal={cumulativeTotal}
        target={target}
        multiRound={config.multiRound ?? false}
        direction={config.direction}
        onConfirmRound={config.multiRound ? confirmRound : undefined}
        locale={locale}
      />

      {/* Reset */}
      <div className="flex justify-center pt-2">
        <button
          onClick={reset}
          className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          {locale === "zh" ? "重置" : "Reset"}
        </button>
      </div>
    </div>
  );
}
