import { GameRepository } from "@/lib/content/GameRepository";
import { TenpaiTrainer } from "@/components/game/trainer/TenpaiTrainer";
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
  const title = locale === "zh" ? `${name} 听牌训练` : `${name} Tenpai Trainer`;

  return {
    title: `${title} - The Game Shelf`,
    description: locale === "zh"
      ? `${name} 听牌训练器 - 练习判断听什么牌`
      : `Tenpai trainer for ${name} - practice identifying winning tiles`,
  };
}

export async function generateStaticParams() {
  const slugs = await GameRepository.getAllGameSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const slug of slugs) {
      const config = await GameRepository.getTrainerConfig(slug);
      if (config) {
        params.push({ locale, slug });
      }
    }
  }
  return params;
}

export default async function TrainerPage({ params }: Props) {
  const { locale, slug } = await params;
  const config = await GameRepository.getTrainerConfig(slug);
  const meta = await GameRepository.getGameMeta(slug);

  if (!config || !meta) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
          {meta.name[locale as "en" | "zh"] ?? meta.name.en}
        </Link>
      </div>
      <h1 className="mb-6 font-heading text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">
        {locale === "zh" ? "听牌训练" : "Tenpai Trainer"}
      </h1>
      <TenpaiTrainer config={config} locale={locale} />
    </div>
  );
}
