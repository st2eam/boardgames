"use client";

interface Props {
  locale: string;
  text: string;
  tone?: "idle" | "you" | "wait" | "done";
}

export function StatusBar({ locale, text, tone = "idle" }: Props) {
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
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${bar}`}
      role="status"
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
      <p className="font-heading text-sm font-semibold leading-snug sm:text-base">
        {text}
      </p>
      <span className="ml-auto hidden text-[11px] font-medium uppercase tracking-wide opacity-50 sm:inline">
        {locale === "zh" ? "状态" : "Status"}
      </span>
    </div>
  );
}
