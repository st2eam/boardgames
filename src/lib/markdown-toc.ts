import type { ReactNode } from "react";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
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

/** Extract h2/h3 headings from markdown for TOC. */
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/#+\s*$/, "").replace(/[*_`]/g, "").trim();
    if (!text) continue;

    let id = slugify(text) || `section-${items.length + 1}`;
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;

    items.push({ id, text, level });
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
