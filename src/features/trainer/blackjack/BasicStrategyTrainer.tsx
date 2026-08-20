"use client";

import { useState, useCallback, useMemo } from "react";
import { generateScenario, getCorrectAction, ACTION_NAMES } from "@/lib/blackjack";
import type { Action, Scenario } from "@/lib/blackjack";
import { PlayingCard } from "./PlayingCard";
import { StrategyChart } from "./StrategyChart";
import { TrainerStats } from "../TrainerStats";

interface Props {
  locale: string;
}

type Phase = "answering" | "result";
type Tab = "trainer" | "chart";

const ACTIONS: Action[] = ["H", "S", "D", "P"];

const ACTION_COLORS: Record<Action, string> = {
  H: "bg-green-100 border-green-300 text-green-800 hover:bg-green-200",
  S: "bg-red-100 border-red-300 text-red-800 hover:bg-red-200",
  D: "bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200",
  P: "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200",
};

const ACTION_ACTIVE: Record<Action, string> = {
  H: "bg-green-500 border-green-600 text-white",
  S: "bg-red-500 border-red-600 text-white",
  D: "bg-amber-500 border-amber-600 text-white",
  P: "bg-blue-500 border-blue-600 text-white",
};

export function BasicStrategyTrainer({ locale }: Props) {
  const [tab, setTab] = useState<Tab>("trainer");
  const [scenario, setScenario] = useState<Scenario>(() => generateScenario());
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [phase, setPhase] = useState<Phase>("answering");
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });

  const correctAction = useMemo(
    () => getCorrectAction(
      scenario.playerTotal,
      scenario.isSoft,
      scenario.isPair,
      scenario.pairValue,
      scenario.dealerUpcardValue
    ),
    [scenario]
  );

  const canSplit = scenario.isPair;

  const handleAction = useCallback((action: Action) => {
    if (phase !== "answering") return;
    setSelectedAction(action);

    const isCorrect = action === correctAction;
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
    setPhase("result");
  }, [phase, correctAction]);

  const handleNext = useCallback(() => {
    setScenario(generateScenario());
    setSelectedAction(null);
    setPhase("answering");
  }, []);

  const lang = locale as "en" | "zh";

  const handDescription = useMemo(() => {
    if (scenario.isPair) {
      return locale === "zh" ? "对子" : "Pair";
    }
    if (scenario.isSoft) {
      return locale === "zh" ? `软${scenario.playerTotal}` : `Soft ${scenario.playerTotal}`;
    }
    return locale === "zh" ? `硬${scenario.playerTotal}` : `Hard ${scenario.playerTotal}`;
  }, [scenario, locale]);

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
          {locale === "zh" ? "训练模式" : "Practice"}
        </button>
        <button
          type="button"
          onClick={() => setTab("chart")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "chart" ? "bg-accent text-white shadow-sm" : "text-muted-foreground hover:text-primary-dark"
          }`}
        >
          {locale === "zh" ? "决策表" : "Strategy Chart"}
        </button>
      </div>

      {tab === "chart" && <StrategyChart locale={locale} />}

      {tab === "trainer" && (
        <>
          <TrainerStats {...stats} locale={locale} />

      {/* Scenario display */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Dealer */}
          <div>
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              {locale === "zh" ? "庄家明牌" : "Dealer Upcard"}
            </div>
            <div className="flex gap-2">
              <PlayingCard card={scenario.dealerUpcard} size="lg" />
              <PlayingCard card={{ rank: "A", suit: "spades" }} size="lg" faceDown />
            </div>
          </div>

          {/* Player */}
          <div>
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              {locale === "zh" ? "你的手牌" : "Your Hand"}
              <span className="ml-2 text-xs text-primary-dark font-semibold">
                ({handDescription})
              </span>
            </div>
            <div className="flex gap-2">
              {scenario.playerCards.map((card, idx) => (
                <PlayingCard key={idx} card={card} size="lg" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 text-sm font-medium text-primary-dark">
          {locale === "zh" ? "你应该怎么做？" : "What should you do?"}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ACTIONS.map((action) => {
            const disabled = action === "P" && !canSplit;
            const isSelected = selectedAction === action;
            const isCorrectAnswer = phase === "result" && action === correctAction;

            let className = `rounded-lg border-2 px-4 py-3 text-center font-bold transition-all `;
            if (disabled) {
              className += "opacity-30 cursor-not-allowed border-stone-200 bg-stone-50 text-stone-400";
            } else if (phase === "result") {
              // Show green ring on the correct answer (whether selected or not)
              if (isCorrectAnswer) {
                className += "ring-2 ring-offset-1 ring-green-500 ";
              }
              // Show active/pressed style on the selected answer
              if (isSelected) {
                className += ACTION_ACTIVE[action];
              } else {
                className += ACTION_COLORS[action];
              }
            } else if (phase === "answering") {
              className += ACTION_COLORS[action] + " cursor-pointer";
            } else {
              className += ACTION_COLORS[action];
            }

            return (
              <button
                key={action}
                type="button"
                disabled={disabled || phase === "result"}
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
          {selectedAction === correctAction ? (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {locale === "zh" ? "正确！" : "Correct!"}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-500 font-medium">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {locale === "zh" ? "错误" : "Incorrect"}
              </div>
              <div className="text-sm text-muted-foreground">
                {locale === "zh" ? "正确答案：" : "Correct: "}
                <span className="font-semibold text-primary-dark">{ACTION_NAMES[correctAction][lang]}</span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="mt-3 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            {locale === "zh" ? "下一题" : "Next"}
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
}
