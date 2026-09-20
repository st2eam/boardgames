"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type {
  FlowData,
  ParsedRuleSection,
  RulesGuideCollectionModule,
  RulesGuideConfig,
  RulesGuideModule,
} from "@/types/game";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { RuleIllustration } from "./RuleIllustration";
import { stripRuleGuideMarkers } from "@/lib/content/ruleGuide";

interface Props {
  locale: string;
  rulesMd: string;
  sections: ParsedRuleSection[];
  guide: RulesGuideConfig;
  flow: FlowData | null;
}

type Lang = "en" | "zh";
type TabbedModule =
  | (Omit<RulesGuideCollectionModule, "type"> & {
      type: "steps" | "categories" | "ranking" | "faq";
    })
  | Extract<RulesGuideModule, { type: "reference" | "prose" }>;

const labels = {
  en: {
    details: "Show details",
    hideDetails: "Hide details",
    previous: "Previous",
    next: "Next",
    previousStep: "Previous step",
    nextStep: "Next step",
    back: "Back",
    startOver: "Start over",
    contents: "On this page",
    contentsExpand: "Open page contents",
    contentsCollapse: "Close page contents",
    chooseNext: "Choose a path",
    guideMode: "Interactive guide",
    fullMode: "Full rules",
    returnToGuide: "Back to interactive guide",
    referenceGroups: "Reference categories",
    setup: "Setup",
    phases: "Turn flow",
    categories: "Reference",
    ranking: "Ranking",
    faq: "FAQ",
    reference: "Quick reference",
    prose: "Rules",
    facts: "Quick start",
    decision: "Decision helper",
    missing: "This rule section is unavailable.",
    invalidLink: "This link no longer points to an available rule section.",
    markStep: "Mark step complete",
    completed: "Completed",
    allStepsComplete: "All steps complete. You are ready to continue.",
  },
  zh: {
    details: "查看详细规则",
    hideDetails: "收起详细规则",
    previous: "上一阶段",
    next: "下一阶段",
    previousStep: "上一步",
    nextStep: "下一步",
    back: "返回上一步",
    startOver: "重新开始",
    contents: "本页内容",
    contentsExpand: "展开本页内容",
    contentsCollapse: "收起本页内容",
    chooseNext: "选择下一步",
    guideMode: "交互指南",
    fullMode: "完整规则",
    returnToGuide: "返回交互指南",
    referenceGroups: "参考分类",
    setup: "游戏准备",
    phases: "回合流程",
    categories: "规则分类",
    ranking: "排名速查",
    faq: "常见问题",
    reference: "快速查表",
    prose: "规则说明",
    facts: "快速开始",
    decision: "决策助手",
    missing: "找不到这一段规则。",
    invalidLink: "这个链接指向的规则条目已不存在。",
    markStep: "标记为已完成",
    completed: "已完成",
    allStepsComplete: "全部步骤完成，可以继续往下玩了。",
  },
} as const;

function getLang(locale: string): Lang {
  return locale === "zh" ? "zh" : "en";
}

function updateHash(id: string) {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", `#${id}`);
}

function readHashItem(moduleId: string, itemIds: string[]) {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.slice(1);
  const prefix = `guide-${moduleId}--`;
  const itemId = hash.startsWith(prefix) ? hash.slice(prefix.length) : "";
  return itemIds.includes(itemId) ? itemId : null;
}

function findHashItem(moduleId: string, itemIds: string[], fallback: string | null) {
  return readHashItem(moduleId, itemIds) ?? fallback;
}

