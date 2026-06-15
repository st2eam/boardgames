"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { FlowData } from "@/types/game";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useTranslations } from "next-intl";

interface Props {
  flowData: FlowData;
  locale: string;
}

function getNodeTitle(
  flowData: FlowData,
  nodeId: string,
  locale: string
): string {
  const node = flowData.nodes[nodeId];
  return node?.title[locale as "en" | "zh"] ?? node?.title.en ?? nodeId;
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

export function DecisionTree({ flowData, locale }: Props) {
  const t = useTranslations("flow");
  const [currentNodeId, setCurrentNodeId] = useState(flowData.startNode);
  const [history, setHistory] = useState<string[]>([]);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const nodeIds = Object.keys(flowData.nodes);
  const node = flowData.nodes[currentNodeId];

  const navigateTo = useCallback(
    (nodeId: string) => {
      if (nodeId === currentNodeId) return;
      setHistory((prev) => [...prev, currentNodeId]);
      setCurrentNodeId(nodeId);
      setOutlineOpen(false);
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
    setOutlineOpen(false);
  }, [flowData.startNode]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentNodeId]);

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
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Sidebar — outline of all nodes */}
      <aside className="shrink-0 lg:w-56">
        {/* Mobile toggle */}
        <button
          onClick={() => setOutlineOpen(!outlineOpen)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-stone-700 shadow-sm lg:hidden"
        >
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            {t("outline")}
          </span>
          <svg
            className={`h-4 w-4 text-stone-400 transition-transform ${outlineOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        {/* Node list */}
        <nav
          className={`mt-2 lg:mt-0 ${outlineOpen ? "block" : "hidden"} lg:block`}
        >
          <div className="rounded-xl border border-border bg-white p-2 shadow-sm lg:sticky lg:top-24">
            <p className="mb-1 px-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              {t("outline")}
            </p>
            <ul className="space-y-0.5">
              {nodeIds.map((id, i) => {
                const isCurrent = id === currentNodeId;
                const visited = history.includes(id);
                const nodeTitle = getNodeTitle(flowData, id, locale);
                return (
                  <li key={id}>
                    <button
                      onClick={() => navigateTo(id)}
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                        isCurrent
                          ? "bg-amber-50 font-semibold text-primary"
                          : visited
                            ? "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                            : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          isCurrent
                            ? "bg-primary text-white"
                            : visited
                              ? "bg-stone-200 text-stone-500"
                              : "bg-stone-100 text-stone-400"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="truncate">{nodeTitle}</span>
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
        <div className="rounded-xl border border-border bg-white shadow-sm">
          {/* Header with step indicator + back nav */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={goBack}
                  className="flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
                  aria-label={t("back")}
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <nav
                className="flex items-center gap-1 text-xs text-stone-400"
                aria-label="Breadcrumb"
              >
                <button
                  onClick={startOver}
                  className="cursor-pointer rounded px-1 py-0.5 hover:text-primary hover:bg-amber-50 transition-colors focus:outline-none"
                >
                  {getNodeTitle(flowData, flowData.startNode, locale)}
                </button>
                {history.length > 0 && (
                  <>
                    {history.length > 2 && (
                      <>
                        <ChevronIcon className="h-2.5 w-2.5 text-stone-300" />
                        <span className="text-stone-300">...</span>
                      </>
                    )}
                    {history.length <= 2 &&
                      history.slice(1).map((hId, i) => (
                        <span key={hId} className="flex items-center gap-1">
                          <ChevronIcon className="h-2.5 w-2.5 text-stone-300" />
                          <button
                            onClick={() => {
                              setCurrentNodeId(hId);
                              setHistory((prev) => prev.slice(0, i + 1));
                            }}
                            className="cursor-pointer rounded px-1 py-0.5 hover:text-accent transition-colors truncate max-w-[100px] focus:outline-none"
                          >
                            {getNodeTitle(flowData, hId, locale)}
                          </button>
                        </span>
                      ))}
                    {history.length > 2 && (
                      <span className="flex items-center gap-1">
                        <ChevronIcon className="h-2.5 w-2.5 text-stone-300" />
                        <button
                          onClick={goBack}
                          className="cursor-pointer rounded px-1 py-0.5 hover:text-accent transition-colors truncate max-w-[100px] focus:outline-none"
                        >
                          {getNodeTitle(
                            flowData,
                            history[history.length - 1],
                            locale
                          )}
                        </button>
                      </span>
                    )}
                    <ChevronIcon className="h-2.5 w-2.5 text-stone-300" />
                    <span className="font-medium text-stone-700 truncate max-w-[120px]">
                      {title}
                    </span>
                  </>
                )}
              </nav>
            </div>
            <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-400">
              {currentIndex + 1} / {nodeIds.length}
            </span>
          </div>

          {/* Title */}
          <div className="px-5 pt-5 sm:px-6">
            <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">
              {title}
            </h2>
          </div>

          {/* Content body */}
          <div className="px-5 py-5 sm:px-6">
            <div className="rounded-xl border border-border bg-stone-50/50 p-4 sm:p-5">
              <MarkdownRenderer content={node.content} />
            </div>
          </div>

          {/* Navigation options */}
          {node.options.length > 0 && (
            <div className="border-t border-border px-5 py-4 sm:px-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {t("chooseNext")}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {node.options.map((opt) => {
                  const targetTitle =
                    opt.label[locale as "en" | "zh"] ?? opt.label.en;
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
