"use client";

import { useEffect, useRef, useState } from "react";
import type { AiChatMessage } from "@bbge/runtime";

interface Props {
  locale: string;
  chat: AiChatMessage[];
  thinkingId: string | null;
  onSend: (text: string) => void;
  /** Resolve seat id → display name when available */
  nameOf?: (playerId: string) => string;
}

export function TableChrome({
  locale,
  chat,
  thinkingId,
  onSend,
  nameOf,
}: Props) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const zh = locale === "zh";

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chat.length]);

  return (
    <div className="pointer-events-auto flex max-h-[min(280px,42%)] w-[min(260px,calc(100%-1rem))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#1a120e]/92 shadow-lg backdrop-blur-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="font-heading text-xs font-bold text-amber-50">
          {zh ? "桌边" : "Talk"}
          {chat.length > 0 ? (
            <span className="ml-1.5 text-accent">{chat.length}</span>
          ) : null}
        </span>
        {thinkingId && (
          <span className="truncate text-[10px] font-semibold text-amber-200/90 animate-pulse">
            {zh ? "思考中…" : "Thinking…"}
          </span>
        )}
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-amber-100/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="flex min-h-0 flex-1 flex-col border-t border-white/10 px-2.5 pb-2.5 pt-1.5">
          <div
            ref={listRef}
            className="mb-2 max-h-36 min-h-[4.5rem] space-y-1.5 overflow-y-auto"
          >
            {chat.length === 0 && (
              <p className="px-1 text-[11px] text-amber-100/45">
                {zh ? "出牌后 AI 会说话，你也可以发一句" : "AI talks after plays — or send a line"}
              </p>
            )}
            {chat.map((m, i) => {
              const name = nameOf?.(m.playerId) ?? m.playerId;
              return (
                <div
                  key={`${m.at}-${i}`}
                  className="rounded-lg bg-white/8 px-2 py-1.5 text-[12px] leading-snug"
                >
                  <p className="font-heading text-[10px] font-semibold text-accent">
                    {name}
                  </p>
                  <p className="text-amber-50/95">{m.text}</p>
                </div>
              );
            })}
          </div>
          <form
            className="flex gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              onSend(text.trim());
              setText("");
            }}
          >
            <input
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-[12px] text-amber-50 placeholder:text-amber-100/35"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={zh ? "说一句…" : "Say…"}
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-accent px-2.5 py-1.5 font-heading text-[11px] font-bold text-[#1a120e] transition-opacity hover:opacity-90"
            >
              {zh ? "发" : "Go"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
