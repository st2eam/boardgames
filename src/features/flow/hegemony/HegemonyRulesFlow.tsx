"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MarkdownRenderer } from "@/features/rules/MarkdownRenderer";
import { RuleIllustration } from "@/features/rules/RuleIllustration";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import type { FlowData } from "@/types/game";
import { parseRuleSections, type RuleSection } from "@/features/flow/ruleSections";

interface Props {
  locale: string;
  rulesMd: string;
  flowData: FlowData;
}

type Lang = "en" | "zh";

/**
 * Fully integrated interactive rules for "Hegemony: Lead Your Class to Victory".
 *
 * The complete rules.md is the single content source. It is split into sections
 * that back each `flow.json` node, so every node card embeds the full rule text
 * for that topic (not a short summary). All cards are server-rendered; a
 * scroll-spy keeps the stage rail in sync and the flow options provide
 * decision-style jumps between topics. No separate full-rule block repeats the
 * tutorial.
 */

/** flow node id → rules.md section heading (keyed by locale). */
const NODE_HEADINGS: Record<string, Record<Lang, string>> = {
  setup: { en: "Setup", zh: "游戏准备" },
  round: { en: "The Round", zh: "每轮怎么走" },
  classes: { en: "The Four Classes", zh: "四个阶级" },
  actions: { en: "The Action Phase", zh: "行动阶段" },
  economy: { en: "The Shared Economy", zh: "共同区域" },
  policies: { en: "Elections and Policies", zh: "选举与政策" },
  production: { en: "The Production Phase", zh: "生产阶段" },
  election: { en: "How to Vote", zh: "怎么表决" },
  "policy-effects": { en: "The Seven Policies", zh: "七项政策" },
  "working-class": { en: "The Working Class", zh: "工人阶级" },
  "middle-class": { en: "The Middle Class", zh: "中产阶级" },
  "capitalist-class": { en: "The Capitalist Class", zh: "资本家阶级" },
  "state-class": { en: "The State", zh: "国家" },
  "loans-imf": { en: "Loans and the IMF", zh: "贷款与 IMF" },
  endgame: { en: "Game End and Victory", zh: "游戏结束" },
  "faq-reference": { en: "Official Rulings", zh: "官方裁定" },
};

/** Sections shown above the flow, as a quick look + objective. */
const INTRO_HEADINGS: Record<Lang, string[]> = {
  en: ["Overview", "Game Objective"],
  zh: ["概述", "游戏目标"],
};

/** Sections shown below the flow, for table-side lookup. */
const REFERENCE_HEADINGS: Record<Lang, string[]> = {
  en: [
    "Common Mistakes",
    "Companies and Components Quick Reference",
    "Number Tables",
  ],
  zh: ["容易踩坑", "公司与组件速查", "数字表"],
};

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "h-3 w-3"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
    </svg>
  );
}

function getNodeTitle(flowData: FlowData, nodeId: string, lang: Lang): string {
  const node = flowData.nodes[nodeId];
  if (!node) return nodeId;
  return node.title[lang] ?? node.title.en;
}