function isKnownGuideHash(hash: string, guide: RulesGuideConfig, flow: FlowData | null) {
  if (!hash.startsWith("guide-")) return true;
  const raw = hash.slice("guide-".length);
  const separator = raw.indexOf("--");
  const moduleId = separator >= 0 ? raw.slice(0, separator) : raw;
  const itemId = separator >= 0 ? raw.slice(separator + 2) : null;
  const module = guide.modules.find((candidate) => candidate.id === moduleId);
  if (!module) return false;
  if (!itemId) return true;
  if (module.type === "decision") return Boolean(flow?.nodes[itemId]);
  if (module.type === "facts") return module.sectionIds.includes(itemId);
  if (module.type === "phases" || module.type === "steps" || module.type === "categories" || module.type === "ranking" || module.type === "faq") return module.itemSectionIds.includes(itemId);
  if (module.type === "reference" || module.type === "prose") return module.sectionIds?.includes(itemId) ?? module.groups?.some((group) => group.sectionIds.includes(itemId)) ?? false;
  return false;
}

function SectionBody({
  section,
  lang,
  collapsible = true,
}: {
  section: ParsedRuleSection;
  lang: Lang;
  collapsible?: boolean;
}) {
  const t = labels[lang];
  return (
    <>
      {section.summaryMd ? <MarkdownRenderer content={section.summaryMd} /> : null}
      {section.detailMd && collapsible ? (
        <details className="mt-3 rounded-xl border border-border bg-surface/70 px-4 py-3">
          <summary className="cursor-pointer select-none text-sm font-semibold text-primary-dark">
            <span className="ml-1">{t.details}</span>
          </summary>
          <div className="pt-3">
            <MarkdownRenderer content={section.detailMd} />
          </div>
        </details>
      ) : section.detailMd ? (
        <MarkdownRenderer content={section.detailMd} />
      ) : null}
    </>
  );
}

function SectionHeader({ section, level = 3 }: { section: ParsedRuleSection; level?: 2 | 3 }) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag id={`rule-section-${section.id}`} className="scroll-mt-24 font-heading font-bold tracking-tight text-primary-dark">
      {section.heading}
    </Tag>
  );
}

function MissingState({ lang }: { lang: Lang }) {
  return <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-primary-dark">{labels[lang].missing}</p>;
}

function ModuleTitle({
  module,
  intro,
  lang,
}: {
  module: RulesGuideModule;
  intro?: ParsedRuleSection;
  lang: Lang;
}) {
  const fallback = labels[lang][module.type as keyof typeof labels[Lang]] ?? labels[lang].reference;
  return (
    <div className="mb-4">
      <h2 id={`guide-heading-${module.id}`} className="font-heading text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">
        {intro?.heading ?? fallback}
      </h2>
      {intro ? <SectionBody section={intro} lang={lang} /> : null}
    </div>
  );
}

