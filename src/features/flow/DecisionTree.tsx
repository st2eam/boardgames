"use client";

import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import type { FlowData } from "@/types/game";
import { MarkdownRenderer } from "@/features/rules/MarkdownRenderer";
import { RuleIllustration } from "@/features/rules/RuleIllustration";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const SeaSaltCardReference = lazy(() =>
  import("./sea-salt/SeaSaltCardReference").then((m) => ({
    default: m.SeaSaltCardReference,
  }))
);

interface Props {
  flowData: FlowData;
  locale: string;
  slug?: string;
}

function getNodeTitle(
  flowData: FlowData,
  nodeId: string,
  locale: string
): string {
  const node = flowData.nodes[nodeId];
  if (!node) return nodeId;
  return node.title[locale as "en" | "zh"] ?? node.title.en;
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "h-3 w-3"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 5 7 7-7 7"
      />
    </svg>
  );
}

export function DecisionTree({ flowData, locale, slug }: Props) {
  const t = useTranslations("flow");
  const [currentNodeId, setCurrentNodeId] = useState(flowData.startNode);
  const [history, setHistory] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const outlinePanelRef = useRef<HTMLDivElement>(null);
  const activeOutlineRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  const nodeIds = Object.keys(flowData.nodes);
  const node = flowData.nodes[currentNodeId];

  const navigateTo = useCallback(
    (nodeId: string) => {
      if (nodeId === currentNodeId) return;
      setHistory((prev) => [...prev, currentNodeId]);
      setCurrentNodeId(nodeId);
    },
    [currentNodeId]
  );

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentNodeId(prev);
  }, [history]);

  const startOver = useCallback(() => {
    setCurrentNodeId(flowData.startNode);
    setHistory([]);
  }, [flowData.startNode]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });

    const panel = outlinePanelRef.current;
    const item = activeOutlineRef.current;
    if (!panel || !item) return;
    const panelRect = panel.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const pad = 8;
    if (itemRect.top < panelRect.top + pad) {
      panel.scrollBy({ top: itemRect.top - panelRect.top - pad, behavior: reducedMotion ? "auto" : "smooth" });
    } else if (itemRect.bottom > panelRect.bottom - pad) {
      panel.scrollBy({
        top: itemRect.bottom - panelRect.bottom + pad,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
  }, [currentNodeId, reducedMotion]);

  if (!node) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center">
        <p className="text-stone-500">
          {t("nodeNotFound")}: {currentNodeId}
        </p>
      </div>
    );
  }

  const title = getNodeTitle(flowData, currentNodeId, locale);
  const currentIndex = nodeIds.indexOf(currentNodeId);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
      <aside className="shrink-0 lg:w-60">
        <nav aria-label={t("outline")}>
          <div
            ref={outlinePanelRef}
            className="flex max-h-[min(70vh,calc(100vh-8rem))] gap-1 overflow-x-auto rounded-2xl border border-border bg-white p-2 shadow-card lg:sticky lg:top-24 lg:block lg:overflow-y-auto lg:overflow-x-hidden"
          >
            <p className="sr-only lg:not-sr-only lg:mb-2 lg:px-2 lg:pt-1 lg:text-[10px] lg:font-bold lg:uppercase lg:tracking-widest lg:text-stone-400">
              {t("outline")}
            </p>
            <ul className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col lg:gap-0.5">
              {nodeIds.map((id, i) => {
                const isCurrent = id === currentNodeId;
                const visited = history.includes(id);
                const nodeTitle = getNodeTitle(flowData, id, locale);
                return (
                  <li key={id} className="lg:w-full">
                    <button
                      ref={isCurrent ? activeOutlineRef : undefined}
                      onClick={() => navigateTo(id)}
                      aria-current={isCurrent ? "step" : undefined}
                      className={`flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                        isCurrent
                          ? "bg-amber-50 font-semibold text-primary"
                          : visited
                            ? "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                            : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"
                      }`}
                    >
                      <span
                        className={`font-mono flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? "text-accent"
                            : visited
                              ? "text-success"
                              : "text-stone-400"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="max-w-32 truncate lg:max-w-none">{nodeTitle}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1" ref={contentRef}>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <div className="border-b border-border px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-200 motion-reduce:transition-none"
                  style={{ width: `${((currentIndex + 1) / nodeIds.length) * 100}%` }}
                />
              </div>
              <span className="font-mono shrink-0 text-[11px] text-stone-400">
                {currentIndex + 1} / {nodeIds.length}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentNodeId}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Title */}
              <div className="px-5 pt-6 sm:px-6">
                <p className="font-mono mb-2 text-[11px] font-medium tracking-[0.12em] text-accent">
                  {String(currentIndex + 1).padStart(2, "0")}
                </p>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">
                  {title}
                </h2>
              </div>

              {/* Content body */}
              <div className="px-5 py-5 sm:px-6">
                {node.illustration ? (
                  <RuleIllustration
                    src={node.illustration.src}
                    alt={node.illustration.alt[locale as "en" | "zh"] ?? node.illustration.alt.en}
                    className="mt-0"
                  />
                ) : null}
                <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                  <MarkdownRenderer content={node.content[locale as "en" | "zh"] ?? node.content.en} />
                </div>
                {slug?.startsWith("sea-salt-paper") && currentNodeId === "card-types" && (
                  <div className="mt-4">
                    <Suspense fallback={<div className="py-8 text-center text-stone-400">Loading...</div>}>
                      <SeaSaltCardReference locale={locale} />
                    </Suspense>
                  </div>
                )}
              </div>

              {/* Navigation options */}
              {node.options.length > 0 && (
                <div className="border-t border-border bg-stone-50/60 px-5 py-4 sm:px-6">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    {t("chooseNext")}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {node.options.map((opt) => {
                      const targetTitle = opt.label[locale as "en" | "zh"] ?? opt.label.en;
                      const isVisited = history.includes(opt.next);
                      return (
                        <button
                          key={opt.next}
                          onClick={() => navigateTo(opt.next)}
                          className={`group flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                            isVisited
                              ? "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-stone-100 hover:text-stone-700"
                              : "border-border bg-white text-stone-700 shadow-sm hover:border-amber-300 hover:bg-amber-50 hover:text-primary hover:shadow"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                              isVisited
                                ? "bg-stone-200 text-stone-400"
                                : "bg-stone-100 text-stone-400 group-hover:bg-primary group-hover:text-white"
                            }`}
                          >
                            <ChevronIcon className="h-3 w-3" />
                          </span>
                          <span className="font-medium">{targetTitle}</span>
                          {isVisited && (
                            <svg
                              className="ml-auto h-3.5 w-3.5 shrink-0 text-stone-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-border px-5 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={goBack}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  {t("back")}
                </button>
              )}
              <button
                onClick={startOver}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                {t("startOver")}
              </button>
            </div>
            {/* Quick jump to next sequential node */}
            {currentIndex < nodeIds.length - 1 && (
              <button
                onClick={() => navigateTo(nodeIds[currentIndex + 1])}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                {getNodeTitle(flowData, nodeIds[currentIndex + 1], locale)}
                <ChevronIcon className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
