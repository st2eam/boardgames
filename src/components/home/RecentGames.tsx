"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { GameSummary } from "@/types/game";
import { getRecentGameSlugs, removeRecentGame } from "@/lib/recent-games";

interface Props {
  games: GameSummary[];
}

export function RecentGames({ games }: Props) {
  const locale = useLocale();
  const t = useTranslations("home");
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(getRecentGameSlugs());
  }, []);

  const bySlug = new Map(games.map((g) => [g.slug, g]));
  const recent = slugs
    .map((slug) => bySlug.get(slug))
    .filter((g): g is GameSummary => Boolean(g))
    .slice(0, 6);

  if (recent.length === 0) return null;

  const handleRemove = (slug: string) => {
    removeRecentGame(slug);
    setSlugs((prev) => prev.filter((s) => s !== slug));
  };

  return (
    <section className="mb-6" aria-label={t("recentlyViewed")}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-600">
          {t("recentlyViewed")}
        </h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {recent.map((game) => {
          const name = game.name[locale as "en" | "zh"] ?? game.name.en;
          return (
            <div
              key={game.slug}
              className="group flex shrink-0 items-center rounded-full border border-border bg-white py-1 pl-3 pr-1 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50"
            >
              <Link
                href={`/${locale}/games/${game.slug}/`}
                className="text-sm text-stone-700 transition-colors group-hover:text-primary"
              >
                {name}
              </Link>
              <button
                type="button"
                onClick={() => handleRemove(game.slug)}
                className="ml-0.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-stone-400 transition-all hover:bg-stone-200/70 hover:text-stone-600 focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:none)]:opacity-70"
                aria-label={t("removeRecent", { name })}
                title={t("removeRecent", { name })}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
