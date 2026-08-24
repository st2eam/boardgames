"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

function cx(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

/**
 * A single, touch-scrollable row for seats, cards, or tiles.
 * It deliberately only wraps at desktop widths: wrapping variable-length
 * content inside a viewport-locked play table is the main source of clipped UI.
 */
export const PlayHorizontalRail = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { children: ReactNode }
>(function PlayHorizontalRail({ children, className, ...props }, ref) {
  return (
    <div
      ref={ref}
      {...props}
      className={cx(
        "-mx-1 flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:justify-center lg:overflow-visible",
        className,
      )}
    >
      {children}
    </div>
  );
});

/** A bounded board/public area. Its content can grow without being clipped. */
export const PlayScrollableRegion = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { children: ReactNode }
>(function PlayScrollableRegion({ children, className, ...props }, ref) {
  return (
    <div
      ref={ref}
      {...props}
      className={cx(
        "min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [scrollbar-gutter:stable]",
        className,
      )}
    >
      {children}
    </div>
  );
});

/**
 * Bottom action area for viewport-locked game tables. It is deliberately a
 * flex item (not `position: fixed`) so it works inside every plugin shell.
 */
export const PlayActionDock = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { children: ReactNode }
>(function PlayActionDock({ children, className, ...props }, ref) {
  return (
    <div
      ref={ref}
      {...props}
      className={cx(
        "shrink-0 border-t border-border/70 bg-white/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3",
        className,
      )}
    >
      {children}
    </div>
  );
});
