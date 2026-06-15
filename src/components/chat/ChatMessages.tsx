"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/lib/chat/ChatProvider";
import { useTranslations } from "next-intl";

export function ChatMessages() {
  const { messages, isStreaming } = useChat();
  const t = useTranslations("chat");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" aria-live="polite">
      {messages.length === 0 && !isStreaming && (
        <p className="py-8 text-center text-sm text-stone-400">
          {t("placeholder")}
        </p>
      )}
      {messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-white"
                  : "bg-stone-100 text-stone-800"
              }`}
            >
              {msg.content || (
                <span className="inline-flex items-center gap-1 text-stone-400">
                  <span className="animate-pulse">{t("thinking")}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      <div ref={bottomRef} />
    </div>
  );
}
