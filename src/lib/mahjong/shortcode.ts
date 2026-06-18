import type { Suit } from "./tiles";

export interface ParsedTile {
  suit: Suit;
  value: number;
  label: string;
  color: string;
}

const MAN_ZH = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
const PIN_ZH = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
const SOU_ZH = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

const SHORTCODE_REGEX = /\[([1-9][mps]|[ESWN]|[CFB])\]/g;

const SUIT_COLORS: Record<Suit, string> = {
  man: "#dc2626",
  pin: "#2563eb",
  sou: "#16a34a",
  wind: "#1c1917",
  dragon: "#1c1917",
};

const SUIT_BG: Record<Suit, string> = {
  man: "#fef2f2",
  pin: "#eff6ff",
  sou: "#f0fdf4",
  wind: "#fafaf9",
  dragon: "#fafaf9",
};

export function parseShortcode(code: string): ParsedTile | null {
  if (code.length === 2) {
    const val = parseInt(code[0], 10);
    const suitChar = code[1];
    if (suitChar === "m" && val >= 1 && val <= 9) {
      return { suit: "man", value: val, label: `${MAN_ZH[val - 1]}万`, color: SUIT_COLORS.man };
    }
    if (suitChar === "p" && val >= 1 && val <= 9) {
      return { suit: "pin", value: val, label: `${PIN_ZH[val - 1]}筒`, color: SUIT_COLORS.pin };
    }
    if (suitChar === "s" && val >= 1 && val <= 9) {
      return { suit: "sou", value: val, label: `${SOU_ZH[val - 1]}条`, color: SUIT_COLORS.sou };
    }
  }
  if (code.length === 1) {
    const windMap: Record<string, string> = { E: "东", S: "南", W: "西", N: "北" };
    const dragonMap: Record<string, [string, string]> = {
      C: ["中", "#dc2626"],
      F: ["发", "#16a34a"],
      B: ["白", "#6b7280"],
    };
    if (windMap[code]) {
      return { suit: "wind", value: "ESWN".indexOf(code) + 1, label: `${windMap[code]}`, color: SUIT_COLORS.wind };
    }
    if (dragonMap[code]) {
      return { suit: "dragon", value: "CFB".indexOf(code) + 1, label: dragonMap[code][0], color: dragonMap[code][1] };
    }
  }
  return null;
}

export function shortcodeToInlineHTML(code: string): string {
  const tile = parseShortcode(code);
  if (!tile) return `[${code}]`;

  const bg = SUIT_BG[tile.suit];
  return `<span style="display:inline-block;border:1px solid #d4d4d4;border-radius:4px;padding:1px 4px;margin:0 1px;font-size:0.85em;font-weight:600;background:${bg};color:${tile.color};line-height:1.4;vertical-align:baseline;">${tile.label}</span>`;
}

export function replaceShortcodesHTML(text: string): string {
  return text.replace(SHORTCODE_REGEX, (_, code) => shortcodeToInlineHTML(code));
}

export function shortcodeToText(code: string): string {
  const tile = parseShortcode(code);
  if (!tile) return `[${code}]`;
  return tile.label;
}

export function replaceShortcodesText(text: string): string {
  return text.replace(SHORTCODE_REGEX, (_, code) => shortcodeToText(code));
}

export { SHORTCODE_REGEX };
