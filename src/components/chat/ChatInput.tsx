"use client";

import { useState, useRef } from "react";
import { useChat } from "@/lib/chat/ChatProvider";
import { useTranslations } from "next-intl";

export function ChatInput() {
  const { sendMessage, isStreaming, apiKey } = useChat();
  const t = useTranslations("chat");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !apiKey) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
    // Refocus after send
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (!apiKey) {
    return (
      <div className="shrink-0 border-t border-stone-100 bg-amber-50/50 px-4 py-3">
        <p className="text-center text-xs text-amber-700">{t("noApiKey")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-stone-100 bg-white px-3 py-3"
    >
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          disabled={isStreaming}
          autoComplete="off"
          className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-accent/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-accent text-white shadow-sm shadow-accent/20 transition-all hover:bg-accent/90 hover:shadow-accent/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
          aria-label={t("save")}
        >
          {isStreaming ? (
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
