import { GameRepository } from "@/lib/content/GameRepository";
import { ScoreCalculator } from "@/components/game/calculator/ScoreCalculator";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const meta = await GameRepository.getGameMeta(slug);
  const name = meta.name[locale as "en" | "zh"] ?? meta.name.en;
  const title = locale === "zh" ? `${name} 番符计算器` : `${name} Score Calculator`;

  return {
    title: `${title} - The Game Shelf`,
    description: locale === "zh"
      ? `${name} 番符自动计算器 - 选择役种和面子组成，自动计算点数`
      : `Score calculator for ${name} - select yaku and melds to calculate points`,
  };
}

export async function generateStaticParams() {
  const slugs = await GameRepository.getAllGameSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const slug of slugs) {
      if (GameRepository.hasCalculatorConfig(slug)) {
        params.push({ locale, slug });
      }
    }
  }
  return params;
}

export default async function CalculatorPage({ params }: Props) {
  const { locale, slug } = await params;
  const config = await GameRepository.getCalculatorConfig(slug);
  const meta = await GameRepository.getGameMeta(slug);

  if (!config || !meta) {
    notFound();
  }

  const gameName = meta.name[locale as "en" | "zh"] ?? meta.name.en;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
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
      </div>
      <h1 className="mb-6 font-heading text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">
        {locale === "zh" ? "番符计算器" : "Score Calculator"}
      </h1>
      <ScoreCalculator locale={locale} />
    </div>
  );
}
