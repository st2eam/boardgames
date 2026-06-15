"use client";

import { useState } from "react";
import type { FlowData } from "@/types/game";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useTranslations } from "next-intl";

interface Props {
  flowData: FlowData;
  locale: string;
}

export function DecisionTree({ flowData, locale }: Props) {
  const t = useTranslations("flow");
  const [currentNodeId, setCurrentNodeId] = useState<string>(
    flowData.startNode
  );
  const [history, setHistory] = useState<string[]>([]);

  const node = flowData.nodes[currentNodeId];
  if (!node) {
    return <p className="text-zinc-600">Node not found: {currentNodeId}</p>;
  }

  const handleOption = (next: string) => {
    setHistory((prev) => [...prev, currentNodeId]);
    setCurrentNodeId(next);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentNodeId(prev);
  };

  const handleStartOver = () => {
    setCurrentNodeId(flowData.startNode);
    setHistory([]);
  };

  const title = node.title[locale as "en" | "zh"] ?? node.title.en;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      {/* Breadcrumb / progress indicator */}
      <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
        {history.map((nodeId, i) => {
          const histNode = flowData.nodes[nodeId];
          return (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-zinc-300">/</span>}
              <button
                onClick={() => {
                  setCurrentNodeId(nodeId);
                  setHistory((prev) => prev.slice(0, i));
                }}
                className="hover:text-blue-600 transition-colors"
              >
                {histNode?.title[locale as "en" | "zh"] ??
                  histNode?.title.en ??
                  nodeId}
              </button>
            </span>
          );
        })}
        {history.length > 0 && <span className="text-zinc-300">/</span>}
        <span className="font-medium text-zinc-800">{title}</span>
      </div>

      {/* Current node content */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">{title}</h2>
        <div className="rounded-lg bg-zinc-50 p-4">
          <MarkdownRenderer content={node.content} />
        </div>
      </div>

      {/* Navigation options */}
      {node.options.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-500">
            {locale === "zh" ? "选择下一步：" : "Choose next step:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {node.options.map((opt) => (
              <button
                key={opt.next}
                onClick={() => handleOption(opt.next)}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {opt.label[locale as "en" | "zh"] ?? opt.label.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-4">
        {history.length > 0 && (
          <button
            onClick={handleBack}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            &larr; {t("back")}
          </button>
        )}
        <button
          onClick={handleStartOver}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
        >
          {t("startOver")}
        </button>
      </div>
    </div>
  );
}
