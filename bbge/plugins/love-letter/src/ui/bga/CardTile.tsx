"use client";

import { cardBackUrl, cardFaceUrl, cardLabel } from "../cardArt";

interface Props {
  locale: string;
  rank?: number;
  name?: { en: string; zh: string };
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  title?: string;
  onClick?: () => void;
}

const SIZE = {
  sm: "h-[88px] w-[62px]",
  md: "h-[120px] w-[84px]",
  lg: "h-[168px] w-[118px]",
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
}: Props) {
  const clickable = Boolean(onClick) && !disabled;
  const src = faceDown ? cardBackUrl() : cardFaceUrl(rank);
  const label = faceDown ? (locale === "zh" ? "牌背" : "Back") : cardLabel({ rank, name }, locale);

  return (
    <button
      type="button"
      disabled={!clickable}
      title={title ?? label}
      onClick={onClick}
      className={[
        "group relative shrink-0 overflow-hidden rounded-lg border-2 bg-[#2a1814] shadow-md transition-all duration-200",
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
        <span className="pointer-events-none absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded bg-black/65 px-1 font-heading text-[11px] font-bold text-amber-50">
          {rank}
        </span>
      )}
      {selected && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-accent/95 py-0.5 text-center font-heading text-[10px] font-bold text-[#1a120e]">
          {locale === "zh" ? "已选" : "Selected"}
        </span>
      )}
    </button>
  );
}
