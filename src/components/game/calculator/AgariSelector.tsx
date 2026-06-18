"use client";

import { TILE_COUNT } from "@/lib/mahjong";
import { MahjongTile } from "@/components/game/trainer/MahjongTile";

interface Props {
  hand: number[];
  agariTile: number | null;
  locale: string;
  onSelect: (tileId: number) => void;
}

export function AgariSelector({ hand, agariTile, locale, onSelect }: Props) {
  const tiles: number[] = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    for (let j = 0; j < hand[i]; j++) {
      tiles.push(i);
    }
  }

  // Deduplicate for display: show each unique tile once with count
  const uniqueTiles = [...new Set(tiles)];

  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="mb-2 text-sm font-medium text-primary-dark">
        {locale === "zh" ? "选择和牌（最后一张）" : "Select winning tile (agari)"}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {uniqueTiles.map((tileId) => (
          <MahjongTile
            key={tileId}
            tileId={tileId}
            size="md"
            selected={agariTile === tileId}
            onClick={() => onSelect(tileId)}
          />
        ))}
      </div>
      {agariTile === null && (
        <p className="mt-2 text-xs text-amber-600">
          {locale === "zh" ? "请点击一张牌作为和牌" : "Click a tile to mark as the winning tile"}
        </p>
      )}
    </div>
  );
}
