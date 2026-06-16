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

// --- Score Calculator Types ---

export interface CardDef {
  id: string;
  name: Record<"en" | "zh", string>;
  color?: string;
  count?: number;
  group?: string;
  points?: number;
  multiplies?: string;
  tier?: string;
}

export interface CardGroup {
  id: string;
  name: Record<"en" | "zh", string>;
  cards: CardDef[];
}

export interface CardTypeDef {
  id: string;
  name: Record<"en" | "zh", string>;
  value: number;
  group?: string;
}

export interface CategoryDef {
  id: string;
  name: Record<"en" | "zh", string>;
  value: number;
  max?: number;
}

export interface FeatureDef {
  id: string;
  name: Record<"en" | "zh", string>;
  inputType: "number";
  formula: string;
  description?: Record<"en" | "zh", string>;
}

export type ScoreConfigType = "formula" | "card-select" | "card-type" | "category" | "feature-calc" | "rounds";

export interface ScoreConfig {
  type: ScoreConfigType;
  engine: string;
  direction: "high-wins" | "low-wins";
  target?: number;
  targetByPlayers?: Record<string, number>;
  players: { min: number; max: number };
  multiRound?: boolean;
  rounds?: number;
  startingScore?: number;
  unit?: Record<"en" | "zh", string>;
  cards?: CardDef[];
  cardGroups?: CardGroup[];
  cardTypes?: CardTypeDef[];
  categories?: CategoryDef[];
  features?: FeatureDef[];
  scoringRules?: Record<string, unknown>;
  filters?: FilterDef[];
  colorDist?: ColorDef[];
}

export interface ColorDef {
  id: string;
  name: Record<"en" | "zh", string>;
  hex: string;
  count: number;
}

export interface FilterDef {
  id: string;
  name: Record<"en" | "zh", string>;
  field: string;
  values: { id: string; name: Record<"en" | "zh", string> }[];
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
