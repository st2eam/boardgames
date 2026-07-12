export type Stone = "black" | "white";

export interface Coord {
  row: number; // 0-based from top
  col: number; // 0-based from left
}

export interface GoProblem {
  id: string;
  size: number; // board size: 9, 13, or 19
  setup: Record<string, Stone>; // "row,col" → stone color
  turn: Stone; // which color is to play
  goal: Record<"en" | "zh", string>;
  solution: Coord[]; // correct move sequence
  difficulty: "beginner" | "easy" | "normal";
}

export interface GoTrainerConfig {
  type: "go-tsumego";
  difficulties: {
    id: string;
    name: Record<"en" | "zh", string>;
    size: number;
  }[];
}
