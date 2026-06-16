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
  target: number | null;
  locale: string;
}

export function CumulativeTracker({
  players,
  config,
  currentRound,
  onAddRoundScore,
  onNextRound,
  getTotal,
  target,
  locale,
}: Props) {
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const unit = config.unit?.[locale as "en" | "zh"] ?? "";
  const isLowWins = config.direction === "low-wins";
  const allFilled = players.every(
    (p) => (p.roundScores?.length ?? 0) >= currentRound
  );

  const handleSubmit = (pi: number) => {
    const val = parseFloat(inputs[pi] ?? "0");
    if (isNaN(val)) return;
    onAddRoundScore(pi, val);
    setInputs((prev) => ({ ...prev, [pi]: "" }));
  };

  const sorted = players
    .map((p, i) => ({ ...p, index: i, total: getTotal(i) }))
    .sort((a, b) => (isLowWins ? a.total - b.total : b.total - a.total));

  const leader = sorted[0];
  const gameOver = target
    ? isLowWins
      ? sorted.some((p) => p.total >= target)
      : sorted.some((p) => p.total >= target)
    : false;

  return (
    <div className="space-y-4">
      {/* Leaderboard */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            {locale === "zh" ? "排行榜" : "Leaderboard"}
          </span>
          <span className="text-xs text-stone-400">
            {locale === "zh" ? `第 ${currentRound} 轮` : `Round ${currentRound}`}
          </span>
        </div>
        <div className="space-y-1.5">
          {sorted.map((p, rank) => {
            const isLeader = rank === 0;
            const hitTarget = target
              ? isLowWins ? p.total >= target : p.total >= target
              : false;
            return (
              <div
                key={p.index}
                className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  isLeader ? "bg-amber-50 border border-amber-200" : "bg-stone-50"
                } ${hitTarget && isLowWins ? "border border-red-200 bg-red-50" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-xs font-bold text-stone-400">
                    #{rank + 1}
                  </span>
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-sm font-medium text-stone-700">{p.name}</span>
                  {isLeader && !gameOver && <span className="text-xs">👑</span>}
                  {hitTarget && isLowWins && <span className="text-xs">💀</span>}
                  {hitTarget && !isLowWins && <span className="text-xs">🏆</span>}
                </div>
                <span
                  className="text-lg font-bold tabular-nums"
                  style={{ color: p.color }}
                >
                  {p.total} {unit}
                </span>
              </div>
            );
          })}
        </div>
        {target && (
          <div className="mt-2 text-center text-xs text-stone-400">
            {isLowWins
              ? locale === "zh" ? `达到 ${target} ${unit} 时出局` : `Eliminated at ${target} ${unit}`
              : locale === "zh" ? `目标：${target} ${unit}` : `Target: ${target} ${unit}`}
          </div>
        )}
      </div>

      {/* Round Input */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-700">
            {locale === "zh" ? `第 ${currentRound} 轮得分` : `Round ${currentRound} Scores`}
          </h3>
          <button
            onClick={onNextRound}
            disabled={!allFilled}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {locale === "zh" ? "下一轮" : "Next Round"}
          </button>
        </div>
        <div className="space-y-2">
          {players.map((player, pi) => {
            const hasCurrent = (player.roundScores?.length ?? 0) >= currentRound;
            return (
              <div key={pi} className="flex items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="w-16 text-sm font-medium text-stone-700 truncate">
                  {player.name}
                </span>
                {hasCurrent ? (
                  <span className="text-sm text-stone-500 tabular-nums">
                    +{player.roundScores![currentRound - 1]}
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={inputs[pi] ?? ""}
                      onChange={(e) =>
                        setInputs((prev) => ({ ...prev, [pi]: e.target.value }))
                      }
                      placeholder="0"
                      className="w-20 rounded-lg border border-stone-200 px-2.5 py-1 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit(pi);
                      }}
                    />
                    <button
                      onClick={() => handleSubmit(pi)}
                      className="rounded-md bg-stone-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-stone-700 transition-colors"
                    >
                      ✓
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      {currentRound > 1 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-2 text-xs font-medium text-stone-500 uppercase tracking-wide">
            {locale === "zh" ? "历史记录" : "History"}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="py-1 pr-3 text-left font-medium text-stone-500">
                    {locale === "zh" ? "回合" : "Round"}
                  </th>
                  {players.map((p, i) => (
                    <th key={i} className="py-1 px-2 text-center font-medium" style={{ color: p.color }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: currentRound - 1 }, (_, ri) => (
                  <tr key={ri} className="border-b border-stone-50">
                    <td className="py-1 pr-3 text-stone-400">R{ri + 1}</td>
                    {players.map((p, pi) => (
                      <td key={pi} className="py-1 px-2 text-center tabular-nums text-stone-600">
                        {p.roundScores?.[ri] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
