"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CategoryItem {
  name: string;
  total: number;
  count: number;
}

interface GameItem {
  name: string;
  category: string;
  price: number | null;
  acquiredDate: string | null;
}

interface SpendingPoint {
  date: string;
  added: number;
  cumulative: number;
  count: number;
  names: string[];
}

interface Props {
  locale: string;
  totalSpent: number;
  gameCount: number;
  avgPrice: number;
  categoryData: CategoryItem[];
  gameList: GameItem[];
  spendingTimeline: SpendingPoint[];
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const fps = 60;
    const totalFrames = Math.round(duration / (1000 / fps));
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (frame >= totalFrames) { setDisplay(value); clearInterval(timer); }
    }, 1000 / fps);
    return () => clearInterval(timer);
  }, [value, inView]);

  return <span ref={ref} className="tabular-nums">{prefix}{display.toLocaleString()}{suffix}</span>;
}

interface MonthlySpending {
  month: string;
  added: number;
  count: number;
  names: string[];
}

function MonthlyTooltip({ active, payload, locale }: { active?: boolean; payload?: Array<{ payload: MonthlySpending }>; locale: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border/60 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="text-sm font-semibold text-primary">{d.month}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-accent">
        ¥{d.added.toLocaleString()}
      </p>
      <p className="text-xs text-primary/50">
        {locale === "zh"
          ? `当月购入 ${d.count} 款`
          : `${d.count} ${d.count === 1 ? "game" : "games"} acquired`}
      </p>
      {d.names.length > 0 && (
        <p className="mt-1 max-w-[220px] text-xs text-primary/60">{d.names.join("、")}</p>
      )}
    </div>
  );
}

