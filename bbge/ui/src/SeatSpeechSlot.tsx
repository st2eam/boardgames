"use client";

import { AnimatePresence, motion } from "motion/react";
import type { SeatBubble } from "./useSeatBubbles";

export type SeatSpeechSlotProps = {
  bubble?: SeatBubble | null;
  /** Extra classes on the fixed-height slot. */
  className?: string;
  /** Visual style: dark felt chip (holdem/go) vs cream tip (love letter). */
  variant?: "felt" | "cream";
};

/**
 * Fixed-height speech slot so bubble on/off does not resize seat chrome.
 */
export function SeatSpeechSlot({
  bubble,
  className,
  variant = "felt",
}: SeatSpeechSlotProps) {
  const slotClass = [
    "relative mb-0.5 h-8 w-full shrink-0 sm:mb-1 sm:h-9",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "cream") {
    return (
      <div className={slotClass}>
        <AnimatePresence mode="wait">
          {bubble ? (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, y: 4, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -2, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-full"
            >
              <div className="relative mx-auto max-w-[11rem] rounded-xl rounded-bl-sm border border-[#5D4037]/20 bg-[#FFF8E7] px-2 py-1.5 shadow-sm">
                <p className="line-clamp-2 break-words text-[11px] leading-snug text-primary-dark">
                  {bubble.text}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={slotClass}>
      <AnimatePresence>
        {bubble ? (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-[#3E2723] px-1.5 text-center font-heading text-[10px] font-bold leading-tight text-amber-50 shadow-sm sm:px-2 sm:text-[11px]"
          >
            <span className="line-clamp-2 break-words">{bubble.text}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
