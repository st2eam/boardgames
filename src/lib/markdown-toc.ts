import type { ReactNode } from "react";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Extract marked h2-h4 headings from markdown for TOC. */
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  const lines = markdown.split(/\r?\n/);
  let pendingId: string | null = null;

  for (const line of lines) {
    const marker = /^\s*<!--\s*rule-section:\s*([a-z0-9][a-z0-9-]*)\s*-->\s*$/i.exec(line);
    if (marker) {
      pendingId = marker[1];
      continue;
    }
    const match = /^(#{2,4})\s+(.+)$/.exec(line);
    if (!match) {
      if (line.trim()) pendingId = null;
      continue;
    }
    const level = match[1].length as 2 | 3 | 4;
    const text = match[2].replace(/#+\s*$/, "").replace(/[*_`]/g, "").trim();
    if (!text) continue;

    let id = pendingId ? `rule-${pendingId}` : slugify(text) || `section-${items.length + 1}`;
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;

    items.push({ id, text, level });
    pendingId = null;
  }

  return items;
}

export function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    const el = children as { props?: { children?: ReactNode } };
    return extractTextFromChildren(el.props?.children);
  }
  return "";
}
