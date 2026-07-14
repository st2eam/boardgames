"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { extractToc } from "@/lib/markdown-toc";
import { useTranslations } from "next-intl";

interface Props {
  content: string;
  variant: "mobile" | "desktop";
}

export function RulesToc({ content, variant }: Props) {
  const t = useTranslations("game");
  const items = useMemo(() => extractToc(content), [content]);
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const headingEls = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (headingEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: [0, 1] }
    );

    for (const el of headingEls) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  // Keep the active entry visible inside the sticky TOC scroller (not the page)
  useEffect(() => {
    if (!activeId || variant !== "desktop") return;
    const panel = panelRef.current;
    const link = activeLinkRef.current;
    if (!panel || !link) return;
    const panelRect = panel.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const pad = 12;
    if (linkRect.top < panelRect.top + pad) {
      panel.scrollBy({ top: linkRect.top - panelRect.top - pad, behavior: "smooth" });
    } else if (linkRect.bottom > panelRect.bottom - pad) {
      panel.scrollBy({
        top: linkRect.bottom - panelRect.bottom + pad,
        behavior: "smooth",
      });
    }
  }, [activeId, variant]);

  if (items.length < 2) return null;

  const list = (
    <nav aria-label={t("toc")}>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              ref={item.id === activeId ? activeLinkRef : undefined}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className={`block rounded-md py-1 text-sm transition-colors ${
                item.level === 3 ? "pl-3 text-[13px]" : "font-medium"
              } ${
                activeId === item.id
                  ? "text-accent"
                  : "text-stone-500 hover:text-primary"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  if (variant === "mobile") {
    return (
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-amber-50/50 px-4 py-3 text-sm font-medium text-primary-dark"
          aria-expanded={open}
        >
          <span>{t("toc")}</span>
          <svg
            className={`h-4 w-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="mt-2 rounded-xl border border-border bg-white px-4 py-3">
            {list}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside>
      <div
        ref={panelRef}
        className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-border bg-white/80 p-4 backdrop-blur-sm"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
          {t("toc")}
        </p>
        {list}
      </div>
    </aside>
  );
}
