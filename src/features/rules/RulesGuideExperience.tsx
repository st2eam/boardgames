"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import type {
  FlowData,
  ParsedRuleSection,
  RulesGuideCollectionModule,
  RulesGuideConfig,
  RulesGuideModule,
} from "@/types/game";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { RuleIllustration } from "./RuleIllustration";

interface Props {
  locale: string;
  rulesMd: string;
  sections: ParsedRuleSection[];
  guide: RulesGuideConfig;
  flow: FlowData | null;
}

type Lang = "en" | "zh";
type GuideCardModule = RulesGuideCollectionModule & { type: "categories" | "ranking" | "faq" };

const labels = {
  en: {
    details: "Show details",
    hideDetails: "Hide details",
    previous: "Previous",
    next: "Next",
    back: "Back",
    startOver: "Start over",
    contents: "On this page",
    chooseNext: "Choose a path",
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
  },
  zh: {
    details: "查看详细规则",
    hideDetails: "收起详细规则",
    previous: "上一阶段",
    next: "下一阶段",
    back: "返回上一步",
    startOver: "重新开始",
    contents: "本页内容",
    chooseNext: "选择下一步",
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
  },
} as const;

function getLang(locale: string): Lang {
  return locale === "zh" ? "zh" : "en";
}

function updateHash(id: string) {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", `#${id}`);
}

