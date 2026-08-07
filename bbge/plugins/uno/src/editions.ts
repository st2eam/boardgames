export type UnoEditionId = "classic" | "flip" | "no-mercy";

export function normalizeUnoEdition(v: string | undefined): UnoEditionId {
  if (v === "flip" || v === "no-mercy") return v;
  return "classic";
}

export function maxPlayersForUnoEdition(edition: UnoEditionId): number {
  return edition === "no-mercy" ? 6 : 10;
}

export function unoEditionOptions(): {
  id: UnoEditionId;
  label: { en: string; zh: string };
  hint: { en: string; zh: string };
}[] {
  return [
    {
      id: "classic",
      label: { en: "Classic UNO", zh: "经典 UNO" },
      hint: { en: "2–10 · standard deck", zh: "2–10 人 · 标准牌组" },
    },
    {
      id: "flip",
      label: { en: "UNO Flip", zh: "UNO Flip" },
      hint: { en: "2–10 · light/dark sides", zh: "2–10 人 · 光明/黑暗双面" },
    },
    {
      id: "no-mercy",
      label: { en: "Show 'Em No Mercy", zh: "毫不留情" },
      hint: { en: "2–6 · stacking & mercy", zh: "2–6 人 · 叠加与淘汰" },
    },
  ];
}
