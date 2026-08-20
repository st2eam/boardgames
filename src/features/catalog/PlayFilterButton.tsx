"use client";

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

interface Props {
  label: string;
  selected: boolean;
  onToggle: () => void;
  layout?: "block" | "pill";
}

export function PlayFilterButton({
  label,
  selected,
  onToggle,
  layout = "block",
}: Props) {
  const layoutClass =
    layout === "pill"
      ? "shrink-0 rounded-full px-3 py-1.5 text-xs"
      : "w-full rounded-xl px-3 py-2.5 text-sm";

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 font-semibold tracking-wide transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${layoutClass} ${
        selected
          ? "border border-accent/55 bg-accent/50 text-primary"
          : "border border-accent/40 bg-accent/25 text-accent-dark hover:border-accent/55 hover:bg-accent/35"
      }`}
    >
      <PlayIcon className={layout === "pill" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label}
    </button>
  );
}
