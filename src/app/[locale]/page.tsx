import { GameFactory } from "@/lib/content/GameFactory";
import { GameRepository } from "@/lib/content/GameRepository";
import { GameCardGrid } from "@/components/home/GameCardGrid";
import { ChatToggle } from "@/components/chat/ChatToggle";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const slugs = await GameRepository.getAllGameSlugs();
  const games = await Promise.all(
    slugs.map((slug) => GameFactory.createGameSummary(slug))
  );

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <GameCardGrid games={games} />
      </div>
      <ChatToggle scope={{ type: "global" }} locale={locale} />
    </>
  );
}
