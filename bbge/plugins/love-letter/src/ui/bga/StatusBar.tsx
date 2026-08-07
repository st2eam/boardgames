"use client";

import { useState } from "react";

interface Props {
  locale: string;
  text: string;
  tone?: "idle" | "you" | "wait" | "done";
  /** AI thinking detail — tap/click to expand (touch-friendly) */
  detail?: string | null;
}

export function StatusBar({ locale, text, tone = "idle", detail }: Props) {
  const zh = locale === "zh";
  const [open, setOpen] = useState(false);
  const bar =
    tone === "you"
      ? "border-accent bg-amber-50 text-amber-950"
      : tone === "wait"
        ? "border-sky-200 bg-sky-50 text-sky-950"
        : tone === "done"
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-border bg-white text-primary-dark";

  return (
    <div
      className={`relative rounded-xl border px-3 py-2.5 shadow-sm sm:px-4 sm:py-3 ${bar}`}
      role="status"
    >
      <button
        type="button"
        disabled={!detail}
        onClick={() => detail && setOpen((v) => !v)}
        className={[
          "flex w-full items-center gap-3 text-left",
          detail ? "cursor-pointer" : "cursor-default",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
            tone === "you"
              ? "bg-accent animate-pulse"
              : tone === "wait"
                ? "bg-sky-500 animate-pulse"
                : tone === "done"
                  ? "bg-emerald-500"
                  : "bg-stone-400",
          ].join(" ")}
        />
        <p className="min-w-0 flex-1 font-heading text-sm font-semibold leading-snug sm:text-base">
          {text}
          {detail ? (
            <span className="ml-2 text-[11px] font-medium opacity-45">
              {open
                ? zh
                  ? "收起思路"
                  : "hide thoughts"
                : zh
                  ? "点按查看思路"
                  : "tap for thoughts"}
            </span>
          ) : null}
        </p>
      </button>

      {detail && open ? (
        <div className="mt-2 max-h-40 overflow-hidden rounded-lg border border-sky-200 bg-white p-2.5 text-left shadow-sm sm:max-h-56">
          <p className="mb-1 font-heading text-[10px] font-bold uppercase tracking-wide text-sky-700">
            {zh ? "当前思路" : "Current thoughts"}
          </p>
          <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words font-sans text-[12px] leading-relaxed text-stone-700 sm:max-h-44">
            {detail}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
