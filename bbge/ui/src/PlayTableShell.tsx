"use client";

import type { ReactNode } from "react";

export type PlayTableShellProps = {
  locale: string;
  title: ReactNode;
  /** Right-side meta chips / log button in the brown toolbar. */
  toolbarExtra?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Show mobile “Log” control when provided. */
  onOpenLog?: () => void;
  logLabel?: string;
};

/**
 * Shared cream table chrome + brown toolbar used by most BBGE plugins.
 */
export function PlayTableShell({
  locale,
  title,
  toolbarExtra,
  children,
  className,
  onOpenLog,
  logLabel,
}: PlayTableShellProps) {
  const zh = locale === "zh";
  return (
    <div
      data-testid="play-table-shell"
      className={[
        "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#3E2723]/25 bg-[#efe6d8] shadow-card",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex shrink-0 items-center gap-2 overflow-hidden border-b border-[#3E2723]/15 bg-[#5D4037] px-3 py-2 text-amber-50 sm:px-4 sm:py-2.5">
        <p className="min-w-0 shrink-0 truncate font-heading text-sm font-bold tracking-wide">{title}</p>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto whitespace-nowrap text-xs text-amber-100/85 [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden">
          {toolbarExtra}
          {onOpenLog ? (
            <button
              type="button"
              onClick={onOpenLog}
              className="min-h-9 cursor-pointer touch-manipulation rounded-lg bg-white/15 px-2.5 py-1.5 font-heading text-[11px] font-bold text-amber-50 hover:bg-white/25 active:scale-[0.98]"
            >
              {logLabel ?? (zh ? "战报" : "Log")}
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5 sm:gap-2 sm:p-3">
        {children}
      </div>
    </div>
  );
}

/** Felt / board frame used inside {@link PlayTableShell}. */
export function PlayFeltFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative min-h-0 overflow-hidden rounded-xl border-[4px] border-[#4E342E] shadow-inner sm:rounded-2xl sm:border-[6px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
