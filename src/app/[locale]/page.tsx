import { GameFactory } from "@/lib/content/GameFactory";
import { GameRepository } from "@/lib/content/GameRepository";
import { GameCardGrid } from "@/components/home/GameCardGrid";
import { ChatToggle } from "@/components/chat/ChatToggle";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const slugs = await GameRepository.getAllGameSlugs();
  const count = slugs.length;

  if (locale === "zh") {
    return buildPageMetadata({
      locale,
      title: "The Game Shelf",
      description: `桌面游戏规则参考站 — 覆盖 ${count} 款游戏，支持中英双语、互动决策树、计分器与训练器。`,
      path: "/",
    });
  }

  return buildPageMetadata({
    locale,
    title: "The Game Shelf",
    description: `Curated board game rules — ${count} games with bilingual rules, decision trees, score trackers, and trainers.`,
    path: "/",
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const slugs = await GameRepository.getAllGameSlugs();
  const games = await Promise.all(
    slugs.map((slug) => GameFactory.createGameSummary(slug))
  );

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <GameCardGrid games={games} />
      </div>
      <ChatToggle scope={{ type: "global" }} locale={locale} />
    </>
  );
}
