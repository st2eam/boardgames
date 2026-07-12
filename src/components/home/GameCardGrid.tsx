"use client";

import { useState, useMemo } from "react";
import type { GameSummary } from "@/types/game";
import { useTranslations, useLocale } from "next-intl";
import { GameCard } from "./GameCard";
import { GameFamilyCard } from "./GameFamilyCard";
import { Sidebar } from "./Sidebar";

interface Props {
  games: GameSummary[];
}

type GridItem =
  | { type: "single"; game: GameSummary }
  | { type: "family"; key: string; games: GameSummary[] };

export type SortMode = "alphabetical" | "bggRank";

function deriveFamilyTags(
  games: GameSummary[],
  locale: string
): { enriched: GameSummary[]; familyTagSet: Set<string> } {
  const familyNameMap = new Map<string, string>();
  for (const g of games) {
    if (g.family && g.familyOrder === 0) {
      const name = g.name[locale as "en" | "zh"] ?? g.name.en;
      familyNameMap.set(g.family, name);
    }
  }

  const familyTagSet = new Set<string>();
  const enriched = games.map((g) => {
    if (!g.family) return g;
    const seriesName = familyNameMap.get(g.family);
    if (!seriesName) return g;
    const seriesTag = `${seriesName}${locale === "zh" ? " 系列" : " series"}`;
    familyTagSet.add(seriesTag);
    if (g.tags.includes(seriesTag)) return g;
    return { ...g, tags: [...g.tags, seriesTag] };
  });

  return { enriched, familyTagSet };
}

