"use client";

import Link from "next/link";
import type { GameMeta } from "@/types/game";
import { useLocale, useTranslations } from "next-intl";

interface Props {
  current: GameMeta;
  related: GameMeta[];
}

const variantLabels: Record<
  string,
  { en: string; zh: string; cls: string }
> = {
  base: { en: "Base Game", zh: "本体", cls: "bg-emerald-100 text-emerald-700" },
  expansion: { en: "DLC", zh: "DLC", cls: "bg-violet-100 text-violet-700" },
  variant: { en: "Variant", zh: "变体", cls: "bg-sky-100 text-sky-700" },
};

export function RelatedGames({ current, related }: Props) {
  const locale = useLocale();
  const t = useTranslations("game");

  if (related.length === 0) return null;

  const sorted = [...related].sort(
    (a, b) => (a.familyOrder ?? 0) - (b.familyOrder ?? 0)
  );

  return (
    <div className="mt-6 rounded-xl border border-border bg-white p-5 sm:p-6">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-400">
        {t("relatedGames")}
      </h3>
      <div className="space-y-2">
        {sorted.map((game) => {
          const name = game.name[locale as "en" | "zh"] ?? game.name.en;
          const badge = game.variantType
            ? variantLabels[game.variantType]
            : null;
          const isCurrent = game.slug === current.slug;

          return (
            <Link
              key={game.slug}
              href={`/${locale}/games/${game.slug}/`}
              className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-all ${
                isCurrent
                  ? "border-amber-300 bg-amber-50 cursor-default"
                  : "border-border bg-stone-50 hover:border-amber-200 hover:bg-amber-50/50"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${isCurrent ? "text-primary" : "text-stone-700"}`}
                  >
                    {name}
                  </span>
                  {badge && (
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badge.cls}`}
                    >
                      {badge[locale as "en" | "zh"]}
                    </span>
                  )}
                  {game.requiresBase && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
                      {locale === "zh" ? "需本体" : "Req. Base"}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-stone-400">
                  {game.players} &middot; {game.duration}
                </p>
              </div>
              {isCurrent ? (
                <span className="text-[10px] font-medium text-primary">
                  {locale === "zh" ? "当前" : "Current"}
                </span>
              ) : (
                <svg
                  className="h-4 w-4 shrink-0 text-stone-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 5 7 7-7 7"
                  />
                </svg>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
