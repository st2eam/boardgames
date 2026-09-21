"use client";

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import type { RuleDocument, RuleSection, RuleSidebar } from "@/types/game";
import { stripRuleDocumentMarkers } from "@/lib/content/ruleMarkers";
import { MarkdownRenderer } from "./MarkdownRenderer";

type Lang = "en" | "zh";

const labels = {
  en: {
    guide: "Interactive guide",
    full: "Full rules",
    guideHint: "Learn step by step or jump to any topic.",
    fullHint: "Read the complete rules continuously.",
    back: "Back",
    startOver: "Start over",
    previous: "Previous",
    next: "Next",
    showDetails: "Show details",
    hideDetails: "Hide details",
    chooseNext: "Choose next",
    invalid: "This rule link no longer points to an available section.",
    returnToGuide: "Return to interactive guide",
  },
  zh: {
    guide: "交互指南",
    full: "完整规则",
    guideHint: "按步骤学习，也可以直接跳到任意主题。",
    fullHint: "按标题连续阅读完整规则。",
    back: "返回上一步",
    startOver: "重新开始",
    previous: "上一项",
    next: "下一项",
    showDetails: "查看详细规则",
    hideDetails: "收起详细规则",
    chooseNext: "选择下一步",
    invalid: "这个规则链接已经不再指向可用的规则条目。",
    returnToGuide: "返回交互指南",
  },
} as const;

function canonicalHashId(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.slice(1);
  if (hash.startsWith("rule-")) return hash.slice(5);
  if (hash.startsWith("guide-")) {
    const parts = hash.slice(6).split("--");
    return parts[parts.length - 1] || null;
  }
  return null;
}

function setRuleHash(id: string) {
  window.history.replaceState(null, "", `#rule-${id}`);
}

