import type { ParsedTile } from "@/lib/mahjong/shortcode";

interface Props {
  tile: ParsedTile;
}

const suitBg: Record<string, string> = {
  man: "bg-red-50 border-red-200",
  pin: "bg-blue-50 border-blue-200",
  sou: "bg-green-50 border-green-200",
  wind: "bg-stone-50 border-stone-200",
  dragon: "bg-stone-50 border-stone-200",
};

const suitText: Record<string, string> = {
  man: "text-red-700",
  pin: "text-blue-700",
  sou: "text-green-700",
  wind: "text-stone-800",
  dragon: "text-stone-800",
};

const dragonColors: Record<number, string> = {
  1: "text-red-600",
  2: "text-green-600",
  3: "text-stone-500",
};

export function InlineTile({ tile }: Props) {
  const textColor = tile.suit === "dragon" ? dragonColors[tile.value] ?? suitText[tile.suit] : suitText[tile.suit];

  return (
    <span
      className={`inline-block rounded border px-1 py-px mx-px text-xs font-bold leading-snug align-baseline ${suitBg[tile.suit]} ${textColor}`}
      title={tile.label}
    >
      {tile.label}
    </span>
  );
}
