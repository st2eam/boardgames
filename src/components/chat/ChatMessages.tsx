"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "motion/react";
import { useChat } from "@/lib/chat/ChatProvider";
import { useTranslations } from "next-intl";

// ─── Sub-components ──────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:300ms]" />
    </div>
  );
}

function ToolStatusIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-0.5 text-xs text-stone-500">
      <span
        className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-accent/25 border-t-accent"
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}

function AssistantAvatar() {
  return (
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

/** Renders markdown inside assistant bubbles. Tailwind prose reset isn't used
 *  because the bubble has its own bg — we define inline styles instead. */
function MarkdownBubble({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings — smaller scale since we're in a chat bubble
        h1: ({ children }) => (
          <h1 className="mb-1.5 mt-3 text-base font-bold first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-1 mt-2.5 text-sm font-bold first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 mt-2 text-sm font-semibold first:mt-0">{children}</h3>
        ),
        // Paragraph
        p: ({ children }) => (
          <p className="mb-1 last:mb-0">{children}</p>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="mb-1 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-1 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>
        ),
        // Inline
        strong: ({ children }) => (
          <strong className="font-semibold text-stone-900">{children}</strong>
        ),
        code: ({ children, className }) => {
          const inline =
            !className || (!String(className).includes("language") && !String(className).includes("hljs"));
          return inline ? (
            <code className="rounded bg-stone-200/70 px-1 py-0.5 text-[12px] text-stone-700">
              {children}
            </code>
          ) : (
            <pre className="mb-1.5 mt-1 overflow-x-auto rounded-lg bg-stone-200/60 p-2.5 text-[12px] leading-relaxed last:mb-0">
              <code className={className}>{children}</code>
            </pre>
          );
        },
        // Table
        table: ({ children }) => (
          <div className="mb-1.5 mt-1 overflow-x-auto last:mb-0">
            <table className="min-w-full border-collapse text-[12px]">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-stone-300">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-2 py-1 text-left font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-2 py-1">{children}</td>
        ),
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="mb-1 border-l-2 border-amber-400/60 pl-3 italic text-stone-600 last:mb-0">
            {children}
          </blockquote>
        ),
        // Horizontal rule
        hr: () => <hr className="my-2 border-stone-300" />,
        // Link
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────

export function ChatMessages() {
  const { messages, isStreaming, streamStatus } = useChat();
  const t = useTranslations("chat");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isNearBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    if (isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamStatus, isStreaming]);

  const visibleMessages = messages.filter(
    (m) => m.role === "user" || (m.role === "assistant" && Boolean(m.content))
  );

  const hasMessages = visibleMessages.length > 0;
  const lastVisible = visibleMessages[visibleMessages.length - 1];
  const showStatusRow =
    isStreaming &&
    (Boolean(streamStatus) || !lastVisible || lastVisible.role === "user");

  const statusLabel =
    streamStatus === "web_search"
      ? t("statusWebSearch")
      : streamStatus === "get_game_rules"
        ? t("statusGetGameRules")
        : streamStatus === "tool_use"
          ? t("statusToolUse")
          : t("thinking");

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
          {visibleMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && <AssistantAvatar />}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-accent text-white shadow-sm shadow-accent/20"
                      : "rounded-bl-md bg-stone-100 text-stone-800"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownBubble content={msg.content} />
                  )}
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
              </motion.div>
            ))}

          {showStatusRow && (
            <div className="flex justify-start">
              <AssistantAvatar />
              <div className="rounded-2xl rounded-bl-md bg-stone-100 px-3.5 py-2.5">
                {streamStatus ? (
                  <ToolStatusIndicator label={statusLabel} />
                ) : (
                  <TypingIndicator />
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
