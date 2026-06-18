"use client";

import { TILE_DEFS } from "@/lib/mahjong";
import { MahjongTile } from "./MahjongTile";

interface TileSelectorProps {
  onSelect: (tileId: number) => void;
  selectedTiles: number[];
  disabledTiles?: number[];
  locale: string;
}

const SUIT_GROUPS = [
  { key: "man", label: { en: "Characters (万)", zh: "万子" }, range: [0, 9] },
  { key: "pin", label: { en: "Circles (筒)", zh: "筒子" }, range: [9, 18] },
  { key: "sou", label: { en: "Bamboo (条)", zh: "条子" }, range: [18, 27] },
  { key: "honor", label: { en: "Honors (字)", zh: "字牌" }, range: [27, 34] },
] as const;

export function TileSelector({
  onSelect,
  selectedTiles,
  disabledTiles = [],
  locale,
}: TileSelectorProps) {
  return (
    <div className="space-y-3">
      {SUIT_GROUPS.map((group) => (
        <div key={group.key}>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {locale === "zh" ? group.label.zh : group.label.en}
          </div>
          <div className="flex flex-wrap gap-1">
            {TILE_DEFS.slice(group.range[0], group.range[1]).map((tile) => (
              <MahjongTile
                key={tile.id}
                tileId={tile.id}
                selected={selectedTiles.includes(tile.id)}
                disabled={disabledTiles.includes(tile.id)}
                onClick={() => onSelect(tile.id)}
                size="sm"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