export function GameCardGrid({ games }: Props) {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("alphabetical");

  const { enriched, familyTagSet } = useMemo(
    () => deriveFamilyTags(games, locale),
    [games, locale]
  );

  const allTags = useMemo(() => {
    const raw = Array.from(new Set(enriched.flatMap((g) => g.tags)));
    return raw.sort((a, b) => {
      const aIsSeries = familyTagSet.has(a) ? 1 : 0;
      const bIsSeries = familyTagSet.has(b) ? 1 : 0;
      if (aIsSeries !== bIsSeries) return aIsSeries - bIsSeries;
      return a.localeCompare(b);
    });
  }, [enriched, familyTagSet]);

  const categories = useMemo(
    () => Array.from(new Set(enriched.map((g) => g.category))).sort(),
    [enriched]
  );

  const playerCounts = useMemo(() => {
    const counts = new Set<number>();
    for (const g of enriched) {
      const match = g.players.match(/(\d+)\s*[-–]\s*(\d+)/);
      if (match) {
        const min = parseInt(match[1], 10);
        const max = parseInt(match[2], 10);
        for (let i = min; i <= max; i++) counts.add(i);
      } else {
        const single = parseInt(g.players, 10);
        if (!isNaN(single)) counts.add(single);
      }
    }
    return Array.from(counts).sort((a, b) => a - b);
  }, [enriched]);

  const filtered = useMemo(() => {
    return enriched.filter((g) => {
      if (selectedTags.size > 0 && !g.tags.some((t) => selectedTags.has(t))) {
        return false;
      }
      if (selectedCategory && g.category !== selectedCategory) {
        return false;
      }
      if (selectedPlayerCount !== null) {
        const match = g.players.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (match) {
          const min = parseInt(match[1], 10);
          const max = parseInt(match[2], 10);
          if (selectedPlayerCount < min || selectedPlayerCount > max) return false;
        } else {
          const single = parseInt(g.players, 10);
          if (isNaN(single) || single !== selectedPlayerCount) return false;
        }
      }
      return true;
    });
  }, [enriched, selectedTags, selectedCategory, selectedPlayerCount]);

  const hasSeriesFilter = useMemo(
    () => Array.from(selectedTags).some((t) => familyTagSet.has(t)),
    [selectedTags, familyTagSet]
  );

  const gridItems = useMemo((): GridItem[] => {
    if (hasSeriesFilter) {
      return filtered
        .slice()
        .sort((a, b) => {
          if (a.family === b.family && a.family) {
            return (a.familyOrder ?? 0) - (b.familyOrder ?? 0);
          }
          if (sortMode === "bggRank") {
            const rankA = a.bggRank ?? Infinity;
            const rankB = b.bggRank ?? Infinity;
            if (rankA !== rankB) return rankA - rankB;
          }
          return a.name.en.localeCompare(b.name.en);
        })
        .map((game) => ({ type: "single" as const, game }));
    }

    const familyMap = new Map<string, GameSummary[]>();

    for (const game of filtered) {
      if (game.family) {
        if (!familyMap.has(game.family)) {
          familyMap.set(game.family, []);
        }
        familyMap.get(game.family)!.push(game);
      }
    }

    const items: GridItem[] = [];
    const processedFamilies = new Set<string>();

    for (const game of filtered) {
      if (game.family) {
        if (!processedFamilies.has(game.family)) {
          processedFamilies.add(game.family);
          const familyGames = familyMap.get(game.family)!;
          familyGames.sort(
            (a, b) => (a.familyOrder ?? 0) - (b.familyOrder ?? 0)
          );
          if (familyGames.length === 1) {
            items.push({ type: "single", game: familyGames[0] });
          } else {
            items.push({
              type: "family",
              key: game.family,
              games: familyGames,
            });
          }
        }
      } else {
        items.push({ type: "single", game });
      }
    }

    if (sortMode === "bggRank") {
      items.sort((a, b) => {
        const rankA = a.type === "family"
          ? (a.games[0].bggRank ?? Infinity)
          : (a.game.bggRank ?? Infinity);
        const rankB = b.type === "family"
          ? (b.games[0].bggRank ?? Infinity)
          : (b.game.bggRank ?? Infinity);
        if (rankA !== rankB) return rankA - rankB;
        const nameA = a.type === "family" ? a.games[0].name.en : a.game.name.en;
        const nameB = b.type === "family" ? b.games[0].name.en : b.game.name.en;
        return nameA.localeCompare(nameB);
      });
    } else {
      const getSortName = (item: GridItem) =>
        item.type === "family" ? item.games[0].name.en : item.game.name.en;
      items.sort((a, b) => getSortName(a).localeCompare(getSortName(b)));
    }

    return items;
  }, [filtered, hasSeriesFilter, sortMode]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      {/* Sidebar — desktop: sticky left, mobile: inline */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        {/* Mobile: horizontal scroll filter strip */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`cursor-pointer shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 ${
              selectedCategory === null
                ? "bg-primary text-white"
                : "bg-stone-100 text-stone-600 hover:bg-amber-50"
            }`}
          >
            {t("allGames")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
              className={`cursor-pointer shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-amber-50"
              }`}
            >
              {cat}
            </button>
          ))}
          {/* Mobile: sort toggle */}
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <span className="text-[11px] font-medium text-stone-400">{t("sortLabel")}</span>
            <button
              onClick={() => setSortMode("alphabetical")}
              className={`cursor-pointer shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                sortMode === "alphabetical"
                  ? "bg-primary text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-amber-50"
              }`}
            >
              A-Z
            </button>
            <button
              onClick={() => setSortMode("bggRank")}
              className={`cursor-pointer shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                sortMode === "bggRank"
                  ? "bg-primary text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-amber-50"
              }`}
            >
              BGG
            </button>
          </div>
        </div>

        {/* Desktop: full sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            allTags={allTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onClearTags={() => setSelectedTags(new Set())}
            totalCount={games.length}
            filteredCount={filtered.length}
            familyTags={familyTagSet}
            playerCounts={playerCounts}
            selectedPlayerCount={selectedPlayerCount}
            onSelectPlayerCount={setSelectedPlayerCount}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
          />
        </div>

        {/* Mobile: player count filter */}
        {playerCounts.length > 0 && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            <span className="shrink-0 self-center text-[11px] font-medium text-stone-400">
              {t("playerCount")}
            </span>
            <button
              onClick={() => setSelectedPlayerCount(null)}
              className={`cursor-pointer shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                selectedPlayerCount === null
                  ? "bg-emerald-500 text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-emerald-50"
              }`}
            >
              {t("anyPlayerCount")}
            </button>
            {playerCounts.map((n) => (
              <button
                key={n}
                onClick={() => setSelectedPlayerCount(selectedPlayerCount === n ? null : n)}
                className={`cursor-pointer shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300/50 ${
                  selectedPlayerCount === n
                    ? "bg-emerald-500 text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-emerald-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {/* Mobile: tag strip */}
        <div className="mt-3 flex flex-wrap gap-1 lg:hidden">
          {allTags.map((tag) => {
            const isSeries = familyTagSet.has(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-all focus:outline-none focus:ring-2 ${
                  selectedTags.has(tag)
                    ? isSeries
                      ? "bg-violet-500 text-white ring-violet-300/50"
                      : "bg-accent text-white ring-accent/50"
                    : isSeries
                      ? "bg-violet-50 text-violet-600 hover:bg-violet-100 ring-violet-300/50"
                      : "bg-stone-100 text-stone-500 hover:bg-accent-light ring-accent/50"
                }`}
              >
                {tag}
              </button>
            );
          })}
          {selectedTags.size > 0 && (
            <button
              onClick={() => setSelectedTags(new Set())}
              className="cursor-pointer rounded-full px-2 py-1 text-[11px] text-stone-400 hover:text-stone-600"
            >
              {tc("clear")}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="min-w-0 flex-1">
        {gridItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 grid-flow-dense">
            {gridItems.map((item) => {
              if (item.type === "family") {
                const base = item.games[0];
                return (
                  <div
                    key={item.key}
                    className={
                      base.category === "card"
                        ? "sm:col-span-1 sm:row-span-2"
                        : base.category === "board"
                          ? "sm:col-span-2"
                          : ""
                    }
                  >
                    <GameFamilyCard games={item.games} sortMode={sortMode} />
                  </div>
                );
              }
              return (
                <div
                  key={item.game.slug}
                  className={
                    item.game.category === "card"
                      ? "sm:col-span-1 sm:row-span-2"
                      : item.game.category === "board"
                        ? "sm:col-span-2"
                        : ""
                  }
                >
                  <GameCard game={item.game} sortMode={sortMode} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <p className="text-lg font-medium text-stone-400">
              {t("noGamesFound")}
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedTags(new Set());
                setSelectedPlayerCount(null);
              }}
              className="cursor-pointer text-sm text-accent hover:text-accent/80 transition-colors"
            >
              {tc("clear")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
