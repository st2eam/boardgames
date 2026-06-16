"use client";

import type { ScoreBreakdown } from "@/lib/score/engines/types";
import type { RoundRecord } from "@/lib/score/score-storage";

interface Props {
  breakdown: ScoreBreakdown;
  rounds: RoundRecord[];
  cumulativeTotal: number;
  target: number | null;
  multiRound: boolean;
  direction: "high-wins" | "low-wins";
  onConfirmRound?: () => void;
  locale: string;
}

export function ScoreDisplay({
  breakdown,
  rounds,
  cumulativeTotal,
  target,
  multiRound,
  direction,
  onConfirmRound,
  locale,
}: Props) {
  const lang = locale as "en" | "zh";
  const displayTotal = multiRound ? cumulativeTotal : breakdown.total;
  const isGameOver = target
    ? direction === "low-wins"
      ? displayTotal >= target
      : displayTotal >= target
    : false;

  return (
    <div className="space-y-3">
      {/* Current round score */}
      <div className={`rounded-xl border p-4 ${isGameOver ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-white"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            {multiRound
              ? locale === "zh" ? "本轮得分" : "This Round"
              : locale === "zh" ? "得分" : "Score"}
          </span>
          {multiRound && onConfirmRound && breakdown.total > 0 && (
            <button
              onClick={onConfirmRound}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 transition-colors"
            >
              {locale === "zh" ? "确认本轮" : "Confirm Round"}
            </button>
          )}
        </div>
        <div className="text-3xl font-bold tabular-nums text-stone-800">
          {breakdown.total}
          {target && !multiRound && (
            <span className="text-sm font-normal text-stone-400 ml-1">/ {target}</span>
          )}
        </div>
        {breakdown.details.length > 0 && (
          <div className="mt-3 space-y-1">
            {breakdown.details.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-stone-500">{d.label[lang]}</span>
                <span className="font-medium tabular-nums text-stone-700">+{d.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Multi-round: cumulative total + history */}
      {multiRound && rounds.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              {locale === "zh" ? "累计总分" : "Total Score"}
            </span>
            <div>
              <span className="text-2xl font-bold tabular-nums text-stone-800">
                {cumulativeTotal}
              </span>
              {target && (
                <span className="text-sm text-stone-400 ml-1">/ {target}</span>
              )}
            </div>
          </div>
          {target && (
            <div className="mb-3 h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${Math.min((cumulativeTotal / target) * 100, 100)}%` }}
              />
            </div>
          )}
          <div className="space-y-1">
            {rounds.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-stone-400">
                  {locale === "zh" ? `第 ${i + 1} 轮` : `Round ${i + 1}`}
                </span>
                <span className="font-medium tabular-nums text-stone-600">+{r.score}</span>
              </div>
            ))}
          </div>
          {isGameOver && (
            <div className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-center text-sm font-medium text-amber-800">
              {direction === "high-wins"
                ? locale === "zh" ? "已达目标分！游戏结束" : "Target reached! Game over"
                : locale === "zh" ? "已超出限制！出局" : "Limit exceeded! Eliminated"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
