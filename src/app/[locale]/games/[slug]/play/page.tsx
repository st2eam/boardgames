import { GameRepository } from "@/lib/content/GameRepository";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Link from "next/link";
import { buildPageMetadata, getCoverImageUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PlayPageClient } from "@/components/game/play/PlayPageClient";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const meta = await GameRepository.getGameMeta(slug);
  const name = meta.name[locale as "en" | "zh"] ?? meta.name.en;
  const title = locale === "zh" ? `${name} 开始游戏` : `${name} Play`;

  return buildPageMetadata({
    locale,
    title,
    description:
      locale === "zh"
        ? `${name} 在线对局 — Host 联机与 AI 座位`
        : `Play ${name} online — host multiplayer and AI seats`,
    path: `/games/${slug}/play/`,
    ogImage: getCoverImageUrl(slug),
  });
}

export async function generateStaticParams() {
  const slugs = await GameRepository.getAllGameSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const slug of slugs) {
      if (GameRepository.hasPlayConfig(slug)) {
        params.push({ locale, slug });
      }
    }
  }
  return params;
}

export default async function PlayPage({ params }: Props) {
  const { locale, slug } = await params;
  const playConfig = await GameRepository.getPlayConfig(slug);
  const meta = await GameRepository.getGameMeta(slug);

  if (!playConfig || !meta) {
    notFound();
  }

  const gameName = meta.name[locale as "en" | "zh"] ?? meta.name.en;

  // Viewport-locked shell: no page scrollbar. Overflow scrolls inside panels.
  return (
    <div className="mx-auto flex h-[calc(100dvh-3.75rem)] w-full max-w-6xl flex-col overflow-hidden px-3 py-2 sm:px-6 lg:px-8">
      <div className="mb-2 shrink-0">
        <Link
          href={`/${locale}/games/${slug}/`}
          className="inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-accent/80"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {gameName}
        </Link>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <Suspense
          fallback={
            <p className="text-sm text-stone-500">Loading…</p>
          }
        >
          <PlayPageClient
            locale={locale}
            slug={slug}
            gameName={gameName}
            pluginId={playConfig.pluginId}
          />
        </Suspense>
      </div>
    </div>
  );
}
