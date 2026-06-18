"use client";

import type { Card } from "@/lib/blackjack";
import { SUIT_SYMBOLS, SUIT_COLORS } from "@/lib/blackjack";

interface Props {
  card: Card;
  faceDown?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-10 h-14 text-sm",
  md: "w-14 h-20 text-lg",
  lg: "w-[4.5rem] h-[6.5rem] text-xl",
};

export function PlayingCard({ card, faceDown, size = "md" }: Props) {
  if (faceDown) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg border border-stone-200 bg-white shadow-sm overflow-hidden relative`}>
        {/* Simple geometric card back pattern */}
        <div className="absolute inset-[4px] rounded-md border border-stone-200 bg-stone-50 flex items-center justify-center">
          <svg viewBox="0 0 40 56" className="w-full h-full p-2 text-stone-300" fill="none" stroke="currentColor" strokeWidth="0.8">
            {/* Diamond grid pattern */}
            <path d="M20 4 L36 28 L20 52 L4 28 Z" />
            <path d="M20 12 L30 28 L20 44 L10 28 Z" />
            <path d="M20 20 L24 28 L20 36 L16 28 Z" fill="currentColor" opacity="0.15" />
            {/* Corner dots */}
            <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="32" cy="8" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="8" cy="48" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="32" cy="48" r="1.5" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
      </div>
    );
  }

  const colorClass = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <div className={`${sizeClasses[size]} rounded-lg border border-stone-200 bg-white shadow-sm flex flex-col items-center justify-between p-1.5 ${colorClass}`}>
      <div className="self-start leading-none font-bold text-[0.85em]">{card.rank}</div>
      <div className="text-2xl leading-none">{symbol}</div>
      <div className="self-end leading-none font-bold text-[0.85em] rotate-180">{card.rank}</div>
    </div>
  );
}
