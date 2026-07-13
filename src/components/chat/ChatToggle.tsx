"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import type { ChatScope } from "@/lib/chat/types";

const LazyChatIsland = dynamic(
  () => import("./ChatIsland").then((m) => ({ default: m.ChatIsland })),
  { ssr: false }
);

interface Props {
  scope: ChatScope;
  locale: string;
}

export function ChatToggle({ scope, locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-stone-900/10 backdrop-blur-sm transition-all duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      {/* Chat island - lazy loaded on first open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[88px] right-4 z-50 w-[calc(100vw-2rem)] max-w-[400px] origin-bottom-right"
          >
            <LazyChatIsland scope={scope} locale={locale} onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button - always rendered, no heavy deps */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 flex items-center justify-center rounded-2xl shadow-lg transition-all duration-300 motion-reduce:transition-none cursor-pointer ${
          isOpen
            ? "h-12 w-12 rotate-90 bg-stone-700 text-white shadow-stone-400/20 hover:bg-stone-800"
            : `h-14 w-14 bg-accent text-white shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${
                mounted ? "scale-100 opacity-100" : "scale-75 opacity-0"
              }`
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Close icon */}
        <svg
          className={`absolute h-5 w-5 transition-all duration-300 motion-reduce:transition-none ${
            isOpen ? "scale-100 rotate-0 opacity-100" : "scale-75 -rotate-90 opacity-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>

        {/* Chat icon */}
        <svg
          className={`absolute h-[22px] w-[22px] transition-all duration-300 motion-reduce:transition-none ${
            isOpen ? "scale-75 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 9h.008" strokeWidth="2.5" />
          <path d="M12 9h.008" strokeWidth="2.5" />
          <path d="M16 9h.008" strokeWidth="2.5" />
        </svg>
      </button>
    </>
  );
}
