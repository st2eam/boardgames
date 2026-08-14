"use client";

import { unoBackUrl } from "./cardArt";

type CardV = {
  id: string;
  color: "red" | "yellow" | "green" | "blue" | null;
  kind: string;
  number?: number | null;
  drawN?: number | null;
  label: string;
};

const BG: Record<string, string> = {
  red: "bg-red-600",
  yellow: "bg-amber-400 text-stone-900",
  green: "bg-emerald-600",
  blue: "bg-sky-600",
};

/** Classic 4-color oval for wild / +4 cards (red top-right, blue bottom-right,
 *  yellow bottom-left, green top-left). */
const WILD_QUAD =
  "conic-gradient(#dc2626 0 25%, #0284c7 25% 50%, #fbbf24 50% 75%, #059669 75% 100%)";

export function UnoCardView({
  card,
  selected,
  dimmed,
  onClick,
  size = "md",
}: {
  card: CardV;
  selected?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg"
      ? "h-24 w-[4.25rem] text-sm"
      : size === "sm"
        ? "h-14 w-10 text-[10px]"
        : "h-20 w-[3.5rem] text-xs";
  const isWild = card.color == null;
  const bg = card.color == null ? "bg-stone-900" : BG[card.color];

  const label =
    card.kind === "number"
      ? card.number
      : card.kind === "draw"
        ? `+${card.drawN}`
        : card.kind === "wildDraw"
          ? `W+${card.drawN}`
          : card.kind === "skip"
            ? "⊘"
            : card.kind === "reverse"
              ? "⇄"
              : card.kind === "flip"
                ? "↻"
                : card.kind === "skipAll"
                  ? "⏭"
                  : card.kind === "discardAll"
                    ? "散"
                    : card.kind === "wild"
                      ? "W"
                      : card.label.slice(0, 4);

  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className={`${dims} relative shrink-0 touch-manipulation rounded-xl border-2 font-heading font-bold text-white shadow-md transition ${bg} ${
        selected
          ? "-translate-y-2 border-white ring-2 ring-accent"
          : "border-white/40"
      } ${dimmed ? "opacity-40" : ""} ${
        onClick ? "cursor-pointer active:scale-95" : "cursor-default"
      }`}
    >
      {isWild ? (
        <span className="absolute inset-0 flex items-center justify-center p-[4px] sm:p-[5px]">
          <span
            className="flex h-full w-full items-center justify-center rounded-[50%] border-2 border-white/70 shadow-inner"
            style={{ background: WILD_QUAD }}
          >
            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
              {label}
            </span>
          </span>
        </span>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-0.5 text-center leading-tight drop-shadow">
          {label}
        </span>
      )}
    </button>
  );
}

export function UnoCardBack({
  size = "md",
  edition,
}: {
  size?: "sm" | "md" | "lg";
  edition?: string;
}) {
  const dims =
    size === "lg"
      ? "h-24 w-[4.25rem]"
      : size === "sm"
        ? "h-14 w-10"
        : "h-20 w-[3.5rem]";
  return (
    <div
      className={`${dims} shrink-0 rounded-xl border-2 border-white/30 shadow-md`}
      style={{
        backgroundImage: `url(${unoBackUrl(edition)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
