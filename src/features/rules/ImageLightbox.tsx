"use client";

/* eslint-disable @next/next/no-img-element -- Rule illustrations use dynamic public-file paths in a static export. */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

type View = { scale: number; x: number; y: number };
type Point = { x: number; y: number };

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function clampPan(x: number, y: number, scale: number) {
  if (typeof window === "undefined" || scale <= MIN_SCALE) {
    return { x: 0, y: 0 };
  }

  const maxX = (window.innerWidth * (scale - 1)) / 2 + 24;
  const maxY = (window.innerHeight * (scale - 1)) / 2 + 24;
  return {
    x: clamp(x, -maxX, maxX),
    y: clamp(y, -maxY, maxY),
  };
}

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, onClose }: Props) {
  const t = useTranslations("game");
  const [view, setViewState] = useState<View>({ scale: MIN_SCALE, x: 0, y: 0 });
  const [failed, setFailed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const viewRef = useRef(view);
  const pointersRef = useRef(new Map<number, Point>());
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);
  const pinchRef = useRef<{
    distance: number;
    scale: number;
    x: number;
    y: number;
  } | null>(null);

  const setView = useCallback((next: View) => {
    const scale = clamp(next.scale, MIN_SCALE, MAX_SCALE);
    const pan = clampPan(next.x, next.y, scale);
    const normalized = { scale, ...pan };
    viewRef.current = normalized;
    setViewState(normalized);
  }, []);

  const zoomTo = useCallback(
    (scale: number) => {
      const current = viewRef.current;
      setView({
        scale,
        x: scale <= MIN_SCALE ? 0 : current.x,
        y: scale <= MIN_SCALE ? 0 : current.y,
      });
    },
    [setView],
  );

  const reset = useCallback(() => setView({ scale: MIN_SCALE, x: 0, y: 0 }), [setView]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    closeButtonRef.current?.focus();

    const focusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.tabIndex !== -1);

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    root.addEventListener("keydown", trapFocus);
    return () => root.removeEventListener("keydown", trapFocus);
  }, []);

  const setPinchStart = () => {
    const points = [...pointersRef.current.values()];
    if (points.length < 2) return;
    const [first, second] = points;
    pinchRef.current = {
      distance: Math.hypot(second.x - first.x, second.y - first.y),
      ...viewRef.current,
    };
    dragRef.current = null;
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size >= 2) {
      setPinchStart();
      return;
    }

    const current = viewRef.current;
    if (current.scale > MIN_SCALE) {
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: current.x,
        y: current.y,
      };
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const points = [...pointersRef.current.values()];
      const [first, second] = points;
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const start = pinchRef.current;
      if (start.distance > 0) {
        setView({
          scale: start.scale * (distance / start.distance),
          x: start.x,
          y: start.y,
        });
      }
      return;
    }

    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setView({
      scale: viewRef.current.scale,
      x: drag.x + event.clientX - drag.startX,
      y: drag.y + event.clientY - drag.startY,
    });
  };

  const finishPointer = (event: PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    dragRef.current = null;

    const remaining = [...pointersRef.current.entries()];
    if (remaining.length === 1 && viewRef.current.scale > MIN_SCALE) {
      const [pointerId, point] = remaining[0];
      dragRef.current = {
        pointerId,
        startX: point.x,
        startY: point.y,
        x: viewRef.current.x,
        y: viewRef.current.y,
      };
    }
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoomTo(viewRef.current.scale + (event.deltaY < 0 ? 0.25 : -0.25));
  };

  const onDoubleClick = () => {
    if (viewRef.current.scale > MIN_SCALE) {
      reset();
    } else {
      zoomTo(2);
    }
  };

  const isReset = view.scale === MIN_SCALE && view.x === 0 && view.y === 0;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={alt || t("imagePreview")}
        className="relative z-10 flex h-full w-full flex-col"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-3 sm:p-5">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/15 bg-stone-900/85 p-1.5 shadow-dialog backdrop-blur">
            <button
              type="button"
              aria-label={t("zoomOutImage")}
              disabled={view.scale <= MIN_SCALE}
              onClick={() => zoomTo(view.scale - 0.5)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-xl font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              −
            </button>
            <button
              type="button"
              aria-label={t("resetImageZoom")}
              disabled={isReset}
              onClick={reset}
              className="min-w-14 cursor-pointer rounded-xl px-2 py-2 text-xs font-semibold tabular-nums text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {Math.round(view.scale * 100)}%
            </button>
            <button
              type="button"
              aria-label={t("zoomInImage")}
              disabled={view.scale >= MAX_SCALE}
              onClick={() => zoomTo(view.scale + 0.5)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-xl font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              +
            </button>
            <span className="mx-0.5 h-6 w-px bg-white/15" aria-hidden="true" />
            <button
              ref={closeButtonRef}
              type="button"
              aria-label={t("closeImage")}
              onClick={onClose}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-white hover:bg-white/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div
          data-testid="image-lightbox-backdrop"
          className={`flex min-h-0 flex-1 touch-none select-none items-center justify-center overflow-hidden px-4 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24 ${view.scale > MIN_SCALE ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
          onWheel={onWheel}
          onDoubleClick={onDoubleClick}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          {failed ? (
            <p className="max-w-sm rounded-2xl border border-white/15 bg-stone-900/85 px-5 py-4 text-center text-sm text-white">
              {t("imageUnavailable")}
            </p>
          ) : (
            <img
              src={src}
              alt={alt}
              draggable={false}
              onError={() => setFailed(true)}
              onDragStart={(event) => event.preventDefault()}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-150 motion-reduce:transition-none"
              style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}
            />
          )}
        </div>

        {alt ? (
          <p className="pointer-events-none absolute inset-x-4 bottom-3 z-10 text-center text-sm text-white/85 drop-shadow sm:bottom-5">
            {alt}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
