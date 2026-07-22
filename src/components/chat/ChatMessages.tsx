"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "motion/react";
import { useChat } from "@/lib/chat/ChatProvider";
import type { ChatActivity, ChatMessage } from "@/lib/chat/types";
import { useTranslations } from "next-intl";

// ─── Sub-components ──────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:300ms]" />
    </div>
  );
}

function Spinner({ className = "border-accent/25 border-t-accent" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 ${className}`}
      aria-hidden
    />
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

function ActivityRow({ activity }: { activity: ChatActivity }) {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);

  if (activity.kind === "thinking") {
    const running = activity.status === "running";
    return (
      <div className="rounded-xl border border-stone-200/80 bg-white/70 px-2.5 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full cursor-pointer items-center gap-2 text-left text-xs text-stone-500"
        >
          {running ? <Spinner /> : (
            <span className="text-accent" aria-hidden>✦</span>
          )}
          <span className="flex-1">
            {running ? t("activityThinking") : t("activityThinkingDone")}
          </span>
          {activity.thinkingText ? (
            <span className="text-[10px] text-stone-400">
              {open ? t("hideThinking") : t("showThinking")}
            </span>
          ) : null}
        </button>
        {open && activity.thinkingText ? (
          <p className="mt-1.5 max-h-28 overflow-y-auto whitespace-pre-wrap border-t border-stone-100 pt-1.5 text-[11px] leading-relaxed text-stone-400">
            {activity.thinkingText}
          </p>
        ) : null}
      </div>
    );
  }

  if (activity.kind === "web_search") {
    if (activity.status === "error") {
      const detail =
        activity.errorCode === "unavailable"
          ? t("activityWebSearchUnavailable")
          : t("activityWebSearchFailed", {
              code: activity.errorCode || "unknown",
            });
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-2.5 py-2 text-xs text-amber-800">
          <div className="flex items-start gap-2">
            <span aria-hidden>⚠</span>
            <div className="min-w-0">
              <p className="font-medium">{t("activityWebSearchErrorTitle")}</p>
              <p className="mt-0.5 text-amber-700/90">{detail}</p>
              {activity.query ? (
                <p className="mt-1 truncate text-[11px] text-amber-700/70">
                  {t("activityWebSearchQuery", { query: activity.query })}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    if (activity.status === "done" && activity.results?.length) {
      return (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-2 text-xs text-emerald-900">
          <p className="mb-1.5 font-medium">
            {t("activityWebSearchResults", { count: activity.results.length })}
          </p>
          <ul className="space-y-1">
            {activity.results.slice(0, 5).map((r) => (
              <li key={r.url} className="truncate">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 underline decoration-emerald-300/60 underline-offset-2 hover:decoration-emerald-700"
                >
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 rounded-xl border border-sky-200/80 bg-sky-50/70 px-2.5 py-2 text-xs text-sky-800">
        <Spinner className="border-sky-300 border-t-sky-600" />
        <div className="min-w-0">
          <p className="font-medium">{t("activityWebSearch")}</p>
          {activity.query ? (
            <p className="truncate text-[11px] text-sky-700/80">
              {t("activityWebSearchQuery", { query: activity.query })}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (activity.kind === "get_game_rules") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-violet-200/80 bg-violet-50/70 px-2.5 py-2 text-xs text-violet-800">
        {activity.status === "running" ? (
          <Spinner className="border-violet-300 border-t-violet-600" />
        ) : (
          <span aria-hidden>✓</span>
        )}
        <span>
          {activity.status === "running"
            ? t("activityGetGameRules")
            : t("activityGetGameRulesDone")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white/70 px-2.5 py-2 text-xs text-stone-600">
      {activity.status === "running" ? <Spinner /> : <span aria-hidden>•</span>}
      <span>
        {activity.status === "running"
          ? t("activityToolUse", { name: activity.toolName || "tool" })
          : t("activityToolUseDone", { name: activity.toolName || "tool" })}
      </span>
    </div>
  );
}

function AssistantBubble({
  msg,
  isStreamingTail,
}: {
  msg: ChatMessage;
  isStreamingTail: boolean;
}) {
  const activities = msg.activities ?? [];
  const hasContent = Boolean(msg.content);
  const showTyping =
    isStreamingTail && !hasContent && activities.every((a) => a.status !== "running");

  return (
    <div className="max-w-[85%] space-y-2 rounded-2xl rounded-bl-md bg-stone-100 px-3.5 py-2.5 text-sm leading-relaxed text-stone-800">
      {activities.length > 0 && (
        <div className="space-y-1.5">
          {activities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </div>
      )}
      {hasContent ? <MarkdownBubble content={msg.content} /> : null}
      {showTyping ? <TypingIndicator /> : null}
      {!hasContent &&
        !showTyping &&
        activities.some((a) => a.status === "running") === false &&
        activities.length === 0 && <TypingIndicator />}
    </div>
  );
}

/** Renders markdown inside assistant bubbles. */
function MarkdownBubble({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-1.5 mt-3 text-base font-bold first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-1 mt-2.5 text-sm font-bold first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 mt-2 text-sm font-semibold first:mt-0">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="mb-1 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-1 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-stone-900">{children}</strong>
        ),
        code: ({ children, className }) => {
          const inline =
            !className ||
            (!String(className).includes("language") &&
              !String(className).includes("hljs"));
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
          <td className="border-t border-stone-200 px-2 py-1">{children}</td>
        ),
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
  const { messages, isStreaming } = useChat();
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
  }, [messages, isStreaming]);

  const visibleMessages = messages.filter(
    (m) =>
      m.role === "user" ||
      (m.role === "assistant" &&
        (Boolean(m.content) || (m.activities?.length ?? 0) > 0))
  );

  const hasMessages = visibleMessages.length > 0;
  const lastVisible = visibleMessages[visibleMessages.length - 1];
  const showWaitingRow =
    isStreaming &&
    (!lastVisible ||
      lastVisible.role === "user" ||
      (lastVisible.role === "assistant" &&
        !lastVisible.content &&
        !(lastVisible.activities?.length)));

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
          {visibleMessages.map((msg, index) => {
            const isTail =
              isStreaming && index === visibleMessages.length - 1 && msg.role === "assistant";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && <AssistantAvatar />}
                {msg.role === "user" ? (
                  <div className="max-w-[78%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm shadow-accent/20">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <AssistantBubble msg={msg} isStreamingTail={isTail} />
                )}
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
            );
          })}

          {showWaitingRow && (
            <div className="flex justify-start">
              <AssistantAvatar />
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
