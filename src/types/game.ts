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
  price?: number;
  /** ISO acquisition date (YYYY-MM-DD), used by the costs timeline. */
  acquiredDate?: string;
  bggRank?: number;
}

export interface FlowOption {
  label: Record<"en" | "zh", string>;
  next: string;
}

export interface FlowIllustration {
  /** Reuses the matching key-mechanic SVG from the rules document. */
  src: string;
  /** Localized accessible caption, shown beneath the image. */
  alt: Record<"en" | "zh", string>;
}

export interface FlowNode {
  title: Record<"en" | "zh", string>;
  content: Record<"en" | "zh", string>;
  options: FlowOption[];
  illustration?: FlowIllustration;
}

export interface FlowData {
  startNode: string;
  nodes: Record<string, FlowNode>;
}

// --- Score Tracker Types ---
// Dedicated multi-player, multi-round running totals only (no generic end-game calculators).

export type ScoreConfigType =
  | "cabo-multi"
  | "sea-salt-multi"
  | "just-wild-multi"
  | "nimmt-multi";

export interface ScoreConfig {
  type: ScoreConfigType;
  engine: string;
  direction: "high-wins" | "low-wins";
  target?: number;
  targetByPlayers?: Record<string, number>;
  players: { min: number; max: number };
  multiRound?: boolean;
}

// --- Trainer Config ---

export interface TrainerDifficulty {
  id: string;
  name: Record<"en" | "zh", string>;
  handSize: number;
}

export interface TrainerConfig {
  type: string;
  tileSet: string;
  difficulties: TrainerDifficulty[];
}

// --- Calculator Config ---

export interface CalculatorConfig {
  type: string;
  name: Record<"en" | "zh", string>;
}

// --- Game & Summary ---

export interface Game {
  meta: GameMeta;
  rules: string; // raw markdown
  flow: FlowData | null;
}

export interface PlayEdition {
  id: string;
  label: Record<"en" | "zh", string>;
  /** When true (or first listed), used if URL has no ?edition= */
  default?: boolean;
}

export interface PlayConfig {
  pluginId: string;
  pluginVersion?: string;
  /** Preferred edition id when opening /play without query */
  defaultEdition?: string;
  /** Optional edition picker on 开始游戏 (e.g. Love Letter full vs premium) */
  editions?: PlayEdition[];
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
  hasTrainer: boolean;
  hasCalculator: boolean;
  hasPlay: boolean;
  trainerType?: string;
  family?: string;
  familyOrder?: number;
  variantType?: "base" | "expansion" | "variant";
  requiresBase?: boolean;
  price?: number;
  acquiredDate?: string;
  bggRank?: number;
}
