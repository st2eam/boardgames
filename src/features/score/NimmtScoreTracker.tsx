"use client";

import { useState, useCallback, useEffect } from "react";
import { normalizeNumericInput } from "@/lib/score/numberInput";

interface PlayerData {
  name: string;
  rounds: number[];
}

interface Props {
  locale: string;
}

const STORAGE_KEY = "nimmt-score-tracker";
const TARGET = 66;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

function getTotal(player: PlayerData): number {
  return player.rounds.reduce((sum, r) => sum + r, 0);
}

export function NimmtScoreTracker({ locale }: Props) {
  const zh = locale === "zh";
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [inputs, setInputs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [playerCount, setPlayerCount] = useState(4);
  const [roundError, setRoundError] = useState("");

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
        setInputs(Array(parsed.length).fill(""));
      } catch {
        const p = createPlayers(4);
        setPlayers(p);
        setInputs(Array(4).fill(""));
      }
    } else {
      const p = createPlayers(4);
      setPlayers(p);
      setInputs(Array(4).fill(""));
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
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
      setInputs(Array(clamped).fill(""));
    },
    [zh]
  );

  const addRound = useCallback(() => {
    const scores = inputs.map((v) => {
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    });
    if (scores.every((s) => s === 0)) {
      setRoundError(zh ? "至少一位玩家需要有得分" : "At least one player must have a score");
      return;
    }

    setRoundError("");
    setPlayers((prev) =>
      prev.map((p, i) => ({
        ...p,
        rounds: [...p.rounds, scores[i]],
      }))
    );
    setInputs(Array(playerCount).fill(""));
  }, [inputs, playerCount, zh]);

  const resetAll = useCallback(() => {
    const p = createPlayers(playerCount);
    setPlayers(p);
    setInputs(Array(playerCount).fill(""));
  }, [zh, playerCount]);

  const gameOver = players.some((p) => getTotal(p) >= TARGET);
  const winner = gameOver
    ? players.reduce((best, p) => (getTotal(p) < getTotal(best) ? p : best), players[0])
    : null;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-accent" />
      </div>
    );
  }

  const playerOptions = Array.from(
    { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
    (_, i) => MIN_PLAYERS + i
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
        <span className="text-sm font-medium text-stone-700">
          {zh ? "玩家数" : "Players"}
        </span>
        <div className="flex flex-wrap gap-1">
          {playerOptions.map((n) => (
            <button
              key={n}
              onClick={() => handlePlayerCountChange(n)}
              disabled={players[0]?.rounds.length > 0}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                playerCount === n
                  ? "bg-accent text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              } ${players[0]?.rounds.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-stone-400">
          {zh ? `目标 ${TARGET} 分 · 最低分获胜` : `Target ${TARGET} · lowest wins`}
        </span>
        {players[0]?.rounds.length > 0 && (
          <span className="text-[10px] text-stone-400">
            {zh ? "重置后可修改人数" : "Reset to change"}
          </span>
        )}
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${playerCount}, minmax(0, 1fr))` }}>
        {players.map((p, i) => (
          <input
            key={i}
            value={p.name}
            onChange={(e) =>
              setPlayers((prev) =>
                prev.map((pl, idx) => (idx === i ? { ...pl, name: e.target.value } : pl))
              )
            }
            className="min-w-0 rounded-lg border border-stone-200 bg-white px-1.5 py-1.5 text-center text-sm font-medium text-stone-700 focus:border-accent focus:outline-none"
          />
        ))}
      </div>

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
                  className="max-w-[80px] truncate px-2 py-2 text-center text-xs font-medium text-stone-500"
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players[0]?.rounds.map((_, roundIdx) => (
              <tr key={roundIdx} className="border-b border-stone-50">
                <td className="px-3 py-1.5 text-xs text-stone-400">R{roundIdx + 1}</td>
                {players.map((p, pIdx) => {
                  const cumulative = p.rounds
                    .slice(0, roundIdx + 1)
                    .reduce((s, r) => s + r, 0);
                  const roundVal = p.rounds[roundIdx];
                  return (
                    <td key={pIdx} className="px-2 py-1.5 text-center tabular-nums">
                      <span className="text-xs text-stone-600">+{roundVal}</span>
                      <span className="ml-1 text-xs font-semibold text-stone-800">
                        ({cumulative})
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${playerCount}, minmax(0, 1fr))` }}>
        {players.map((p, i) => {
          const total = getTotal(p);
          const isWinner = winner === p;
          return (
            <div
              key={i}
              className={`rounded-xl border p-3 text-center ${
                isWinner
                  ? "border-amber-300 bg-amber-50"
                  : total >= TARGET
                    ? "border-red-200 bg-red-50"
                    : "border-stone-200 bg-white"
              }`}
            >
              <div
                className={`text-2xl font-bold tabular-nums ${
                  isWinner
                    ? "text-amber-600"
                    : total >= TARGET
                      ? "text-red-500"
                      : "text-stone-800"
                }`}
              >
                {total}
              </div>
              <div className="mt-0.5 text-[10px] text-stone-400">
                {zh ? "累计" : "Total"}
              </div>
            </div>
          );
        })}
      </div>

      {gameOver && winner && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
          <div className="text-lg font-bold text-amber-700">
            🏆 {winner.name} {zh ? "获胜！" : "Wins!"}
          </div>
          <div className="mt-1 text-sm text-amber-600">
            {zh
              ? `最低分 ${getTotal(winner)} 分（有人达到 ${TARGET}+）`
              : `Lowest score: ${getTotal(winner)} (someone hit ${TARGET}+)`}
          </div>
        </div>
      )}

      {!gameOver && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">
            {zh ? "输入本轮牛头数" : "Enter Round Bullheads"}
          </h3>
          <div
            className="mb-3 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${playerCount}, minmax(0, 1fr))` }}
          >
            {players.map((p, i) => (
              <div key={i} className="min-w-0 text-center">
                <div className="mb-1 truncate text-[10px] text-stone-400">{p.name}</div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={inputs[i]}
                  onChange={(e) => {
                    const value = normalizeNumericInput(e.target.value);
                    setInputs((prev) => prev.map((v, idx) => (idx === i ? value : v)));
                    setRoundError("");
                  }}
                  placeholder="0"
                  className="w-full min-w-0 rounded-lg border border-stone-200 px-1.5 py-2 text-center text-sm tabular-nums text-stone-800 focus:border-accent focus:outline-none"
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
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            {zh ? "确认回合" : "Confirm Round"}
          </button>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          onClick={resetAll}
          className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          {zh ? "重置游戏" : "Reset Game"}
        </button>
      </div>
    </div>
  );
}
