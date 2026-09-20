import type { ParsedRuleSection } from "@/types/game";

const SECTION_MARKER = /^\s*<!--\s*rule-section:\s*([a-z0-9][a-z0-9-]*)\s*-->\s*$/i;
const DETAILS_MARKER = /^\s*<!--\s*rule-details\s*-->\s*$/i;
const HEADING = /^(#{2,3})\s+(.+)$/;

export function parseRuleGuideSections(markdown: string): ParsedRuleSection[] {
  const lines = markdown.split(/\r?\n/);
  const sections: ParsedRuleSection[] = [];
  let pendingId: string | null = null;
  let current: {
    id: string;
    heading: string;
    level: 2 | 3;
    body: string[];
  } | null = null;

  const flush = () => {
    if (!current) return;
    const detailIndex = current.body.findIndex((line) => DETAILS_MARKER.test(line));
    const summaryLines = detailIndex >= 0 ? current.body.slice(0, detailIndex) : current.body;
    const detailLines = detailIndex >= 0 ? current.body.slice(detailIndex + 1) : [];
    const summaryMd = summaryLines.join("\n").trim();
    const detailMd = detailLines.join("\n").trim();
    sections.push({
      id: current.id,
      heading: current.heading,
      level: current.level,
      summaryMd,
      detailMd: detailMd || null,
    });
    current = null;
  };

  for (const line of lines) {
    const marker = SECTION_MARKER.exec(line);
    if (marker) {
      flush();
      pendingId = marker[1];
      continue;
    }

    const heading = HEADING.exec(line);
    if (!current && heading && pendingId) {
      flush();
      current = {
        id: pendingId,
        heading: heading[2].replace(/#+\s*$/, "").trim(),
        level: heading[1].length as 2 | 3,
        body: [],
      };
      pendingId = null;
      continue;
    }

    if (current) current.body.push(line);
  }

  flush();
  return sections;
}

export function stripRuleGuideMarkers(markdown: string): string {
  return markdown
    .replace(/^\s*<!--\s*rule-section:\s*[a-z0-9][a-z0-9-]*\s*-->\s*(?:\r?\n|$)/gim, "")
    .replace(/^\s*<!--\s*rule-details\s*-->\s*(?:\r?\n|$)/gim, "");
}
