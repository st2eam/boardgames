"use client";

import type { ScoreConfig } from "@/types/game";
import { useScoreState } from "@/lib/score/useScoreState";
import { PlayerSetup } from "./PlayerSetup";
import { VPTracker } from "./VPTracker";
import { RoundTracker } from "./RoundTracker";
import { CumulativeTracker } from "./CumulativeTracker";
import { useTranslations } from "next-intl";

interface Props {
  slug: string;
  config: ScoreConfig;
  locale: string;
}

export function ScoreTracker({ slug, config, locale }: Props) {
  const t = useTranslations("score");
  const {
    session,
    loaded,
    addPlayer,
    removePlayer,
    renamePlayer,
    updateCategoryScore,
    addRoundScore,
    nextRound,
    reset,
    getPlayerTotal,
    getTarget,
  } = useScoreState(slug, config);

  if (!loaded || !session) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-accent" />
      </div>
    );
  }

  const target = getTarget(session.players.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PlayerSetup
          players={session.players}
          config={config}
          onAdd={addPlayer}
          onRemove={removePlayer}
          onRename={renamePlayer}
          t={t}
        />
      </div>

      <TrackerStrategy
        type={config.type}
        players={session.players}
        config={config}
        currentRound={session.currentRound}
        onUpdate={updateCategoryScore}
        onAddRoundScore={addRoundScore}
        onNextRound={nextRound}
        getTotal={getPlayerTotal}
        target={target}
        locale={locale}
      />

      <div className="flex justify-center pt-2">
        <button
          onClick={reset}
          className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          {t("resetAll")}
        </button>
      </div>
    </div>
  );
}

interface StrategyProps {
  type: ScoreConfig["type"];
  players: import("@/lib/score/score-storage").PlayerScore[];
  config: ScoreConfig;
  currentRound: number;
  onUpdate: (playerIndex: number, categoryId: string, delta: number) => void;
  onAddRoundScore: (playerIndex: number, score: number) => void;
  onNextRound: () => void;
  getTotal: (playerIndex: number) => number;
  target: number | null;
  locale: string;
}

function TrackerStrategy({ type, ...props }: StrategyProps) {
  switch (type) {
    case "victory-points":
      return (
        <VPTracker
          players={props.players}
          config={props.config}
          onUpdate={props.onUpdate}
          getTotal={props.getTotal}
          target={props.target}
          locale={props.locale}
        />
      );
    case "rounds":
      return (
        <RoundTracker
          players={props.players}
          config={props.config}
          currentRound={props.currentRound}
          onAddRoundScore={props.onAddRoundScore}
          onNextRound={props.onNextRound}
          getTotal={props.getTotal}
          locale={props.locale}
        />
      );
    case "cumulative":
      return (
        <CumulativeTracker
          players={props.players}
          config={props.config}
          currentRound={props.currentRound}
          onAddRoundScore={props.onAddRoundScore}
          onNextRound={props.onNextRound}
          getTotal={props.getTotal}
          target={props.target}
          locale={props.locale}
        />
      );
    default:
      return null;
  }
}
