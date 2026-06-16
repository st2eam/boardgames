"use client";

import { useState } from "react";
import type { CardDef, FilterDef } from "@/types/game";

interface Props {
  cards: CardDef[];
  selections: Record<string, number>;
  onUpdate: (cardId: string, delta: number) => void;
  filters?: FilterDef[];
  locale: string;
}

const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
  green: "#22c55e",
  "dark-blue": "#1e40af",
  yellow: "#eab308",
  orange: "#f97316",
  black: "#1c1917",
  white: "#f5f5f4",
  pink: "#ec4899",
  teal: "#14b8a6",
};

export function CardSelector({ cards, selections, onUpdate, filters, locale }: Props) {
  const lang = locale as "en" | "zh";
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const filter = filters?.[0];
  const safeSelections = selections ?? {};

  const filtered = activeFilter === "all"
    ? cards
    : cards.filter((c) => c.group === activeFilter || c.tier === activeFilter);

  return (
    <div>
      {filter && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {filter.values.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveFilter(v.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeFilter === v.id
                  ? "bg-accent text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {v.name[lang]}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {filtered.map((card) => {
          const count = safeSelections[card.id] ?? 0;
          const maxCount = card.count ?? 99;
          return (
            <div
              key={card.id}
              className={`rounded-xl border p-3 transition-all ${
                count > 0
                  ? "border-accent/40 bg-accent/5 shadow-sm"
                  : "border-stone-200 bg-white"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-stone-800 block truncate">
                    {card.name[lang]}
                  </span>
                  {card.points !== undefined && (
                    <span className="text-[11px] text-stone-400">{card.points} pts</span>
                  )}
                </div>
                {card.color && (
                  <span
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-stone-200/60"
                    style={{ backgroundColor: COLOR_MAP[card.color] ?? card.color }}
                    title={card.color}
                  />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdate(card.id, -1)}
                    disabled={count <= 0}
                    className="h-7 w-7 rounded-lg bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-base font-medium"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold tabular-nums text-stone-800">
                    {count}
                  </span>
                  <button
                    onClick={() => onUpdate(card.id, 1)}
                    disabled={count >= maxCount}
                    className="h-7 w-7 rounded-lg bg-stone-100 text-stone-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-base font-medium"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] text-stone-300">
                  /{maxCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
