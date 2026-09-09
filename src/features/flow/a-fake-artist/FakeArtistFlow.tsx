"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MarkdownRenderer } from "@/features/rules/MarkdownRenderer";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { parseRuleSections, type RuleSection } from "./splitRules";

interface Props {
  locale: string;
  rulesMd: string;
}

/**
 * Fully integrated interactive rules for "A Fake Artist Goes to New York".
 *
 * The complete rules.md is the single content source. It is split into
 * sections and embedded into five stage cards (setup → drawing → pointing →
 * guess & score → next round), so there is no separate full-rule block that
 * repeats the tutorial. The stepper scrolls to and highlights the matching
 * stage card; quick-look and table-side sections stay outside the steps.
 */
const STAGES: { label: Record<"en" | "zh", string> }[] = [
  { label: { en: "Set the secret", zh: "准备题目" } },
  { label: { en: "Draw two rounds", zh: "轮流作画" } },
  { label: { en: "Point at once", zh: "同时指认" } },
  { label: { en: "Guess & score", zh: "猜题计分" } },
  { label: { en: "Next round", zh: "开始下一轮" } },
];

/** rules.md headings that back each stage card (keyed by locale). */
const STAGE_HEADINGS: Record<"en" | "zh", Record<number, string>> = {
  en: {
    1: "Set Up a Round",
    2: "1. Draw Exactly One Mark",
    3: "2. Point Together",
    4: "3. Guess and Score",
    5: "Start the Next Round",
  },
  zh: {
    1: "准备一轮",
    2: "1. 每次只画一笔",
    3: "2. 同时指认",
    4: "3. 猜题与计分",
    5: "开始下一轮",
  },
};

/** Sections shown above the steps (quick look + objective). */
const INTRO_HEADINGS: Record<"en" | "zh", string[]> = {
  en: ["Learn It in 30 Seconds", "Game Objective"],
  zh: ["30 秒知道怎么玩", "游戏目标"],
};

/** Sections shown below the steps (roles + table-side answers). */
const REFERENCE_HEADINGS: Record<"en" | "zh", string[]> = {
  en: ["Roles and Components", "Table-Side Answers"],
  zh: ["角色与组件", "桌边速查"],
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

export function FakeArtistFlow({ locale, rulesMd }: Props) {
  const t = useTranslations("flow");
  const lang: "en" | "zh" = locale === "zh" ? "zh" : "en";
  const reducedMotion = useReducedMotion();

  const byHeading = useMemo(() => {
    const map = new Map<string, RuleSection>();
    for (const section of parseRuleSections(rulesMd)) map.set(section.heading, section);
    return map;
  }, [rulesMd]);

  const intro = useMemo(
    () =>
      INTRO_HEADINGS[lang]
        .map((h) => byHeading.get(h))
        .filter((s): s is RuleSection => Boolean(s)),
    [byHeading, lang]
  );

  const stages = useMemo(
    () =>
      [1, 2, 3, 4, 5].map((i) => byHeading.get(STAGE_HEADINGS[lang][i]) ?? null),
    [byHeading, lang]
  );

  const reference = useMemo(
    () =>
      REFERENCE_HEADINGS[lang]
        .map((h) => byHeading.get(h))
        .filter((s): s is RuleSection => Boolean(s)),
    [byHeading, lang]
  );

  const [activeStage, setActiveStage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  /* Scroll-spy: keep the stepper in sync with the visible stage card. */
  useEffect(() => {
    const cards = [1, 2, 3, 4, 5]
      .map((i) => document.getElementById(`stage-${i}`))
      .filter((el): el is HTMLElement => Boolean(el));
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const match = /stage-(\d)/.exec(visible[0]?.target.id ?? "");
        if (match) setActiveStage(Number(match[1]));
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.4] }
    );

    for (const card of cards) observer.observe(card);
    return () => observer.disconnect();
  }, [stages]);

  const scrollToStage = useCallback(
    (idx: number) => {
      setActiveStage(idx);
      document
        .getElementById(`stage-${idx}`)
        ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    },
    [reducedMotion]
  );

  return (
    <section ref={sectionRef}>
      {/* Stage stepper */}
      <nav
        aria-label={t("outline")}
        className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-white px-3 py-2.5 shadow-card"
      >
        {STAGES.map((stage, i) => {
          const idx = i + 1;
          const active = activeStage === idx;
          return (
            <button
              key={idx}
              onClick={() => scrollToStage(idx)}
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
                {String(idx).padStart(2, "0")}
              </span>
              <span>{stage.label[lang]}</span>
            </button>
          );
        })}
      </nav>

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

      {/* Stage cards: the complete rules, embedded per step */}
      <div className="max-w-3xl space-y-6">
        {stages.map((section, i) => {
          const idx = i + 1;
          if (!section) return null;
          const active = activeStage === idx;
          return (
            <article
              id={`stage-${idx}`}
              key={idx}
              aria-current={active ? "step" : undefined}
              className={`scroll-mt-24 rounded-2xl border bg-white p-6 shadow-card transition-colors sm:p-8 ${
                active ? "border-accent/70 ring-1 ring-accent/20" : "border-border"
              }`}
            >
              <header className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-mono text-xs font-bold text-white">
                  {String(idx).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
                    {lang === "zh" ? `阶段 ${idx} / ${STAGES.length}` : `Stage ${idx} of ${STAGES.length}`}
                  </p>
                  <h3 className="font-heading text-xl font-bold tracking-tight text-primary-dark">
                    {STAGES[i].label[lang]}
                  </h3>
                </div>
              </header>

              <MarkdownRenderer content={section.md} />

              {idx < STAGES.length && (
                <div className="mt-6 border-t border-border pt-4">
                  <button
                    onClick={() => scrollToStage(idx + 1)}
                    className="group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
                  >
                    {lang === "zh" ? "下一步" : "Next"}
                    <span className="font-semibold">{STAGES[idx].label[lang]}</span>
                    <ChevronIcon className="h-3.5 w-3.5 text-stone-400 transition-colors group-hover:text-accent" />
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Roles + table-side reference */}
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
    </section>
  );
}
