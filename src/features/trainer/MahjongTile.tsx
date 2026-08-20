"use client";

import { getTileDef } from "@/lib/mahjong";
import type { Suit } from "@/lib/mahjong";

interface MahjongTileProps {
  tileId: number;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  highlight?: boolean;
}

const sizeStyles = {
  sm: "w-7 h-9 text-xs",
  md: "w-9 h-11 text-sm",
  lg: "w-11 h-14 text-base",
};

const suitBorderColor: Record<Suit, string> = {
  man: "border-red-200",
  pin: "border-blue-200",
  sou: "border-green-200",
  wind: "border-stone-300",
  dragon: "border-stone-300",
};

const suitBg: Record<Suit, string> = {
  man: "bg-gradient-to-b from-white to-red-50",
  pin: "bg-gradient-to-b from-white to-blue-50",
  sou: "bg-gradient-to-b from-white to-green-50",
  wind: "bg-gradient-to-b from-white to-stone-50",
  dragon: "bg-gradient-to-b from-white to-stone-50",
};

const suitTextColor: Record<Suit, string> = {
  man: "text-red-700",
  pin: "text-blue-700",
  sou: "text-green-700",
  wind: "text-stone-800",
  dragon: "text-stone-800",
};

const dragonTextColor: Record<number, string> = {
  1: "text-red-600",
  2: "text-green-600",
  3: "text-stone-400",
};

const MAN_ZH = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
const PIN_NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];
const SOU_NUM = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const WIND_ZH = ["东", "南", "西", "北"];
const DRAGON_ZH = ["中", "發", "白"];

function getTileDisplay(suit: Suit, value: number): { top: string; bottom: string } {
  switch (suit) {
    case "man":
      return { top: MAN_ZH[value - 1], bottom: "万" };
    case "pin":
      return { top: PIN_NUM[value - 1], bottom: "筒" };
    case "sou":
      return { top: SOU_NUM[value - 1], bottom: "条" };
    case "wind":
      return { top: WIND_ZH[value - 1], bottom: "" };
    case "dragon":
      return { top: DRAGON_ZH[value - 1], bottom: "" };
  }
}

export function MahjongTile({
  tileId,
  selected,
  onClick,
  size = "md",
  disabled,
  highlight,
}: MahjongTileProps) {
  const tile = getTileDef(tileId);
  const display = getTileDisplay(tile.suit, tile.value);
  const textColor = tile.suit === "dragon" ? (dragonTextColor[tile.value] ?? suitTextColor.dragon) : suitTextColor[tile.suit];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex flex-col items-center justify-center rounded-md border-2 shadow-sm transition-all font-bold leading-none select-none
        ${sizeStyles[size]}
        ${suitBg[tile.suit]}
        ${selected ? "border-accent ring-2 ring-accent/40 scale-110 shadow-md" : suitBorderColor[tile.suit]}
        ${highlight ? "border-green-500 ring-2 ring-green-400 shadow-green-100 shadow-md" : ""}
        ${disabled && !highlight ? "opacity-60 cursor-not-allowed" : ""}
        ${!disabled ? "hover:shadow-md hover:scale-105 hover:border-accent/60 cursor-pointer active:scale-95" : ""}
        ${textColor}
      `}
      title={tile.name.zh}
    >
      <span className="leading-none">{display.top}</span>
      {display.bottom && (
        <span className="leading-none opacity-70 mt-1">{display.bottom}</span>
      )}
    </button>
  );
}
