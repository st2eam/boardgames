"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { GoTrainerConfig } from "@/lib/go/types";
import type { GoProblem, Coord } from "@/lib/go/types";
import { problems, getProblemsByDifficulty } from "@/lib/go/problems";
import { GoBoard } from "./GoBoard";
import { TrainerStats } from "../TrainerStats";

interface Props {
  config: GoTrainerConfig;
  locale: string;
}

type Phase = "playing" | "result";

export function GoTsumegoTrainer({ config, locale }: Props) {
  const t = useTranslations("game");
  const [difficulty, setDifficulty] = useState(config.difficulties[0].id);
  const [problem, setProblem] = useState<GoProblem>(() => getRandom(difficulty));
  const [playedStones, setPlayedStones] = useState<Record<string, "black" | "white">>({});
  const [phase, setPhase] = useState<Phase>("playing");
  const [lastMove, setLastMove] = useState<Coord | null>(null);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  function getRandom(diff: string): GoProblem {
    const pool = getProblemsByDifficulty(diff);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const allStones = { ...problem.setup, ...playedStones };

  const handleClick = useCallback(
    (c: Coord) => {
      if (phase === "result") return;
      const k = `${c.row},${c.col}`;
      if (allStones[k]) return; // occupied
      setPlayedStones((prev) => ({ ...prev, [k]: problem.turn }));
      setLastMove(c);
    },
    [phase, allStones, problem.turn]
  );

  const handleCheck = () => {
    const isCorrect = problem.solution.some(
      (sol) =>
        playedStones[`${sol.row},${sol.col}`] === problem.turn
    );
    setTotal((p) => p + 1);
    if (isCorrect) {
      setCorrect((p) => p + 1);
      setStreak((p) => p + 1);
    } else {
      setStreak(0);
    }
    setPhase("result");
  };

  const handleNext = () => {
    const next = getRandom(difficulty);
    setProblem(next);
    setPlayedStones({});
    setLastMove(null);
    setPhase("playing");
  };

  const handleDifficultyChange = (diff: string) => {
    setDifficulty(diff);
    const next = getRandom(diff);
    setProblem(next);
    setPlayedStones({});
    setLastMove(null);
    setPhase("playing");
  };

  const handleUndo = () => {
    setPlayedStones((prev) => {
      const next = { ...prev };
      if (lastMove) {
        delete next[`${lastMove.row},${lastMove.col}`];
      }
      return next;
    });
    setLastMove(null);
  };

  const goalText = problem.goal[locale as "en" | "zh"] ?? problem.goal.en;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <TrainerStats correct={correct} total={total} streak={streak} locale={locale} />

      {/* Difficulty selector */}
      <div className="flex gap-1.5 flex-wrap">
        {config.difficulties.map((d) => (
          <button
            key={d.id}
            onClick={() => handleDifficultyChange(d.id)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              difficulty === d.id
                ? "bg-primary text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {d.name[locale as "en" | "zh"] ?? d.name.en}
          </button>
        ))}
      </div>

      {/* Goal */}
      <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
        phase === "result"
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-amber-50 text-amber-800 border border-amber-200"
      }`}>
        {phase === "result"
          ? (streak > 0
              ? `${locale === "zh" ? "正确！" : "Correct!"} ${goalText}`
              : `${locale === "zh" ? "错误，答案是：" : "Incorrect. Answer:"} ${problem.solution.map((s) => String.fromCharCode(65 + s.col) + (problem.size - s.row)).join(", ")}`)
          : `${locale === "zh" ? "黑方" : "Black"}: ${goalText}`
        }
      </div>

      {/* Board */}
      <GoBoard
        size={problem.size}
        stones={allStones}
        onIntersectionClick={handleClick}
        disabled={phase === "result"}
        lastMove={lastMove}
      />

      {/* Controls */}
      <div className="flex gap-2">
        {phase === "playing" ? (
          <>
            <button
              onClick={handleUndo}
              disabled={Object.keys(playedStones).length === 0}
              className="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-default transition-colors"
            >
              {locale === "zh" ? "撤销" : "Undo"}
            </button>
            <button
              onClick={handleCheck}
              disabled={Object.keys(playedStones).length === 0}
              className="cursor-pointer flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-default transition-colors"
            >
              {locale === "zh" ? "检查答案" : "Check"}
            </button>
          </>
        ) : (
          <button
            onClick={handleNext}
            className="cursor-pointer flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            {locale === "zh" ? "下一题" : "Next Problem"}
          </button>
        )}
      </div>
    </div>
  );
}
