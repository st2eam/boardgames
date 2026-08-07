"use client";

import { cardBackUrl, cardFaceUrl, cardLabel } from "../cardArt";

interface Props {
  locale: string;
  rank?: number;
  name?: { en: string; zh: string };
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  title?: string;
  onClick?: () => void;
  /** Open large preview (does not select) */
  onZoom?: () => void;
}

const SIZE = {
  sm: "h-[100px] w-[70px]",
  md: "h-[140px] w-[98px]",
  lg: "h-[200px] w-[140px]",
  xl: "h-[240px] w-[168px]",
} as const;

export function CardTile({
  locale,
  rank = 0,
  name,
  faceDown,
  selected,
  disabled,
  size = "md",
  title,
  onClick,
  onZoom,
}: Props) {
  const zh = locale === "zh";
  const clickable = Boolean(onClick) && !disabled;
  const src = faceDown ? cardBackUrl() : cardFaceUrl(rank);
  const label = faceDown ? (zh ? "牌背" : "Back") : cardLabel({ rank, name }, locale);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        disabled={!clickable}
        title={title ?? label}
        onClick={onClick}
        className={[
          "group relative block overflow-hidden rounded-xl border-2 bg-[#2a1814] shadow-md transition-all duration-200",
          SIZE[size],
          selected
            ? "-translate-y-3 border-accent shadow-[0_8px_24px_rgba(196,149,42,0.45)] ring-2 ring-accent/50"
            : "border-[#5D4037]/80",
          clickable
            ? "cursor-pointer hover:-translate-y-2 hover:border-accent hover:shadow-lg active:translate-y-0"
            : "cursor-default",
          disabled ? "opacity-45 grayscale-[30%]" : "",
        ].join(" ")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          draggable={false}
          className="h-full w-full object-cover"
        />
        {!faceDown && (
          <span className="pointer-events-none absolute left-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-md bg-black/70 px-1.5 font-heading text-xs font-bold text-amber-50">
            {rank}
          </span>
        )}
        {selected && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-accent/95 py-1 text-center font-heading text-[11px] font-bold text-[#1a120e]">
            {zh ? "已选" : "Selected"}
          </span>
        )}
      </button>
      {onZoom && !faceDown && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onZoom();
          }}
          className="absolute -right-2 -top-2 z-10 cursor-pointer rounded-full border border-border bg-white px-2 py-1 font-heading text-[10px] font-bold text-primary-dark shadow-md hover:bg-amber-50"
          title={zh ? "查看大图" : "View large"}
        >
          {zh ? "大图" : "Zoom"}
        </button>
      )}
    </div>
  );
}