function findHashItem(moduleId: string, itemIds: string[], fallback: string | null) {
  if (typeof window === "undefined") return fallback;
  const hash = window.location.hash.slice(1);
  const prefix = `guide-${moduleId}--`;
  const itemId = hash.startsWith(prefix) ? hash.slice(prefix.length) : hash;
  return itemIds.includes(itemId) ? itemId : fallback;
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

function CollectionItem({
  section,
  lang,
  open,
  onClick,
  index,
  compact = false,
}: {
  section: ParsedRuleSection;
  lang: Lang;
  open: boolean;
  onClick: () => void;
  index: number;
  compact?: boolean;
}) {
  return (
    <article
      id={`guide-item-${section.id}`}
      className={`rounded-2xl border bg-white transition-colors ${open ? "border-accent/70 ring-1 ring-accent/20" : "border-border"}`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`guide-detail-${section.id}`}
        onClick={onClick}
        className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-accent/40 sm:px-5"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-white">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-base font-bold text-primary-dark sm:text-lg">{section.heading}</span>
          {compact && section.summaryMd ? (
            <span className="mt-0.5 block text-sm text-stone-600">{section.summaryMd.replace(/[#*_`]/g, "").split("\n")[0]}</span>
          ) : null}
        </span>
        <span aria-hidden="true" className={`text-xl text-accent transition-transform motion-reduce:transition-none ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      <div
        id={`guide-detail-${section.id}`}
        aria-hidden={!open}
        className={`${open ? "block" : "hidden"} border-t border-border px-4 py-4 sm:px-5 print:block`}
      >
        <SectionBody section={section} lang={lang} />
      </div>
    </article>
  );
}

function StepsModule({ module, sections, lang }: { module: RulesGuideCollectionModule; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  const items = module.itemSectionIds.map((id) => sections.get(id)).filter((section): section is ParsedRuleSection => Boolean(section));
  const [openId, setOpenId] = useState(() => findHashItem(module.id, module.itemSectionIds, module.defaultItemId ?? items[0]?.id ?? null));
  const intro = module.introSectionId ? sections.get(module.introSectionId) : undefined;
  return (
    <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24">
      <ModuleTitle module={module} intro={intro} lang={lang} />
      <div className="grid gap-2">
        {items.map((section, index) => (
          <CollectionItem
            key={section.id}
            section={section}
            lang={lang}
            index={index}
            open={openId === section.id}
            onClick={() => {
              const next = openId === section.id ? null : section.id;
              setOpenId(next);
              if (next) updateHash(`guide-${module.id}--${next}`);
            }}
            compact
          />
        ))}
      </div>
    </section>
  );
}

function PhaseModule({ module, sections, lang }: { module: RulesGuideCollectionModule; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  const t = labels[lang];
  const items = module.itemSectionIds.map((id) => sections.get(id)).filter((section): section is ParsedRuleSection => Boolean(section));
  const [activeId, setActiveId] = useState(() => findHashItem(module.id, module.itemSectionIds, module.defaultItemId ?? items[0]?.id ?? null));
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const active = items[activeIndex];
  const intro = module.introSectionId ? sections.get(module.introSectionId) : undefined;

  const select = useCallback((id: string) => {
    setActiveId(id);
    updateHash(`guide-${module.id}--${id}`);
  }, [module.id]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = Math.min(items.length - 1, activeIndex + 1);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = Math.max(0, activeIndex - 1);
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex !== activeIndex) {
      event.preventDefault();
      select(items[nextIndex].id);
    }
  };

  if (!active) return null;
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
              aria-controls={`guide-panel-${item.id}`}
              tabIndex={item.id === active.id ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={onKeyDown}
              className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 lg:w-full ${item.id === active.id ? "bg-amber-50 font-semibold text-primary" : "text-stone-600 hover:bg-stone-50"}`}
            >
              <span className="font-mono text-[10px] font-bold text-accent">{String(index + 1).padStart(2, "0")}</span>
              <span className="truncate">{item.heading}</span>
            </button>
          ))}
        </div>
        <div id={`guide-panel-${active.id}`} role="tabpanel" aria-labelledby={`guide-item-${active.id}`} tabIndex={-1} className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7 print:hidden">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-accent">{activeIndex + 1} / {items.length}</p>
              <h3 id={`rule-section-${active.id}`} className="font-heading text-xl font-bold text-primary-dark sm:text-2xl">{active.heading}</h3>
            </div>
            <span className="sr-only" aria-live="polite">{active.heading}</span>
          </div>
          <SectionBody section={active} lang={lang} collapsible />
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button type="button" disabled={activeIndex === 0} onClick={() => select(items[activeIndex - 1].id)} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.previous}</button>
            <button type="button" disabled={activeIndex === items.length - 1} onClick={() => select(items[activeIndex + 1].id)} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.next}</button>
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

function CollectionModule({ module, sections, lang }: { module: GuideCardModule; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  const items = module.itemSectionIds.map((id) => sections.get(id)).filter((section): section is ParsedRuleSection => Boolean(section));
  const intro = module.introSectionId ? sections.get(module.introSectionId) : undefined;
  const [openIds, setOpenIds] = useState<string[]>(() => {
    const initial = findHashItem(module.id, module.itemSectionIds, module.defaultItemId ?? null);
    return initial ? [initial] : [];
  });
  const allowMultiple = module.type === "faq";
  return (
    <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24">
      <ModuleTitle module={module} intro={intro} lang={lang} />
      <div className={module.type === "categories" ? "grid gap-3 sm:grid-cols-2" : "grid gap-2"}>
        {items.map((section, index) => (
          <CollectionItem
            key={section.id}
            section={section}
            lang={lang}
            index={index}
            open={openIds.includes(section.id)}
            onClick={() => {
              const isOpen = openIds.includes(section.id);
              const next = isOpen ? null : section.id;
              setOpenIds((current) => {
                if (allowMultiple) {
                  return isOpen ? current.filter((id) => id !== section.id) : [...current, section.id];
                }
                return next ? [next] : [];
              });
              if (next) updateHash(`guide-${module.id}--${next}`);
            }}
            compact
          />
        ))}
      </div>
    </section>
  );
}

function FactsModule({ module, sections, lang }: { module: Extract<RulesGuideModule, { type: "facts" }>; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  return (
    <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24">
      <ModuleTitle module={module} lang={lang} />
      <div className="grid gap-3 sm:grid-cols-2">
        {module.sectionIds.map((id) => {
          const section = sections.get(id);
          if (!section) return null;
          return <article key={id} className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6"><SectionHeader section={section} /><div className="mt-3"><SectionBody section={section} lang={lang} collapsible={false} /></div></article>;
        })}
      </div>
    </section>
  );
}

function ContentModule({ module, sections, lang }: { module: Extract<RulesGuideModule, { type: "reference" | "prose" }>; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  return (
    <section id={`guide-${module.id}`} aria-labelledby={`guide-heading-${module.id}`} className="scroll-mt-24">
      <ModuleTitle module={module} lang={lang} />
      <div className="grid gap-4">
        {module.sectionIds.map((id) => {
          const section = sections.get(id);
          if (!section) return null;
          return <article key={id} className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7"><SectionHeader section={section} /><div className="mt-3"><SectionBody section={section} lang={lang} collapsible={module.type !== "reference"} /></div></article>;
        })}
      </div>
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
  if (!flow || !node) return null;

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
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t.decision}</p>
          <h3 className="mt-1 font-heading text-2xl font-bold text-primary-dark">{node.title[lang] ?? node.title.en}</h3>
        </div>
        <div className="px-5 py-5 sm:px-7"><MarkdownRenderer content={node.content[lang] ?? node.content.en} />{node.illustration ? <RuleIllustration src={node.illustration.src} alt={node.illustration.alt[lang] ?? node.illustration.alt.en} /> : null}</div>
        {node.options.length > 0 ? <div className="border-t border-border bg-stone-50/60 px-5 py-4 sm:px-7 print:hidden"><div className="grid gap-2 sm:grid-cols-2">{node.options.map((option) => <button key={option.next} type="button" onClick={() => navigate(option.next)} className="min-h-11 rounded-xl border border-border bg-white px-4 py-3 text-left text-sm font-medium text-stone-700 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-accent/40">{option.label[lang] ?? option.label.en}</button>)}</div></div> : null}
        <div className="flex items-center gap-2 border-t border-border px-5 py-3 sm:px-7 print:hidden">
          {history.length > 0 ? <button type="button" onClick={() => { const previous = history[history.length - 1]; setHistory((items) => items.slice(0, -1)); setCurrentId(previous); updateHash(`guide-${module.id}--${previous}`); }} className="min-h-11 rounded-lg bg-stone-100 px-3 py-2 text-sm font-medium text-stone-600 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.back}</button> : null}
          <button type="button" onClick={() => { setHistory([]); setCurrentId(start); updateHash(`guide-${module.id}--${start}`); }} className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-accent/40">{t.startOver}</button>
        </div>
      </div>
    </section>
  );
}

function JumpNav({ modules, sections, lang }: { modules: RulesGuideModule[]; sections: Map<string, ParsedRuleSection>; lang: Lang }) {
  const t = labels[lang];
  const titleFor = (module: RulesGuideModule) => {
    if ("introSectionId" in module && module.introSectionId) return sections.get(module.introSectionId)?.heading;
    if (module.type === "facts") return t.facts;
    return t[module.type as keyof typeof t] ?? t.reference;
  };
  return (
    <aside className="hidden lg:block">
      <nav aria-label={t.contents} className="sticky top-24 rounded-2xl border border-border bg-white/85 p-3 shadow-card backdrop-blur-sm print:hidden">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-stone-400">{t.contents}</p>
        <ul className="space-y-1">{modules.map((module) => <li key={module.id}><a href={`#guide-${module.id}`} className="block rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-amber-50 hover:text-primary">{titleFor(module)}</a></li>)}</ul>
      </nav>
    </aside>
  );
}

function renderModule(module: RulesGuideModule, sections: Map<string, ParsedRuleSection>, flow: FlowData | null, lang: Lang) {
  if (module.type === "facts") return <FactsModule key={module.id} module={module} sections={sections} lang={lang} />;
  if (module.type === "reference" || module.type === "prose") return <ContentModule key={module.id} module={module} sections={sections} lang={lang} />;
  if (module.type === "decision") return <DecisionModule key={module.id} module={module} sections={sections} flow={flow} lang={lang} />;
  if (module.type === "steps") return <StepsModule key={module.id} module={module} sections={sections} lang={lang} />;
  if (module.type === "phases") return <PhaseModule key={module.id} module={module} sections={sections} lang={lang} />;
  return <CollectionModule key={module.id} module={module as GuideCardModule} sections={sections} lang={lang} />;
}

export function RulesGuideExperience({ locale, rulesMd, sections: sectionList, guide, flow }: Props) {
  const lang = getLang(locale);
  const sections = useMemo(() => new Map(sectionList.map((section) => [section.id, section])), [sectionList]);
  return (
    <>
      <div className="rules-guide-experience lg:grid lg:grid-cols-[minmax(0,48rem)_14rem] lg:justify-center lg:gap-10">
        <main className="min-w-0 space-y-10">{guide.modules.map((module) => renderModule(module, sections, flow, lang))}</main>
        <JumpNav modules={guide.modules} sections={sections} lang={lang} />
      </div>
      <noscript>
        <div className="mt-10 rounded-xl border border-border bg-white p-6 sm:p-8">
          <MarkdownRenderer content={rulesMd} />
        </div>
      </noscript>
    </>
  );
}
