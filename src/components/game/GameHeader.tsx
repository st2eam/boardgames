"use client";

import Link from "next/link";
import type { GameMeta } from "@/types/game";
import { useTranslations, useLocale } from "next-intl";
import { ExportButton } from "./ExportButton";

interface Props {
  meta: GameMeta;
  hasFlow: boolean;
  rules?: string;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export function GameHeader({ meta, hasFlow, rules }: Props) {
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
