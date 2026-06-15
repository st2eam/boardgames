"use client";

import { useState, useMemo } from "react";
import type { GameSummary } from "@/types/game";
import { useTranslations } from "next-intl";
import { GameCard } from "./GameCard";

interface Props {
  games: GameSummary[];
}

export function GameCardGrid({ games }: Props) {
  const t = useTranslations("home");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allTags = useMemo(
    () => Array.from(new Set(games.flatMap((g) => g.tags))).sort(),
    [games]
  );

  const categories = useMemo(
    () => Array.from(new Set(games.map((g) => g.category))).sort(),
    [games]
  );

  const filtered = useMemo(() => {
    return games.filter((g) => {
      if (selectedTags.size > 0 && !g.tags.some((t) => selectedTags.has(t))) {
        return false;
      }
      if (selectedCategory && g.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [games, selectedTags, selectedCategory]);

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
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-3">
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                !selectedCategory
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
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
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  selectedCategory === cat
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs font-medium text-zinc-400 self-center mr-1">
            {t("filterByTags")}:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                selectedTags.has(tag)
                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-zinc-500">{t("noGamesFound")}</p>
      )}
    </div>
  );
}
