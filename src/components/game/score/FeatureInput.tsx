"use client";

import type { FeatureDef } from "@/types/game";

interface Props {
  features: FeatureDef[];
  selections: Record<string, number>;
  onUpdate: (featureId: string, delta: number) => void;
  locale: string;
}

export function FeatureInput({ features, selections, onUpdate, locale }: Props) {
  const lang = locale as "en" | "zh";
  const safeSelections = selections ?? {};

  return (
    <div className="space-y-2">
      {features.map((feature) => {
        const value = safeSelections[feature.id] ?? 0;
        return (
          <div
            key={feature.id}
            className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3"
          >
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-stone-800 block">
                {feature.name[lang]}
              </span>
              {feature.description && (
                <span className="text-[11px] text-stone-400">
                  {feature.description[lang]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <button
                onClick={() => onUpdate(feature.id, -1)}
                disabled={value <= 0}
                className="h-8 w-8 rounded-lg bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg font-medium"
              >
                −
              </button>
              <span className="w-8 text-center text-base font-bold tabular-nums text-stone-800">
                {value}
              </span>
              <button
                onClick={() => onUpdate(feature.id, 1)}
                className="h-8 w-8 rounded-lg bg-stone-100 text-stone-500 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center justify-center text-lg font-medium"
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
