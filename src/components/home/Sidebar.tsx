"use client";

import { useTranslations } from "next-intl";
import type { SortMode } from "./GameCardGrid";

interface Props {
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

  return (
    <aside className="flex shrink-0 flex-col gap-6 lg:w-60">
      {/* Site identity */}
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-2xl font-bold tabular-nums tracking-tight text-primary-dark">
            {totalCount}
          </span>
          <span className="text-xs text-stone-400">
            {filteredCount !== totalCount ? `(${filteredCount} visible)` : "games"}
          </span>
        </div>
      </div>

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
          <button
            onClick={() => onSortModeChange("english")}
            className={`cursor-pointer rounded-md px-2.5 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 ${
              sortMode === "english"
                ? "bg-primary text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-primary"
            }`}
          >
            {t("sortEnglish")}
          </button>
          <button
            onClick={() => onSortModeChange("chinese")}
            className={`cursor-pointer rounded-md px-2.5 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 ${
              sortMode === "chinese"
                ? "bg-primary text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-primary"
            }`}
          >
            {t("sortChinese")}
          </button>
          <button
            onClick={() => onSortModeChange("bggRank")}
            className={`cursor-pointer rounded-md px-2.5 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 ${
              sortMode === "bggRank"
                ? "bg-primary text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-primary"
            }`}
          >
            {t("sortByBggRank")}
          </button>
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
            className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 ${
              selectedCategory === null
                ? "bg-primary text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-primary"
            }`}
          >
            {t("allGames")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                onSelectCategory(selectedCategory === cat ? null : cat)
              }
              className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium capitalize transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      )}

      {/* Player count filter */}
      {playerCounts.length > 0 && (
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            {t("playerCount")}
          </h4>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onSelectPlayerCount(null)}
              className={`cursor-pointer rounded-md px-2.5 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300/50 ${
                selectedPlayerCount === null
                  ? "bg-emerald-500 text-white"
                  : "text-stone-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {t("anyPlayerCount")}
            </button>
            {playerCounts.map((n) => (
              <button
                key={n}
                onClick={() =>
                  onSelectPlayerCount(selectedPlayerCount === n ? null : n)
                }
                className={`cursor-pointer rounded-md px-2.5 py-1.5 text-xs font-medium tabular-nums transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300/50 ${
                  selectedPlayerCount === n
                    ? "bg-emerald-500 text-white"
                    : "text-stone-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Series tags */}
      {seriesTags.length > 0 && (
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            {t("series")}
          </h4>
          <div className="flex flex-wrap gap-1">
            {seriesTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-violet-300/50 ${
                  selectedTags.has(tag)
                    ? "bg-violet-500 text-white"
                    : "bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tag cloud */}
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
          <div className="flex flex-wrap gap-1">
            {regularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  selectedTags.has(tag)
                    ? "bg-accent text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-accent-light hover:text-accent-dark"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
