"use client";

/** Visual Love Letter / generic playing card — no emoji icons. */

const RANK_TINT: Record<number, { from: string; to: string; ink: string }> = {
  0: { from: "#78909C", to: "#546E7A", ink: "#ECEFF1" },
  1: { from: "#EF5350", to: "#C62828", ink: "#FFEBEE" },
  2: { from: "#5C6BC0", to: "#3949AB", ink: "#E8EAF6" },
  3: { from: "#8D6E63", to: "#5D4037", ink: "#EFEBE9" },
  4: { from: "#EC407A", to: "#AD1457", ink: "#FCE4EC" },
  5: { from: "#26A69A", to: "#00695C", ink: "#E0F2F1" },
  6: { from: "#AB47BC", to: "#6A1B9A", ink: "#F3E5F5" },
  7: { from: "#FFA726", to: "#EF6C00", ink: "#FFF3E0" },
  8: { from: "#42A5F5", to: "#1565C0", ink: "#E3F2FD" },
  9: { from: "#C4952A", to: "#8B6914", ink: "#FFF8E1" },
};

export interface PlayingCardProps {
  rank?: number;
  name?: string;
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

const SIZES = {
  sm: "h-20 w-14 text-[10px]",
  md: "h-28 w-20 text-xs",
  lg: "h-36 w-24 text-sm",
};

export function PlayingCard({
  rank = 0,
  name = "",
  faceDown,
  selected,
  disabled,
  size = "md",
  onClick,
  className = "",
}: PlayingCardProps) {
  const tint = RANK_TINT[rank] ?? RANK_TINT[1]!;
  const interactive = Boolean(onClick) && !disabled;

  if (faceDown) {
    return (
      <div
        className={`${SIZES[size]} relative shrink-0 rounded-xl border-2 border-primary-dark/30 shadow-card ${className}`}
        style={{
          background:
            "repeating-linear-gradient(135deg, #5D4037 0 6px, #3E2723 6px 12px)",
        }}
        aria-hidden
      >
        <div className="absolute inset-1 rounded-lg border border-accent/40 bg-linear-to-br from-primary/40 to-primary-dark/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-6 w-6 text-accent/80" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 21s-6.5-4.35-9.33-8.1C.5 9.9 1.7 5.8 5.4 4.6c2.1-.7 4.3.1 5.6 1.8 1.3-1.7 3.5-2.5 5.6-1.8 3.7 1.2 4.9 5.3 2.73 8.3C18.5 16.65 12 21 12 21z" />
          </svg>
        </div>
      </div>
    );
  }

  const Comp = interactive ? "button" : "div";

  return (
    <Comp
      type={interactive ? "button" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={[
        SIZES[size],
        "relative shrink-0 rounded-xl border-2 text-left shadow-card transition-all duration-200",
        interactive ? "cursor-pointer hover:-translate-y-1 hover:shadow-card-hover" : "",
        selected
          ? "border-accent ring-2 ring-accent/50 -translate-y-2 shadow-card-hover"
          : "border-white/80",
        disabled ? "opacity-40 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      style={{
        background: `linear-gradient(160deg, ${tint.from}, ${tint.to})`,
        color: tint.ink,
      }}
    >
      <div className="flex h-full flex-col justify-between p-2">
        <div className="font-heading text-xl font-bold leading-none drop-shadow-sm sm:text-2xl">
          {rank}
        </div>
        <div className="font-heading text-[0.65rem] font-semibold leading-tight sm:text-xs">
          {name}
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 rounded-[10px] opacity-30"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), transparent 45%)",
        }}
      />
    </Comp>
  );
}