function StaggerChild({ index, children, className = "" }: { index: number; children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function CostDashboard({
  locale,
  totalSpent,
  gameCount,
  avgPrice,
  categoryData,
  gameList,
  spendingTimeline,
}: Props) {
  const t = useTranslations("costs");

  const CATEGORY_LABELS: Record<string, Record<string, string>> = {
    card: { en: "Card", zh: "卡牌" },
    board: { en: "Board", zh: "桌游" },
    tile: { en: "Tile", zh: "牌类" },
    dice: { en: "Dice", zh: "骰子" },
  };

  const catLabel = (key: string) =>
    CATEGORY_LABELS[key]?.[locale] ?? key;

  const paidGames = gameList.filter(
    (game): game is GameItem & { price: number } => game.price !== null && game.price > 0
  );
  const maxCategoryTotal = Math.max(...categoryData.map((category) => category.total), 1);
  const topGames = paidGames.slice(0, 6);
  const maxGamePrice = topGames[0]?.price ?? 1;
  const priceBands = [
    {
      label: locale === "zh" ? "¥50 以下" : "Under ¥50",
      games: paidGames.filter((game) => game.price < 50),
    },
    {
      label: "¥50–99",
      games: paidGames.filter((game) => game.price >= 50 && game.price < 100),
    },
    {
      label: "¥100–199",
      games: paidGames.filter((game) => game.price >= 100 && game.price < 200),
    },
    {
      label: locale === "zh" ? "¥200 及以上" : "¥200 and over",
      games: paidGames.filter((game) => game.price >= 200),
    },
  ].map((band) => ({
    ...band,
    count: band.games.length,
    total: band.games.reduce((sum, game) => sum + game.price, 0),
  }));
  const maxBandCount = Math.max(...priceBands.map((band) => band.count), 1);

  const monthlyMap = new Map<string, MonthlySpending>();
  for (const point of spendingTimeline) {
    const month = point.date.slice(0, 7);
    const current = monthlyMap.get(month) ?? { month, added: 0, count: 0, names: [] };
    current.added += point.added;
    current.count += point.names.length;
    current.names.push(...point.names);
    monthlyMap.set(month, current);
  }
  const monthlySpending = Array.from(monthlyMap.values());
  const averageActiveMonth = monthlySpending.length > 0
    ? Math.round(monthlySpending.reduce((sum, month) => sum + month.added, 0) / monthlySpending.length)
    : 0;

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <StaggerChild index={0}>
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary-dark to-primary p-8 sm:p-10">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }} />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
              {locale === "zh" ? "私人数据" : "Private Data"}
            </p>
            <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-lg text-base text-white/50">
              {locale === "zh"
                ? "追踪你的桌游收藏花费，了解你在每个品类上的投入"
                : "Track your board game collection spending across every category"}
            </p>
          </div>
        </div>
      </StaggerChild>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          {
            icon: (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 10.818a4.5 4.5 0 00-3.5-4.618V4.5a.75.75 0 00-1.5 0v1.7A4.5 4.5 0 002.25 10.818V14.5a.75.75 0 001.5 0v-3.682a3 3 0 012.5-2.96V14.5a.75.75 0 001.5 0V7.858a3 3 0 012.5 2.96V14.5a.75.75 0 001.5 0v-3.682z" />
                <path d="M17.75 10.818a4.5 4.5 0 00-3.5-4.618V4.5a.75.75 0 00-1.5 0v1.7a4.494 4.494 0 00-1.397.742.75.75 0 10.894 1.204A3 3 0 0114.25 7.858V14.5a.75.75 0 001.5 0V7.858a3 3 0 012.5 2.96V14.5a.75.75 0 001.5 0v-3.682z" />
              </svg>
            ),
            label: t("totalSpent"),
            value: <AnimatedNumber value={totalSpent} prefix="¥" />,
            accent: true,
          },
          {
            icon: (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06L6.56 10l1.72-1.72zm3.44-1.06a.75.75 0 111.06 1.06L11.06 10l1.72 1.72a.75.75 0 11-1.06 1.06l-2.25-2.25a.75.75 0 010-1.06l2.25-2.25z" clipRule="evenodd" />
              </svg>
            ),
            label: t("gamesWithPrice"),
            value: <AnimatedNumber value={gameCount} suffix={locale === "zh" ? " 款" : ""} />,
          },
          {
            icon: (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.732 6.232a2.5 2.5 0 013.536 0 .75.75 0 101.06-1.06A4 4 0 006.5 8v.165c0 .364.034.728.1 1.085H6a.75.75 0 000 1.5h.932a6.46 6.46 0 001.018 1.755l-.014.013-1.652 1.652a.75.75 0 101.06 1.06l1.652-1.652.013-.014A6.46 6.46 0 0010.765 14.5H11a.75.75 0 000-1.5h-.235a4.97 4.97 0 01-1.47-1.127A4.964 4.964 0 008.353 9.75H11a.75.75 0 000-1.5H8.1a3.5 3.5 0 01-.068-.585V8a2.5 2.5 0 01.7-1.768z" clipRule="evenodd" />
              </svg>
            ),
            label: t("averagePrice"),
            value: <AnimatedNumber value={avgPrice} prefix="¥" />,
          },
        ].map((card, i) => (
          <StaggerChild key={card.label} index={i + 1}>
            <div className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover ${
              card.accent
                ? "border-accent/20 bg-linear-to-br from-accent-light via-white to-white"
                : "border-border bg-white"
            }`}>
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
                card.accent
                  ? "bg-accent/10 text-accent"
                  : "bg-primary-light text-primary/60"
              }`}>
                {card.icon}
              </div>
              <p className="text-sm font-medium text-primary/50">{card.label}</p>
              <p className={`mt-1 text-3xl font-bold tracking-tight ${
                card.accent ? "text-accent-dark" : "text-primary"
              }`}>
                {card.value}
              </p>
            </div>
          </StaggerChild>
        ))}
      </div>

      {categoryData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <StaggerChild index={4} className="lg:col-span-3">
            <section className="h-full rounded-2xl border border-border bg-white p-6 transition-shadow duration-300 hover:shadow-card-hover">
              <h2 className="font-heading text-lg font-semibold text-primary">
                {locale === "zh" ? "钱花在哪" : "Where the money went"}
              </h2>
              <p className="mt-1 text-xs text-primary/40">
                {locale === "zh" ? "分类金额、占比与平均单价放在一起比较" : "Compare spend, share, and average price together"}
              </p>
              <div className="mt-7 space-y-7">
                {categoryData.map((category, index) => {
                  const share = totalSpent > 0 ? category.total / totalSpent : 0;
                  const average = category.count > 0 ? Math.round(category.total / category.count) : 0;
                  return (
                    <div key={category.name}>
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="font-heading text-base font-semibold text-primary">{catLabel(category.name)}</p>
                          <p className="mt-0.5 text-xs text-primary/45">
                            {category.count} {locale === "zh" ? "款" : "games"} · {locale === "zh" ? "均价" : "avg."} ¥{average.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading text-xl font-bold tabular-nums text-primary">¥{category.total.toLocaleString()}</p>
                          <p className="text-xs font-semibold tabular-nums text-accent-dark">{(share * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-primary-light" aria-hidden="true">
                        <div
                          className={index === 0 ? "h-full rounded-full bg-accent" : "h-full rounded-full bg-primary/65"}
                          style={{ width: `${Math.max((category.total / maxCategoryTotal) * 100, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </StaggerChild>

          <StaggerChild index={5} className="lg:col-span-2">
            <section className="h-full rounded-2xl border border-border bg-primary-light/45 p-6">
              <h2 className="font-heading text-lg font-semibold text-primary">
                {locale === "zh" ? "单价分布" : "Price distribution"}
              </h2>
              <p className="mt-1 text-xs text-primary/40">
                {locale === "zh" ? "看看收藏集中在哪个价格带" : "See where most purchases are concentrated"}
              </p>
              <div className="mt-6 space-y-5">
                {priceBands.map((band) => (
                  <div key={band.label}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-primary/70">{band.label}</span>
                      <span className="font-semibold tabular-nums text-primary">
                        {band.count} {locale === "zh" ? "款" : band.count === 1 ? "game" : "games"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-accent transition-[width] duration-700"
                          style={{ width: `${Math.max((band.count / maxBandCount) * 100, band.count > 0 ? 3 : 0)}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs tabular-nums text-primary/45">¥{band.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </StaggerChild>
        </div>
      )}

      {monthlySpending.length > 0 && (
        <StaggerChild index={6}>
          <section className="rounded-2xl border border-border bg-white p-6 transition-shadow duration-300 hover:shadow-card-hover">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-heading text-lg font-semibold text-primary">
                  {locale === "zh" ? "每月买了多少" : "Monthly spending"}
                </h2>
                <p className="mt-1 text-xs text-primary/40">
                  {locale === "zh"
                    ? `${monthlySpending.length} 个有购入记录的月份 · 柱高代表当月花费`
                    : `${monthlySpending.length} active months · bar height shows monthly spend`}
                </p>
              </div>
              <p className="text-xs text-primary/45">
                {locale === "zh" ? "活跃月均" : "Average active month"}{" "}
                <span className="font-semibold tabular-nums text-primary">¥{averageActiveMonth.toLocaleString()}</span>
              </p>
            </div>
            <div className="mt-5" role="img" aria-label={locale === "zh" ? "按月花费柱状图" : "Monthly spending bar chart"}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlySpending} margin={{ top: 16, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.45} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "var(--color-primary)", fontSize: 11, fontWeight: 500, opacity: 0.6 }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                    tickFormatter={(month: string) => month.slice(2).replace("-", "/")}
                    minTickGap={18}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-primary)", fontSize: 11, opacity: 0.45 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) => `¥${value}`}
                    width={54}
                  />
                  <ReferenceLine
                    y={averageActiveMonth}
                    stroke="var(--color-primary)"
                    strokeOpacity={0.35}
                    strokeDasharray="5 5"
                  />
                  <Tooltip content={<MonthlyTooltip locale={locale} />} cursor={{ fill: "var(--color-accent-light)" }} />
                  <Bar
                    dataKey="added"
                    fill="var(--color-accent)"
                    radius={[6, 6, 2, 2]}
                    maxBarSize={38}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </StaggerChild>
      )}

      {topGames.length > 0 && (
        <StaggerChild index={7}>
          <section className="rounded-2xl border border-border bg-white p-6 transition-shadow duration-300 hover:shadow-card-hover">
            <h2 className="font-heading text-lg font-semibold text-primary">
              {locale === "zh" ? "最贵的几款" : "Most expensive games"}
            </h2>
            <p className="mt-1 text-xs text-primary/40">
              {locale === "zh" ? "快速找到拉高收藏成本的单品" : "The purchases contributing most to collection cost"}
            </p>
            <ol className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
              {topGames.map((game, index) => (
                <li key={`${game.name}-${index}`} className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-x-3">
                  <span className="row-span-3 self-start pt-0.5 font-heading text-sm font-semibold tabular-nums text-primary/30">{index + 1}</span>
                  <div className="flex min-w-0 items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-primary">{game.name}</span>
                    <span className="shrink-0 font-heading text-sm font-bold tabular-nums text-primary">¥{game.price.toLocaleString()}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-primary/40">
                    {catLabel(game.category)}{game.acquiredDate ? ` · ${game.acquiredDate}` : ""}
                  </p>
                  <div className="col-start-2 mt-2 h-2 overflow-hidden rounded-full bg-primary-light" aria-hidden="true">
                    <div className="h-full rounded-full bg-primary/65" style={{ width: `${(game.price / maxGamePrice) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </StaggerChild>
      )}

      {/* Detailed List */}
      <StaggerChild index={6}>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <div className="border-b border-border bg-linear-to-r from-primary-light/40 to-transparent px-6 py-5">
            <h2 className="font-heading text-lg font-semibold text-primary">
              {t("detailedList")}
            </h2>
            <p className="mt-0.5 text-xs text-primary/40">
              {locale === "zh"
                ? `共 ${gameList.length} 款游戏，已收录价格按从高到低排列，未收录排在末尾`
                : `${gameList.length} games · priced high to low, unlisted last`}
            </p>
          </div>
          {gameList.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary/30">
                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-primary/50">{t("noData")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-primary/40">
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">{t("game")}</th>
                    <th className="px-6 py-3">{t("category")}</th>
                    <th className="px-6 py-3">{locale === "zh" ? "购入日期" : "Date"}</th>
                    <th className="px-6 py-3 text-right">{t("price")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {gameList.map((game, i) => (
                    <tr
                      key={game.name}
                      className="group transition-colors duration-150 hover:bg-accent-light/20"
                    >
                      <td className="px-6 py-3.5 tabular-nums text-xs text-primary/30">
                        {i + 1}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-medium text-primary transition-colors group-hover:text-accent-dark">
                          {game.name}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center rounded-md bg-primary-light/60 px-2 py-0.5 text-xs font-medium text-primary/70">
                          {catLabel(game.category)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 tabular-nums text-xs text-primary/50">
                        {game.acquiredDate ?? (
                          <span className="text-primary/25">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right tabular-nums">
                        {game.price == null ? (
                          <span
                            className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: "#FFF3CD", color: "#856404" }}
                          >
                            {locale === "zh" ? "未收录" : "Unlisted"}
                          </span>
                        ) : game.price === 0 ? (
                          <span className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            {t("free")}
                          </span>
                        ) : (
                          <span className="font-semibold text-primary">¥{game.price.toLocaleString()}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-linear-to-r from-primary-light/50 to-primary-light/20">
                    <td className="px-6 py-4" />
                    <td className="px-6 py-4 font-heading font-semibold text-primary">
                      {t("totalSpent")}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary/50">
                      {gameList.length} {locale === "zh" ? "款" : "games"}
                    </td>
                    <td className="px-6 py-4 text-right font-heading text-lg font-bold tabular-nums text-accent-dark">
                      ¥{totalSpent.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </StaggerChild>
    </div>
  );
}
