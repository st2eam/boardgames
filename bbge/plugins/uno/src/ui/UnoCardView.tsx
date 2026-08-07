"use client";

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
  const bg = card.color
    ? BG[card.color]
    : "bg-stone-900 bg-[linear-gradient(135deg,#111_40%,#f59e0b_40%,#f59e0b_60%,#111_60%)]";

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
      <span className="absolute inset-0 flex items-center justify-center px-0.5 text-center leading-tight drop-shadow">
        {card.kind === "number"
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
                          : card.label.slice(0, 4)}
      </span>
    </button>
  );
}

export function UnoCardBack({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "lg"
      ? "h-24 w-[4.25rem]"
      : size === "sm"
        ? "h-14 w-10"
        : "h-20 w-[3.5rem]";
  return (
    <div
      className={`${dims} shrink-0 rounded-xl border-2 border-white/30 bg-gradient-to-br from-red-700 via-stone-900 to-amber-500 shadow-md`}
    />
  );
}
