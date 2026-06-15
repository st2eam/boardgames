"use client";

import type { GameMeta } from "@/types/game";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  meta: GameMeta;
  hasFlow: boolean;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export function GameHeader({ meta, hasFlow }: Props) {
  const locale = useLocale();
  const t = useTranslations("game");
  const tc = useTranslations("common");
  const difficultyKey = `difficulty${meta.difficulty.charAt(0).toUpperCase() + meta.difficulty.slice(1)}` as const;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <a
            href={`/${locale}/`}
            className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            &larr; {t("backToGames")}
          </a>
          <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
            {meta.name[locale as "en" | "zh"] ?? meta.name.en}
          </h1>
        </div>
        {hasFlow && (
          <a
            href={`/${locale}/games/${meta.slug}/flow/`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {t("viewFlow")}
          </a>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
        <span>
          {t("players")}: {meta.players}
        </span>
        <span className="text-zinc-300">|</span>
        <span>
          {t("duration")}: {meta.duration}
        </span>
        <span className="text-zinc-300">|</span>
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
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
