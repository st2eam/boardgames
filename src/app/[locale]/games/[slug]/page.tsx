import { GameFactory } from "@/lib/content/GameFactory";
import { GameRepository } from "@/lib/content/GameRepository";
import { GameHeader } from "@/components/game/GameHeader";
import { MarkdownRenderer } from "@/components/game/MarkdownRenderer";
import { RelatedGames } from "@/components/game/RelatedGames";
import { ChatToggle } from "@/components/chat/ChatToggle";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
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

async function getFamilyGames(currentMeta: Awaited<ReturnType<typeof GameRepository.getGameMeta>>) {
  if (!currentMeta.family) return [];
  const allSlugs = await GameRepository.getAllGameSlugs();
  const familyMetas = [];
  for (const slug of allSlugs) {
    try {
      const meta = await GameRepository.getGameMeta(slug);
      if (meta.family === currentMeta.family) {
        familyMetas.push(meta);
      }
    } catch {
      // skip
    }
  }
  return familyMetas;
}

export default async function GamePage({ params }: Props) {
  const { locale, slug } = await params;
  const game = await GameFactory.createGame(slug, locale);

  if (!game) {
    notFound();
  }

  const familyGames = await getFamilyGames(game.meta);
  const gameName = game.meta.name[locale as "en" | "zh"] ?? game.meta.name.en;

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <GameHeader meta={game.meta} hasFlow={game.flow !== null} rules={game.rules} />
        <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
          <MarkdownRenderer content={game.rules} />
        </div>
        {familyGames.length > 1 && (
          <RelatedGames current={game.meta} related={familyGames} />
        )}
      </div>
      <ChatToggle
        scope={{ type: "game", slug, gameName, rules: game.rules }}
        locale={locale}
      />
    </>
  );
}
