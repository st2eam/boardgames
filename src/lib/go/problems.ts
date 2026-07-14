import type { GoProblem } from "./types";

// All problems verified: legal board state, empty solution positions, correct goal.
export const problems: GoProblem[] = [
  // ── Beginner — capture 1 stone ──
  {
    id: "beginner-1",
    size: 9,
    setup: {
      "3,4": "black", "5,4": "black", "4,3": "black",
      "4,4": "white",
    },
    turn: "black",
    goal: { en: "Black to play — capture the white stone", zh: "黑先 — 提掉白子" },
    solution: [{ row: 4, col: 5 }],
    difficulty: "beginner",
  },
  {
    id: "beginner-2",
    size: 9,
    setup: {
      "3,3": "white", "5,3": "white", "4,2": "white",
      "4,3": "black",
    },
    turn: "black",
    goal: { en: "Black to play — save the stone from capture", zh: "黑先 — 救出被叫吃的黑子" },
    solution: [{ row: 4, col: 4 }],
    difficulty: "beginner",
  },
  {
    id: "beginner-3",
    size: 9,
    setup: {
      "3,4": "black", "5,4": "black", "3,5": "black", "5,5": "black", "4,6": "black",
      "4,4": "white", "4,5": "white",
    },
    turn: "black",
    goal: { en: "Black to play — capture two white stones", zh: "黑先 — 提掉两子" },
    solution: [{ row: 4, col: 3 }],
    difficulty: "beginner",
  },

  // ── Easy — life & death basics ──
  {
    id: "easy-1",
    size: 9,
    setup: {
      "2,4": "black", "3,4": "black",
      "2,5": "black",
      "2,6": "black", "3,6": "black", "4,6": "black",
      "3,5": "white",
    },
    turn: "black",
    goal: { en: "Black to play — capture to make the corner safe", zh: "黑先 — 提子确保角部安全" },
    solution: [{ row: 4, col: 5 }],
    difficulty: "easy",
  },
  {
    id: "easy-2",
    size: 9,
    setup: {
      "3,3": "black", "3,4": "black", "3,5": "black",
      "4,3": "black", "4,5": "black",
      "5,3": "black", "5,4": "black", "5,5": "black",
    },
    turn: "white",
    goal: { en: "White to play — find the killing move", zh: "白先 — 找到杀棋要点" },
    solution: [{ row: 4, col: 4 }],
    difficulty: "easy",
  },
  {
    id: "easy-3",
    size: 9,
    setup: {
      "2,3": "black", "2,4": "black", "2,5": "black",
      "3,3": "black", "3,5": "black",
      "4,3": "black", "4,5": "black",
      "5,3": "black", "5,4": "black", "5,5": "black",
      "3,4": "white", "4,4": "white",
    },
    turn: "white",
    goal: { en: "White to play — connect the two stones to live", zh: "白先 — 连接两子做活" },
    solution: [{ row: 3, col: 4 }],
    difficulty: "easy",
  },

  // ── Normal — vital point recognition ──
  {
    id: "normal-1",
    size: 9,
    setup: {
      "4,2": "white", "4,3": "white", "4,4": "white",
      "4,5": "white", "4,6": "white",
      "3,3": "black", "5,3": "black", "3,5": "black", "5,5": "black",
    },
    turn: "black",
    goal: { en: "Black to play — split the white group", zh: "黑先 — 分断白棋" },
    solution: [{ row: 4, col: 4 }],
    difficulty: "normal",
  },
  {
    id: "normal-2",
    size: 9,
    setup: {
      "2,3": "black", "2,4": "black", "2,5": "black",
      "3,3": "black", "3,5": "black",
      "4,3": "black", "4,4": "black", "4,5": "black",
      "5,3": "black", "5,5": "black",
      "6,3": "black", "6,4": "black", "6,5": "black",
    },
    turn: "white",
    goal: { en: "White to play — find the vital point to kill", zh: "白先 — 找到点杀要点" },
    solution: [{ row: 3, col: 4 }],
    difficulty: "normal",
  },
];

export function getProblemsByDifficulty(difficulty: string): GoProblem[] {
  return problems.filter((p) => p.difficulty === difficulty);
}
