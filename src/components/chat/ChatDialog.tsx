"use client";

import { useChat } from "@/lib/chat/ChatProvider";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ApiKeyModal } from "./ApiKeyModal";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  title?: string;
}

export function ChatDialog({ title }: Props) {
  const { apiKey, clearHistory, setIsOpen } = useChat();
  const t = useTranslations("chat");
  const [showApiModal, setShowApiModal] = useState(!apiKey);

  return (
    <div className="fixed bottom-20 right-4 z-50 flex h-[500px] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:w-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-zinc-100 bg-white px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-900">
          {title ?? t("title")}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowApiModal(true)}
            className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            title={t("setApiKey")}
          >
            {apiKey ? <>&#x1f511;</> : <>&#x26a0;&#xfe0f;</>}
          </button>
          <button
            onClick={clearHistory}
            className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            title={t("clearHistory")}
          >
            &#x1f5d1;
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="ml-1 rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            &#x2715;
          </button>
        </div>
      </div>

      {/* Messages */}
      <ChatMessages />

      {/* Input */}
      <ChatInput />

      {/* API Key Modal */}
      {showApiModal && (
        <ApiKeyModal onClose={() => setShowApiModal(false)} />
      )}
    </div>
  );
}
