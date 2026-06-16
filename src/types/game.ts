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

// --- Score Tracker Types ---

export interface ScoreCategory {
  id: string;
  name: Record<"en" | "zh", string>;
  value: number;
  max?: number;
}

export interface ScoreConfig {
  type: "victory-points" | "rounds" | "cumulative";
  direction: "high-wins" | "low-wins";
  target?: number;
  targetByPlayers?: Record<string, number>;
  players: { min: number; max: number };
  categories?: ScoreCategory[];
  rounds?: number;
  startingScore?: number;
  unit?: Record<"en" | "zh", string>;
}

// --- Game & Summary ---

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
  hasScore: boolean;
  family?: string;
  familyOrder?: number;
  variantType?: "base" | "expansion" | "variant";
  requiresBase?: boolean;
}
