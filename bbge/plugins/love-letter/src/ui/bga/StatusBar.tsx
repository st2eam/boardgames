"use client";

interface Props {
  locale: string;
  text: string;
  tone?: "idle" | "you" | "wait" | "done";
  /** Shown on hover when AI is thinking */
  detail?: string | null;
}

export function StatusBar({ locale, text, tone = "idle", detail }: Props) {
  const zh = locale === "zh";
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
      className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${bar}`}
      role="status"
      title={detail ?? undefined}
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
            {zh ? "悬停查看思路" : "hover for thoughts"}
          </span>
        ) : null}
      </p>
      <span className="ml-auto hidden shrink-0 text-[11px] font-medium uppercase tracking-wide opacity-50 sm:inline">
        {zh ? "状态" : "Status"}
      </span>

      {detail ? (
        <div
          className="pointer-events-none absolute left-3 right-3 top-[calc(100%+6px)] z-30 hidden max-h-56 overflow-hidden rounded-xl border border-sky-200 bg-white p-3 text-left shadow-lg group-hover:block"
          role="tooltip"
        >
          <p className="mb-1 font-heading text-[10px] font-bold uppercase tracking-wide text-sky-700">
            {zh ? "当前思路" : "Current thoughts"}
          </p>
          <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap break-words font-sans text-[12px] leading-relaxed text-stone-700">
            {detail}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
