import { GameRepository } from "@/lib/content/GameRepository";
import type { GameMeta } from "@/types/game";
import { CostDashboard } from "@/features/costs/CostDashboard";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (locale === "zh") {
    return buildPageMetadata({
      locale,
      title: "收藏花费",
      description: "查看桌游收藏的花费统计、分类分布与单价排行。",
      path: "/costs/",
    });
  }

  return buildPageMetadata({
    locale,
    title: "Collection Costs",
    description:
      "Spending overview for the board game collection — totals, categories, and price rankings.",
    path: "/costs/",
  });
}

export default async function CostsPage({ params }: Props) {
  const { locale } = await params;
  const slugs = await GameRepository.getAllGameSlugs();
  const allMetas: GameMeta[] = await Promise.all(
    slugs.map((slug) => GameRepository.getGameMeta(slug))
  );

  const gamesWithPrice = allMetas
    .filter((m) => m.price != null)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

  // Games without a recorded price are still listed and rendered as "未收录" badges.
  const gamesWithoutPrice = allMetas
    .filter((m) => m.price == null)
    .sort((a, b) =>
      (a.name[locale as "en" | "zh"] ?? a.name.en).localeCompare(
        b.name[locale as "en" | "zh"] ?? b.name.en
      )
    );

  const totalSpent = gamesWithPrice.reduce((sum, g) => sum + (g.price ?? 0), 0);
  const gameCount = gamesWithPrice.filter((g) => (g.price ?? 0) > 0).length;
  const avgPrice = gameCount > 0 ? Math.round(totalSpent / gameCount) : 0;

  const categoryMap = new Map<string, { total: number; count: number }>();
  for (const g of gamesWithPrice) {
    const cat = g.category;
    const prev = categoryMap.get(cat) ?? { total: 0, count: 0 };
    categoryMap.set(cat, {
      total: prev.total + (g.price ?? 0),
      count: prev.count + 1,
    });
  }

  const categoryData = Array.from(categoryMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);

  const displayName = (g: GameMeta) =>
    g.name[locale as "en" | "zh"] ?? g.name.en;

  // Cumulative spending timeline: priced games that have an acquisition date.
  const datedGames = gamesWithPrice
    .filter((g) => g.acquiredDate && (g.price ?? 0) > 0)
    .slice()
    .sort((a, b) => (a.acquiredDate ?? "").localeCompare(b.acquiredDate ?? ""));

  const dateGroups = new Map<string, GameMeta[]>();
  for (const g of datedGames) {
    const d = g.acquiredDate as string;
    const bucket = dateGroups.get(d) ?? [];
    bucket.push(g);
    dateGroups.set(d, bucket);
  }

  const round2 = (n: number) => Math.round(n * 100) / 100;
  let running = 0;
  let runningCount = 0;
  const spendingTimeline = Array.from(dateGroups.entries()).map(([date, games]) => {
    const added = games.reduce((sum, g) => sum + (g.price ?? 0), 0);
    running = round2(running + added);
    runningCount += games.length;
    return {
      date,
      added: round2(added),
      cumulative: running,
      count: runningCount,
      names: games.map(displayName),
    };
  });

  // Priced games first (high to low), unpriced games appended afterwards.
  const gameList = [
    ...gamesWithPrice.map((g) => ({
      name: displayName(g),
      category: g.category,
      price: g.price ?? 0,
      acquiredDate: g.acquiredDate ?? null,
    })),
    ...gamesWithoutPrice.map((g) => ({
      name: displayName(g),
      category: g.category,
      price: null,
      acquiredDate: g.acquiredDate ?? null,
    })),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <CostDashboard
        locale={locale}
        totalSpent={totalSpent}
        gameCount={gameCount}
        avgPrice={avgPrice}
        categoryData={categoryData}
        gameList={gameList}
        spendingTimeline={spendingTimeline}
      />
    </div>
  );
}
