"use client";

import { useState } from "react";
import { useChat } from "@/lib/chat/ChatProvider";
import { useTranslations } from "next-intl";

export function ChatInput() {
  const { sendMessage, isStreaming, apiKey } = useChat();
  const t = useTranslations("chat");
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !apiKey) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-zinc-100 px-4 py-3"
    >
      {!apiKey ? (
        <p className="text-center text-xs text-amber-600">{t("noApiKey")}</p>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            disabled={isStreaming}
            className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      )}
    </form>
  );
}
