"use client";

import { useState, useCallback, useMemo } from "react";
import type { GoTrainerConfig } from "@/lib/go/types";
import type { GoProblem, Coord } from "@/lib/go/types";
import { problems, getProblemsByDifficulty } from "@/lib/go/problems";
import {
  formatGoBoardContext,
  goTutorSuggestedPrompts,
} from "@/lib/go/boardContext";
import { ChatToggle } from "@/features/chat/ChatToggle";
import { GoBoard } from "./GoBoard";
import { TrainerStats } from "../TrainerStats";

interface Props {
  config: GoTrainerConfig;
  locale: string;
}

type Phase = "playing" | "result";

export function GoTsumegoTrainer({ config, locale }: Props) {
  const [difficulty, setDifficulty] = useState(config.difficulties[0].id);
  const [problem, setProblem] = useState<GoProblem>(() => getRandom(difficulty));
  const [playedStones, setPlayedStones] = useState<Record<string, "black" | "white">>({});
  const [phase, setPhase] = useState<Phase>("playing");
  const [lastMove, setLastMove] = useState<Coord | null>(null);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wasCorrect, setWasCorrect] = useState(true);

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
    // Correct: all solution positions must be played, no extra stones elsewhere
    const solutionKeys = new Set(problem.solution.map((s) => `${s.row},${s.col}`));
    const playedKeys = Object.keys(playedStones);
    const allSolutionPlayed = problem.solution.every(
      (sol) => playedStones[`${sol.row},${sol.col}`] === problem.turn
    );
    const noExtraStones = playedKeys.every((k) => solutionKeys.has(k));
    const isCorrect = allSolutionPlayed && noExtraStones && playedKeys.length > 0;
    setTotal((p) => p + 1);
    if (isCorrect) {
      setCorrect((p) => p + 1);
      setStreak((p) => p + 1);
      setWasCorrect(true);
    } else {
      setStreak(0);
      setWasCorrect(false);
    }
    setPhase("result");
  };

  const handleNext = () => {
    const next = getRandom(difficulty);
    setProblem(next);
    setPlayedStones({});
    setLastMove(null);
    setPhase("playing");
    setWasCorrect(true);
  };

  const handleDifficultyChange = (diff: string) => {
    setDifficulty(diff);
    const next = getRandom(diff);
    setProblem(next);
    setPlayedStones({});
    setLastMove(null);
    setPhase("playing");
    setWasCorrect(true);
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
  const turnLabel = problem.turn === "black"
    ? (locale === "zh" ? "黑先" : "Black")
    : (locale === "zh" ? "白先" : "White");

  const playedMoves = useMemo(() => {
    return Object.keys(playedStones).map((k) => {
      const [row, col] = k.split(",").map(Number);
      return { row: row!, col: col! } as Coord;
    });
  }, [playedStones]);

  const boardContext = useMemo(
    () =>
      formatGoBoardContext({
        size: problem.size,
        stones: allStones,
        turn: problem.turn,
        goal: goalText,
        phase,
        wasCorrect,
        playedMoves,
        solution: phase === "result" ? problem.solution : null,
        locale,
      }),
    [
      problem.size,
      problem.turn,
      problem.solution,
      allStones,
      goalText,
      phase,
      wasCorrect,
      playedMoves,
      locale,
    ],
  );

  const tsumegoHintPrompt =
    locale === "zh"
      ? "请根据当前棋盘，给我这道死活的思路提示（先别直接给正解）"
      : "Using the current board, give me hints for this tsumego (don’t spoil the full answer yet)";

  return (
    <div className="mx-auto max-w-md space-y-4">
      <TrainerStats correct={correct} total={total} streak={streak} locale={locale} />
      <p className="rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-xs leading-relaxed text-primary-dark">
        {locale === "zh"
          ? "右下角打开「围棋老师」：可陪聊规则、讲死活思路。老师能看到当前棋盘。"
          : "Open Go Teacher (bottom-right) for rules chat and tsumego tips — the teacher can see this board."}
      </p>

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
          ? (wasCorrect
              ? `${locale === "zh" ? "正确！" : "Correct!"}`
              : `${locale === "zh" ? "错误，绿色标记为正确答案" : "Incorrect — green marks show the answer"}`)
          : `${turnLabel}: ${goalText}`
        }
      </div>

      {/* Board */}
      <GoBoard
        size={problem.size}
        stones={allStones}
        onIntersectionClick={handleClick}
        disabled={phase === "result"}
        lastMove={lastMove}
        solutionStones={phase === "result" && !wasCorrect ? problem.solution : null}
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

      <ChatToggle
        scope={{
          type: "game",
          slug: "go",
          gameName: locale === "zh" ? "围棋" : "Go",
          boardContext,
          suggestedPrompts: [
            tsumegoHintPrompt,
            ...goTutorSuggestedPrompts(locale).slice(0, 3),
          ],
        }}
        locale={locale}
      />
    </div>
  );
}
