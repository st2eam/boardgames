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

      {/* Score display */}
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

      {/* Color distribution (for mermaid-style scoring) */}
      {config.colorDist && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">
            {locale === "zh" ? "颜色分布（美人鱼计分用）" : "Color Distribution (for Mermaid scoring)"}
          </h3>
          <ColorCounter
            colors={config.colorDist}
            selections={session.currentSelections}
            onUpdate={updateSelection}
            locale={locale}
          />
        </div>
      )}

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
