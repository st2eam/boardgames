import { GameRepository } from "@/lib/content/GameRepository";
import { ScoreTracker } from "@/components/game/score/ScoreTracker";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Link from "next/link";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await GameRepository.getAllGameSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const slug of slugs) {
      if (GameRepository.hasScoreConfig(slug)) {
        params.push({ locale, slug });
      }
    }
  }
  return params;
}

export default async function ScorePage({ params }: Props) {
  const { locale, slug } = await params;
  const scoreConfig = await GameRepository.getScoreConfig(slug);
  const meta = await GameRepository.getGameMeta(slug);

  if (!scoreConfig || !meta) {
    notFound();
  }

  const gameName = meta.name[locale as "en" | "zh"] ?? meta.name.en;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/${locale}/games/${slug}/`}
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {gameName}
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">
          {locale === "zh" ? `${gameName} 计分器` : `${gameName} Score Tracker`}
        </h1>
      </div>
      <ScoreTracker slug={slug} config={scoreConfig} locale={locale} />
    </div>
  );
}
