export const categoryGradients: Record<string, string> = {
  board: "from-amber-500 to-orange-500",
  card: "from-emerald-500 to-teal-500",
  party: "from-rose-500 to-pink-500",
  strategy: "from-indigo-500 to-violet-500",
  family: "from-lime-500 to-green-500",
  adventure: "from-violet-500 to-fuchsia-500",
};

export const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-rose-500",
};

export const variantBadge: Record<string, { en: string; zh: string; cls: string }> = {
  expansion: {
    en: "DLC",
    zh: "DLC",
    cls: "bg-violet-100 text-violet-700",
  },
  variant: {
    en: "Variant",
    zh: "变体",
    cls: "bg-sky-100 text-sky-700",
  },
};
