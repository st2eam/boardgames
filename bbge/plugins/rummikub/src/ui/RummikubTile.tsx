"use client";

type TileV = {
  id: string;
  color: string | null;
  number: number | null;
  joker: boolean;
};

const COLOR_BG: Record<string, string> = {
  black: "bg-stone-800 text-white",
  red: "bg-red-600 text-white",
  blue: "bg-sky-600 text-white",
  orange: "bg-orange-500 text-white",
};

const COLOR_LABEL_ZH: Record<string, string> = {
  black: "黑",
  red: "红",
  blue: "蓝",
  orange: "橙",
};

const DIMS = {
  lg: "h-14 w-11 text-lg",
  sm: "h-8 w-6 text-xs",
  md: "h-11 w-8 text-base",
} as const;

export function RummikubTileView({
  tile,
  selected,
  dimmed,
  onClick,
  onPointerDown,
  dragging,
  fromRack,
  fromRackLabel,
  size = "md",
}: {
  tile: TileV;
  selected?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  dragging?: boolean;
  fromRack?: boolean;
  fromRackLabel?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = DIMS[size];
  const isJoker = tile.joker || tile.color == null;
  const bg = isJoker
    ? "bg-gradient-to-br from-amber-300 to-amber-500 text-stone-900"
    : COLOR_BG[tile.color!];
  const interactive = Boolean(onClick || onPointerDown);

  const face = isJoker ? (
    <span className="text-base leading-none">★</span>
  ) : (
    <span className="leading-none">{tile.number}</span>
  );

  return (
    <div
      role={interactive ? "button" : "img"}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={`${dims} relative shrink-0 select-none rounded-md border-2 font-heading font-bold shadow-sm transition ${bg} ${
        selected
          ? "-translate-y-1.5 border-accent ring-2 ring-accent"
          : fromRack
            ? "border-accent ring-1 ring-accent"
            : "border-white/60"
      } ${dimmed ? "opacity-40" : ""} ${
        dragging ? "scale-110 shadow-lg" : ""
      } ${
        onPointerDown
          ? "cursor-grab touch-none active:cursor-grabbing"
          : interactive
            ? "cursor-pointer active:scale-95"
            : "cursor-default"
      }`}
    >
      {fromRack && fromRackLabel ? (
        <span className="absolute left-0 top-0 z-10 rounded-br-sm rounded-tl-[3px] bg-accent px-0.5 text-[7px] font-bold leading-3 text-[#1a120e]">
          {fromRackLabel}
        </span>
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center">
        {face}
      </span>
    </div>
  );
}

export function RummikubTileBack({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg"
      ? "h-14 w-11"
      : size === "sm"
        ? "h-8 w-6"
        : "h-11 w-8";
  return (
    <div
      className={`${dims} shrink-0 rounded-md border-2 border-white/40 bg-stone-300 shadow-sm`}
    />
  );
}

export function tileLabel(tile: TileV, zh: boolean): string {
  if (tile.joker || tile.color == null) return zh ? "鬼牌" : "Joker";
  const color = zh ? COLOR_LABEL_ZH[tile.color!] : tile.color![0]?.toUpperCase();
  return `${color}${tile.number}`;
}
