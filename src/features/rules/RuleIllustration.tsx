"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ImageLightbox } from "./ImageLightbox";

type LocalizedText = Record<"en" | "zh", string>;

interface Props {
  src: string;
  alt: string;
  className?: string;
}

/** Shared, base-path-safe rule image used by rule markdown and interactive flows. */
export function RuleIllustration({ src, alt, className = "" }: Props) {
  const t = useTranslations("game");
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const href =
    src.startsWith("http") || src.startsWith("/boardgames")
      ? src
      : src.startsWith("/")
        ? `/boardgames${src}`
        : src;

  return (
    <span className={`my-6 block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={alt ? `${t("viewImage")}: ${alt}` : t("viewImage")}
        onClick={() => setIsOpen(true)}
        className="group relative mx-auto block w-full max-w-2xl cursor-zoom-in overflow-hidden rounded-2xl focus:outline-none"
      >
        <img
          src={href}
          alt={alt}
          className="w-full rounded-2xl border border-border bg-white shadow-card transition-transform duration-200 group-hover:scale-[1.01] motion-reduce:transition-none"
        />
        <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-stone-900/75 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path strokeLinecap="round" d="m16 16 4 4M11 8v6M8 11h6" />
          </svg>
          {t("viewImage")}
        </span>
      </button>
      {alt ? (
        <span className="mt-2 block text-center text-sm text-stone-500">
          {alt}
        </span>
      ) : null}
      {isOpen ? (
        <ImageLightbox
          src={href}
          alt={alt}
          onClose={() => {
            setIsOpen(false);
            requestAnimationFrame(() => triggerRef.current?.focus());
          }}
        />
      ) : null}
    </span>
  );
}

export type { LocalizedText };
