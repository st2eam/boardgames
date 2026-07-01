"use client";

import { useState, useCallback, useEffect } from "react";

interface RoundScore {
  card: number;
  color: number;
}

interface PlayerData {
  name: string;
  rounds: RoundScore[];
}

interface Props {
  locale: string;
}

const STORAGE_KEY = "sea-salt-score-tracker";
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;
const TARGET_BY_PLAYERS: Record<number, number> = { 2: 40, 3: 35, 4: 30 };

function getTotal(player: PlayerData): number {
  return player.rounds.reduce((sum, r) => sum + r.card + r.color, 0);
}

export function SeaSaltScoreTracker({ locale }: Props) {
  const zh = locale === "zh";
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [cardInputs, setCardInputs] = useState<string[]>([]);
  const [colorInputs, setColorInputs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [playerCount, setPlayerCount] = useState(4);
  const [roundError, setRoundError] = useState("");

  const target = TARGET_BY_PLAYERS[playerCount] ?? 30;

  function createPlayers(count: number): PlayerData[] {
    return Array.from({ length: count }, (_, i) => ({
      name: `${zh ? "玩家" : "P"}${i + 1}`,
      rounds: [],
    }));
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PlayerData[];
        setPlayers(parsed);
        setPlayerCount(parsed.length);
        setCardInputs(Array(parsed.length).fill(""));
        setColorInputs(Array(parsed.length).fill(""));
      } catch {
        const p = createPlayers(4);
        setPlayers(p);
        setCardInputs(Array(4).fill(""));
        setColorInputs(Array(4).fill(""));
      }
    } else {
      const p = createPlayers(4);
      setPlayers(p);
      setCardInputs(Array(4).fill(""));
      setColorInputs(Array(4).fill(""));
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loaded && players.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    }
  }, [players, loaded]);

  const handlePlayerCountChange = useCallback(
    (count: number) => {
      const clamped = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, count));
      setPlayerCount(clamped);
      const p = createPlayers(clamped);
      setPlayers(p);
      setCardInputs(Array(clamped).fill(""));
      setColorInputs(Array(clamped).fill(""));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zh]
  );

  const addRound = useCallback(() => {
    const cards = cardInputs.map((v) => {
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    });
    const colors = colorInputs.map((v) => {
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    });

    const allZero = cards.every((c, i) => c === 0 && colors[i] === 0);
    if (allZero) {
      setRoundError(
        zh
          ? "至少一位玩家需要有得分"
          : "At least one player must have a score"
      );
      return;
    }

    setRoundError("");
    setPlayers((prev) =>
      prev.map((p, i) => ({
        ...p,
        rounds: [...p.rounds, { card: cards[i], color: colors[i] }],
      }))
    );
    setCardInputs(Array(playerCount).fill(""));
    setColorInputs(Array(playerCount).fill(""));
  }, [cardInputs, colorInputs, playerCount, zh]);

  const resetAll = useCallback(() => {
    const p = createPlayers(playerCount);
    setPlayers(p);
    setCardInputs(Array(playerCount).fill(""));
    setColorInputs(Array(playerCount).fill(""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zh, playerCount]);

  const gameOver = players.some((p) => getTotal(p) >= target);
  const winner = gameOver
    ? players.reduce((best, p) =>
        getTotal(p) > getTotal(best) ? p : best,
      players[0])
    : null;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Player count + target */}
      <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
        <span className="text-sm font-medium text-stone-700">
          {zh ? "玩家数" : "Players"}
        </span>
        <div className="flex gap-1">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => handlePlayerCountChange(n)}
              disabled={players[0]?.rounds.length > 0}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                playerCount === n
                  ? "bg-accent text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              } ${players[0]?.rounds.length > 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1">
          <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
          <span className="text-xs font-medium text-blue-600">
            {zh ? `目标 ${target} 分` : `Target: ${target}`}
          </span>
        </div>
      </div>

      {/* Player names */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${playerCount}, 1fr)` }}>
        {players.map((p, i) => (
          <input
            key={i}
            value={p.name}
            onChange={(e) =>
              setPlayers((prev) =>
                prev.map((pl, idx) =>
                  idx === i ? { ...pl, name: e.target.value } : pl
                )
              )
            }
            className="min-w-0 rounded-lg border border-stone-200 bg-white px-1.5 py-1.5 text-center text-sm font-medium text-stone-700 focus:border-accent focus:outline-none"
          />
        ))}
      </div>

      {/* Score table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="px-3 py-2 text-left text-xs font-medium text-stone-500">
                {zh ? "回合" : "Round"}
              </th>
              {players.map((p, i) => (
                <th
                  key={i}
                  className="max-w-[100px] truncate px-2 py-2 text-center text-xs font-medium text-stone-500"
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players[0]?.rounds.map((_, roundIdx) => (
              <tr key={roundIdx} className="border-b border-stone-50">
                <td className="px-3 py-1.5 text-xs text-stone-400">
                  R{roundIdx + 1}
                </td>
                {players.map((p, pIdx) => {
                  const r = p.rounds[roundIdx];
                  const cumulative = p.rounds
                    .slice(0, roundIdx + 1)
                    .reduce((s, rd) => s + rd.card + rd.color, 0);
                  const roundTotal = r.card + r.color;
                  return (
                    <td
                      key={pIdx}
                      className="px-2 py-1.5 text-center tabular-nums"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs text-stone-500">
                          {r.card}
                        </span>
                        {r.color > 0 && (
                          <span className="text-xs text-blue-500">
                            +{r.color}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400">=</span>
                        <span className="text-xs font-medium text-stone-700">
                          {roundTotal}
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold text-stone-400">
                        ({cumulative})
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {players[0]?.rounds.length === 0 && (
              <tr>
                <td
                  colSpan={playerCount + 1}
                  className="px-3 py-6 text-center text-xs text-stone-400"
                >
                  {zh ? "暂无回合记录" : "No rounds yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cumulative totals */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${playerCount}, 1fr)` }}
      >
        {players.map((p, i) => {
          const total = getTotal(p);
          const isWinner = winner === p;
          return (
            <div
              key={i}
              className={`rounded-xl border p-3 text-center ${
                isWinner
                  ? "border-amber-300 bg-amber-50"
                  : total >= target
                    ? "border-green-300 bg-green-50"
                    : "border-stone-200 bg-white"
              }`}
            >
              <div
                className={`text-2xl font-bold tabular-nums ${
                  isWinner
                    ? "text-amber-600"
                    : total >= target
                      ? "text-green-600"
                      : "text-stone-800"
                }`}
              >
                {total}
              </div>
              <div className="mt-0.5 text-[10px] text-stone-400">
                {zh ? "累计" : "Total"}
                {total >= target && !isWinner && ` ≥ ${target}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Game over banner */}
      {gameOver && winner && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
          <div className="text-lg font-bold text-amber-700">
            🏆 {winner.name} {zh ? "获胜！" : "Wins!"}
          </div>
          <div className="mt-1 text-sm text-amber-600">
            {zh
              ? `最高分 ${getTotal(winner)} 分`
              : `Highest score: ${getTotal(winner)}`}
          </div>
        </div>
      )}

      {/* Input row for new round */}
      {!gameOver && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">
            {zh ? "输入本回合得分" : "Enter Round Scores"}
          </h3>

          {/* Card scores */}
          <div className="mb-1 text-xs font-medium text-stone-500">
            {zh ? "卡牌分数" : "Card Score"}
          </div>
          <div
            className="mb-3 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${playerCount}, 1fr)` }}
          >
            {players.map((p, i) => (
              <div key={i} className="min-w-0 text-center">
                <div className="mb-1 truncate text-[10px] text-stone-400">
                  {p.name}
                </div>
                <input
                  type="number"
                  min="0"
                  value={cardInputs[i]}
                  onChange={(e) => {
                    setCardInputs((prev) =>
                      prev.map((v, idx) => (idx === i ? e.target.value : v))
                    );
                    setRoundError("");
                  }}
                  placeholder="0"
                  className="w-full min-w-0 rounded-lg border border-stone-200 px-1.5 py-2 text-center text-sm tabular-nums text-stone-800 focus:border-accent focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Color bonus */}
          <div className="mb-1 text-xs font-medium text-blue-500">
            {zh ? "颜色得分" : "Color Bonus"}
          </div>
          <div
            className="mb-3 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${playerCount}, 1fr)` }}
          >
            {players.map((p, i) => (
              <div key={i} className="min-w-0 text-center">
                <div className="mb-1 truncate text-[10px] text-stone-400">
                  {p.name}
                </div>
                <input
                  type="number"
                  min="0"
                  value={colorInputs[i]}
                  onChange={(e) => {
                    setColorInputs((prev) =>
                      prev.map((v, idx) => (idx === i ? e.target.value : v))
                    );
                    setRoundError("");
                  }}
                  placeholder="0"
                  className="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-50/30 px-1.5 py-2 text-center text-sm tabular-nums text-stone-800 focus:border-blue-400 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {roundError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {roundError}
            </div>
          )}
          <button
            onClick={addRound}
            className="w-full cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            {zh ? "确认回合" : "Confirm Round"}
          </button>
        </div>
      )}

      {/* Reset */}
      <div className="flex justify-center pt-2">
        <button
          onClick={resetAll}
          className="cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          {zh ? "重置游戏" : "Reset Game"}
        </button>
      </div>
    </div>
  );
}
