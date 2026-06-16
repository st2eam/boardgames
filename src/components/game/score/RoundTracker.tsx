"use client";

import { useState } from "react";
import type { ScoreConfig } from "@/types/game";
import type { PlayerScore } from "@/lib/score/score-storage";

interface Props {
  players: PlayerScore[];
  config: ScoreConfig;
  currentRound: number;
  onAddRoundScore: (playerIndex: number, score: number) => void;
  onNextRound: () => void;
  getTotal: (playerIndex: number) => number;
  locale: string;
}

export function RoundTracker({
  players,
  config,
  currentRound,
  onAddRoundScore,
  onNextRound,
  getTotal,
  locale,
}: Props) {
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const maxRounds = config.rounds ?? Infinity;
  const unit = config.unit?.[locale as "en" | "zh"] ?? "";
  const allFilled = players.every(
    (p) => (p.roundScores?.length ?? 0) >= currentRound
  );

  const handleSubmitRound = (playerIndex: number) => {
    const val = parseFloat(inputs[playerIndex] ?? "0");
    if (isNaN(val)) return;
    onAddRoundScore(playerIndex, val);
    setInputs((prev) => ({ ...prev, [playerIndex]: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4">
        <div>
          <span className="text-xs text-stone-500">
            {locale === "zh" ? "当前回合" : "Current Round"}
          </span>
          <div className="text-2xl font-bold text-stone-800">
            {currentRound}
            {maxRounds !== Infinity && (
              <span className="text-sm font-normal text-stone-400"> / {maxRounds}</span>
            )}
          </div>
        </div>
        <button
          onClick={onNextRound}
          disabled={!allFilled || currentRound >= maxRounds}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {locale === "zh" ? "下一轮" : "Next Round"}
        </button>
      </div>

      {players.map((player, pi) => {
        const total = getTotal(pi);
        const hasThisRound = (player.roundScores?.length ?? 0) >= currentRound;

        return (
          <div key={pi} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="text-sm font-semibold text-stone-800">
                  {player.name}
                </span>
              </div>
              <span className="text-xl font-bold tabular-nums" style={{ color: player.color }}>
                {total} {unit}
              </span>
            </div>

            {(player.roundScores?.length ?? 0) > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {player.roundScores!.map((s, ri) => (
                  <span
                    key={ri}
                    className="rounded-md bg-stone-100 px-2 py-0.5 text-xs tabular-nums text-stone-600"
                  >
                    R{ri + 1}: {s >= 0 ? "+" : ""}{s}
                  </span>
                ))}
              </div>
            )}

            {!hasThisRound && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inputs[pi] ?? ""}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [pi]: e.target.value }))
                  }
                  placeholder={`R${currentRound} ${locale === "zh" ? "得分" : "score"}`}
                  className="w-28 rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmitRound(pi);
                  }}
                />
                <button
                  onClick={() => handleSubmitRound(pi)}
                  className="rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700 transition-colors"
                >
                  {locale === "zh" ? "确认" : "Confirm"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
