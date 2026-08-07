"use client";

import { useEffect, useState } from "react";

/** Client-only media query; `false` during SSR / first paint. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Below Tailwind `lg` (1024px) — phone / small tablet portrait. */
export function useIsMobileLayout(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}
