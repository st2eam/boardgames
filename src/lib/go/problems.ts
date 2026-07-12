import type { GoProblem } from "./types";

export const problems: GoProblem[] = [
  // ── Beginner (9×9) ──
  {
    id: "beginner-1",
    size: 9,
    setup: {
      "1,3": "black", "1,4": "black", "1,5": "black",
      "2,3": "black", "2,5": "black",
      "3,3": "black", "3,4": "black", "3,5": "black",
    },
    turn: "black",
    goal: { en: "Black to play — make two eyes to live", zh: "黑先 — 做两只眼活棋" },
    solution: [{ row: 2, col: 4 }],
    difficulty: "beginner",
  },
  {
    id: "beginner-2",
    size: 9,
    setup: {
      "2,2": "white", "2,3": "white", "2,4": "white",
      "3,2": "white", "3,4": "white",
      "4,1": "white", "4,2": "white", "4,3": "white", "4,4": "white",
      "3,3": "black",
    },
    turn: "black",
    goal: { en: "Black to play — escape and capture the corner", zh: "黑先 — 逃出并吃掉角部" },
    solution: [{ row: 3, col: 3 }],
    difficulty: "beginner",
  },
  {
    id: "beginner-3",
    size: 9,
    setup: {
      "3,3": "white",
      "4,2": "black", "4,3": "black", "4,4": "black",
      "5,2": "black", "5,3": "white", "5,4": "black",
      "6,2": "black", "6,3": "black", "6,4": "black",
    },
    turn: "black",
    goal: { en: "Black to play — capture the white stone", zh: "黑先 — 提掉白子" },
    solution: [{ row: 5, col: 3 }],
    difficulty: "beginner",
  },

  // ── Easy (9×9) ──
  {
    id: "easy-1",
    size: 9,
    setup: {
      "2,2": "black", "2,3": "black", "2,4": "black",
      "3,2": "black", "3,4": "black",
      "4,2": "black", "4,3": "black", "4,4": "black",
      "3,3": "white",
    },
    turn: "black",
    goal: { en: "Black to play — save the group and make life", zh: "黑先 — 救活棋组" },
    solution: [{ row: 3, col: 3 }],
    difficulty: "easy",
  },
  {
    id: "easy-2",
    size: 9,
    setup: {
      "4,4": "black",
      "5,3": "black", "5,5": "black",
      "6,4": "black",
    },
    turn: "white",
    goal: { en: "White to play — kill the black group", zh: "白先 — 杀死黑棋" },
    solution: [{ row: 5, col: 4 }],
    difficulty: "easy",
  },
  {
    id: "easy-3",
    size: 9,
    setup: {
      "2,4": "black",
      "3,3": "black", "3,5": "black",
      "4,2": "black", "4,4": "black", "4,6": "black",
      "5,3": "black", "5,5": "black",
      "6,4": "black",
      "3,4": "white",
    },
    turn: "white",
    goal: { en: "White to play — connect to live", zh: "白先 — 连接活棋" },
    solution: [{ row: 4, col: 3 }],
    difficulty: "easy",
  },

  // ── Normal (9×9) ──
  {
    id: "normal-1",
    size: 9,
    setup: {
      "3,3": "white", "3,4": "white", "3,5": "white", "3,6": "white",
      "4,3": "white", "4,6": "white",
      "5,3": "white", "5,4": "white", "5,5": "white", "5,6": "white",
      "4,4": "black", "4,5": "black",
    },
    turn: "black",
    goal: { en: "Black to play — find the vital point to live", zh: "黑先 — 找到要点做活" },
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
      "3,4": "white", "5,4": "white",
    },
    turn: "white",
    goal: { en: "White to play — kill the black corner", zh: "白先 — 点杀黑角" },
    solution: [{ row: 4, col: 4 }],
    difficulty: "normal",
  },
];

export function getProblemsByDifficulty(difficulty: string): GoProblem[] {
  return problems.filter((p) => p.difficulty === difficulty);
}

export function getRandomProblem(difficulty: string): GoProblem {
  const pool = getProblemsByDifficulty(difficulty);
  return pool[Math.floor(Math.random() * pool.length)];
}
