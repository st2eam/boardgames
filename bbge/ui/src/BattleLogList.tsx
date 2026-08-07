"use client";

import { useEffect, useRef } from "react";
import type { PlayLogEntry } from "./plugin-types";

export type BattleLogListProps = {
  locale: string;
  entries: PlayLogEntry[];
  /** Optional heading above the list (e.g. 战报). */
  title?: string;
  /** Extra classes on the scroll container (merged with scroll defaults). */
  className?: string;
  /** Row style: plain lines (holdem) vs padded chips (love letter). */
  variant?: "plain" | "chip";
};

const SCROLL_CLASS =
  "min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain [scrollbar-gutter:stable]";

/**
 * Shared battle-log scroller for all BBGE tables.
 * Needs a height-bounded flex parent (`min-h-0` + fixed/flex height).
 */
export function BattleLogList({
  locale,
  entries,
  title,
  className,
  variant = "plain",
}: BattleLogListProps) {
  const zh = locale === "zh";
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [entries.length, entries[entries.length - 1]?.id]);

  return (
    <div
      ref={listRef}
      className={[SCROLL_CLASS, className].filter(Boolean).join(" ")}
    >
      {title ? (
        <p className="mb-1 font-heading text-xs font-bold text-stone-500">
          {title}
        </p>
      ) : null}
      {entries.length === 0 && (
        <p className="text-[11px] text-stone-400">
          {zh ? "行动会出现在这里" : "Actions appear here"}
        </p>
      )}
      {entries.map((e) => {
        const tone =
          e.tone === "win"
            ? variant === "chip"
              ? "bg-amber-50 text-amber-950"
              : "text-emerald-700"
            : e.tone === "warn"
              ? variant === "chip"
                ? "bg-red-50 text-red-900"
                : "text-amber-700"
              : variant === "chip"
                ? "bg-surface text-primary-dark"
                : "text-stone-600";
        if (variant === "chip") {
          return (
            <div
              key={e.id}
              className={[
                "mb-1 whitespace-pre-wrap rounded-md px-1.5 py-1 text-[11px] leading-snug",
                tone,
              ].join(" ")}
            >
              {e.text}
            </div>
          );
        }
        return (
          <p key={e.id} className={["text-[11px] leading-snug", tone].join(" ")}>
            {e.text}
          </p>
        );
      })}
    </div>
  );
}
