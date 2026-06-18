"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/lib/chat/ChatProvider";
import { useTranslations } from "next-intl";

export function ChatInput() {
  const { sendMessage, isStreaming, apiKey } = useChat();
  const t = useTranslations("chat");
  const [input, setInput] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !apiKey || isOffline) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (isOffline) {
    return (
      <div className="shrink-0 border-t border-stone-100 bg-stone-50/80 px-4 py-3">
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l8.735 8.735m0 0a.374.374 0 11.53.53m-.53-.53l.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 010 5.304m2.121-7.425a6.75 6.75 0 010 9.546m2.121-11.667C21.004 7.21 22.5 9.515 22.5 12s-1.496 4.79-3.606 6.894" />
          </svg>
          <span>{t("offlineMode")}</span>
        </div>
      </div>
    );
  }

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
