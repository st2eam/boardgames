"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import type { ScoreBreakdown } from "@/lib/score/engines/types";
import type { RoundRecord } from "@/lib/score/score-storage";
import { AnimatedNumber } from "@/components/home/AnimatedNumber";

interface Props {
  breakdown: ScoreBreakdown;
  rounds: RoundRecord[];
  cumulativeTotal: number;
  target: number | null;
  multiRound: boolean;
  direction: "high-wins" | "low-wins";
  onConfirmRound?: () => void;
  locale: string;
}

export function ScoreDisplay({
  breakdown,
  rounds,
  cumulativeTotal,
  target,
  multiRound,
  direction,
  onConfirmRound,
  locale,
}: Props) {
  const t = useTranslations("score");
  const lang = locale as "en" | "zh";
  const displayTotal = multiRound ? cumulativeTotal : breakdown.total;
  const isGameOver = target ? displayTotal >= target : false;

  return (
    <div className="space-y-3">
      {/* Current round score */}
      <div className={`rounded-xl border p-4 ${isGameOver ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-white"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            {multiRound ? t("thisRound") : t("score")}
          </span>
          {multiRound && onConfirmRound && (breakdown.total > 0 || breakdown.colorBonus > 0) && (
            <button
              onClick={onConfirmRound}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 transition-colors"
            >
              {t("confirmRound")}
            </button>
          )}
        </div>
        <div className="text-3xl font-bold tabular-nums text-stone-800">
          <AnimatedNumber value={breakdown.total} />
          {target && !multiRound && (
            <span className="text-sm font-normal text-stone-400 ml-1">/ {target}</span>
          )}
        </div>
        {(breakdown.details.length > 0 || breakdown.colorBonus > 0) && (
          <div className="mt-3 space-y-1">
            <AnimatePresence initial={false}>
              {breakdown.details.map((d, i) => (
                <motion.div
                  key={`${d.label.en}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-stone-500">{d.label[lang]}</span>
                  <span className="font-medium tabular-nums text-stone-700">+{d.value}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {breakdown.colorBonus > 0 && (
              <div className={`flex items-center justify-between text-sm ${breakdown.details.length > 0 ? "border-t border-dashed border-stone-200 pt-1 mt-1" : ""}`}>
                <span className="text-stone-500">{t("colorBonus")}</span>
                <span className="font-medium tabular-nums text-emerald-600">+{breakdown.colorBonus}</span>
              </div>
            )}
            {breakdown.cardScore > 0 && breakdown.cardScore !== breakdown.total && (
              <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1">
                <span>{t("cardScore")}</span>
                <span className="tabular-nums">{breakdown.cardScore}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Multi-round: cumulative total + history */}
      {multiRound && rounds.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              {t("totalScore")}
            </span>
            <div>
              <AnimatedNumber
                value={cumulativeTotal}
                className="text-2xl font-bold text-stone-800"
              />
              {target && (
                <span className="text-sm text-stone-400 ml-1">/ {target}</span>
              )}
            </div>
          </div>
          {target && (
            <div className="mb-3 h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${Math.min((cumulativeTotal / target) * 100, 100)}%` }}
              />
            </div>
          )}
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {rounds.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between overflow-hidden text-sm"
                >
                  <span className="text-stone-400">
                    {t("round", { n: i + 1 })}
                  </span>
                  <span className="font-medium tabular-nums text-stone-600">+{r.score}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {isGameOver && (
            <div className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-center text-sm font-medium text-amber-800">
              {direction === "high-wins" ? t("targetReached") : t("limitExceeded")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
