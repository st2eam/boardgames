export type CaboCard = {
  id: string;
  value: number;
};

/** 52 cards: 0×2, 1–12×4, 13×2 */
export function buildCaboDeck(): CaboCard[] {
  const deck: CaboCard[] = [];
  const add = (value: number, count: number) => {
    for (let i = 0; i < count; i++) {
      deck.push({ id: `cabo-${value}-${i}`, value });
    }
  };
  add(0, 2);
  for (let v = 1; v <= 12; v++) add(v, 4);
  add(13, 2);
  return deck;
}

export function abilityKind(value: number): "peek" | "spy" | "swap" | null {
  if (value === 7 || value === 8) return "peek";
  if (value === 9 || value === 10) return "spy";
  if (value === 11 || value === 12) return "swap";
  return null;
}

export function sumSlots(slots: { card: CaboCard }[]): number {
  return slots.reduce((s, x) => s + x.card.value, 0);
}
