"use client";

import { BattleLogList } from "./BattleLogList";
import type { PlayLogEntry } from "./formatPlayLog";

interface Props {
  locale: string;
  entries: PlayLogEntry[];
  currentPlayerId?: string | null;
  thinkingId?: string | null;
  nameOf?: (id: string) => string;
}

/** Legacy sidebar chrome around {@link BattleLogList}. */
export function PlayLogSidebar({
  locale,
  entries,
  currentPlayerId,
  thinkingId,
  nameOf,
}: Props) {
  const zh = locale === "zh";

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card lg:w-72 lg:shrink-0">
      <div className="shrink-0 border-b border-border px-4 py-3">
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
      <BattleLogList
        locale={locale}
        entries={entries}
        variant="chip"
        className="px-3 py-3"
      />
    </aside>
  );
}
