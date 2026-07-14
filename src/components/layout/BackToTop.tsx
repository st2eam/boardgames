"use client";

import { useEffect, useState } from "react";
import { getChatOpen, subscribeChatOpen } from "@/lib/floating-ui";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [chatOpen, setChatOpenState] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setChatOpenState(getChatOpen());
    return subscribeChatOpen(setChatOpenState);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const show = visible && !chatOpen;

  return (
    <button
      onClick={scrollToTop}
      className={`cursor-pointer fixed right-4 bottom-20 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-border shadow-card text-stone-400 hover:text-primary hover:border-amber-300 hover:shadow-card-hover transition-all duration-300 motion-reduce:transition-none ${
        show
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-90 pointer-events-none"
      }`}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
