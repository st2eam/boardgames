"use client";

import { useState, useCallback, useMemo } from "react";
import type { TrainerConfig } from "@/types/game";
import { generateTenpaiHand, findWaits, getTileDef, TILE_COUNT } from "@/lib/mahjong";
import { MahjongTile } from "./MahjongTile";
import { TileSelector } from "./TileSelector";
import { TrainerStats } from "./TrainerStats";

interface TenpaiTrainerProps {
  config: TrainerConfig;
  locale: string;
}

type Phase = "answering" | "result";

export function TenpaiTrainer({ config, locale }: TenpaiTrainerProps) {
  const [difficultyIdx, setDifficultyIdx] = useState(0);
  const [hand, setHand] = useState<number[]>(() =>
    generateTenpaiHand(config.difficulties[0].handSize)
  );
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("answering");
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });

  const currentDifficulty = config.difficulties[difficultyIdx];

  const correctWaits = useMemo(() => findWaits(hand), [hand]);

  const handTiles = useMemo(() => {
    const tiles: number[] = [];
    for (let i = 0; i < TILE_COUNT; i++) {
      for (let c = 0; c < hand[i]; c++) {
        tiles.push(i);
      }
    }
    return tiles;
  }, [hand]);

  const handleSelectAnswer = useCallback(
    (tileId: number) => {
      if (phase !== "answering") return;
      setSelectedAnswers((prev) =>
        prev.includes(tileId)
          ? prev.filter((id) => id !== tileId)
          : [...prev, tileId]
      );
    },
    [phase]
  );

  const handleSubmit = useCallback(() => {
    if (selectedAnswers.length === 0) return;
    const isCorrect =
      selectedAnswers.length === correctWaits.length &&
      selectedAnswers.every((id) => correctWaits.includes(id));

    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
    setPhase("result");
  }, [selectedAnswers, correctWaits]);

  const handleNext = useCallback(() => {
    setHand(generateTenpaiHand(currentDifficulty.handSize));
    setSelectedAnswers([]);
    setPhase("answering");
  }, [currentDifficulty.handSize]);

  const handleChangeDifficulty = useCallback(
    (idx: number) => {
      setDifficultyIdx(idx);
      setHand(generateTenpaiHand(config.difficulties[idx].handSize));
      setSelectedAnswers([]);
      setPhase("answering");
    },
    [config.difficulties]
  );

  return (
    <div className="space-y-6">
      {/* Difficulty selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {locale === "zh" ? "难度：" : "Difficulty: "}
        </span>
        {config.difficulties.map((d, idx) => (
          <button
            key={d.id}
            type="button"
            onClick={() => handleChangeDifficulty(idx)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              idx === difficultyIdx
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted-foreground hover:bg-accent/10"
            }`}
          >
            {d.name[locale as "en" | "zh"] ?? d.name.en}
          </button>
        ))}
      </div>

      {/* Stats */}
      <TrainerStats {...stats} locale={locale} />

      {/* Hand display */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-2 text-sm font-medium text-muted-foreground">
          {locale === "zh" ? "当前手牌" : "Current Hand"}
          <span className="ml-2 text-xs">({handTiles.length} {locale === "zh" ? "张" : "tiles"})</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {handTiles.map((tileId, idx) => (
            <MahjongTile key={`${tileId}-${idx}`} tileId={tileId} size="md" disabled />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 text-sm font-medium text-primary-dark">
          {locale === "zh"
            ? "这手牌听什么？点击选择所有可能的听牌："
            : "What tiles complete this hand? Select all possible waits:"}
        </div>

        <TileSelector
          onSelect={handleSelectAnswer}
          selectedTiles={selectedAnswers}
          locale={locale}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {phase === "answering" ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedAnswers.length === 0}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locale === "zh" ? "提交答案" : "Submit Answer"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            {locale === "zh" ? "下一题" : "Next Question"}
          </button>
        )}
      </div>

      {/* Result feedback */}
      {phase === "result" && (
        <div className="rounded-xl border p-4 space-y-3">
          {selectedAnswers.length === correctWaits.length &&
          selectedAnswers.every((id) => correctWaits.includes(id)) ? (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {locale === "zh" ? "回答正确！" : "Correct!"}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500 font-medium">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {locale === "zh" ? "回答错误" : "Incorrect"}
            </div>
          )}

          <div>
            <div className="text-sm text-muted-foreground mb-1.5">
              {locale === "zh" ? "正确答案：" : "Correct answer: "}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {correctWaits.map((tileId) => (
                <MahjongTile key={tileId} tileId={tileId} size="sm" highlight disabled />
              ))}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {correctWaits.map((id) => getTileDef(id).name[locale === "zh" ? "zh" : "en"]).join("、")}
            </div>
          </div>

          {selectedAnswers.some((id) => !correctWaits.includes(id)) && (
            <div>
              <div className="text-sm text-red-400 mb-1">
                {locale === "zh" ? "你的错误选择：" : "Your wrong selections: "}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAnswers
                  .filter((id) => !correctWaits.includes(id))
                  .map((tileId) => (
                    <MahjongTile key={tileId} tileId={tileId} size="sm" disabled />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
