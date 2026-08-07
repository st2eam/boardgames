"use client";

import { cardFaceUrl, cardLabel } from "../cardArt";

interface Props {
  locale: string;
  targetName: string;
  rank: number;
  name?: { en: string; zh: string };
  onConfirm: () => void;
  onZoom: () => void;
}

export function PriestRevealModal({
  locale,
  targetName,
  rank,
  name,
  onConfirm,
  onZoom,
}: Props) {
  const zh = locale === "zh";
  const label = cardLabel({ rank, name }, locale);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-[#efe6d8] p-5 shadow-2xl">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-accent-dark">
          {zh ? "神父 · 偷看手牌" : "Priest · Peek"}
        </p>
        <h2 className="mt-1 font-heading text-xl font-bold text-primary-dark">
          {zh ? `${targetName} 的手牌` : `${targetName}'s hand`}
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          {zh
            ? "看清楚后再点确认，回合才会交给下一位。"
            : "Confirm after you have seen it — then the turn advances."}
        </p>

        <button
          type="button"
          onClick={onZoom}
          className="mx-auto mt-5 block w-[min(100%,220px)] cursor-pointer overflow-hidden rounded-xl border-4 border-[#5D4037] shadow-lg transition-transform hover:scale-[1.02]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardFaceUrl(rank)}
            alt={label}
            className="aspect-[5/7] w-full object-cover"
          />
        </button>
        <p className="mt-3 text-center font-heading text-lg font-bold text-primary-dark">
          <span className="text-accent">{rank}</span> · {label}
        </p>
        <p className="text-center text-[11px] text-stone-500">
          {zh ? "点击牌面可放大" : "Tap the card to enlarge"}
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-5 w-full cursor-pointer rounded-xl bg-accent py-3.5 font-heading text-sm font-bold text-white shadow-card hover:bg-accent-dark"
        >
          {zh ? "我看完了，确认" : "Got it — continue"}
        </button>
      </div>
    </div>
  );
}
