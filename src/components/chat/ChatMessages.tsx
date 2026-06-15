"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/lib/chat/ChatProvider";
import { useTranslations } from "next-intl";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:300ms]" />
    </div>
  );
}

function EmptyState({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
        <svg
          className="h-7 w-7 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-stone-500">{placeholder}</p>
      <p className="mt-1 text-xs text-stone-400">Powered by DeepSeek</p>
    </div>
  );
}

export function ChatMessages() {
  const { messages, isStreaming } = useChat();
  const t = useTranslations("chat");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track auto-scroll: only auto-scroll when user is near bottom
  const isNearBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    if (isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const hasMessages = messages.some(
    (m) => m.role === "user" || m.role === "assistant"
  );

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto"
      aria-live="polite"
    >
      {!hasMessages && !isStreaming ? (
        <EmptyState placeholder={t("placeholder")} />
      ) : (
        <div className="flex flex-col gap-3 px-4 py-4">
          {messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <svg
                      className="h-3.5 w-3.5 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                      />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-accent text-white shadow-sm shadow-accent/20"
                      : msg.content
                        ? "rounded-bl-md bg-stone-100 text-stone-800"
                        : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {msg.content || <TypingIndicator />}
                </div>
                {msg.role === "user" && (
                  <div className="ml-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-stone-200">
                    <svg
                      className="h-3.5 w-3.5 text-stone-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}

          {/* Streaming placeholder */}
          {isStreaming &&
            messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <svg
                    className="h-3.5 w-3.5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                </div>
                <div className="rounded-2xl rounded-bl-md bg-stone-100 px-3.5 py-2.5">
                  <TypingIndicator />
                </div>
              </div>
            )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
