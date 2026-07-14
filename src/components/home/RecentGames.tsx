"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { GameSummary } from "@/types/game";
import { getRecentGameSlugs } from "@/lib/recent-games";

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

  if (slugs.length === 0) return null;

  const bySlug = new Map(games.map((g) => [g.slug, g]));
  const recent = slugs
    .map((slug) => bySlug.get(slug))
    .filter((g): g is GameSummary => Boolean(g))
    .slice(0, 6);

  if (recent.length === 0) return null;

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
            <Link
              key={game.slug}
              href={`/${locale}/games/${game.slug}/`}
              className="shrink-0 rounded-full border border-border bg-white px-3.5 py-1.5 text-sm text-stone-700 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-primary"
            >
              {name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
