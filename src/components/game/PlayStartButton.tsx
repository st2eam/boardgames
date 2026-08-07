"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { PlayConfig, PlayEdition } from "@/types/game";

interface Props {
  slug: string;
  playConfig: PlayConfig;
}

function defaultEditionId(cfg: PlayConfig): string {
  if (cfg.defaultEdition) return cfg.defaultEdition;
  const marked = cfg.editions?.find((e) => e.default);
  if (marked) return marked.id;
  return cfg.editions?.[0]?.id ?? "full";
}

export function PlayStartButton({ slug, playConfig }: Props) {
  const locale = useLocale();
  const t = useTranslations("game");
  const editions = playConfig.editions ?? [];
  const [open, setOpen] = useState(false);

  if (editions.length <= 1) {
    const ed = defaultEditionId(playConfig);
    const href =
      editions.length === 1 || playConfig.defaultEdition
        ? `/${locale}/games/${slug}/play/?edition=${encodeURIComponent(ed)}`
        : `/${locale}/games/${slug}/play/`;
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent/90"
      >
        <PlayIcon />
        {t("startGame")}
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent/90"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <PlayIcon />
        {t("startGame")}
        <svg
          className={`h-3.5 w-3.5 opacity-90 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-1.5 min-w-[14rem] overflow-hidden rounded-xl border border-border bg-white py-1 shadow-card"
          >
            <p className="px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wide text-stone-400">
              {locale === "zh" ? "选择版本" : "Choose edition"}
            </p>
            {editions.map((e: PlayEdition) => (
              <Link
                key={e.id}
                role="menuitem"
                href={`/${locale}/games/${slug}/play/?edition=${encodeURIComponent(e.id)}`}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-primary-dark transition-colors hover:bg-amber-50"
              >
                {e.label[locale as "en" | "zh"] ?? e.label.en}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
      />
    </svg>
  );
}
