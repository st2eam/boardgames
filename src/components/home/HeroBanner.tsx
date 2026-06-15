"use client";

import { useTranslations } from "next-intl";

interface Props {
  gameCount: number;
}

export function HeroBanner({ gameCount }: Props) {
  const t = useTranslations("home");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
      {/* Subtle grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
        {/* Left: content */}
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-primary-dark sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-stone-500 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Right: visual stat badge */}
        <div className="flex shrink-0 items-center gap-6 lg:flex-col lg:items-end lg:gap-8">
          {/* Game count display */}
          <div className="flex items-baseline gap-1.5 rounded-2xl bg-primary-light/60 px-5 py-4">
            <span className="font-heading text-4xl font-bold tabular-nums tracking-tight text-primary-dark sm:text-5xl">
              {gameCount}
            </span>
            <span className="text-sm font-medium text-stone-400">+</span>
          </div>

          {/* Decorative game piece shapes */}
          <div className="hidden sm:flex lg:flex-col lg:items-end" aria-hidden="true">
            <div className="flex gap-1.5 lg:flex-col lg:gap-1.5">
              <div className="h-3 w-3 rounded-full bg-accent/30" />
              <div className="h-3 w-8 rounded-full bg-primary/20" />
              <div className="h-3 w-3 rounded-full bg-accent/40" />
            </div>
            <div className="mt-1.5 flex gap-2 lg:flex-col lg:gap-1.5">
              <div className="h-1.5 w-6 rounded-full bg-accent/25" />
              <div className="h-1.5 w-10 rounded-full bg-primary/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
