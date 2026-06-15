"use client";

import type { GameSummary } from "@/types/game";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  game: GameSummary;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export function GameCard({ game }: Props) {
  const locale = useLocale();
  const t = useTranslations("game");
  const tc = useTranslations("common");

  const difficultyKey = `difficulty${game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}` as const;

  return (
    <a
      href={`/${locale}/games/${game.slug}/`}
      className="group block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
    >
      <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
        {game.name[locale as "en" | "zh"] ?? game.name.en}
      </h3>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
        <span className="inline-flex items-center gap-1">
          <span className="text-zinc-400">&#x1f465;</span>
          {t("players")}: {game.players}
        </span>
        <span className="text-zinc-300">&middot;</span>
        <span className="inline-flex items-center gap-1">
          <span className="text-zinc-400">&#x1f552;</span>
          {t("duration")}: {game.duration}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[game.difficulty]}`}
        >
          {tc(difficultyKey)}
        </span>
        {game.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600"
          >
            {tag}
          </span>
        ))}
      </div>
      {game.hasFlow && (
        <div className="mt-3 text-xs font-medium text-blue-600">
          {t("viewFlow")} &rarr;
        </div>
      )}
    </a>
  );
}
