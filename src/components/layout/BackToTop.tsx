"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`cursor-pointer fixed right-4 bottom-20 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-border shadow-card text-stone-400 hover:text-primary hover:border-amber-300 hover:shadow-card-hover transition-all duration-300 motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-90 pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
