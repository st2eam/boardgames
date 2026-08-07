"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = {
  value?: number;
  bullheads?: number;
  faceDown?: boolean;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
};

const SIZE = {
  sm: "h-12 w-9 text-xs",
  md: "h-16 w-12 text-sm",
  lg: "h-20 w-[3.6rem] text-base",
} as const;

export function NimmtCard({
  value,
  bullheads = 1,
  faceDown,
  selected,
  size = "md",
  disabled,
  onClick,
}: Props) {
  const reduce = useReducedMotion();
  const clickable = Boolean(onClick) && !disabled;

  if (faceDown) {
    return (
      <div
        className={[
          "shrink-0 rounded-lg border-2 border-[#5D4037] bg-linear-to-br from-[#6D4C41] to-[#3E2723] shadow-sm",
          SIZE[size],
        ].join(" ")}
      />
    );
  }

  return (
    <motion.button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      className={[
        "relative shrink-0 rounded-lg border-2 bg-[#FFF8E7] font-heading font-black tabular-nums shadow-sm",
        SIZE[size],
        selected
          ? "border-accent ring-2 ring-accent/50 -translate-y-1"
          : "border-[#5D4037]/70",
        clickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-accent"
          : "cursor-default",
        disabled ? "opacity-45" : "",
      ].join(" ")}
      animate={
        reduce || !selected
          ? undefined
          : { y: [0, -2, 0] }
      }
      transition={{ duration: 0.35 }}
    >
      <span className="absolute inset-0 flex items-center justify-center text-primary-dark">
        {value}
      </span>
      <span
        className={[
          "absolute bottom-0.5 right-0.5 rounded px-0.5 font-heading text-[9px] font-bold leading-none",
          bullheads >= 5
            ? "bg-rose-600 text-white"
            : bullheads >= 2
              ? "bg-amber-500 text-white"
              : "bg-stone-300 text-stone-700",
        ].join(" ")}
      >
        {bullheads}
      </span>
    </motion.button>
  );
}
