"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { GameSummary } from "@/types/game";
import { useLocale, useTranslations } from "next-intl";
import { GameCover } from "./GameCover";
import { categoryGradients, difficultyColors, variantBadge } from "@/lib/constants";
import type { SortMode } from "./GameCardGrid";

function TruncatedName({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (el) setIsTruncated(el.scrollWidth > el.clientWidth);
  }, []);

  useEffect(() => {
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [check, name]);

  return (
    <span
      ref={ref}
      className="block truncate text-sm font-semibold text-stone-800"
      title={isTruncated ? name : undefined}
    >
      {name}
    </span>
  );
}

interface Props {
  games: GameSummary[];
  sortMode: SortMode;
}

export function GameFamilyCard({ games, sortMode }: Props) {
  const locale = useLocale();
  const t = useTranslations("game");
  const tc = useTranslations("common");
  const [expanded, setExpanded] = useState(false);

  const sorted = [...games].sort(
    (a, b) => (a.familyOrder ?? 0) - (b.familyOrder ?? 0)
  );
  const base = sorted[0];
  const variants = sorted.slice(1);
  const gradient =
    categoryGradients[base.category] ?? "from-stone-400 to-stone-500";
  const baseName = base.name[locale as "en" | "zh"] ?? base.name.en;

  const showRank = sortMode === "bggRank" && base.bggRank != null;

  return (
    <div className="group/family relative">
      {/* Stacked background layers for unexpanded state */}
      {!expanded && variants.length > 0 && (
        <>
          {variants.length >= 2 && (
            <div
              className="absolute inset-x-0 -bottom-2 top-3 rounded-2xl border border-stone-200/60 bg-stone-100 transition-opacity group-hover/family:opacity-80"
              aria-hidden="true"
            />
          )}
          <div
            className="absolute inset-x-0 -bottom-1 top-1.5 rounded-2xl border border-stone-200/80 bg-stone-50 transition-opacity group-hover/family:opacity-90"
            aria-hidden="true"
          />
        </>
      )}

      {/* Base game card */}
      <div className="relative">
        <Link
          href={`/${locale}/games/${base.slug}/`}
          className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-amber-300/60"
        >
          <GameCover
            slug={base.slug}
            gradient={gradient}
            className={base.category === "card" ? "min-h-56" : "h-28 sm:h-32"}
          >
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent p-4 pt-16">
              <h3 className="font-heading text-lg font-bold leading-tight text-white">
                {baseName}
              </h3>
              <p className="mt-0.5 text-xs text-white/70">
                {base.players} &middot; {base.duration}
              </p>
            </div>
            <span className="absolute top-3 left-3 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {base.category}
            </span>
            {showRank && (
              <span className="absolute top-3 right-3 z-10 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                #{base.bggRank}
              </span>
            )}
          </GameCover>

          <div className="flex items-center gap-2 px-4 py-2.5">
            <div className="min-w-0 flex-1 flex flex-wrap gap-1">
              {base.hasFlow && (
                <span className="rounded-md bg-accent-light px-1.5 py-0.5 text-[10px] font-medium text-accent-dark">
                  {t("viewFlow")}
                </span>
              )}
              {base.hasScore && (
                <span className="rounded-md bg-accent-light px-1.5 py-0.5 text-[10px] font-medium text-accent-dark">
                  {t("scoreTracker")}
                </span>
              )}
              {base.hasTrainer && (
                <span className="rounded-md bg-accent-light px-1.5 py-0.5 text-[10px] font-medium text-accent-dark">
                  {base.trainerType === "blackjack-basic-strategy" ? t("strategyTrainer") : base.trainerType === "texas-holdem-preflop" ? t("preflopTrainer") : t("tenpaiTrainer")}
                </span>
              )}
              {base.hasCalculator && (
                <span className="rounded-md bg-accent-light px-1.5 py-0.5 text-[10px] font-medium text-accent-dark">
                  {t("scoreCalculator")}
                </span>
              )}
              {base.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${difficultyColors[base.difficulty]}`}
            />
          </div>
        </Link>

        {/* Family count badge */}
        {variants.length > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setExpanded(!expanded);
            }}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse variants" : "Show variants"}
            className={`absolute -top-2 -right-2 z-10 flex cursor-pointer items-center gap-1 rounded-full border-2 border-white px-2.5 py-1 text-[11px] font-bold shadow-md transition-all hover:scale-105 ${
              expanded
                ? "bg-primary text-white"
                : "bg-violet-500 text-white"
            }`}
          >
            +{variants.length}
            <svg
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded variant/expansion cards */}
      <div
        className={`overflow-hidden transition-all duration-300 motion-reduce:transition-none ${
          expanded ? "mt-2 max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {variants.length > 0 && (
        <div className="space-y-2">
          {variants.map((game) => {
            const name = game.name[locale as "en" | "zh"] ?? game.name.en;
            const badge = game.variantType
              ? variantBadge[game.variantType]
              : null;
            const diffKey =
              `difficulty${game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}` as const;
            return (
              <Link
                key={game.slug}
                href={`/${locale}/games/${game.slug}/`}
                className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-sm transition-all hover:border-amber-300/60 hover:shadow-md hover:-translate-y-0.5"
              >
                <GameCover
                  slug={game.slug}
                  gradient={gradient}
                  className="h-10 w-10 shrink-0 rounded-lg"
                  fallbackIcon={
                    game.variantType === "expansion" ? (
                      <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    )
                  }
                />
                <div className="min-w-0 flex-1">
                  <TruncatedName name={name} />
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
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
                    <span className="text-xs text-stone-400">
                      {game.players} &middot; {game.duration}
                    </span>
                  </div>
                </div>
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
              </Link>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
