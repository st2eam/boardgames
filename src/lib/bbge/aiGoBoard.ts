/** Columns A–T skipping I (standard Go notation). */
const COLS = "ABCDEFGHJKLMNOPQRST";

export function goCoordLabel(
  row: number,
  col: number,
  size: number,
): string {
  return `${COLS[col] ?? "?"}${size - row}`;
}

type GoSeatView = {
  size?: number;
  komi?: number;
  phase?: string;
  toActColor?: string | null;
  consecutivePasses?: number;
  ko?: { row: number; col: number } | null;
  lastMove?: { row: number; col: number } | null;
  lastMoveLabel?: string | null;
  boardAscii?: string;
  stones?: Record<string, "black" | "white">;
  you?: { color?: string; captures?: number } | null;
  seats?: { id: string; color: string; captures: number }[];
  legal?: { type: string; row?: number; col?: number }[];
};

/**
 * Pack the live board into a prompt block the LLM must read before choosing
 * a move (same ASCII source as the Go teacher chat).
 */
export function goBoardPromptBlock(
  view: GoSeatView,
  playerId: string,
  zh: boolean,
  hintPlays?: { row: number; col: number; note?: string }[],
): string {
  const size = view.size ?? 9;
  const color = view.you?.color ?? view.toActColor ?? "?";
  const myCaps = view.you?.captures ?? 0;
  const oppCaps =
    view.seats?.find((s) => s.id !== playerId)?.captures ?? 0;
  const plays = (view.legal ?? []).filter(
    (a) => a.type === "play" && a.row != null && a.col != null,
  ) as { type: "play"; row: number; col: number }[];

  const black: string[] = [];
  const white: string[] = [];
  for (const [k, c] of Object.entries(view.stones ?? {})) {
    const [rs, cs] = k.split(",");
    const label = goCoordLabel(Number(rs), Number(cs), size);
    if (c === "black") black.push(label);
    else white.push(label);
  }
  black.sort();
  white.sort();

  const legalLabels = plays.map(
    (p) => `${goCoordLabel(p.row, p.col, size)}(${p.row},${p.col})`,
  );
  // Keep prompt bounded on 19×19; ASCII + stones still describe the whole board.
  const legalShown =
    legalLabels.length > 80
      ? `${legalLabels.slice(0, 80).join(" ")} …(+${legalLabels.length - 80})`
      : legalLabels.join(" ");

  const koLabel =
    view.ko != null
      ? goCoordLabel(view.ko.row, view.ko.col, size)
      : null;
  const lastLabel =
    view.lastMoveLabel ??
    (view.lastMove
      ? goCoordLabel(view.lastMove.row, view.lastMove.col, size)
      : null);

  const hintLine =
    hintPlays?.length &&
    (zh
      ? `\n启发式参考点（可采纳也可忽略，以盘面与规则为准）：${hintPlays
          .map(
            (h) =>
              `${goCoordLabel(h.row, h.col, size)}(${h.row},${h.col})${
                h.note ? `[${h.note}]` : ""
              }`,
          )
          .join(" ")}`
      : `\nHeuristic hints (optional): ${hintPlays
          .map(
            (h) =>
              `${goCoordLabel(h.row, h.col, size)}(${h.row},${h.col})${
                h.note ? `[${h.note}]` : ""
              }`,
          )
          .join(" ")}`);

  if (zh) {
    return `
## 当前棋盘数据（每手必读，据此落子）
- 规格：${size}×${size} · 贴目 ${view.komi ?? "?"} · 阶段 ${view.phase ?? "?"}
- 你的颜色：${color === "black" ? "黑●" : color === "white" ? "白○" : color} · 提子 己 ${myCaps} / 对 ${oppCaps}
- 连续停棋：${view.consecutivePasses ?? 0}/2${koLabel ? ` · 劫点 ${koLabel}` : ""}${lastLabel ? ` · 上一手 ${lastLabel}` : ""}
- 黑子坐标：${black.length ? black.join(" ") : "（无）"}
- 白子坐标：${white.length ? white.join(" ") : "（无）"}
- 合法落点（标签(row,col)，共 ${plays.length}）：${legalShown || "（无，可停棋/认输）"}

ASCII（列 A… 跳过 I；行号自下而上；●黑 ○白 ·空）：
${view.boardAscii?.trim() || "(无盘面)"}
${hintLine || ""}`;
  }

  return `
## Live board data (read before every move)
- Size ${size}×${size} · komi ${view.komi ?? "?"} · phase ${view.phase ?? "?"}
- Your color: ${color} · captures you ${myCaps} / opp ${oppCaps}
- Consecutive passes: ${view.consecutivePasses ?? 0}/2${koLabel ? ` · ko ${koLabel}` : ""}${lastLabel ? ` · last ${lastLabel}` : ""}
- Black: ${black.length ? black.join(" ") : "(none)"}
- White: ${white.length ? white.join(" ") : "(none)"}
- Legal plays (label(row,col), ${plays.length}): ${legalShown || "(none — pass/resign)"}

ASCII (cols A… skip I; row nums bottom→top; ●black ○white ·empty):
${view.boardAscii?.trim() || "(no board)"}
${hintLine || ""}`;
}
