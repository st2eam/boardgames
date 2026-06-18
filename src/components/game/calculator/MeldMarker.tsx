"use client";

import type { Decomposition } from "@/lib/mahjong";
import { MahjongTile } from "@/components/game/trainer/MahjongTile";

interface Props {
  decomposition: Decomposition | null;
  openMeldIndices: Set<number>;
  locale: string;
  onToggleMeld: (meldIndex: number) => void;
}

export function MeldMarker({ decomposition, openMeldIndices, locale, onToggleMeld }: Props) {
  if (!decomposition || decomposition.type !== "standard") {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="mb-2 text-sm font-medium text-primary-dark">
        {locale === "zh" ? "标记副露（点击面子切换明/暗）" : "Mark open melds (click to toggle)"}
      </div>
      <div className="space-y-2">
        {decomposition.melds.map((meld, idx) => {
          const isOpen = openMeldIndices.has(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onToggleMeld(idx)}
              className={`flex items-center gap-1 rounded-lg border-2 px-2 py-1.5 transition-all ${
                isOpen
                  ? "border-amber-400 bg-amber-50"
                  : "border-border bg-surface hover:border-stone-300"
              }`}
            >
              <div className="flex gap-0.5">
                {meld.tiles.map((tileId, ti) => (
                  <MahjongTile key={ti} tileId={tileId} size="sm" disabled />
                ))}
              </div>
              <span className={`ml-2 text-xs font-medium ${isOpen ? "text-amber-700" : "text-muted-foreground"}`}>
                {isOpen
                  ? (locale === "zh" ? "副露" : "Open")
                  : (locale === "zh" ? "暗" : "Closed")}
              </span>
            </button>
          );
        })}

        {/* Pair display */}
        <div className="flex items-center gap-1 rounded-lg border-2 border-dashed border-border px-2 py-1.5">
          <div className="flex gap-0.5">
            <MahjongTile tileId={decomposition.pair} size="sm" disabled />
            <MahjongTile tileId={decomposition.pair} size="sm" disabled />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">
            {locale === "zh" ? "雀头" : "Pair"}
          </span>
        </div>
      </div>
    </div>
  );
}
