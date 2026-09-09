import { extractToc } from "@/lib/markdown-toc";

export interface RuleSection {
  /** TOC-compatible anchor id for this section (same slug as full-doc TOC). */
  id: string;
  /** Heading text with markdown markers removed. */
  heading: string;
  level: 2 | 3;
  /** The heading line plus everything below it until the next heading, unchanged. */
  md: string;
}

/**
 * Split a rules.md document into sections at every `##` / `###` heading.
 * Each section keeps its own heading line so MarkdownRenderer generates the
 * exact same anchor ids as the full-document TOC (extractToc is text-based).
 */
export function parseRuleSections(markdown: string): RuleSection[] {
  const sections: RuleSection[] = [];
  const lines = markdown.split("\n");

  let current: { heading: string; level: 2 | 3; mdLines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const md = current.mdLines.join("\n");
    const toc = extractToc(md);
    sections.push({
      id: toc[0]?.id ?? `section-${sections.length + 1}`,
      heading: current.heading,
      level: current.level,
      md,
    });
    current = null;
  };

  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (match) {
      flush();
      current = {
        heading: match[2]
          .replace(/#+\s*$/, "")
          .replace(/[*_`]/g, "")
          .trim(),
        level: match[1].length as 2 | 3,
        mdLines: [line],
      };
    } else if (current) {
      current.mdLines.push(line);
    }
  }
  flush();
  return sections;
}
