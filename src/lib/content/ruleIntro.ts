const OPENING_HEADINGS = /^(overview|game overview|theme|theme background|概览|概述|游戏概述|主题背景)$/i;

function plainText(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reuses each rules document’s opening paragraph; no duplicate metadata copy. */
export function extractRuleIntro(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const overviewIndex = lines.findIndex((line) => {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    return match ? OPENING_HEADINGS.test(match[1].replace(/^\d+\.\s*/, "")) : false;
  });
  const start = overviewIndex >= 0 ? overviewIndex + 1 : 1;
  const collected: string[] = [];

  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (/^#{1,6}\s+/.test(line)) break;
    if (!line || /^!\[/.test(line) || /^>\s*$/.test(line)) {
      if (collected.length) break;
      continue;
    }
    if (/^(?:[-*]\s|\d+\.\s|\|)/.test(line)) break;
    const text = plainText(line.replace(/^>\s*/, ""));
    if (text) collected.push(text);
  }

  return collected.join(" ");
}
