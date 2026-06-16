"use client";

import type { ColorDef } from "@/types/game";

interface Props {
  colors: ColorDef[];
  selections: Record<string, number>;
  onUpdate: (colorId: string, delta: number) => void;
  locale: string;
}

export function ColorCounter({ colors, selections, onUpdate, locale }: Props) {
  const lang = locale as "en" | "zh";
  const safeSelections = selections ?? {};

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {colors.map((color) => {
        const count = safeSelections[`color:${color.id}`] ?? 0;
        return (
          <div
            key={color.id}
            className={`rounded-xl border p-2.5 transition-all ${
              count > 0
                ? "border-stone-300 bg-stone-50 shadow-sm"
                : "border-stone-200 bg-white"
            }`}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-stone-200/60"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-xs font-medium text-stone-700 truncate">
                {color.name[lang]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onUpdate(`color:${color.id}`, -1)}
                  disabled={count <= 0}
                  className="h-6 w-6 rounded-md bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
                >
                  −
                </button>
                <span className="w-5 text-center text-xs font-bold tabular-nums text-stone-800">
                  {count}
                </span>
                <button
                  onClick={() => onUpdate(`color:${color.id}`, 1)}
                  disabled={count >= color.count}
                  className="h-6 w-6 rounded-md bg-stone-100 text-stone-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
                >
                  +
                </button>
              </div>
              <span className="text-[9px] text-stone-300">/{color.count}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
