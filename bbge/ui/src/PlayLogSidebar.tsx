"use client";

import { useEffect, useRef } from "react";
import type { PlayLogEntry } from "./formatPlayLog";

interface Props {
  locale: string;
  entries: PlayLogEntry[];
  currentPlayerId?: string | null;
  thinkingId?: string | null;
  nameOf?: (id: string) => string;
}

export function PlayLogSidebar({
  locale,
  entries,
  currentPlayerId,
  thinkingId,
  nameOf,
}: Props) {
  const zh = locale === "zh";
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  return (
    <aside className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card lg:w-72 lg:shrink-0">
      <div className="border-b border-border px-4 py-3">
        <p className="font-heading text-sm font-bold text-primary-dark">
          {zh ? "运行日志" : "Play log"}
        </p>
        <p className="mt-0.5 text-[11px] text-stone-500">
          {thinkingId
            ? zh
              ? `${nameOf?.(thinkingId) ?? thinkingId} 思考中…`
              : `${nameOf?.(thinkingId) ?? thinkingId} thinking…`
            : currentPlayerId
              ? zh
                ? `当前：${nameOf?.(currentPlayerId) ?? currentPlayerId}`
                : `Turn: ${nameOf?.(currentPlayerId) ?? currentPlayerId}`
              : zh
                ? "出牌与结算会出现在这里"
                : "Actions appear here"}
        </p>
      </div>
      <div
        ref={listRef}
        className="max-h-[min(520px,55vh)] min-h-[220px] flex-1 space-y-1.5 overflow-y-auto px-3 py-3"
      >
        {entries.length === 0 && (
          <p className="px-1 text-xs text-stone-400">
            {zh ? "开局后这里会记录每一步" : "Each step will be logged after start"}
          </p>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className={[
              "rounded-lg px-2.5 py-2 text-[12px] leading-snug",
              e.tone === "warn"
                ? "bg-red-50 text-red-900"
                : e.tone === "win"
                  ? "bg-amber-50 text-amber-950"
                  : "bg-surface text-primary-dark",
            ].join(" ")}
          >
            {e.text}
          </div>
        ))}
      </div>
    </aside>
  );
}
