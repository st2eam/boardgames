"use client";

import Link from "next/link";
import type { GameMeta } from "@/types/game";
import { useTranslations, useLocale } from "next-intl";
import { ExportButton } from "./ExportButton";

interface Props {
  meta: GameMeta;
  hasFlow: boolean;
  hasScore: boolean;
  hasTrainer: boolean;
  hasCalculator: boolean;
  trainerType?: string;
  rules?: string;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export function GameHeader({ meta, hasFlow, hasScore, hasTrainer, hasCalculator, trainerType, rules }: Props) {
  const locale = useLocale();
  const t = useTranslations("game");
  const tc = useTranslations("common");
  const difficultyKey = `difficulty${meta.difficulty.charAt(0).toUpperCase() + meta.difficulty.slice(1)}` as const;
  const gameName = meta.name[locale as "en" | "zh"] ?? meta.name.en;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/${locale}/`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t("backToGames")}
          </Link>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-primary-dark sm:text-4xl">
            {gameName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {hasFlow && (
            <Link
              href={`/${locale}/games/${meta.slug}/flow/`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent/90 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
              {t("viewFlow")}
            </Link>
          )}
          {hasScore && (
            <Link
              href={`/${locale}/games/${meta.slug}/score/`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm font-medium text-accent shadow-sm hover:bg-accent/10 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              {t("scoreTracker")}
            </Link>
          )}
          {hasTrainer && (
            <Link
              href={`/${locale}/games/${meta.slug}/trainer/`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/60 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-100 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
              {trainerType === "blackjack-basic-strategy" ? t("openStrategyTrainer") : trainerType === "texas-holdem-preflop" ? t("openPreflopTrainer") : trainerType === "go-tsumego" ? t("openTsumegoTrainer") : t("openTrainer")}
            </Link>
          )}
          {hasCalculator && (
            <Link
              href={`/${locale}/games/${meta.slug}/calculator/`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/60 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm hover:bg-violet-100 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm2.25-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H12.75v-.008Zm0 2.25h.008v.008H12.75v-.008Zm2.25-4.5h.008v.008H15v-.008Zm0 2.25h.008v.008H15v-.008ZM3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
              {t("openCalculator")}
            </Link>
          )}
          {rules && (
            <ExportButton markdown={rules} gameName={gameName} slug={meta.slug} />
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-stone-600">
        <span>
          {t("players")}: {meta.players}
        </span>
        <span className="text-stone-300">|</span>
        <span>
          {t("duration")}: {meta.duration}
        </span>
        <span className="text-stone-300">|</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[meta.difficulty]}`}
        >
          {tc(difficultyKey)}
        </span>
      </div>

      {meta.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
