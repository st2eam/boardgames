"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChatProvider, useChat } from "@/components/chat/ChatProvider";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ApiKeyModal } from "@/components/chat/ApiKeyModal";
import type { ChatScope } from "@/lib/chat/types";

interface Props {
  locale: string;
  boardContext: string;
  suggestedPrompts: string[];
}

/** In-table Go teacher: no FAB — messages + input live in the play sidebar. */
export function GoTutorPanel({ locale, boardContext, suggestedPrompts }: Props) {
  const zh = locale === "zh";
  const scope: ChatScope = {
    type: "game",
    slug: "go",
    gameName: zh ? "围棋" : "Go",
    boardContext,
    suggestedPrompts,
  };

  return (
    <ChatProvider scope={scope} locale={locale}>
      <GoTutorPanelInner
        suggestedPrompts={suggestedPrompts}
        locale={locale}
      />
    </ChatProvider>
  );
}

function GoTutorPanelInner({
  suggestedPrompts,
  locale,
}: {
  suggestedPrompts: string[];
  locale: string;
}) {
  const t = useTranslations("chat");
  const zh = locale === "zh";
  const {
    sendMessage,
    isStreaming,
    apiKey,
    apiKeyLoaded,
    clearHistory,
  } = useChat();
  const [input, setInput] = useState("");
  const [showKey, setShowKey] = useState(false);

  const submit = async () => {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    if (!apiKey) {
      setShowKey(true);
      return;
    }
    setInput("");
    await sendMessage(msg);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-stone-50/80">
      <div className="flex shrink-0 items-center justify-between border-b border-border/80 px-2.5 py-1.5">
        <p className="font-heading text-xs font-bold text-primary-dark">
          {t("goTutorTitle")}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowKey(true)}
            className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-medium text-stone-500 hover:bg-white hover:text-primary-dark"
          >
            API
          </button>
          <button
            type="button"
            onClick={() => void clearHistory()}
            className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-medium text-stone-500 hover:bg-white hover:text-primary-dark"
          >
            {t("clearHistory")}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden [&_.px-4]:px-2 [&_.py-4]:py-2 [&_.text-sm]:text-xs">
        <ChatMessages />
      </div>

      {apiKeyLoaded && apiKey && suggestedPrompts.length > 0 && (
        <div className="shrink-0 border-t border-border/60 px-2 py-1.5">
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-stone-400">
            {t("goTutorHint")}
          </p>
          <div className="flex flex-wrap gap-1">
            {suggestedPrompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isStreaming}
                onClick={() => void sendMessage(prompt)}
                className="cursor-pointer rounded-full border border-border bg-white px-2 py-0.5 text-[10px] font-medium text-primary-dark hover:border-accent/40 hover:bg-accent/5 disabled:opacity-40"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="flex shrink-0 gap-1 border-t border-border/80 bg-white p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1.5 text-xs"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("goTutorPlaceholder")}
          disabled={isStreaming}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="cursor-pointer rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-40"
        >
          {zh ? "发送" : "Send"}
        </button>
      </form>

      {showKey || (apiKeyLoaded && !apiKey) ? (
        <ApiKeyModal onClose={() => setShowKey(false)} />
      ) : null}
    </div>
  );
}
