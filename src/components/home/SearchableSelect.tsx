"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  placeholder: string;
  accentClass?: string;
  selectedBgClass?: string;
  optionBgClass?: string;
}

export function SearchableSelect({
  options,
  selected,
  onToggle,
  placeholder,
  accentClass = "bg-accent text-white",
  selectedBgClass = "bg-accent/10 text-accent-dark",
  optionBgClass = "hover:bg-stone-50",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
      setQuery("");
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex min-h-[36px] cursor-pointer flex-wrap items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1.5 transition-colors hover:border-stone-300 focus-within:border-stone-400 focus-within:ring-1 focus-within:ring-stone-300"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        {Array.from(selected).map((val) => (
          <span
            key={val}
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium ${selectedBgClass}`}
          >
            {val}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(val);
              }}
              className="ml-0.5 cursor-pointer text-current opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={selected.size === 0 ? placeholder : ""}
          className="min-w-[60px] flex-1 border-none bg-transparent text-xs text-stone-700 outline-none placeholder:text-stone-400"
        />
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-stone-400">—</div>
          ) : (
            filtered.map((opt) => {
              const isSelected = selected.has(opt);
              return (
                <button
                  key={opt}
                  onClick={() => {
                    onToggle(opt);
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                    isSelected ? selectedBgClass : `text-stone-600 ${optionBgClass}`
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? `${accentClass} border-transparent`
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  {opt}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
