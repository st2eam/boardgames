"use client";

import { trioBackUrl, trioFaceUrl } from "./cardArt";

export function TrioCard({
  value,
  faceDown,
  selected,
  onClick,
  size = "md",
}: {
  value?: number | null;
  faceDown?: boolean;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg"
      ? "h-28 w-[5.1rem]"
      : size === "sm"
        ? "h-14 w-[2.55rem]"
        : "h-20 w-[3.65rem]";
  const src = faceDown || value == null ? trioBackUrl() : trioFaceUrl(value);

  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className={`${dims} shrink-0 overflow-hidden rounded-lg border-2 bg-white shadow-md transition ${
        selected ? "-translate-y-1 border-accent ring-2 ring-accent" : "border-white/70"
      } ${onClick ? "cursor-pointer active:scale-95" : "cursor-default"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={faceDown ? "card back" : String(value)} className="h-full w-full object-cover" draggable={false} />
    </button>
  );
}
