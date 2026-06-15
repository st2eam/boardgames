"use client";

import Link from "next/link";
import type { GameSummary } from "@/types/game";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  game: GameSummary;
}

const categoryGradients: Record<string, string> = {
  board: "from-amber-500 to-orange-500",
  card: "from-emerald-500 to-teal-500",
  party: "from-rose-500 to-pink-500",
  strategy: "from-indigo-500 to-violet-500",
  family: "from-lime-500 to-green-500",
  adventure: "from-violet-500 to-fuchsia-500",
};

const difficultyColor: Record<string, string> = {
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-rose-500",
};

function useTags(game: GameSummary, t: ReturnType<typeof useTranslations<"game">>) {
  const descriptive = [...game.tags];
  const functional: string[] = [];
  if (game.hasFlow) functional.push(t("viewFlow"));
  return { descriptive, functional };
}

export function GameCard({ game }: Props) {
  const locale = useLocale();
  const t = useTranslations("game");
  const tc = useTranslations("common");

  const gradient =
    categoryGradients[game.category] ?? "from-stone-400 to-stone-500";
  const name = game.name[locale as "en" | "zh"] ?? game.name.en;
  const { descriptive, functional } = useTags(game, t);

  const difficultyKey =
    `difficulty${game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}` as const;

  // ── card games: 1×2 tall skinny card ──
  if (game.category === "card") {
    return (
      <Link
        href={`/${locale}/games/${game.slug}/`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-amber-300/60 active:translate-y-0"
      >
        {/* Cover area */}
        <div className={`relative flex-1 bg-gradient-to-br ${gradient} min-h-64`}>
          <div className="absolute inset-0 opacity-20" aria-hidden="true">
            <div className="absolute -top-6 -right-6 h-40 w-40 rounded-full bg-white/40" />
            <div className="absolute top-1/3 -left-4 h-28 w-28 rounded-full bg-white/25" />
            <div className="absolute bottom-1/4 right-8 h-6 w-6 rounded-full bg-white/50" />
            <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent p-4 pt-20">
            <h3 className="font-heading text-lg font-bold leading-tight text-white">
              {name}
            </h3>
            <p className="mt-1 text-xs text-white/70">
              {game.players} &middot; {game.duration}
            </p>
          </div>
          <span className="absolute top-3 left-3 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {game.category}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-4 py-2.5 min-h-[36px]">
          <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap" title={[...functional, ...descriptive].join(", ")}>
            {functional.map((tag) => (
              <span key={tag} className="mr-1 inline-block rounded-md bg-accent-light px-1.5 py-0.5 text-[10px] font-medium text-accent-dark">
                {tag}
              </span>
            ))}
            {descriptive.map((tag) => (
              <span key={tag} className="mr-1 inline-block rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500">
                {tag}
              </span>
            ))}
          </div>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${difficultyColor[game.difficulty]}`}
            aria-label={`${t("difficulty")}: ${tc(difficultyKey)}`}
          />
        </div>
      </Link>
    );
  }

  // ── board games: 2×1 wide horizontal card ──
  if (game.category === "board") {
    return (
      <Link
        href={`/${locale}/games/${game.slug}/`}
        className="group relative flex overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-amber-300/60 active:translate-y-0"
      >
        {/* Cover — left side */}
        <div className={`relative w-40 shrink-0 bg-gradient-to-br ${gradient} sm:w-56`}>
          <div className="absolute inset-0 opacity-20" aria-hidden="true">
            <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-white/40" />
            <div className="absolute -bottom-6 -left-2 h-24 w-24 rounded-full bg-white/30" />
            <div className="absolute bottom-8 right-6 h-6 w-6 rounded-full bg-white/50" />
          </div>
          <span className="absolute bottom-3 left-3 rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {game.category}
          </span>
        </div>

        {/* Content — right side */}
        <div className="flex flex-1 flex-col justify-center p-5 sm:p-6 min-w-0">
          <div className="flex items-start gap-3">
            <h3 className="font-heading text-lg font-semibold leading-snug text-primary-dark sm:text-xl">
              {name}
            </h3>
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${difficultyColor[game.difficulty]}`}
              aria-label={`${t("difficulty")}: ${tc(difficultyKey)}`}
            />
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              {game.players}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {game.duration}
            </span>
          </p>
          <div className="mt-2.5 min-h-[24px] overflow-hidden whitespace-nowrap" title={[...functional, ...descriptive].join(", ")}>
            {functional.map((tag) => (
              <span key={tag} className="mr-1.5 inline-block rounded-lg bg-accent-light px-2 py-0.5 text-[11px] font-medium text-accent-dark">
                {tag}
              </span>
            ))}
            {descriptive.map((tag) => (
              <span key={tag} className="mr-1.5 inline-block rounded-lg bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    );
  }

  // ── other games: standard vertical card ──
  return (
    <Link
      href={`/${locale}/games/${game.slug}/`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-amber-300/60 active:translate-y-0"
    >
      {/* Cover image area */}
      <div className={`relative h-28 bg-gradient-to-br ${gradient} sm:h-32`}>
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute -top-3 right-6 h-20 w-20 rounded-full bg-white/50" />
          <div className="absolute -bottom-4 -left-2 h-16 w-16 rounded-full bg-white/30" />
        </div>
        <span className="absolute bottom-2 left-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
          {game.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold leading-snug text-primary-dark group-hover:text-primary transition-colors">
            {name}
          </h3>
          <span
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${difficultyColor[game.difficulty]}`}
            aria-label={`${t("difficulty")}: ${tc(difficultyKey)}`}
          />
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            {game.players}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {game.duration}
          </span>
        </div>
        <div className="mt-auto min-h-[22px] overflow-hidden whitespace-nowrap" title={[...functional, ...descriptive].join(", ")}>
          {functional.map((tag) => (
            <span key={tag} className="mr-1.5 inline-block rounded-md bg-accent-light px-1.5 py-0.5 text-[10px] font-medium text-accent-dark">
              {tag}
            </span>
          ))}
          {descriptive.map((tag) => (
            <span key={tag} className="mr-1.5 inline-block rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
