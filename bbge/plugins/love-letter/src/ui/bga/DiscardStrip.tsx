"use client";

import { cardFaceUrl, cardLabel } from "../cardArt";

type Card = {
  id: string;
  rank: number;
  name?: { en: string; zh: string };
};

interface Props {
  locale: string;
  cards: Card[];
  onZoom?: (card: Card) => void;
  compact?: boolean;
}

/** Overlapping fan — no horizontal scrollbar. */
export function DiscardStrip({ locale, cards, onZoom, compact }: Props) {
  const zh = locale === "zh";
  if (cards.length === 0) {
    return (
      <p className="text-[10px] text-stone-400">
        {zh ? "暂无出牌" : "No discards"}
      </p>
    );
  }

  const h = compact ? "h-9 w-6" : "h-12 w-8";
  const overlap = compact ? "-ml-2.5" : "-ml-3";

  return (
    <div
      className="flex flex-wrap items-end"
      onClick={(e) => e.stopPropagation()}
    >
      {cards.map((c, i) => (
        <button
          key={c.id}
          type="button"
          title={`${cardLabel(c, locale)} (${c.rank})`}
          onClick={() => onZoom?.(c)}
          className={[
            "relative overflow-hidden rounded border border-[#5D4037]/50 bg-[#2a1814] shadow-sm transition-transform hover:-translate-y-0.5 hover:border-accent hover:z-10",
            h,
            onZoom ? "cursor-pointer" : "cursor-default",
            i === 0 ? "" : overlap,
            i === cards.length - 1 ? "z-[1] ring-1 ring-accent/60" : "opacity-95",
          ].join(" ")}
          style={{ zIndex: i + 1 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardFaceUrl(c.rank)}
            alt={cardLabel(c, locale)}
            className="h-full w-full object-cover"
            draggable={false}
          />
          <span className="absolute left-0 top-0 rounded-br bg-black/70 px-0.5 font-heading text-[8px] font-bold text-amber-50">
            {c.rank}
          </span>
        </button>
      ))}
    </div>
  );
}
