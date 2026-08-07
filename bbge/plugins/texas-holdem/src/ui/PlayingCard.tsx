"use client";

import { motion, useReducedMotion } from "motion/react";

const SUIT_GLYPH: Record<string, string> = {
  s: "♠",
  h: "♥",
  d: "♦",
  c: "♣",
};

const SUIT_COLOR: Record<string, string> = {
  s: "#1a1a1a",
  h: "#c62828",
  d: "#c62828",
  c: "#1a1a1a",
};

function rankChar(rank: number): string {
  if (rank <= 9) return String(rank);
  return ({ 10: "T", 11: "J", 12: "Q", 13: "K", 14: "A" } as const)[
    rank as 10 | 11 | 12 | 13 | 14
  ];
}

type Props = {
  rank?: number;
  suit?: string;
  faceDown?: boolean;
  size?: "sm" | "md" | "lg";
  folded?: boolean;
  dealDelay?: number;
  flip?: boolean;
};

const SIZES = {
  sm: "h-14 w-10 text-[11px]",
  md: "h-[4.5rem] w-[3.2rem] text-sm",
  lg: "h-24 w-[4.25rem] text-base",
};

export function PlayingCard({
  rank,
  suit,
  faceDown,
  size = "md",
  folded,
  dealDelay = 0,
  flip,
}: Props) {
  const reduce = useReducedMotion();
  const red = suit === "h" || suit === "d";

  if (faceDown || rank == null || !suit) {
    return (
      <motion.div
        className={[
          SIZES[size],
          "rounded-lg border-2 border-[#3E2723]/40 bg-gradient-to-br from-[#1a237e] to-[#0d47a1] shadow-md",
          folded ? "opacity-40" : "",
        ].join(" ")}
        initial={reduce ? false : { y: -40, opacity: 0, scale: 0.7 }}
        animate={{ y: 0, opacity: folded ? 0.4 : 1, scale: 1 }}
        transition={{ delay: dealDelay, type: "spring", stiffness: 280, damping: 20 }}
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,.08) 0 2px, transparent 2px 6px)",
        }}
      />
    );
  }

  return (
    <motion.div
      className={[
        SIZES[size],
        "relative flex flex-col justify-between rounded-lg border border-stone-300 bg-[#fffef8] p-1 shadow-md",
        folded ? "opacity-35 grayscale" : "",
      ].join(" ")}
      style={{ color: SUIT_COLOR[suit] ?? "#111" }}
      initial={
        reduce
          ? false
          : flip
            ? { rotateY: -90, opacity: 0.3 }
            : { y: -36, opacity: 0, scale: 0.75 }
      }
      animate={{ rotateY: 0, y: 0, opacity: folded ? 0.35 : 1, scale: 1 }}
      transition={{
        delay: dealDelay,
        type: "spring",
        stiffness: 260,
        damping: 18,
      }}
    >
      <div className="font-heading font-bold leading-none">
        {rankChar(rank)}
        <span className="ml-0.5">{SUIT_GLYPH[suit]}</span>
      </div>
      <div
        className={`self-center font-heading ${size === "lg" ? "text-2xl" : "text-lg"} ${red ? "" : ""}`}
      >
        {SUIT_GLYPH[suit]}
      </div>
      <div className="self-end rotate-180 font-heading font-bold leading-none">
        {rankChar(rank)}
        <span className="ml-0.5">{SUIT_GLYPH[suit]}</span>
      </div>
    </motion.div>
  );
}
