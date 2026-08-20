"use client";

import { useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";

interface Props {
  counts: number[];
  value: number | null;
  onChange: (n: number | null) => void;
  anyLabel: string;
}

export function PlayerCountSlider({ counts, value, onChange, anyLabel }: Props) {
  const min = counts[0];
  const max = counts[counts.length - 1];
  const current = value ?? min;
  const pct = max > min ? ((current - min) / (max - min)) * 100 : 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = parseInt(e.target.value, 10);
      onChange(n);
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="relative flex h-5 items-center overflow-hidden text-sm font-semibold text-emerald-600">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value === null ? "any" : value}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="tabular-nums"
            >
              {value === null ? anyLabel : value}
            </motion.span>
          </AnimatePresence>
        </span>
        {value !== null && (
          <button
            onClick={() => onChange(null)}
            className="cursor-pointer text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            {anyLabel}
          </button>
        )}
      </div>
      <div className="relative flex h-4 items-center">
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{ width: value === null ? "0%" : `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={current}
          onChange={handleChange}
          className="relative z-10 m-0 h-4 w-full cursor-pointer appearance-none bg-transparent p-0
            [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-500 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm"
        />
      </div>
      <div className="flex justify-between text-[10px] tabular-nums text-stone-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
