import { GameRepository } from "@/lib/content/GameRepository";
import { TenpaiTrainer } from "@/components/game/trainer/TenpaiTrainer";
import { BasicStrategyTrainer } from "@/components/game/trainer/blackjack/BasicStrategyTrainer";
import { PreflopTrainer } from "@/components/game/trainer/texas-holdem/PreflopTrainer";
import { GoTsumegoTrainer } from "@/components/game/trainer/go/GoTsumegoTrainer";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

const TRAINER_TITLES: Record<string, { en: string; zh: string }> = {
  tenpai: { en: "Tenpai Trainer", zh: "听牌训练" },
  "blackjack-basic-strategy": { en: "Basic Strategy Trainer", zh: "基本策略训练" },
  "texas-holdem-preflop": { en: "Preflop Trainer", zh: "翻前训练" },
  "go-tsumego": { en: "Trainer", zh: "训练" },
};

const TRAINER_DESCRIPTIONS: Record<string, { en: string; zh: string }> = {
  tenpai: {
    en: "practice identifying winning tiles",
    zh: "练习判断听什么牌",
  },
  "blackjack-basic-strategy": {
    en: "practice optimal blackjack decisions",
    zh: "练习最优21点决策",
  },
  "texas-holdem-preflop": {
    en: "practice GTO preflop open-raise decisions",
    zh: "练习GTO翻前起手牌决策",
  },
  "go-tsumego": {
    en: "practice Go problems",
    zh: "练习围棋题目",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const meta = await GameRepository.getGameMeta(slug);
  const config = await GameRepository.getTrainerConfig(slug);
  const name = meta.name[locale as "en" | "zh"] ?? meta.name.en;
  const type = config?.type ?? "tenpai";
  const titleText = TRAINER_TITLES[type]?.[locale as "en" | "zh"] ?? TRAINER_TITLES.tenpai.en;
  const desc = TRAINER_DESCRIPTIONS[type]?.[locale as "en" | "zh"] ?? "";

  return {
    title: `${name} ${titleText} - The Game Shelf`,
    description: `${name} - ${desc}`,
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

  const type = config.type;
  const titleText = TRAINER_TITLES[type]?.[locale as "en" | "zh"] ?? TRAINER_TITLES.tenpai[locale as "en" | "zh"];

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
        {titleText}
      </h1>
      {type === "tenpai" && <TenpaiTrainer config={config} locale={locale} />}
      {type === "blackjack-basic-strategy" && <BasicStrategyTrainer locale={locale} />}
      {type === "texas-holdem-preflop" && <PreflopTrainer locale={locale} />}
      {type === "go-tsumego" && <GoTsumegoTrainer config={config as any} locale={locale} />}
    </div>
  );
}
