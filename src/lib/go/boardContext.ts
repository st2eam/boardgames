import type { Coord, Stone } from "./types";

/** Columns A–T skipping I (common Go notation). */
const COLS = "ABCDEFGHJKLMNOPQRST";

function coordLabel(c: Coord, size: number): string {
  const col = COLS[c.col] ?? String(c.col);
  const row = size - c.row;
  return `${col}${row}`;
}

/**
 * Compact board dump for LLM tutoring (ASCII + status).
 * Coordinates: letters left→right, numbers bottom→top.
 */
export function formatGoBoardContext(opts: {
  size: number;
  stones: Record<string, Stone>;
  turn: Stone;
  goal: string;
  phase: "playing" | "result";
  wasCorrect?: boolean;
  playedMoves?: Coord[];
  solution?: Coord[] | null;
  locale: string;
}): string {
  const {
    size,
    stones,
    turn,
    goal,
    phase,
    wasCorrect,
    playedMoves = [],
    solution,
    locale,
  } = opts;
  const zh = locale === "zh";
  const lines: string[] = [];

  lines.push(zh ? `【当前死活题】` : `[Current tsumego]`);
  lines.push(
    zh
      ? `棋盘 ${size}×${size} · ${turn === "black" ? "黑" : "白"}先 · 目标：${goal}`
      : `Board ${size}×${size} · ${turn} to play · Goal: ${goal}`,
  );

  // Header columns
  const header = ["  ", ...Array.from({ length: size }, (_, c) => COLS[c] ?? "?")].join(
    " ",
  );
  lines.push(header);
  for (let r = 0; r < size; r++) {
    const rowNum = String(size - r).padStart(2, " ");
    const cells: string[] = [];
    for (let c = 0; c < size; c++) {
      const k = `${r},${c}`;
      const s = stones[k];
      cells.push(s === "black" ? "●" : s === "white" ? "○" : "·");
    }
    lines.push(`${rowNum} ${cells.join(" ")}`);
  }

  if (playedMoves.length) {
    lines.push(
      zh
        ? `学员已落子：${playedMoves.map((m) => coordLabel(m, size)).join(" → ")}`
        : `Student moves: ${playedMoves.map((m) => coordLabel(m, size)).join(" → ")}`,
    );
  }

  if (phase === "result") {
    lines.push(
      zh
        ? `已提交答案：${wasCorrect ? "正确" : "错误"}`
        : `Answer submitted: ${wasCorrect ? "correct" : "incorrect"}`,
    );
    if (solution?.length) {
      lines.push(
        zh
          ? `参考正解：${solution.map((m) => coordLabel(m, size)).join(" → ")}`
          : `Reference solution: ${solution.map((m) => coordLabel(m, size)).join(" → ")}`,
      );
    }
  } else {
    lines.push(
      zh
        ? "学员尚未提交答案。讲解时可给思路与提示，不要直接剧透全部正解，除非对方明确要求看答案。"
        : "Student has not checked yet. Hint and teach; do not spoil the full solution unless they ask.",
    );
  }

  return lines.join("\n");
}

export function goTutorSuggestedPrompts(locale: string): string[] {
  return locale === "zh"
    ? [
        "用一句话讲清气和提子",
        "这道死活题我该从哪看起？",
        "帮我复盘刚才的思路错在哪",
        "初学者先学布局还是死活？",
      ]
    : [
        "Explain liberties & capture in one minute",
        "How should I approach this tsumego?",
        "Where did my last idea go wrong?",
        "Should beginners study joseki or life-and-death first?",
      ];
}
