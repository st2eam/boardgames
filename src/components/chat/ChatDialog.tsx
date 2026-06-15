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
    <div className="fixed bottom-20 right-4 z-50 flex h-[500px] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl sm:w-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-stone-100 bg-white px-4 py-3">
        <h3 className="text-sm font-semibold text-stone-900">
          {title ?? t("title")}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowApiModal(true)}
            className="cursor-pointer rounded-md px-2 py-1 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
            title={t("setApiKey")}
            aria-label={t("setApiKey")}
          >
            {apiKey ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            )}
          </button>
          <button
            onClick={clearHistory}
            className="cursor-pointer rounded-md px-2 py-1 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
            title={t("clearHistory")}
            aria-label={t("clearHistory")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="cursor-pointer ml-1 rounded-md px-2 py-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label={t("close")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
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
