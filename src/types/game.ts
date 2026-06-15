export interface GameMeta {
  slug: string;
  name: Record<"en" | "zh", string>;
  players: string;
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  category: string;
  family?: string;
  familyOrder?: number;
  variantType?: "base" | "expansion" | "variant";
  requiresBase?: boolean;
}

export interface FlowOption {
  label: Record<"en" | "zh", string>;
  next: string;
}

export interface FlowNode {
  title: Record<"en" | "zh", string>;
  content: string; // markdown
  options: FlowOption[];
}

export interface FlowData {
  startNode: string;
  nodes: Record<string, FlowNode>;
}

export interface Game {
  meta: GameMeta;
  rules: string; // raw markdown
  flow: FlowData | null;
}

export interface GameSummary {
  slug: string;
  name: Record<"en" | "zh", string>;
  players: string;
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  category: string;
  hasFlow: boolean;
  family?: string;
  familyOrder?: number;
  variantType?: "base" | "expansion" | "variant";
  requiresBase?: boolean;
}
