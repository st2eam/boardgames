import { GameFactory } from "@/lib/content/GameFactory";
import { GameRepository } from "@/lib/content/GameRepository";
import { GameHeader } from "@/components/game/GameHeader";
import { MarkdownRenderer } from "@/components/game/MarkdownRenderer";
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

export default async function GamePage({ params }: Props) {
  const { locale, slug } = await params;
  const game = await GameFactory.createGame(slug, locale);

  if (!game) {
    notFound();
  }

  const gameName = game.meta.name[locale as "en" | "zh"] ?? game.meta.name.en;

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <GameHeader meta={game.meta} hasFlow={game.flow !== null} />
        <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
          <MarkdownRenderer content={game.rules} />
        </div>
      </div>
      <ChatToggle
        scope={{ type: "game", slug, gameName, rules: game.rules }}
        locale={locale}
      />
    </>
  );
}
