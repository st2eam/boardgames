"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { GameSummary } from "@/types/game";
import { useTranslations, useLocale } from "next-intl";
import { GameCard } from "./GameCard";
import { GameFamilyCard } from "./GameFamilyCard";
import { Sidebar } from "./Sidebar";
import { PlayerCountSlider } from "./PlayerCountSlider";
import { SearchableSelect } from "./SearchableSelect";
import { SearchBox } from "./SearchBox";
import { RecentGames } from "./RecentGames";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  games: GameSummary[];
}

type GridItem =
  | { type: "single"; game: GameSummary }
  | { type: "family"; key: string; games: GameSummary[] };

export type SortMode = "english" | "chinese" | "bggRank";

function parseSortMode(value: string | null): SortMode {
  if (value === "chinese" || value === "bggRank" || value === "english") return value;
  return "english";
}

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipUrlSync = useRef(true);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => {
    const raw = searchParams.get("tag");
    return raw ? new Set(raw.split(",").filter(Boolean)) : new Set();
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    () => searchParams.get("cat")
  );
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number | null>(() => {
    const raw = searchParams.get("players");
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  });
  const [sortMode, setSortMode] = useState<SortMode>(() =>
    parseSortMode(searchParams.get("sort"))
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(() =>
    searchParams.get("dir") === "desc" ? "desc" : "asc"
  );

  // Sync filters → URL (shareable / refresh-safe)
  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory) params.set("cat", selectedCategory);
    if (selectedTags.size > 0) {
      params.set("tag", Array.from(selectedTags).join(","));
    }
    if (selectedPlayerCount !== null) {
      params.set("players", String(selectedPlayerCount));
    }
    if (sortMode !== "english") params.set("sort", sortMode);
    if (sortDir !== "asc") params.set("dir", sortDir);

    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    const current = `${pathname}${window.location.search}`;
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedTags,
    selectedPlayerCount,
    sortMode,
    sortDir,
    pathname,
    router,
  ]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTags(new Set());
    setSelectedPlayerCount(null);
  }, []);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== null ||
    selectedTags.size > 0 ||
    selectedPlayerCount !== null;

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
    const q = searchQuery.trim().toLowerCase();
    return enriched.filter((g) => {
      if (q) {
        const haystack = `${g.name.en} ${g.name.zh}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
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
  }, [enriched, searchQuery, selectedTags, selectedCategory, selectedPlayerCount]);

  const hasSeriesFilter = useMemo(
    () => Array.from(selectedTags).some((t) => familyTagSet.has(t)),
    [selectedTags, familyTagSet]
  );

  const gridItems = useMemo((): GridItem[] => {
    // Shared sort comparator that respects sortMode + sortDir
    const cmp = (a: GameSummary, b: GameSummary): number => {
      // Family grouping takes priority when series filter is active
      if (hasSeriesFilter && a.family === b.family && a.family) {
        return (a.familyOrder ?? 0) - (b.familyOrder ?? 0);
      }
      let r = 0;
      if (sortMode === "bggRank") {
        const ra = a.bggRank ?? Infinity;
        const rb = b.bggRank ?? Infinity;
        r = ra - rb;
      } else if (sortMode === "chinese") {
        r = a.name.zh.localeCompare(b.name.zh, "zh-CN");
      } else {
        r = a.name.en.localeCompare(b.name.en);
      }
      return sortDir === "asc" ? r : -r;
    };

    if (hasSeriesFilter) {
      return filtered
        .slice()
        .sort(cmp)
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

    // Sort grid items by the representative game
    items.sort((a, b) => {
      const ga = a.type === "family" ? a.games[0] : a.game;
      const gb = b.type === "family" ? b.games[0] : b.game;
      return cmp(ga, gb);
    });

    return items;
  }, [filtered, hasSeriesFilter, sortMode, sortDir]);

  const mobileSeriesTags = useMemo(
    () => allTags.filter((t) => familyTagSet.has(t)),
    [allTags, familyTagSet]
  );
  const mobileRegularTags = useMemo(
    () => allTags.filter((t) => !familyTagSet.has(t)),
    [allTags, familyTagSet]
  );
  const mobileSelectedSeriesTags = useMemo(
    () => new Set(Array.from(selectedTags).filter((t) => familyTagSet.has(t))),
    [selectedTags, familyTagSet]
  );
  const mobileSelectedRegularTags = useMemo(
    () => new Set(Array.from(selectedTags).filter((t) => !familyTagSet.has(t))),
    [selectedTags, familyTagSet]
  );

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
        {/* Mobile: search box */}
        <div className="mb-2 lg:hidden">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("search")}
          />
        </div>

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
            <button
              onClick={() => setSortMode("english")}
              className={`cursor-pointer shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                sortMode === "english"
                  ? "bg-primary text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-amber-50"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setSortMode("chinese")}
              className={`cursor-pointer shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                sortMode === "chinese"
                  ? "bg-primary text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-amber-50"
              }`}
            >
              中文
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
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="cursor-pointer shrink-0 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-primary transition-colors"
              title={sortDir === "asc" ? "Ascending" : "Descending"}
            >
              {sortDir === "asc" ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop: full sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
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
            sortDir={sortDir}
            onToggleSortDir={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          />
        </div>

        {/* Mobile: player count slider */}
        {playerCounts.length > 0 && (
          <div className="mt-3 px-1 lg:hidden">
            <div className="mb-1 text-[11px] font-medium text-stone-400">
              {t("playerCount")}
            </div>
            <PlayerCountSlider
              counts={playerCounts}
              value={selectedPlayerCount}
              onChange={setSelectedPlayerCount}
              anyLabel={t("anyPlayerCount")}
            />
          </div>
        )}

        {/* Mobile: series & tags selects */}
        <div className="mt-3 space-y-3 lg:hidden">
          {mobileSeriesTags.length > 0 && (
            <div>
              <div className="mb-1 text-[11px] font-medium text-stone-400">
                {t("series")}
              </div>
              <SearchableSelect
                options={mobileSeriesTags}
                selected={mobileSelectedSeriesTags}
                onToggle={toggleTag}
                placeholder={t("series")}
                accentClass="bg-violet-500 text-white"
                selectedBgClass="bg-violet-100 text-violet-700"
                optionBgClass="hover:bg-violet-50"
              />
            </div>
          )}
          {mobileRegularTags.length > 0 && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-400">Tags</span>
                {selectedTags.size > 0 && (
                  <button
                    onClick={() => setSelectedTags(new Set())}
                    className="cursor-pointer text-[11px] text-stone-400 hover:text-stone-600"
                  >
                    {tc("clear")}
                  </button>
                )}
              </div>
              <SearchableSelect
                options={mobileRegularTags}
                selected={mobileSelectedRegularTags}
                onToggle={toggleTag}
                placeholder="Tags"
                accentClass="bg-accent text-white"
                selectedBgClass="bg-amber-100 text-amber-800"
                optionBgClass="hover:bg-amber-50"
              />
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="min-w-0 flex-1">
        {!hasActiveFilters && <RecentGames games={games} />}

        {gridItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 grid-flow-dense">
            <AnimatePresence mode="popLayout">
              {gridItems.map((item) => {
                const key = item.type === "family" ? item.key : item.game.slug;
                const category =
                  item.type === "family"
                    ? item.games[0].category
                    : item.game.category;
                const spanClass =
                  category === "card"
                    ? "sm:col-span-1 sm:row-span-2"
                    : category === "board"
                      ? "sm:col-span-2"
                      : "";
                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.28,
                      ease: [0.22, 1, 0.36, 1],
                      layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                    }}
                    className={spanClass}
                  >
                    {item.type === "family" ? (
                      <GameFamilyCard games={item.games} sortMode={sortMode} />
                    ) : (
                      <GameCard game={item.game} sortMode={sortMode} />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-white/60 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-accent">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-stone-600">
                {t("noGamesFound")}
              </p>
              <p className="mt-1 text-sm text-stone-400">
                {t("noGamesFoundHint")}
              </p>
            </div>
            {hasActiveFilters && (
              <div className="flex flex-wrap justify-center gap-2 text-xs text-stone-500">
                {searchQuery.trim() && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-1">
                    “{searchQuery.trim()}”
                  </span>
                )}
                {selectedCategory && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 capitalize">
                    {selectedCategory}
                  </span>
                )}
                {selectedPlayerCount !== null && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-1">
                    {selectedPlayerCount}P
                  </span>
                )}
                {Array.from(selectedTags).map((tag) => (
                  <span key={tag} className="rounded-full bg-stone-100 px-2.5 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={clearFilters}
              className="cursor-pointer rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent/90"
            >
              {t("clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
