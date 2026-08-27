import { GameFactory } from "@/lib/content/GameFactory";
import { GameRepository } from "@/lib/content/GameRepository";
import { GameHeader } from "@/features/rules/GameHeader";
import { GameIntro } from "@/features/rules/GameIntro";
import { MarkdownRenderer } from "@/features/rules/MarkdownRenderer";
import { RulesToc } from "@/features/rules/RulesToc";
import { RelatedGames } from "@/features/rules/RelatedGames";
import { TrackRecentVisit } from "@/features/rules/TrackRecentVisit";
import { ChatToggle } from "@/features/chat/ChatToggle";
import { goTutorSuggestedPrompts } from "@/lib/go/boardContext";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, getCoverImageUrl, absoluteUrl } from "@/lib/seo";
import { extractRuleIntro } from "@/lib/content/ruleIntro";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const meta = await GameRepository.getGameMeta(slug);
  const name = meta.name[locale as "en" | "zh"] ?? meta.name.en;
  const description =
    locale === "zh"
      ? `${name} 完整规则说明 — ${meta.players} 人，时长 ${meta.duration}`
      : `Complete rules for ${name} — ${meta.players} players, ${meta.duration}`;

  return buildPageMetadata({
    locale,
    title: name,
    description,
    path: `/games/${slug}/`,
    ogImage: getCoverImageUrl(slug),
    type: "article",
  });
}

export async function generateStaticParams() {
  const slugs = await GameRepository.getAllGameSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export default async function GamePage({ params }: Props) {
  const { locale, slug } = await params;
  const game = await GameFactory.createGame(slug, locale);

  if (!game) {
    notFound();
  }

  const familyGames = game.meta.family
    ? await GameRepository.getFamilyGames(game.meta.family)
    : [];
  const gameName = game.meta.name[locale as "en" | "zh"] ?? game.meta.name.en;
  const intro = extractRuleIntro(game.rules);

  const trainerConfig = await GameRepository.getTrainerConfig(slug);
  const playConfig = await GameRepository.getPlayConfig(slug);
  const cover = getCoverImageUrl(slug);
  const pageUrl = absoluteUrl(`/${locale}/games/${slug}/`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: gameName,
    description:
      locale === "zh"
        ? `${gameName} 完整规则说明`
        : `Complete rules for ${gameName}`,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "The Game Shelf",
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Game",
      name: game.meta.name.en,
      alternateName: game.meta.name.zh,
      numberOfPlayers: game.meta.players,
      ...(cover ? { image: cover } : {}),
    },
  };

  return (
    <>
      <TrackRecentVisit slug={slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <GameHeader
            meta={game.meta}
            hasPlay={GameRepository.hasPlayConfig(slug)}
            playConfig={playConfig}
            hasFlow={game.flow !== null}
            hasScore={GameRepository.hasScoreConfig(slug)}
            hasTrainer={GameRepository.hasTrainerConfig(slug)}
            hasCalculator={GameRepository.hasCalculatorConfig(slug)}
            trainerType={trainerConfig?.type}
            rules={game.rules}
          />
        </div>

        {/* columns stretch so sticky TOC has a tall containing block */}
        <div className="lg:grid lg:grid-cols-[minmax(0,48rem)_14rem] lg:justify-center lg:gap-10">
          <div className="min-w-0">
            {intro ? <GameIntro content={intro} locale={locale} /> : null}
            <div className="lg:hidden">
              <RulesToc content={game.rules} variant="mobile" />
            </div>
            <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
              <MarkdownRenderer content={game.rules} />
            </div>
            {familyGames.length > 1 && (
              <RelatedGames current={game.meta} related={familyGames} />
            )}
          </div>
          <div className="hidden lg:block">
            <RulesToc content={game.rules} variant="desktop" />
          </div>
        </div>
      </div>
      <ChatToggle
        scope={{
          type: "game",
          slug,
          gameName,
          ...(slug === "go"
            ? { suggestedPrompts: goTutorSuggestedPrompts(locale) }
            : {}),
        }}
        locale={locale}
      />
    </>
  );
}
