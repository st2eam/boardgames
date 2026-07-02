"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { shortcodeToInlineHTML, replaceShortcodesText } from "@/lib/mahjong/shortcode";

const CARD_DOWNLOADS: Record<string, string> = {
  trio: "/downloads/trio-cards.zip",
  cabo: "/downloads/cabo-cards.zip",
};

interface Props {
  markdown: string;
  gameName: string;
  slug: string;
}

export function ExportButton({ markdown, gameName, slug }: Props) {
  const t = useTranslations("game");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cardDownloadUrl = CARD_DOWNLOADS[slug];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function downloadMarkdown() {
    const converted = replaceShortcodesText(markdown);
    const blob = new Blob([converted], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-rules.md`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  function exportPDF() {
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${gameName}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 24px; color: #1c1917; line-height: 1.7; }
  h1 { font-size: 1.75em; margin: 1.5em 0 0.5em; border-bottom: 2px solid #e7e5e4; padding-bottom: 0.3em; }
  h1:first-child { margin-top: 0; }
  h2 { font-size: 1.35em; margin: 1.3em 0 0.4em; color: #44403c; }
  h3 { font-size: 1.1em; margin: 1em 0 0.3em; color: #57534e; }
  p { margin: 0.5em 0; }
  ul, ol { margin: 0.5em 0; padding-left: 1.5em; }
  li { margin: 0.25em 0; }
  table { border-collapse: collapse; width: 100%; margin: 0.8em 0; font-size: 0.9em; }
  th, td { border: 1px solid #d6d3d1; padding: 6px 12px; text-align: left; }
  th { background: #fafaf9; font-weight: 600; }
  blockquote { border-left: 3px solid #d97706; background: #fffbeb; padding: 8px 16px; margin: 0.8em 0; font-style: italic; }
  strong { font-weight: 600; }
  code { background: #f5f5f4; padding: 1px 4px; border-radius: 3px; font-size: 0.9em; }
  hr { border: none; border-top: 1px solid #e7e5e4; margin: 1.5em 0; }
  @media print { body { padding: 0; } }
</style>
</head>
<body id="content"></body>
</html>`);
    win.document.close();

    const container = win.document.getElementById("content")!;
    renderMarkdownToHTML(markdown, container, win.document);

    setTimeout(() => {
      win.print();
    }, 300);

    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-stone-600 shadow-sm transition-all hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800"
        aria-label={t("export")}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        {t("export")}
      </button>

      <div className={`absolute right-0 z-20 mt-1.5 w-44 rounded-xl border border-border bg-white py-1.5 shadow-lg transition-all duration-200 origin-top-right motion-reduce:transition-none ${
        open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
      }`}>
          <button
            onClick={exportPDF}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
          >
            <svg
              className="h-4 w-4 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H6.75a2.25 2.25 0 0 0-2.25 2.25v13.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-.75"
              />
            </svg>
            {t("exportPDF")}
          </button>
          <button
            onClick={downloadMarkdown}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
          >
            <svg
              className="h-4 w-4 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
              />
            </svg>
            {t("exportMarkdown")}
          </button>
          {cardDownloadUrl && (
            <a
              href={cardDownloadUrl}
              download
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
            >
              <svg
                className="h-4 w-4 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v13.5a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              {t("exportCards")}
            </a>
          )}
        </div>
    </div>
  );
}

function renderMarkdownToHTML(
  md: string,
  container: HTMLElement,
  doc: Document
) {
  const lines = md.split("\n");
  let i = 0;
  let inTable = false;
  let tableEl: HTMLTableElement | null = null;
  let inThead = false;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      flushTable();
      const h = doc.createElement("h1");
      h.innerHTML = inlineFormat(line.slice(2));
      container.appendChild(h);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      flushTable();
      const h = doc.createElement("h2");
      h.innerHTML = inlineFormat(line.slice(3));
      container.appendChild(h);
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      flushTable();
      const h = doc.createElement("h3");
      h.innerHTML = inlineFormat(line.slice(4));
      container.appendChild(h);
      i++;
      continue;
    }
    if (line.startsWith("---") || line.startsWith("***")) {
      flushTable();
      container.appendChild(doc.createElement("hr"));
      i++;
      continue;
    }
    if (line.startsWith("> ")) {
      flushTable();
      const bq = doc.createElement("blockquote");
      let text = line.slice(2);
      while (i + 1 < lines.length && lines[i + 1].startsWith("> ")) {
        i++;
        text += "\n" + lines[i].slice(2);
      }
      bq.innerHTML = inlineFormat(text);
      container.appendChild(bq);
      i++;
      continue;
    }
    if (line.startsWith("|")) {
      if (!inTable) {
        tableEl = doc.createElement("table");
        inTable = true;
        inThead = true;
      }
      if (line.replace(/[|\-\s:]/g, "") === "") {
        inThead = false;
        i++;
        continue;
      }
      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      const tr = doc.createElement("tr");
      const tag = inThead ? "th" : "td";
      for (const cell of cells) {
        const el = doc.createElement(tag);
        el.innerHTML = inlineFormat(cell);
        tr.appendChild(el);
      }
      if (inThead) {
        let thead = tableEl!.querySelector("thead");
        if (!thead) {
          thead = doc.createElement("thead");
          tableEl!.appendChild(thead);
        }
        thead.appendChild(tr);
      } else {
        let tbody = tableEl!.querySelector("tbody");
        if (!tbody) {
          tbody = doc.createElement("tbody");
          tableEl!.appendChild(tbody);
        }
        tbody.appendChild(tr);
      }
      i++;
      continue;
    }

    flushTable();

    if (/^\d+\.\s/.test(line)) {
      const ol = doc.createElement("ol");
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const li = doc.createElement("li");
        li.innerHTML = inlineFormat(lines[i].replace(/^\d+\.\s/, ""));
        ol.appendChild(li);
        i++;
      }
      container.appendChild(ol);
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const ul = doc.createElement("ul");
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        const li = doc.createElement("li");
        li.innerHTML = inlineFormat(lines[i].slice(2));
        ul.appendChild(li);
        i++;
      }
      container.appendChild(ul);
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }

    const p = doc.createElement("p");
    p.innerHTML = inlineFormat(line);
    container.appendChild(p);
    i++;
  }

  flushTable();

  function flushTable() {
    if (inTable && tableEl) {
      container.appendChild(tableEl);
      inTable = false;
      tableEl = null;
      inThead = false;
    }
  }
}

function inlineFormat(text: string): string {
  return text
    .replace(/\[([1-9][mps]|[ESWN]|[CFB])\]/g, (_, code) => {
      return shortcodeToInlineHTML(code);
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color:#2563eb">$1</a>'
    );
}
