"use client";

import { TILE_DEFS, TILE_COUNT } from "@/lib/mahjong";
import { MahjongTile } from "@/components/game/trainer/MahjongTile";

interface Props {
  hand: number[]; // counts array (length 34)
  maxTiles: number;
  locale: string;
  onHandChange: (hand: number[]) => void;
}

const SUIT_GROUPS = [
  { label: { en: "Characters", zh: "万" }, start: 0, end: 9 },
  { label: { en: "Circles", zh: "筒" }, start: 9, end: 18 },
  { label: { en: "Bamboo", zh: "条" }, start: 18, end: 27 },
  { label: { en: "Winds", zh: "风" }, start: 27, end: 31 },
  { label: { en: "Dragons", zh: "三元" }, start: 31, end: 34 },
];

export function HandPicker({ hand, maxTiles, locale, onHandChange }: Props) {
  const lang = locale as "en" | "zh";
  const totalSelected = hand.reduce((a, b) => a + b, 0);
  const isFull = totalSelected >= maxTiles;

  const addTile = (id: number) => {
    if (isFull || hand[id] >= 4) return;
    const next = [...hand];
    next[id]++;
    onHandChange(next);
  };

  const removeTile = (id: number) => {
    if (hand[id] <= 0) return;
    const next = [...hand];
    next[id]--;
    onHandChange(next);
  };

  // Build sorted list of selected tiles for display
  const selectedTiles: number[] = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    for (let j = 0; j < hand[i]; j++) {
      selectedTiles.push(i);
    }
  }

  return (
    <div className="space-y-4">
      {/* Selected tiles display */}
      <div className="rounded-lg border border-border bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-dark">
            {locale === "zh" ? "已选牌" : "Selected Tiles"}
          </span>
          <span className={`text-sm font-semibold ${isFull ? "text-green-600" : "text-muted-foreground"}`}>
            {totalSelected} / {maxTiles}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 min-h-12">
          {selectedTiles.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              {locale === "zh" ? "点击下方牌面选择" : "Click tiles below to select"}
            </p>
          ) : (
            selectedTiles.map((tileId, idx) => (
              <MahjongTile
                key={`${tileId}-${idx}`}
                tileId={tileId}
                size="md"
                onClick={() => removeTile(tileId)}
              />
            ))
          )}
        </div>
        {totalSelected > 0 && (
          <button
            type="button"
            onClick={() => onHandChange(new Array(TILE_COUNT).fill(0))}
            className="mt-2 text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            {locale === "zh" ? "清空" : "Clear all"}
          </button>
        )}
      </div>

      {/* Tile picker grid */}
      <div className="space-y-2">
        {SUIT_GROUPS.map((group) => (
          <div key={group.start} className="rounded-lg border border-border bg-surface p-2">
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">
              {group.label[lang]}
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: group.end - group.start }, (_, i) => {
                const tileId = group.start + i;
                const count = hand[tileId];
                const disabled = isFull || count >= 4;
                return (
                  <div key={tileId} className="relative">
                    <MahjongTile
                      tileId={tileId}
                      size="md"
                      disabled={disabled}
                      onClick={() => addTile(tileId)}
                    />
                    {count > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-sm">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
