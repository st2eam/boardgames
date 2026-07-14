import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";

/** GitHub Pages project site: https://st2eam.github.io/boardgames/ */
export const SITE_ORIGIN = "https://st2eam.github.io";
export const BASE_PATH = "/boardgames";
export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;
export const SITE_NAME = "The Game Shelf";

const DEFAULT_OG_IMAGE = `${SITE_URL}/icons/icon-512.png`;

let coverManifest: Record<string, string> | null = null;

function loadCoverManifest(): Record<string, string> {
  if (coverManifest) return coverManifest;
  const path = join(process.cwd(), "public", "data", "cover-manifest.json");
  if (!existsSync(path)) {
    coverManifest = {};
    return coverManifest;
  }
  coverManifest = JSON.parse(readFileSync(path, "utf-8")) as Record<string, string>;
  return coverManifest;
}

/** Absolute URL including /boardgames basePath. */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withBase = normalized.startsWith(BASE_PATH)
    ? normalized
    : `${BASE_PATH}${normalized}`;
  return `${SITE_ORIGIN}${withBase}`;
}

/** Path without locale, e.g. `/`, `/costs/`, `/games/love-letter/`. */
export function pageAlternates(locale: string, pathWithoutLocale: string) {
  const clean = pathWithoutLocale.startsWith("/")
    ? pathWithoutLocale
    : `/${pathWithoutLocale}`;
  const withSlash = clean.endsWith("/") ? clean : `${clean}/`;

  return {
    canonical: absoluteUrl(`/${locale}${withSlash === "/" ? "/" : withSlash}`),
    languages: {
      en: absoluteUrl(`/en${withSlash === "/" ? "/" : withSlash}`),
      zh: absoluteUrl(`/zh${withSlash === "/" ? "/" : withSlash}`),
      "x-default": absoluteUrl(`/en${withSlash === "/" ? "/" : withSlash}`),
    },
  };
}

export function getCoverImageUrl(slug: string): string | undefined {
  const ext = loadCoverManifest()[slug];
  if (!ext) return undefined;
  return absoluteUrl(`/images/games/${slug}.${ext}`);
}

export function getDefaultOgImage(): string {
  return DEFAULT_OG_IMAGE;
}

interface BuildMetadataOptions {
  locale: string;
  title: string;
  description: string;
  /** Path without locale prefix, e.g. `/games/love-letter/` */
  path: string;
  ogImage?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

export function buildPageMetadata({
  locale,
  title,
  description,
  path,
  ogImage,
  type = "website",
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const image = ogImage ?? DEFAULT_OG_IMAGE;
  const url = pageAlternates(locale, path).canonical;
  const fullTitle =
    title === SITE_NAME || title.includes(` - ${SITE_NAME}`)
      ? title
      : `${title} - ${SITE_NAME}`;

  return {
    // absolute avoids stacking with root title.template
    title: { absolute: fullTitle },
    description,
    alternates: pageAlternates(locale, path),
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type,
      images: [
        {
          url: image,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
