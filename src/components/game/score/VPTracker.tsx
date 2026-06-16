"use client";

import type { ScoreConfig } from "@/types/game";
import type { PlayerScore } from "@/lib/score/score-storage";

interface Props {
  players: PlayerScore[];
  config: ScoreConfig;
  onUpdate: (playerIndex: number, categoryId: string, delta: number) => void;
  getTotal: (playerIndex: number) => number;
  target: number | null;
  locale: string;
}

export function VPTracker({ players, config, onUpdate, getTotal, target, locale }: Props) {
  const categories = config.categories ?? [];
  const lang = locale as "en" | "zh";

  return (
    <div className="space-y-3">
      {players.map((player, pi) => {
        const total = getTotal(pi);
        const progress = target ? Math.min((total / target) * 100, 100) : 0;
        const isWinner = target ? total >= target : false;

        return (
          <div
            key={pi}
            className={`rounded-xl border p-4 transition-all ${
              isWinner
                ? "border-amber-300 bg-amber-50 shadow-md shadow-amber-100"
                : "border-stone-200 bg-white"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="text-sm font-semibold text-stone-800">
                  {player.name}
                </span>
                {isWinner && <span className="text-xs">🏆</span>}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold tabular-nums" style={{ color: player.color }}>
                  {total}
                </span>
                {target && (
                  <span className="text-xs text-stone-400 ml-1">/ {target}</span>
                )}
              </div>
            </div>

            {target && (
              <div className="mb-3 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: player.color }}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((cat) => {
                const count = player.scores[cat.id] ?? 0;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg bg-stone-50 px-2.5 py-1.5"
                  >
                    <div className="min-w-0">
                      <span className="text-[11px] text-stone-500 truncate block">
                        {cat.name[lang]}
                      </span>
                      <span className="text-xs font-medium text-stone-400">
                        ×{cat.value > 0 ? "+" : ""}{cat.value}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdate(pi, cat.id, -1)}
                        disabled={count <= 0}
                        className="h-6 w-6 rounded-md bg-white border border-stone-200 text-stone-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold tabular-nums text-stone-800">
                        {count}
                      </span>
                      <button
                        onClick={() => onUpdate(pi, cat.id, 1)}
                        disabled={cat.max !== undefined && count >= cat.max}
                        className="h-6 w-6 rounded-md bg-white border border-stone-200 text-stone-500 hover:bg-green-50 hover:border-green-200 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
