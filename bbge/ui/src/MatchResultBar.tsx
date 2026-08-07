"use client";

export type MatchResultBarProps = {
  locale: string;
  /** Host rematch callback; omit for guests (shows waiting). */
  onRematch?: () => void;
  /** Button label override (default: 再来一局 / Play again). */
  label?: string;
  className?: string;
};

/**
 * Compact rematch CTA for finished hands / rounds.
 */
export function MatchResultBar({
  locale,
  onRematch,
  label,
  className,
}: MatchResultBarProps) {
  const zh = locale === "zh";
  return (
    <div
      className={[
        "ml-auto flex min-h-11 items-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {onRematch ? (
        <button
          type="button"
          onClick={onRematch}
          className="min-h-11 cursor-pointer touch-manipulation rounded-xl bg-accent px-5 py-2.5 font-heading text-sm font-bold text-white hover:bg-accent-dark active:scale-[0.98]"
        >
          {label ?? (zh ? "再来一局" : "Play again")}
        </button>
      ) : (
        <span className="px-1 text-xs text-stone-500">
          {zh ? "等待房主…" : "Waiting…"}
        </span>
      )}
    </div>
  );
}
