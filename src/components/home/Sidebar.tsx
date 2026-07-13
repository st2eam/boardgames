"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import type { SortMode } from "./GameCardGrid";
import { PlayerCountSlider } from "./PlayerCountSlider";
import { SearchableSelect } from "./SearchableSelect";
import { SearchBox } from "./SearchBox";
import { AnimatedNumber } from "./AnimatedNumber";

interface Props {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  allTags: string[];
  selectedTags: Set<string>;
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  totalCount: number;
  filteredCount: number;
  familyTags?: Set<string>;
  playerCounts: number[];
  selectedPlayerCount: number | null;
  onSelectPlayerCount: (n: number | null) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  sortDir: "asc" | "desc";
  onToggleSortDir: () => void;
}

export function Sidebar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  allTags,
  selectedTags,
  onToggleTag,
  onClearTags,
  totalCount,
  filteredCount,
  familyTags,
  playerCounts,
  selectedPlayerCount,
  onSelectPlayerCount,
  sortMode,
  onSortModeChange,
  sortDir,
  onToggleSortDir,
}: Props) {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  const regularTags = allTags.filter((t) => !familyTags?.has(t));
  const seriesTags = allTags.filter((t) => familyTags?.has(t));

  const selectedSeriesTags = useMemo(
    () => new Set(Array.from(selectedTags).filter((t) => familyTags?.has(t))),
    [selectedTags, familyTags]
  );
  const selectedRegularTags = useMemo(
    () => new Set(Array.from(selectedTags).filter((t) => !familyTags?.has(t))),
    [selectedTags, familyTags]
  );

  return (
    <aside className="flex shrink-0 flex-col gap-6 lg:w-60">
      {/* Site identity */}
      <div>
        <div className="flex items-baseline gap-1.5">
          <AnimatedNumber
            value={filteredCount}
            className="font-heading text-2xl font-bold tracking-tight text-primary-dark"
          />
          <span className="text-xs text-stone-400">
            {filteredCount !== totalCount ? `/ ${totalCount}` : "games"}
          </span>
        </div>
      </div>

      {/* Search box */}
      <SearchBox
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={t("search")}
      />

      {/* Sort mode toggle */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            {t("sortLabel")}
          </h4>
          <button
            onClick={onToggleSortDir}
            className="cursor-pointer rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-primary transition-colors"
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
        <div className="flex gap-1">
          {([
            ["english", t("sortEnglish")],
            ["chinese", t("sortChinese")],
            ["bggRank", t("sortByBggRank")],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => onSortModeChange(mode)}
              className={`relative cursor-pointer rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                sortMode === mode
                  ? "text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-primary"
              }`}
            >
              {sortMode === mode && (
                <motion.span
                  layoutId="sortActiveIndicator"
                  className="absolute inset-0 rounded-md bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category nav */}
      {categories.length > 1 && (
        <nav className="space-y-0.5">
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            Category
          </h4>
          <button
            onClick={() => onSelectCategory(null)}
            className={`relative w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
              selectedCategory === null
                ? "text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-primary"
            }`}
          >
            {selectedCategory === null && (
              <motion.span
                layoutId="categoryActiveIndicator"
                className="absolute inset-0 rounded-lg bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{t("allGames")}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                onSelectCategory(selectedCategory === cat ? null : cat)
              }
              className={`relative w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                selectedCategory === cat
                  ? "text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-primary"
              }`}
            >
              {selectedCategory === cat && (
                <motion.span
                  layoutId="categoryActiveIndicator"
                  className="absolute inset-0 rounded-lg bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Player count slider */}
      {playerCounts.length > 0 && (
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            {t("playerCount")}
          </h4>
          <PlayerCountSlider
            counts={playerCounts}
            value={selectedPlayerCount}
            onChange={onSelectPlayerCount}
            anyLabel={t("anyPlayerCount")}
          />
        </div>
      )}

      {/* Series searchable select */}
      {seriesTags.length > 0 && (
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            {t("series")}
          </h4>
          <SearchableSelect
            options={seriesTags}
            selected={selectedSeriesTags}
            onToggle={onToggleTag}
            placeholder={t("series")}
            accentClass="bg-violet-500 text-white"
            selectedBgClass="bg-violet-100 text-violet-700"
            optionBgClass="hover:bg-violet-50"
          />
        </div>
      )}

      {/* Tags searchable select */}
      {regularTags.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
              Tags
            </h4>
            {selectedTags.size > 0 && (
              <button
                onClick={onClearTags}
                className="cursor-pointer text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
              >
                {tc("clear")}
              </button>
            )}
          </div>
          <SearchableSelect
            options={regularTags}
            selected={selectedRegularTags}
            onToggle={onToggleTag}
            placeholder="Tags"
            accentClass="bg-accent text-white"
            selectedBgClass="bg-amber-100 text-amber-800"
            optionBgClass="hover:bg-amber-50"
          />
        </div>
      )}
    </aside>
  );
}