function inlineLabel(markdown: string): string {
  return markdown.replace(/[*_`]/g, "").trim();
}

function withoutH1(markdown: string): string {
  return markdown.replace(/^\s*#\s+.+(?:\r?\n|$)/, "").trim();
}

function RuleHeading({ section }: { section: RuleSection }) {
  const Tag = section.level === 2 ? "h2" : section.level === 3 ? "h3" : "h4";
  const className = section.level === 2
    ? "mb-3 mt-8 scroll-mt-24 font-heading text-2xl font-bold tracking-tight text-primary-dark first:mt-0"
    : section.level === 3
      ? "mb-2 mt-5 scroll-mt-24 font-heading text-xl font-bold text-primary-dark"
      : "mb-2 mt-4 scroll-mt-24 font-heading text-lg font-semibold text-stone-800";
  return <Tag id={`rule-${section.id}`} className={className}>{section.heading}</Tag>;
}

function RuleMarkdown({ content, lang }: { content: string; lang: Lang }) {
  const details = useMemo(() => {
    const match = /([\s\S]*?)\s*<!--\s*rule-details\s*-->\s*([\s\S]*)/i.exec(content);
    return match ? { summary: match[1].trim(), detail: match[2].trim() } : null;
  }, [content]);
  const [open, setOpen] = useState(false);
  if (!content.trim()) return null;
  if (!details) return <MarkdownRenderer content={content} />;
  const t = labels[lang];
  return (
    <div>
      <MarkdownRenderer content={details.summary} />
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="mb-3 min-h-11 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-primary-dark transition-colors hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {open ? t.hideDetails : t.showDetails}
      </button>
      {open ? <MarkdownRenderer content={details.detail} /> : null}
    </div>
  );
}

function SidebarView({ sidebar, sectionId, lang }: { sidebar: RuleSidebar; sectionId: string; lang: Lang }) {
  const t = labels[lang];
  const ids = sidebar.items.map((item) => item.id);
  const [activeId, setActiveId] = useState(sidebar.defaultId ?? ids[0]);

  useEffect(() => {
    const onHashChange = () => {
      const next = canonicalHashId();
      if (next && ids.includes(next)) setActiveId(next);
    };
    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [ids]);

  const select = (id: string) => {
    setActiveId(id);
    setRuleHash(id);
  };
  const activeIndex = Math.max(0, ids.indexOf(activeId));
  const active = sidebar.items[activeIndex];

  return (
    <div className="mt-4 flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)] lg:items-start lg:gap-5">
      <nav aria-label={sectionId} className="rounded-2xl border border-border bg-white p-2 shadow-card lg:sticky lg:top-24">
        <ul className="flex max-h-[min(55vh,32rem)] flex-col gap-1 overflow-y-auto">
          {sidebar.items.map((item, index) => {
            const activeItem = item.id === active.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={activeItem ? (sidebar.ordered ? "step" : "location") : undefined}
                  aria-expanded={activeItem}
                  onClick={() => select(item.id)}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${activeItem ? "bg-amber-50 font-semibold text-primary-dark" : "text-stone-700 hover:bg-stone-50"}`}
                >
                  {sidebar.ordered ? <span className="font-mono text-[10px] font-bold text-accent-dark">{String(index + 1).padStart(2, "0")}</span> : null}
                  <span className="min-w-0 flex-1 truncate">{inlineLabel(item.labelMd)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7" aria-live="polite">
        <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-accent-dark">
          {sidebar.ordered ? `${activeIndex + 1} / ${sidebar.items.length}` : t.guide}
        </p>
        <MarkdownRenderer content={active.labelMd} />
        <RuleMarkdown content={active.contentMd} lang={lang} />
        {sidebar.ordered ? (
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button type="button" disabled={activeIndex === 0} onClick={() => select(ids[activeIndex - 1])} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.previous}</button>
            <button type="button" disabled={activeIndex === ids.length - 1} onClick={() => select(ids[activeIndex + 1])} className="min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-accent-dark hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.next}</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TabsView({ section, lang }: { section: RuleSection; lang: Lang }) {
  const ids = section.children.map((child) => child.id);
  const [activeId, setActiveId] = useState(section.ui?.type === "tabs" ? section.ui.defaultId ?? ids[0] : ids[0]);
  const activeIndex = Math.max(0, ids.indexOf(activeId));
  const active = section.children[activeIndex];

  useEffect(() => {
    const onHashChange = () => {
      const next = canonicalHashId();
      if (next && ids.includes(next)) setActiveId(next);
    };
    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [ids]);

  const select = useCallback((id: string, focus = false) => {
    setActiveId(id);
    setRuleHash(id);
    if (focus) document.getElementById(`rule-tab-${id}`)?.focus();
  }, [setActiveId]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const current = ids.indexOf(activeId);
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % ids.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + ids.length) % ids.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = ids.length - 1;
    if (next !== current) {
      event.preventDefault();
      select(ids[next], true);
    }
  };

  return (
    <div className="mt-4">
      <div role="tablist" aria-label={section.heading} className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-white p-2 print:hidden">
        {section.children.map((child, index) => (
          <button
            key={child.id}
            id={`rule-tab-${child.id}`}
            type="button"
            role="tab"
            aria-selected={child.id === active.id}
            aria-controls={`rule-panel-${child.id}`}
            aria-current={child.id === active.id ? "step" : undefined}
            tabIndex={child.id === active.id ? 0 : -1}
            onClick={() => select(child.id)}
            onKeyDown={onKeyDown}
            className={`flex min-h-11 shrink-0 max-w-[18rem] items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${child.id === active.id ? "bg-amber-50 font-semibold text-primary-dark" : "text-stone-700 hover:bg-stone-50"}`}
          >
            <span className="font-mono text-[10px] font-bold text-accent-dark">{String(index + 1).padStart(2, "0")}</span>
            <span className="truncate">{child.heading}</span>
          </button>
        ))}
      </div>
      <div id={`rule-panel-${active.id}`} role="tabpanel" aria-labelledby={`rule-tab-${active.id}`} className="mt-4 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7">
        <RuleHeading section={active} />
        <SectionBody section={active} lang={lang} />
      </div>
    </div>
  );
}

function DecisionView({ section, lang }: { section: RuleSection; lang: Lang }) {
  const t = labels[lang];
  const nodes = useMemo(() => new Map(section.children.map((child) => [child.id, child])), [section.children]);
  const startId = section.ui?.type === "decision" ? section.ui.startId : section.children[0]?.id;
  const [currentId, setCurrentId] = useState(startId);
  const [history, setHistory] = useState<string[]>([]);

  const syncHash = useCallback(() => {
    const initial = canonicalHashId();
    if (initial && nodes.has(initial)) setCurrentId(initial);
  }, [nodes]);

  useEffect(() => {
    window.addEventListener("hashchange", syncHash);
    window.dispatchEvent(new Event("hashchange"));
    return () => window.removeEventListener("hashchange", syncHash);
  }, [syncHash]);

  const node = nodes.get(currentId);
  if (!node) return null;

  const navigate = (id: string) => {
    setHistory((items) => [...items, currentId]);
    setCurrentId(id);
    setRuleHash(id);
  };
  const back = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((items) => items.slice(0, -1));
    setCurrentId(previous);
    setRuleHash(previous);
  };
  const restart = () => {
    setHistory([]);
    setCurrentId(startId);
    setRuleHash(startId);
  };

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white shadow-card">
      <div className="border-b border-border px-5 py-4 sm:px-7">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-accent-dark">{t.chooseNext}</p>
        <RuleHeading section={node} />
      </div>
      <div className="px-5 py-5 sm:px-7"><SectionBody section={node} lang={lang} /></div>
      {node.choices?.length ? (
        <div className="border-t border-border bg-stone-50/60 px-5 py-4 sm:px-7">
          <div className="grid gap-2 sm:grid-cols-2">
            {node.choices.map((choice) => (
              <button key={choice.targetId} type="button" onClick={() => navigate(choice.targetId)} className="min-h-11 rounded-xl border border-border bg-white px-4 py-3 text-left text-sm font-medium text-primary-dark shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-accent/40">{choice.labelMd}</button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex items-center gap-2 border-t border-border px-5 py-3 sm:px-7">
        {history.length > 0 ? <button type="button" onClick={back} className="min-h-11 rounded-lg bg-stone-100 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.back}</button> : null}
        <button type="button" onClick={restart} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.startOver}</button>
      </div>
    </div>
  );
}

function SectionBody({ section, lang }: { section: RuleSection; lang: Lang }) {
  return (
    <>
      <RuleMarkdown content={section.contentMd} lang={lang} />
      {section.sidebar ? <SidebarView sidebar={section.sidebar} sectionId={section.id} lang={lang} /> : null}
      {section.ui?.type === "tabs" ? <TabsView section={section} lang={lang} /> : null}
      {section.ui?.type === "decision" ? <DecisionView section={section} lang={lang} /> : null}
      {!section.ui ? section.children.map((child) => <SectionView key={child.id} section={child} lang={lang} />) : null}
    </>
  );
}

function SectionView({ section, lang }: { section: RuleSection; lang: Lang }) {
  return (
    <section id={`rule-section-${section.id}`} className="scroll-mt-24">
      <RuleHeading section={section} />
      <SectionBody section={section} lang={lang} />
    </section>
  );
}

export function RuleDocumentExperience({ locale, rulesMd, document }: { locale: string; rulesMd: string; document: RuleDocument }) {
  const lang = locale === "zh" ? "zh" : "en";
  const t = labels[lang];
  const [mode, setMode] = useState<"guide" | "full">("guide");
  const [invalidHash, setInvalidHash] = useState(false);
  const knownIds = useMemo(() => {
    const ids = new Set<string>();
    const visit = (section: RuleSection) => {
      ids.add(section.id);
      section.sidebar?.items.forEach((item) => ids.add(item.id));
      section.children.forEach(visit);
    };
    document.sections.forEach(visit);
    return ids;
  }, [document]);

  useEffect(() => {
    const inspect = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "rules-full") setMode("full");
      const id = canonicalHashId();
      setInvalidHash(Boolean(id && !knownIds.has(id)));
    };
    inspect();
    window.addEventListener("hashchange", inspect);
    return () => window.removeEventListener("hashchange", inspect);
  }, [knownIds]);

  const changeMode = (next: "guide" | "full") => {
    setMode(next);
    setInvalidHash(false);
    window.history.replaceState(null, "", next === "full" ? "#rules-full" : `#rule-${document.sections[0]?.id ?? "rules"}`);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 print:hidden">
        <div className="flex rounded-xl border border-border bg-white p-1" role="group" aria-label={lang === "zh" ? "规则阅读模式" : "Rules reading mode"}>
          <button type="button" aria-pressed={mode === "guide"} onClick={() => changeMode("guide")} className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent/40 ${mode === "guide" ? "bg-amber-50 text-primary-dark" : "text-stone-700 hover:bg-stone-50"}`}>{t.guide}</button>
          <button type="button" aria-pressed={mode === "full"} onClick={() => changeMode("full")} className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent/40 ${mode === "full" ? "bg-amber-50 text-primary-dark" : "text-stone-700 hover:bg-stone-50"}`}>{t.full}</button>
        </div>
        <p className="text-sm text-stone-600">{mode === "guide" ? t.guideHint : t.fullHint}</p>
      </div>
      {invalidHash ? <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-primary-dark"><span>{t.invalid}</span><button type="button" onClick={() => changeMode("guide")} className="min-h-11 rounded-lg border border-amber-300 bg-white px-3 py-2 font-semibold hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.returnToGuide}</button></div> : null}
      {mode === "full" ? (
        <article id="rules-full" className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8"><MarkdownRenderer content={stripRuleDocumentMarkers(rulesMd)} tocContent={rulesMd} /></article>
      ) : (
        <div className="rules-guide-experience max-w-3xl space-y-10">
          {document.introMd ? <div><MarkdownRenderer content={withoutH1(document.introMd)} /></div> : null}
          {document.sections.map((section) => <SectionView key={section.id} section={section} lang={lang} />)}
        </div>
      )}
      <noscript><article className="mt-10 rounded-xl border border-border bg-white p-6 sm:p-8"><MarkdownRenderer content={stripRuleDocumentMarkers(rulesMd)} /></article></noscript>
    </>
  );
}
