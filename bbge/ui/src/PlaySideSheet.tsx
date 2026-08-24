"use client";

import type { ReactNode } from "react";

export type PlaySideSheetProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/**
 * Mobile bottom sheet for battle log / side panel.
 * Uses a fixed `70dvh` height so inner `BattleLogList` can scroll
 * (max-height alone often fails to constrain flex children).
 */
export function PlaySideSheet({
  locale,
  open,
  onClose,
  title,
  children,
}: PlaySideSheetProps) {
  const zh = locale === "zh";
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45">
      <button
        type="button"
        aria-label={zh ? "关闭" : "Close"}
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-[70dvh] max-h-[70dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-[#efe6d8] pb-[env(safe-area-inset-bottom)] shadow-2xl sm:h-auto sm:max-h-[80dvh] sm:max-w-md sm:rounded-2xl sm:pb-0">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <p className="font-heading text-sm font-bold text-primary-dark">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-surface px-3 py-1.5 text-xs font-bold text-primary-dark"
          >
            {zh ? "关闭" : "Close"}
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
          {children}
        </div>
      </div>
    </div>
  );
}