export function HegemonyRulesFlow({ locale, rulesMd, flowData }: Props) {
  const t = useTranslations("flow");
  const lang: Lang = locale === "zh" ? "zh" : "en";
  const reducedMotion = useReducedMotion();

  const sections = useMemo(() => parseRuleSections(rulesMd), [rulesMd]);

  const nodeIds = useMemo(() => Object.keys(flowData.nodes), [flowData.nodes]);

  /** A section plus the h3 subsections that follow it, until the next h2. */
  const sectionWithChildren = useCallback(
    (heading: string): RuleSection[] => {
      const idx = sections.findIndex((s) => s.heading === heading);
      if (idx < 0) return [];
      const out: RuleSection[] = [sections[idx]];
      for (let i = idx + 1; i < sections.length; i++) {
        if (sections[i].level === 2) break;
        out.push(sections[i]);
      }
      return out;
    },
    [sections]
  );

  /** Sections backing a flow node (its section plus following h3 subsections). */
  const sectionsForNode = useCallback(
    (nodeId: string): RuleSection[] => {
      const heading = NODE_HEADINGS[nodeId]?.[lang];
      if (!heading) return [];
      return sectionWithChildren(heading);
    },
    [sectionWithChildren, lang]
  );

  const intro = useMemo(
    () =>
      INTRO_HEADINGS[lang]
        .flatMap((h) => sectionWithChildren(h))
        .filter((s): s is RuleSection => Boolean(s)),
    [sectionWithChildren, lang]
  );

  const reference = useMemo(
    () =>
      REFERENCE_HEADINGS[lang]
        .flatMap((h) => sectionWithChildren(h))
        .filter((s): s is RuleSection => Boolean(s)),
    [sectionWithChildren, lang]
  );

  const [activeNode, setActiveNode] = useState(flowData.startNode);

  /* Scroll-spy: keep the stage rail in sync with the visible node card. */
  useEffect(() => {
    const els = nodeIds
      .map((id) => document.getElementById(`hegemony-node-${id}`))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0]?.target.id ?? "";
        if (id.startsWith("hegemony-node-")) {
          setActiveNode(id.slice("hegemony-node-".length));
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.3] }
    );

    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, [nodeIds]);

  const scrollToNode = useCallback(
    (nodeId: string) => {
      setActiveNode(nodeId);
      document
        .getElementById(`hegemony-node-${nodeId}`)
        ?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
    },
    [reducedMotion]
  );

  const nodeCount = nodeIds.length;

  return (
    <section aria-labelledby="hegemony-flow-heading">
      <h2 id="hegemony-flow-heading" className="sr-only">
        {lang === "zh" ? "交互式规则流程" : "Interactive rules flow"}
      </h2>

      {/* Quick look + objective */}
      {intro.length > 0 && (
        <div className="mb-8 grid max-w-3xl gap-4">
          {intro.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-7"
            >
              <MarkdownRenderer content={section.md} />
            </div>
          ))}
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[minmax(0,48rem)_14rem] lg:justify-center lg:gap-10">
        <div className="min-w-0">
          {/* Mobile / tablet stage rail */}
          <nav
            aria-label={t("outline")}
            className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-white px-3 py-2.5 shadow-card lg:hidden"
          >
            {nodeIds.map((id, i) => {
              const active = activeNode === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollToNode(id)}
                  aria-current={active ? "step" : undefined}
                  className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[13px] transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                    active
                      ? "border-transparent bg-primary text-white"
                      : "border-border bg-white text-stone-600 hover:text-stone-800"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      active ? "text-white/70" : "text-stone-400"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{getNodeTitle(flowData, id, lang)}</span>
                </button>
              );
            })}
          </nav>

          {/* Node cards: the complete rules, embedded per topic */}
          <div className="max-w-3xl space-y-6">
            {nodeIds.map((id, i) => {
              const node = flowData.nodes[id];
              if (!node) return null;
              const active = activeNode === id;
              const sections = sectionsForNode(id);
              const title = getNodeTitle(flowData, id, lang);
              return (
                <article
                  id={`hegemony-node-${id}`}
                  key={id}
                  aria-current={active ? "step" : undefined}
                  className={`scroll-mt-24 rounded-2xl border bg-white p-6 shadow-card transition-colors sm:p-8 ${
                    active ? "border-accent/70 ring-1 ring-accent/20" : "border-border"
                  }`}
                >
                  <header className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-mono text-xs font-bold text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
                        {lang === "zh"
                          ? `步骤 ${i + 1} / ${nodeCount}`
                          : `Step ${i + 1} of ${nodeCount}`}
                      </p>
                      <h3 className="font-heading text-xl font-bold tracking-tight text-primary-dark">
                        {title}
                      </h3>
                    </div>
                  </header>

                  {/* Flow node lead-in */}
                  <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                    <MarkdownRenderer
                      content={node.content[lang] ?? node.content.en}
                    />
                  </div>

                  {node.illustration ? (
                    <RuleIllustration
                      src={node.illustration.src}
                      alt={
                        node.illustration.alt[lang] ?? node.illustration.alt.en
                      }
                      className="mt-4"
                    />
                  ) : null}

                  {/* Full rule text for this topic */}
                  {sections.length > 0 ? (
                    <div className="mt-5 space-y-5">
                      {sections.map((section) => (
                        <MarkdownRenderer
                          key={section.id}
                          content={section.md}
                        />
                      ))}
                    </div>
                  ) : null}

                  {/* Decision-style related topics */}
                  {node.options.length > 0 && (
                    <div className="mt-6 border-t border-border pt-4">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                        {t("chooseNext")}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {node.options.map((opt) => {
                          const targetTitle =
                            opt.label[lang] ?? opt.label.en;
                          return (
                            <button
                              key={opt.next}
                              onClick={() => scrollToNode(opt.next)}
                              className="group flex w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-white px-3.5 py-2.5 text-left text-sm text-stone-700 shadow-sm transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-primary hover:shadow focus:outline-none focus:ring-2 focus:ring-accent/40"
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition-colors group-hover:bg-primary group-hover:text-white">
                                <ChevronIcon className="h-3 w-3" />
                              </span>
                              <span className="font-medium">{targetTitle}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Table-side reference */}
          {reference.length > 0 && (
            <div className="mt-8 grid max-w-3xl gap-4">
              {reference.map((section) => (
                <div
                  key={section.id}
                  className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-7"
                >
                  <MarkdownRenderer content={section.md} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop stage rail */}
        <aside className="hidden lg:block">
          <nav
            aria-label={t("outline")}
            className="sticky top-24 flex max-h-[calc(100vh-8rem)] flex-col rounded-2xl border border-border bg-white p-2 shadow-card"
          >
            <p className="mb-2 px-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              {t("outline")}
            </p>
            <ul className="flex-1 space-y-0.5 overflow-y-auto">
              {nodeIds.map((id, i) => {
                const active = activeNode === id;
                const title = getNodeTitle(flowData, id, lang);
                return (
                  <li key={id}>
                    <button
                      onClick={() => scrollToNode(id)}
                      aria-current={active ? "step" : undefined}
                      className={`flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                        active
                          ? "bg-amber-50 font-semibold text-primary"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"
                      }`}
                    >
                      <span
                        className={`font-mono flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold ${
                          active ? "text-accent" : "text-stone-400"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate">{title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => scrollToNode(flowData.startNode)}
              className="mt-1 w-full cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {t("startOver")}
            </button>
          </nav>
        </aside>
      </div>
    </section>
  );
}
