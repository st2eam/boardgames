"use client";

import { useState } from "react";

export type ThinkingStatusTone = "idle" | "you" | "wait" | "done";

export type ThinkingStatusBannerProps = {
  locale: string;
  text: string;
  tone?: ThinkingStatusTone;
  /** AI thinking stream — tap to expand. */
  detail?: string | null;
  /** Dark felt tables (e.g. CABO). */
  inverse?: boolean;
  className?: string;
};

/**
 * Compact status strip with optional expandable LLM thinking.
 */
export function ThinkingStatusBanner({
  locale,
  text,
  tone = "idle",
  detail,
  inverse = false,
  className,
}: ThinkingStatusBannerProps) {
  const zh = locale === "zh";
  const [open, setOpen] = useState(false);
  const bar = inverse
    ? tone === "you"
      ? "border-amber-300/50 bg-amber-950/55 text-amber-50"
      : tone === "wait"
        ? "border-sky-300/40 bg-sky-950/50 text-sky-50"
        : tone === "done"
          ? "border-emerald-300/40 bg-emerald-950/50 text-emerald-50"
          : "border-white/20 bg-black/30 text-white"
    : tone === "you"
      ? "border-accent bg-amber-50 text-amber-950"
      : tone === "wait"
        ? "border-sky-200 bg-sky-50 text-sky-950"
        : tone === "done"
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-border bg-white/90 text-primary-dark";

  return (
    <div
      className={[
        "relative min-h-11 shrink-0 overflow-hidden rounded-xl border px-3 py-1.5 shadow-sm sm:px-4 sm:py-2",
        bar,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      <button
        type="button"
        disabled={!detail}
        onClick={() => detail && setOpen((v) => !v)}
        className={[
          "flex w-full touch-manipulation items-center gap-3 text-left",
          detail ? "cursor-pointer" : "cursor-default",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
            tone === "you"
              ? "bg-accent animate-pulse"
              : tone === "wait"
                ? "bg-sky-400 animate-pulse"
                : tone === "done"
                  ? "bg-emerald-400"
                  : inverse
                    ? "bg-white/50"
                    : "bg-stone-400",
          ].join(" ")}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold leading-tight sm:text-base">
            {text}
          </p>
          <p
            className={[
              "mt-0.5 truncate text-[11px] leading-tight",
              inverse ? "text-white/55" : "opacity-55",
            ].join(" ")}
          >
            {detail
              ? open
                ? zh
                  ? "点按收起思路"
                  : "Tap to hide thoughts"
                : zh
                  ? "点按查看思路"
                  : "Tap for thoughts"
              : "\u00a0"}
          </p>
        </div>
      </button>

      {detail && open ? (
        <div
          className={[
            "mt-1.5 max-h-40 overflow-hidden rounded-lg p-2.5 text-left shadow-sm sm:max-h-56",
            inverse
              ? "border border-white/15 bg-black/40"
              : "border border-sky-200/80 bg-white",
          ].join(" ")}
        >
          <p
            className={[
              "mb-1 font-heading text-[10px] font-bold uppercase tracking-wide",
              inverse ? "text-sky-200" : "text-sky-700",
            ].join(" ")}
          >
            {zh ? "当前思路" : "Current thoughts"}
          </p>
          <pre
            className={[
              "max-h-32 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words font-sans text-[12px] leading-relaxed sm:max-h-44",
              inverse ? "text-white/85" : "text-stone-700",
            ].join(" ")}
          >
            {detail}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