function TabbedSectionModule({ module, sections, lang }: { module: TabbedModule; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  const t = labels[lang];
  const contentModule = module.type === "reference" || module.type === "prose"
    ? module as Extract<RulesGuideModule, { type: "reference" | "prose" }>
    : null;
  const groups = useMemo(() => contentModule?.groups ?? [], [contentModule]);
  const allItemIds = useMemo(
    () => contentModule ? (contentModule.sectionIds ?? groups.flatMap((group) => group.sectionIds)) : (module as RulesGuideCollectionModule).itemSectionIds,
    [contentModule, groups, module],
  );
  const defaultItemId = contentModule ? groups[0]?.defaultItemId : (module as RulesGuideCollectionModule).defaultItemId;
  const [activeId, setActiveId] = useState(() => findHashItem(module.id, allItemIds, defaultItemId ?? allItemIds[0] ?? null));
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeGroup = groups.find((group) => group.sectionIds.includes(activeId ?? ""));
  const itemIds = activeGroup?.sectionIds ?? allItemIds;
  const items = itemIds.map((id) => sections.get(id)).filter((section): section is ParsedRuleSection => Boolean(section));
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const active = items[activeIndex];
  const intro = "introSectionId" in module && module.introSectionId ? sections.get(module.introSectionId) : undefined;
  const collapsible = module.type !== "reference" && module.type !== "prose";
  const singleItem = !groups.length && items.length === 1;

  useEffect(() => {
    const onHashChange = () => {
      const next = readHashItem(module.id, allItemIds);
      if (!next) return;
      setActiveId(next);
      window.requestAnimationFrame(() => document.getElementById(`guide-${module.id}--${next}`)?.scrollIntoView({ block: "start", behavior: "smooth" }));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [allItemIds, module.id]);

  const select = useCallback((id: string, focus = false) => {
    setActiveId(id);
    updateHash(`guide-${module.id}--${id}`);
    if (focus) {
      window.requestAnimationFrame(() => tabRefs.current[id]?.focus());
    }
  }, [module.id]);
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = Math.min(items.length - 1, activeIndex + 1);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = Math.max(0, activeIndex - 1);
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex !== activeIndex) {
      event.preventDefault();
      select(items[nextIndex].id, true);
    }
  };

  const markComplete = (id: string) => setCompletedIds((current) => new Set(current).add(id));
  const selectNextStep = () => {
    markComplete(active.id);
    select(items[activeIndex + 1].id);
  };

  if (!active) return <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24"><ModuleTitle module={module} intro={intro} lang={lang} /><MissingState lang={lang} /></section>;
  return (
    <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24">
      <ModuleTitle module={module} intro={intro} lang={lang} />
      {groups.length > 1 ? (
        <div className="mb-3 flex gap-1.5 overflow-x-auto border-b border-border pb-2 print:hidden" aria-label={t.referenceGroups}>
          {groups.map((group) => {
            const isActive = group.id === activeGroup?.id;
            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => select(group.defaultItemId ?? group.sectionIds[0])}
                className={`min-h-11 shrink-0 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${isActive ? "bg-amber-50 text-primary-dark" : "text-stone-700 hover:bg-stone-50"}`}
              >
                {group.label[lang] ?? group.label.en}
              </button>
            );
          })}
        </div>
      ) : null}
      {singleItem ? (
        <article className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7">
          <SectionHeader section={active} />
          <div className="mt-3"><SectionBody section={active} lang={lang} collapsible={collapsible} /></div>
        </article>
      ) : (
        <>
          <div role="tablist" aria-label={activeGroup?.label[lang] ?? intro?.heading ?? t.reference} className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-white p-2 print:hidden">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`guide-item-${item.id}`}
                aria-selected={item.id === active.id}
                aria-current={item.id === active.id ? "step" : undefined}
                aria-controls={`guide-${module.id}--${item.id}`}
                tabIndex={item.id === active.id ? 0 : -1}
                ref={(element) => { tabRefs.current[item.id] = element; }}
                onClick={() => select(item.id)}
                onKeyDown={onKeyDown}
                className={`flex min-h-11 shrink-0 max-w-[18rem] cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${item.id === active.id ? "bg-amber-50 font-semibold text-primary-dark" : "text-stone-700 hover:bg-stone-50"}`}
              >
                <span className="font-mono text-[10px] font-bold text-accent-dark">{String(index + 1).padStart(2, "0")}</span>
                <span className="truncate">{item.heading}</span>
                {completedIds.has(item.id) ? <span aria-hidden="true" className="text-xs font-bold text-accent-dark">✓</span> : null}
              </button>
            ))}
          </div>
          <div id={`guide-${module.id}--${active.id}`} role="tabpanel" aria-labelledby={`guide-item-${active.id}`} tabIndex={-1} className="mt-4 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7 print:hidden">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-accent-dark">{activeIndex + 1} / {items.length}</p>
                <h3 id={`rule-section-${active.id}`} className="font-heading text-xl font-bold text-primary-dark sm:text-2xl">{active.heading}</h3>
              </div>
              <span className="sr-only" aria-live="polite">{active.heading}</span>
            </div>
            <SectionBody section={active} lang={lang} collapsible={collapsible} />
            {module.type === "steps" ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-primary-dark"><input type="checkbox" checked={completedIds.has(active.id)} onChange={(event) => { if (event.target.checked) markComplete(active.id); else setCompletedIds((current) => { const next = new Set(current); next.delete(active.id); return next; }); }} className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40" />{completedIds.has(active.id) ? t.completed : t.markStep}</label>
                <button type="button" disabled={activeIndex === 0} onClick={() => select(items[activeIndex - 1].id)} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.previousStep}</button>
                <button type="button" disabled={activeIndex === items.length - 1} onClick={selectNextStep} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-accent-dark transition-colors hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.nextStep}</button>
                {activeIndex === items.length - 1 && completedIds.has(active.id) ? <p role="status" className="basis-full text-sm font-medium text-accent-dark">{t.allStepsComplete}</p> : null}
              </div>
            ) : null}
          </div>
        </>
      )}
      <div className="hidden space-y-6 print:block">
        {(groups.length ? groups.flatMap((group) => group.sectionIds) : allItemIds).map((id) => {
          const item = sections.get(id);
          if (!item) return null;
          return <article key={item.id} className="break-inside-avoid rounded-2xl border border-border bg-white p-5 sm:p-7"><h3 className="font-heading text-xl font-bold text-primary-dark sm:text-2xl">{item.heading}</h3><div className="mt-3"><SectionBody section={item} lang={lang} collapsible={false} /></div></article>;
        })}
      </div>
    </section>
  );
}

