"use client";

import { AnimatePresence, motion } from "motion/react";

interface Props {
  text: string;
  /** Remount / restart animation when this changes */
  bubbleKey: string;
}

/** Compact speech bubble beside an avatar. */
export function SpeechBubble({ text, bubbleKey }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={bubbleKey}
        initial={{ opacity: 0, y: 4, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -2, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        className="relative max-w-[11rem] rounded-xl rounded-bl-sm border border-[#5D4037]/20 bg-[#FFF8E7] px-2 py-1.5 shadow-sm"
      >
        <p className="text-[11px] leading-snug text-primary-dark">{text}</p>
        <span
          className="absolute -left-1 bottom-2 h-2 w-2 rotate-45 border-b border-l border-[#5D4037]/20 bg-[#FFF8E7]"
          aria-hidden
        />
      </motion.div>
    </AnimatePresence>
  );
}
