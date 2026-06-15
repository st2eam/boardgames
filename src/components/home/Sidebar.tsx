"use client";

import { useTranslations } from "next-intl";

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