function PhaseModule({ module, sections, lang }: { module: RulesGuideCollectionModule; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  const t = labels[lang];
  const items = module.itemSectionIds.map((id) => sections.get(id)).filter((section): section is ParsedRuleSection => Boolean(section));
  const [activeId, setActiveId] = useState(() => findHashItem(module.id, module.itemSectionIds, module.defaultItemId ?? items[0]?.id ?? null));
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const active = items[activeIndex];
  const intro = module.introSectionId ? sections.get(module.introSectionId) : undefined;

  useEffect(() => {
    const onHashChange = () => {
      const next = readHashItem(module.id, module.itemSectionIds);
      if (!next) return;
      setActiveId(next);
      window.requestAnimationFrame(() => document.getElementById(`guide-${module.id}--${next}`)?.scrollIntoView({ block: "start", behavior: "smooth" }));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [module.id, module.itemSectionIds]);

  const select = useCallback((id: string, focus = false) => {
    setActiveId(id);
    updateHash(`guide-${module.id}--${id}`);
    if (focus) {
      window.requestAnimationFrame(() => tabRefs.current[id]?.focus());
    }
  }, [module.id]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = Math.min(items.length - 1, activeIndex + 1);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = Math.max(0, activeIndex - 1);
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex !== activeIndex) {
      event.preventDefault();
      select(items[nextIndex].id, true);
    }
  };

  if (!active) return <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24"><ModuleTitle module={module} intro={intro} lang={lang} /><MissingState lang={lang} /></section>;
  return (
    <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24">
      <ModuleTitle module={module} intro={intro} lang={lang} />
      <div className="grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-start">
        <div role="tablist" aria-label={intro?.heading ?? t.phases} className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-white p-2 lg:sticky lg:top-24 lg:block print:hidden">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`guide-item-${item.id}`}
              aria-selected={item.id === active.id}
              aria-current={item.id === active.id ? "step" : undefined}
              aria-controls={`guide-${module.id}--${item.id}`}
              tabIndex={item.id === active.id ? 0 : -1}
              ref={(element) => { tabRefs.current[item.id] = element; }}
              onClick={() => select(item.id)}
              onKeyDown={onKeyDown}
              className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 lg:w-full ${item.id === active.id ? "bg-amber-50 font-semibold text-primary-dark" : "text-stone-700 hover:bg-stone-50"}`}
            >
              <span className="font-mono text-[10px] font-bold text-accent">{String(index + 1).padStart(2, "0")}</span>
              <span className="truncate">{item.heading}</span>
            </button>
          ))}
        </div>
        <div id={`guide-${module.id}--${active.id}`} role="tabpanel" aria-labelledby={`guide-item-${active.id}`} tabIndex={-1} className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7 print:hidden">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-accent-dark">{activeIndex + 1} / {items.length}</p>
              <h3 id={`rule-section-${active.id}`} className="font-heading text-xl font-bold text-primary-dark sm:text-2xl">{active.heading}</h3>
            </div>
            <span className="sr-only" aria-live="polite">{active.heading}</span>
          </div>
          <SectionBody section={active} lang={lang} collapsible />
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button type="button" disabled={activeIndex === 0} onClick={() => select(items[activeIndex - 1].id)} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.previous}</button>
            <button type="button" disabled={activeIndex === items.length - 1} onClick={() => select(items[activeIndex + 1].id)} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-accent-dark transition-colors hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.next}</button>
          </div>
        </div>
      </div>
      <div className="hidden space-y-6 print:block">
        {items.map((item) => (
          <article key={item.id} className="break-inside-avoid rounded-2xl border border-border bg-white p-5 sm:p-7">
            <h3 className="font-heading text-xl font-bold text-primary-dark sm:text-2xl">{item.heading}</h3>
            <div className="mt-3"><SectionBody section={item} lang={lang} collapsible={false} /></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FactsModule({ module, sections, lang }: { module: Extract<RulesGuideModule, { type: "facts" }>; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  const items = module.sectionIds.map((id) => sections.get(id)).filter((section): section is ParsedRuleSection => Boolean(section));
  return (
    <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24">
      <ModuleTitle module={module} lang={lang} />
      {items.length === 0 ? <MissingState lang={lang} /> : <div className="grid gap-3 sm:grid-cols-2">{items.map((section) => <article key={section.id} className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6"><SectionHeader section={section} /><div className="mt-3"><SectionBody section={section} lang={lang} collapsible={false} /></div></article>)}</div>}
    </section>
  );
}

function DecisionModule({ module, sections, flow, lang }: { module: Extract<RulesGuideModule, { type: "decision" }>; sections: Map<string, ParsedRuleSection>; flow: FlowData | null; lang: Lang }) {
  const t = labels[lang];
  const intro = module.introSectionId ? sections.get(module.introSectionId) : undefined;
  const start = module.startNode ?? flow?.startNode ?? "";
  const [currentId, setCurrentId] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      const prefix = `guide-${module.id}--`;
      const hashNode = hash.startsWith(prefix) ? hash.slice(prefix.length) : "";
      if (hashNode && flow?.nodes[hashNode]) return hashNode;
    }
    return start;
  });
  const [history, setHistory] = useState<string[]>([]);
  const node = flow?.nodes[currentId];
  if (!flow || !node) return <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24"><ModuleTitle module={module} intro={intro} lang={lang} /><MissingState lang={lang} /></section>;

  const navigate = (next: string) => {
    setHistory((previous) => [...previous, currentId]);
    setCurrentId(next);
    updateHash(`guide-${module.id}--${next}`);
  };

  return (
    <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24">
      <ModuleTitle module={module} intro={intro} lang={lang} />
      <div className="rounded-2xl border border-border bg-white shadow-card">
        <div className="border-b border-border px-5 py-4 sm:px-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-dark">{t.decision}</p>
          <h3 className="mt-1 font-heading text-2xl font-bold text-primary-dark">{node.title[lang] ?? node.title.en}</h3>
        </div>
        <div className="px-5 py-5 sm:px-7"><MarkdownRenderer content={node.content[lang] ?? node.content.en} />{node.illustration ? <RuleIllustration src={node.illustration.src} alt={node.illustration.alt[lang] ?? node.illustration.alt.en} /> : null}</div>
        {node.options.length > 0 ? <div className="border-t border-border bg-stone-50/60 px-5 py-4 sm:px-7 print:hidden"><div className="grid gap-2 sm:grid-cols-2">{node.options.map((option) => <button key={option.next} type="button" onClick={() => navigate(option.next)} className="min-h-11 rounded-xl border border-border bg-white px-4 py-3 text-left text-sm font-medium text-primary-dark shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/40">{option.label[lang] ?? option.label.en}</button>)}</div></div> : null}
        <div className="flex items-center gap-2 border-t border-border px-5 py-3 sm:px-7 print:hidden">
          {history.length > 0 ? <button type="button" onClick={() => { const previous = history[history.length - 1]; setHistory((items) => items.slice(0, -1)); setCurrentId(previous); updateHash(`guide-${module.id}--${previous}`); }} className="min-h-11 rounded-lg bg-stone-100 px-3 py-2 text-sm font-medium text-stone-600 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.back}</button> : null}
          <button type="button" onClick={() => { setHistory([]); setCurrentId(start); updateHash(`guide-${module.id}--${start}`); }} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.startOver}</button>
        </div>
      </div>
    </section>
  );
}

type ViewMode = "guide" | "full";

function moduleTitleFor(module: RulesGuideModule, sections: Map<string, ParsedRuleSection>, lang: Lang) {
  const t = labels[lang];
  if ("introSectionId" in module && module.introSectionId) return sections.get(module.introSectionId)?.heading ?? t.reference;
  if (module.type === "facts") return t.facts;
  return t[module.type as keyof typeof t] ?? t.reference;
}

function GuideModeSwitch({ mode, onChange, lang }: { mode: ViewMode; onChange: (next: ViewMode) => void; lang: Lang }) {
  const t = labels[lang];
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 print:hidden">
      <div className="flex rounded-xl border border-border bg-white p-1" role="group" aria-label={lang === "zh" ? "规则阅读模式" : "Rules reading mode"}>
        {(["guide", "full"] as const).map((item) => {
          const active = mode === item;
          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(item)}
              className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${active ? "bg-amber-50 text-primary-dark" : "text-stone-700 hover:bg-stone-50"}`}
            >
              {item === "guide" ? t.guideMode : t.fullMode}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-stone-600">{mode === "guide" ? (lang === "zh" ? "按步骤学习，也可直接跳到任意模块。" : "Learn step by step or jump to any module.") : (lang === "zh" ? "按标题连续阅读完整规则。" : "Read the complete rules continuously.")}</p>
    </div>
  );
}

function FullRulesModule({ rulesMd, lang, onBack }: { rulesMd: string; lang: Lang; onBack: () => void }) {
  const t = labels[lang];
  const content = useMemo(() => stripRuleGuideMarkers(rulesMd), [rulesMd]);
  return (
    <section id="rules-full" aria-labelledby="rules-full-heading" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="rules-full-heading" className="font-heading text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">{t.fullMode}</h2>
        <button type="button" onClick={onBack} className="min-h-11 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-primary-dark transition-colors hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.returnToGuide}</button>
      </div>
      <article className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8">
        <MarkdownRenderer content={content} />
      </article>
    </section>
  );
}

function MobileJumpNav({ modules, sections, lang }: { modules: RulesGuideModule[]; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  const t = labels[lang];
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-6 lg:hidden print:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-guide-contents"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-border bg-white px-4 py-2 text-left text-sm font-semibold text-primary-dark shadow-card focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        <span>{open ? t.contentsCollapse : t.contentsExpand}</span>
      </button>
      {open ? (
        <nav id="mobile-guide-contents" aria-label={t.contents} className="mt-2 rounded-xl border border-border bg-white p-2 shadow-card">
          <ul className="grid gap-1 sm:grid-cols-2">
            {modules.map((module) => (
              <li key={module.id}>
                <a href={`#guide-${module.id}`} onClick={() => setOpen(false)} className="block min-h-11 rounded-lg px-3 py-2 text-sm text-primary-dark transition-colors hover:bg-amber-50 hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/40">
                  {moduleTitleFor(module, sections, lang)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

function JumpNav({ modules, sections, lang }: { modules: RulesGuideModule[]; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  const t = labels[lang];
  const [activeId, setActiveId] = useState(modules[0]?.id ?? "");

  useEffect(() => {
    const targets = modules.map((module) => document.getElementById(`guide-${module.id}`)).filter((element): element is HTMLElement => Boolean(element));
    if (targets.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveId(visible.target.id.replace(/^guide-/, ""));
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.6] });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [modules]);

  return (
    <aside className="hidden lg:block">
      <nav aria-label={t.contents} className="sticky top-24 rounded-2xl border border-border bg-white/85 p-3 shadow-card backdrop-blur-sm print:hidden">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-stone-400">{t.contents}</p>
        <ul className="space-y-1">{modules.map((module) => { const active = module.id === activeId; return <li key={module.id}><a href={`#guide-${module.id}`} aria-current={active ? "location" : undefined} className={`block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-amber-50 hover:text-primary-dark ${active ? "bg-amber-50 font-semibold text-primary-dark" : "text-primary-dark"}`}>{moduleTitleFor(module, sections, lang)}</a></li>; })}</ul>
      </nav>
    </aside>
  );
}

function renderModule(module: RulesGuideModule, sections: Map<string, ParsedRuleSection>, flow: FlowData | null, lang: Lang) {
  if (module.type === "facts") return <FactsModule key={module.id} module={module} sections={sections} lang={lang} />;
  if (module.type === "decision") return <DecisionModule key={module.id} module={module} sections={sections} flow={flow} lang={lang} />;
  if (module.type === "phases") return <PhaseModule key={module.id} module={module} sections={sections} lang={lang} />;
  return <TabbedSectionModule key={module.id} module={module as TabbedModule} sections={sections} lang={lang} />;
}

export function RulesGuideExperience({ locale, rulesMd, sections: sectionList, guide, flow }: Props) {
  const lang = getLang(locale);
  const sections = useMemo(() => new Map(sectionList.map((section) => [section.id, section])), [sectionList]);
  const [viewMode, setViewMode] = useState<ViewMode>(() => (typeof window !== "undefined" && window.location.hash === "#rules-full" ? "full" : "guide"));
  const [hashNotice, setHashNotice] = useState(false);
  const changeViewMode = useCallback((next: ViewMode) => {
    setViewMode(next);
    setHashNotice(false);
    updateHash(next === "full" ? "rules-full" : `guide-${guide.modules[0]?.id ?? "quick-start"}`);
  }, [guide.modules]);

  useEffect(() => {
    const inspectHash = () => {
      const hash = window.location.hash.slice(1);
      setViewMode(hash === "rules-full" ? "full" : "guide");
      setHashNotice(hash.startsWith("guide-") && !isKnownGuideHash(hash, guide, flow));
    };
    inspectHash();
    const onHashChange = () => inspectHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [flow, guide]);

  return (
    <>
      <GuideModeSwitch mode={viewMode} onChange={changeViewMode} lang={lang} />
      {hashNotice ? <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-primary-dark"><span>{labels[lang].invalidLink}</span><button type="button" onClick={() => changeViewMode("guide")} className="min-h-11 rounded-lg border border-amber-300 bg-white px-3 py-2 font-semibold text-primary-dark hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-accent/40">{labels[lang].returnToGuide}</button></div> : null}
      {viewMode === "full" ? <FullRulesModule rulesMd={rulesMd} lang={lang} onBack={() => changeViewMode("guide")} /> : (
        <>
          <MobileJumpNav modules={guide.modules} sections={sections} lang={lang} />
          <div className="rules-guide-experience lg:grid lg:grid-cols-[minmax(0,48rem)_14rem] lg:justify-center lg:gap-10">
            <main className="min-w-0 space-y-10">{guide.modules.map((module) => renderModule(module, sections, flow, lang))}</main>
            <JumpNav modules={guide.modules} sections={sections} lang={lang} />
          </div>
        </>
      )}
      <noscript>
        <div className="mt-10 rounded-xl border border-border bg-white p-6 sm:p-8">
          <MarkdownRenderer content={rulesMd} />
        </div>
      </noscript>
    </>
  );
}
