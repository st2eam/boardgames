"use client";

import { useState, useCallback, useMemo } from "react";
import { generatePreflopScenario, ACTION_NAMES, POSITION_NAMES } from "@/lib/texas-holdem";
import type { PreflopAction, PreflopScenario } from "@/lib/texas-holdem";
import { PlayingCard } from "../blackjack/PlayingCard";
import { TrainerStats } from "../TrainerStats";
import { PreflopChart } from "./PreflopChart";

interface Props {
  locale: string;
}

type Phase = "answering" | "result";
type Tab = "trainer" | "chart";

const ACTIONS: PreflopAction[] = ["R", "F"];

const ACTION_COLORS: Record<PreflopAction, string> = {
  R: "bg-green-100 border-green-300 text-green-800 hover:bg-green-200",
  F: "bg-red-100 border-red-300 text-red-800 hover:bg-red-200",
  M: "bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200",
};

const ACTION_ACTIVE: Record<PreflopAction, string> = {
  R: "bg-green-500 border-green-600 text-white",
  F: "bg-red-500 border-red-600 text-white",
  M: "bg-amber-500 border-amber-600 text-white",
};

export function PreflopTrainer({ locale }: Props) {
  const [tab, setTab] = useState<Tab>("trainer");
  const [scenario, setScenario] = useState<PreflopScenario>(() => generatePreflopScenario());
  const [selectedAction, setSelectedAction] = useState<PreflopAction | null>(null);
  const [phase, setPhase] = useState<Phase>("answering");
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });

  const lang = locale as "en" | "zh";

  const isCorrectAnswer = useCallback((action: PreflopAction): boolean => {
    if (action === scenario.correctAction) return true;
    // M (mixed) hands: accept both R and F
    if (scenario.correctAction === "M") return action === "R" || action === "F";
    return false;
  }, [scenario.correctAction]);

  const handleAction = useCallback((action: PreflopAction) => {
    if (phase !== "answering") return;
    setSelectedAction(action);

    const correct = isCorrectAnswer(action);
    setStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
      streak: correct ? prev.streak + 1 : 0,
    }));
    setPhase("result");
  }, [phase, isCorrectAnswer]);

  const handleNext = useCallback(() => {
    setScenario(generatePreflopScenario());
    setSelectedAction(null);
    setPhase("answering");
  }, []);

  const positionName = POSITION_NAMES[scenario.position][lang];

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab("trainer")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "trainer" ? "bg-accent text-white shadow-sm" : "text-muted-foreground hover:text-primary-dark"
          }`}
        >
          {lang === "zh" ? "训练模式" : "Practice"}
        </button>
        <button
          type="button"
          onClick={() => setTab("chart")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "chart" ? "bg-accent text-white shadow-sm" : "text-muted-foreground hover:text-primary-dark"
          }`}
        >
          {lang === "zh" ? "起手牌表" : "Preflop Chart"}
        </button>
      </div>

      {tab === "chart" && <PreflopChart locale={locale} />}

      {tab === "trainer" && (
        <>
          <TrainerStats {...stats} locale={locale} />

          {/* Scenario display */}
          <div className="rounded-xl border border-border bg-surface p-5">
            {/* Position badge */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "zh" ? "你的位置" : "Your Position"}
              </span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
                {positionName}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {lang === "zh" ? "所有人弃牌到你，RFI决策" : "Folded to you, RFI decision"}
              </span>
            </div>

            {/* Hand display */}
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                {lang === "zh" ? "你的手牌" : "Your Hand"}
                <span className="ml-2 text-xs font-semibold text-primary-dark">
                  ({scenario.handLabel})
                </span>
              </div>
              <div className="flex gap-2">
                <PlayingCard card={scenario.card1} size="lg" />
                <PlayingCard card={scenario.card2} size="lg" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-3 text-sm font-medium text-primary-dark">
              {lang === "zh" ? "你应该怎么做？" : "What should you do?"}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ACTIONS.map((action) => {
                const isSelected = selectedAction === action;
                const isCorrect = phase === "result" && action === scenario.correctAction;
                const isMixed = phase === "result" && scenario.correctAction === "M";

                let className = "rounded-lg border-2 px-4 py-3 text-center font-bold transition-all ";
                if (isSelected && phase === "result") {
                  className += ACTION_ACTIVE[action];
                } else if (isCorrect && phase === "result") {
                  className += "ring-2 ring-offset-1 ring-green-500 " + ACTION_COLORS[action];
                } else if (isMixed && phase === "result") {
                  className += "ring-2 ring-offset-1 ring-amber-400 " + ACTION_COLORS[action];
                } else if (phase === "answering") {
                  className += ACTION_COLORS[action] + " cursor-pointer";
                } else {
                  className += ACTION_COLORS[action];
                }

                return (
                  <button
                    key={action}
                    type="button"
                    disabled={phase === "result"}
                    onClick={() => handleAction(action)}
                    className={className}
                  >
                    <div className="text-lg">{ACTION_NAMES[action][lang]}</div>
                    <div className="text-xs opacity-70">{ACTION_NAMES[action][lang === "zh" ? "en" : "zh"]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result feedback */}
          {phase === "result" && selectedAction && (
            <div className="rounded-xl border p-4 space-y-2">
              {isCorrectAnswer(selectedAction) ? (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {scenario.correctAction === "M"
                    ? (lang === "zh" ? "正确！这是混合手牌，加注或弃牌都可以" : "Correct! This is a mixed hand — both raise and fold are fine")
                    : (lang === "zh" ? "正确！" : "Correct!")}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-red-500 font-medium">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {lang === "zh" ? "错误" : "Incorrect"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {lang === "zh" ? "正确答案：" : "Correct: "}
                    <span className="font-semibold text-primary-dark">
                      {ACTION_NAMES[scenario.correctAction][lang]}
                    </span>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="mt-3 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
              >
                {lang === "zh" ? "下一题" : "Next"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
