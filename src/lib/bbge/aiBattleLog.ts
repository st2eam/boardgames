/** Append shared battle-log context into an LLM seat prompt. */
export function battleLogPromptBlock(
  battleLog: string[] | undefined,
  zh: boolean,
): string {
  if (!battleLog?.length) return "";
  const header = zh
    ? "\n\n本局战报（按时间顺序，含每位玩家每一轮行动，请据此判断局势）："
    : "\n\nBattle log (chronological — every player's actions each round; use to read the table):";
  return `${header}\n${battleLog.join("\n")}`;
}
