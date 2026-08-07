"use client";

import { useState } from "react";
import type { AiChatMessage } from "@bbge/runtime";

interface Props {
  locale: string;
  chat: AiChatMessage[];
  thinkingId: string | null;
  onSend: (text: string) => void;
}

export function TableChrome({ locale, chat, thinkingId, onSend }: Props) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(true);
  const zh = locale === "zh";

  return (
    <div className="rounded-2xl border border-border bg-white/95 shadow-card backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors duration-200 hover:bg-surface"
      >
        <span className="font-heading text-sm font-bold text-primary-dark">
          {zh ? "桌边聊天" : "Table talk"}
          {chat.length > 0 ? (
            <span className="ml-2 rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
              {chat.length}
            </span>
          ) : null}
        </span>
        {thinkingId && (
          <span className="mr-3 animate-pulse rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
            {zh ? `${thinkingId} 思考中` : `${thinkingId} thinking`}
          </span>
        )}
        <svg
          className={`h-4 w-4 text-stone-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
        <div className="border-t border-border px-4 pb-4 pt-2">
          <div className="mb-3 max-h-28 space-y-2 overflow-y-auto">
            {chat.length === 0 && (
              <p className="text-xs text-stone-400">
                {zh ? "还没有人说话" : "No messages yet"}
              </p>
            )}
            {chat.map((m, i) => (
              <div
                key={`${m.at}-${i}`}
                className="flex gap-2 rounded-xl bg-surface px-3 py-2 text-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-white">
                  {m.playerId.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-[11px] font-semibold text-accent-dark">
                    {m.playerId}
                  </p>
                  <p className="text-primary-dark">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              onSend(text.trim());
              setText("");
            }}
          >
            <input
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={zh ? "说点什么…" : "Say something…"}
            />
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-primary px-4 py-2.5 font-heading text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-dark"
            >
              {zh ? "发送" : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
