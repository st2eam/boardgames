"use client";

import { useEffect, type RefObject } from "react";

export type UseScrollActiveSeatIntoViewOptions = {
  /** Seat currently to act. */
  activeSeatId: string | null | undefined;
  /** Only scroll while true (e.g. phase === "playing"). */
  enabled?: boolean;
  /** Prefer smooth scroll when true. */
  smooth?: boolean;
  /** One or more scroll roots that contain `[data-seat-id]`. */
  roots: Array<RefObject<HTMLElement | null>>;
  /** Extra deps that remount seats (hand/round). */
  resetKey?: string | number;
};

/**
 * Scroll the acting seat into view inside a horizontal rail or vertical stack.
 * Seats must expose `data-seat-id`.
 */
export function useScrollActiveSeatIntoView({
  activeSeatId,
  enabled = true,
  smooth = true,
  roots,
  resetKey,
}: UseScrollActiveSeatIntoViewOptions): void {
  useEffect(() => {
    if (!enabled || !activeSeatId) return;
    const opts: ScrollIntoViewOptions = {
      behavior: smooth ? "smooth" : "auto",
      inline: "center",
      block: "nearest",
    };
    for (const rootRef of roots) {
      const root = rootRef.current;
      if (!root) continue;
      const el = root.querySelector<HTMLElement>(
        `[data-seat-id="${CSS.escape(activeSeatId)}"]`,
      );
      if (el) {
        el.scrollIntoView(opts);
        return;
      }
    }
    // roots are refs — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSeatId, enabled, smooth, resetKey]);
}
