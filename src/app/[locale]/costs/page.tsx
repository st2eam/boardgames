import { GameRepository } from "@/lib/content/GameRepository";
import type { GameMeta } from "@/types/game";
import { CostDashboard } from "@/components/costs/CostDashboard";
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

  const gameList = gamesWithPrice.map((g) => ({
    name: g.name[locale as "en" | "zh"] ?? g.name.en,
    category: g.category,
    price: g.price ?? 0,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <CostDashboard
        locale={locale}
        totalSpent={totalSpent}
        gameCount={gameCount}
        avgPrice={avgPrice}
        categoryData={categoryData}
        gameList={gameList}
      />
    </div>
  );
}
