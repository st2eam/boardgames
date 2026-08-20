"use client";

import { useState, useCallback, useEffect } from "react";

interface PlayerData {
  name: string;
  score: number;
  tokens: number; // unused tokens (tiebreaker)
  done: boolean;
}

interface Props {
  locale: string;
}

const STORAGE_KEY = "just-wild-score-tracker";
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;
const MAX_TOKENS = 5;

function createPlayers(count: number, zh: boolean): PlayerData[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `${zh ? "玩家" : "P"}${i + 1}`,
    score: 0,
    tokens: MAX_TOKENS,
    done: false,
  }));
}

export function JustWildScoreTracker({ locale }: Props) {
  const zh = locale === "zh";
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [playerCount, setPlayerCount] = useState(4);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PlayerData[];
        setPlayers(parsed);
        setPlayerCount(parsed.length);
      } catch {
        const p = createPlayers(4, zh);
        setPlayers(p);
      }
    } else {
      const p = createPlayers(4, zh);
      setPlayers(p);
    }
    setLoaded(true);
  }, [zh]);

  useEffect(() => {
    if (loaded && players.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    }
  }, [players, loaded]);

  const handlePlayerCountChange = useCallback(
    (count: number) => {
      const clamped = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, count));
      setPlayerCount(clamped);
      setPlayers(createPlayers(clamped, zh));
    },
    [zh]
  );

  const setScore = useCallback((idx: number, value: number) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, score: Math.max(0, value) } : p))
    );
  }, []);

  const setTokens = useCallback((idx: number, value: number) => {
    setPlayers((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, tokens: Math.max(0, Math.min(MAX_TOKENS, value)) } : p
      )
    );
  }, []);

  const toggleDone = useCallback((idx: number) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, done: !p.done } : p))
    );
  }, []);

  const resetAll = useCallback(() => {
    const p = createPlayers(playerCount, zh);
    setPlayers(p);
  }, [zh, playerCount]);

  // Determine winner
  const allDone = players.every((p) => p.done);
  const winner = allDone
    ? players.reduce((best, p) => {
        if (p.score > best.score) return p;
        if (p.score === best.score && p.tokens > best.tokens) return p;
        return best;
      }, players[0])
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
      {/* Player count selector */}
      <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
        <span className="text-sm font-medium text-stone-700">
          {zh ? "玩家数" : "Players"}
        </span>
        <div className="flex gap-1">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => handlePlayerCountChange(n)}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                playerCount === n
                  ? "bg-accent text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* How to score hint */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        {zh
          ? "每位玩家打出最后一张牌后，计数桌面上自己物种的可见半面卡牌数量，填入得分。平局时比较剩余指示物数量。"
          : "When a player plays their last card, count their visible half-cards on the table. Enter that as their score. Tiebreaker: most unused tokens."}
      </div>

      {/* Player cards */}
      <div className="space-y-3">
        {players.map((p, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 transition-colors ${
              p.done
                ? "border-green-200 bg-green-50/50"
                : "border-stone-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Player name */}
              <input
                value={p.name}
                onChange={(e) =>
                  setPlayers((prev) =>
                    prev.map((pl, idx) =>
                      idx === i ? { ...pl, name: e.target.value } : pl
                    )
                  )
                }
                className="w-20 min-w-0 rounded-lg border border-stone-200 px-2 py-1.5 text-center text-sm font-medium text-stone-700 focus:border-accent focus:outline-none"
              />

              {/* Score input */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">
                  {zh ? "得分" : "Score"}
                </span>
                <button
                  onClick={() => setScore(i, p.score - 1)}
                  disabled={p.score <= 0}
                  className="h-8 w-8 rounded-lg bg-stone-100 text-sm font-medium text-stone-500 hover:bg-stone-200 disabled:opacity-30 transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center text-xl font-bold tabular-nums text-stone-800">
                  {p.score}
                </span>
                <button
                  onClick={() => setScore(i, p.score + 1)}
                  className="h-8 w-8 rounded-lg bg-stone-100 text-sm font-medium text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Tokens input */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-stone-400">
                  {zh ? "剩余指示物" : "Tokens left"}
                </span>
                <button
                  onClick={() => setTokens(i, p.tokens - 1)}
                  disabled={p.tokens <= 0}
                  className="h-7 w-7 rounded-lg bg-stone-100 text-xs font-medium text-stone-400 hover:bg-stone-200 disabled:opacity-30 transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold tabular-nums text-stone-600">
                  {p.tokens}
                </span>
                <button
                  onClick={() => setTokens(i, p.tokens + 1)}
                  disabled={p.tokens >= MAX_TOKENS}
                  className="h-7 w-7 rounded-lg bg-stone-100 text-xs font-medium text-stone-400 hover:bg-stone-200 disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Done toggle */}
              <button
                onClick={() => toggleDone(i)}
                className={`ml-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  p.done
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                }`}
              >
                {p.done ? (zh ? "已确认" : "Done ✓") : (zh ? "确认" : "Confirm")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Winner banner */}
      {allDone && winner && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
          <div className="text-lg font-bold text-amber-700">
            🏆 {winner.name} {zh ? "获胜！" : "Wins!"}
          </div>
          <div className="text-sm text-amber-600 mt-1">
            {zh
              ? `${winner.score} 分，剩余 ${winner.tokens} 个指示物`
              : `${winner.score} pts, ${winner.tokens} tokens remaining`}
          </div>
          {/* Show if won by tiebreaker */}
          {players.filter((p) => p.score === winner.score).length > 1 && (
            <div className="text-xs text-amber-500 mt-1">
              {zh ? "（平局，指示物更多者获胜）" : "(tiebreaker: most unused tokens)"}
            </div>
          )}
        </div>
      )}

      {/* Reset */}
      <div className="flex justify-center pt-2">
        <button
          onClick={resetAll}
          className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          {zh ? "重置" : "Reset"}
        </button>
      </div>
    </div>
  );
}
