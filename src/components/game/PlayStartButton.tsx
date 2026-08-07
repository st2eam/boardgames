"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { PlayConfig } from "@/types/game";

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

/** Rules-page CTA — edition is chosen in the play lobby. */
export function PlayStartButton({ slug, playConfig }: Props) {
  const locale = useLocale();
  const t = useTranslations("game");
  const ed = defaultEditionId(playConfig);
  const href =
    playConfig.editions && playConfig.editions.length > 0
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
