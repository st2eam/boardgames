"use client";

import { cardBackUrl, cardFaceUrl, cardLabel } from "../cardArt";

interface Props {
  locale: string;
  rank?: number;
  role?: string;
  name?: { en: string; zh: string };
  faceDown?: boolean;
  subtitle?: string;
  onClose: () => void;
}

export function CardLightbox({
  locale,
  rank = 0,
  role,
  name,
  faceDown,
  subtitle,
  onClose,
}: Props) {
  const zh = locale === "zh";
  const src = faceDown ? cardBackUrl() : cardFaceUrl(rank, role);
  const label = faceDown
    ? zh
      ? "牌背"
      : "Back"
    : cardLabel({ rank, name }, locale);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-label={label}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-md flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-1 -top-1 cursor-pointer rounded-full bg-white px-3 py-1 font-heading text-sm font-bold text-primary-dark shadow-md hover:bg-amber-50"
        >
          {zh ? "关闭" : "Close"}
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          className="max-h-[75vh] w-auto max-w-full rounded-2xl border-4 border-[#5D4037] object-contain shadow-2xl"
        />
        <div className="rounded-xl bg-[#1a120e]/90 px-4 py-2 text-center text-amber-50">
          <p className="font-heading text-lg font-bold">
            {!faceDown && <span className="mr-2 text-accent">{rank}</span>}
            {label}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-sm text-amber-100/80">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
