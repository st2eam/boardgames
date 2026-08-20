"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#C4952A",
  "#5D4037",
  "#A1887F",
  "#8B6914",
  "#D4A843",
  "#795548",
  "#BCAAA4",
  "#6D4C41",
];

interface CategoryItem {
  name: string;
  total: number;
  count: number;
}

interface GameItem {
  name: string;
  category: string;
  price: number;
}

interface Props {
  locale: string;
  totalSpent: number;
  gameCount: number;
  avgPrice: number;
  categoryData: CategoryItem[];
  gameList: GameItem[];
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, mounted]);
  if (!mounted) return { ref, inView: true };
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

function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: CategoryItem & { displayName: string; percent: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-border/60 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="text-sm font-semibold text-primary">{d.payload.displayName}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-accent">¥{d.value.toLocaleString()}</p>
      <p className="text-xs text-primary/50">{d.payload.count} games · {(d.payload.percent * 100).toFixed(1)}%</p>
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: CategoryItem }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-border/60 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="text-sm font-semibold text-primary">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-accent">¥{d.value.toLocaleString()}</p>
      <p className="text-xs text-primary/50">{d.payload.count} games</p>
    </div>
  );
}

function StaggerChild({ index, children }: { index: number; children: React.ReactNode }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
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
}: Props) {
  const t = useTranslations("costs");

  const pieData = categoryData.map((c) => ({
    ...c,
    displayName: c.name,
    percent: totalSpent > 0 ? c.total / totalSpent : 0,
  }));

  const CATEGORY_LABELS: Record<string, Record<string, string>> = {
    card: { en: "Card", zh: "卡牌" },
    board: { en: "Board", zh: "桌游" },
    tile: { en: "Tile", zh: "牌类" },
    dice: { en: "Dice", zh: "骰子" },
  };

  const catLabel = (key: string) =>
    CATEGORY_LABELS[key]?.[locale] ?? key;

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

      {/* Charts */}
      {categoryData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pie Chart — Donut with center label */}
          <StaggerChild index={4}>
            <div className="rounded-2xl border border-border bg-white p-6 transition-shadow duration-300 hover:shadow-card-hover">
              <h2 className="mb-1 font-heading text-lg font-semibold text-primary">
                {t("spendingByCategory")}
              </h2>
              <p className="mb-4 text-xs text-primary/40">
                {locale === "zh" ? "各分类花费占比" : "Proportion of spending per category"}
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={120}
                    dataKey="total"
                    nameKey="displayName"
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    paddingAngle={3}
                    stroke="none"
                    label={({ displayName, percent }: { displayName?: string; percent?: number }) =>
                      `${catLabel(displayName ?? "")} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#BCAAA4", strokeWidth: 1 }}
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        className="transition-opacity duration-200 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <text
                    x="50%"
                    y="42%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-primary text-2xl font-bold"
                    style={{ fontSize: 24, fontWeight: 700 }}
                  >
                    ¥{totalSpent.toLocaleString()}
                  </text>
                  <text
                    x="50%"
                    y="52%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-primary/40 text-xs"
                    style={{ fontSize: 12 }}
                  >
                    {t("totalSpent")}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </StaggerChild>

          {/* Bar Chart */}
          <StaggerChild index={5}>
            <div className="rounded-2xl border border-border bg-white p-6 transition-shadow duration-300 hover:shadow-card-hover">
              <h2 className="mb-1 font-heading text-lg font-semibold text-primary">
                {t("categoryComparison")}
              </h2>
              <p className="mb-4 text-xs text-primary/40">
                {locale === "zh" ? "各分类花费金额对比" : "Absolute spending by category"}
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={categoryData.map((c) => ({ ...c, label: catLabel(c.name) }))}
                  margin={{ top: 10, right: 10, bottom: 5, left: 10 }}
                >
                  <defs>
                    {COLORS.map((color, i) => (
                      <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#D7CCC8"
                    strokeOpacity={0.3}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#5D4037", fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fill: "#A1887F", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `¥${v}`}
                    dx={-4}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(196, 149, 42, 0.06)", radius: 8 }} />
                  <Bar
                    dataKey="total"
                    radius={[8, 8, 0, 0]}
                    animationBegin={300}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    maxBarSize={56}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={`url(#barGrad${i % COLORS.length})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StaggerChild>
        </div>
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
                ? `共 ${gameList.length} 款游戏，按价格从高到低排列`
                : `${gameList.length} games, sorted by price descending`}
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
                      <td className="px-6 py-3.5 text-right tabular-nums">
                        {game.price === 0 ? (
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
