"use client";

import { useChat } from "@/lib/chat/ChatProvider";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ApiKeyModal } from "./ApiKeyModal";
import { useRef, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  title?: string;
}

function ClearConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("chat");
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/95 backdrop-blur-sm">
      <div className="w-full max-w-xs px-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>
        <h4 className="mb-1 text-sm font-semibold text-stone-900">
          {t("clearHistory")}
        </h4>
        <p className="mb-5 text-xs leading-relaxed text-stone-500">
          {t("clearHistoryConfirm")}
        </p>
        <div className="flex gap-2.5">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            {t("close")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl bg-red-500 px-3 py-2.5 text-sm font-medium text-white shadow-sm shadow-red-200 hover:bg-red-600 transition-colors"
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChatDialog({ title }: Props) {
  const { apiKey, clearHistory, setIsOpen, scope, activeMode, toggleMode } = useChat();
  const t = useTranslations("chat");
  const locale = useLocale();
  const [showApiModal, setShowApiModal] = useState(!apiKey);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const hasApiKey = Boolean(apiKey);
  const isGamePage = scope.type === "game";
  const isGameMode = activeMode === "game";
  const gameName = isGamePage
    ? (scope as { type: "game"; gameName: string }).gameName
    : "";

  const headerTitle = isGameMode && isGamePage
    ? (locale === "zh" ? `${gameName} 助手` : `${gameName} Assistant`)
    : t("globalTitle");

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-2xl shadow-stone-400/15">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-stone-100 bg-gradient-to-b from-stone-50/80 to-white px-4 py-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isGameMode ? "bg-accent/10" : "bg-violet-500/10"}`}>
            {isGameMode ? (
              <svg
                className="h-4 w-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-violet-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.97.633-3.794 1.708-5.282"
                />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-stone-800 truncate">
              {title ?? headerTitle}
            </h3>
            <p className="text-[11px] text-stone-400">
              {hasApiKey ? "DeepSeek" : t("noApiKey")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {isGamePage && (
            <button
              onClick={toggleMode}
              className="cursor-pointer rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              title={t(isGameMode ? "switchToGlobal" : "switchToGame")}
              aria-label={t(isGameMode ? "switchToGlobal" : "switchToGame")}
            >
              {isGameMode ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.97.633-3.794 1.708-5.282" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={() => setShowApiModal(true)}
            className="cursor-pointer rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            title={t("setApiKey")}
            aria-label={t("setApiKey")}
          >
            {hasApiKey ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="cursor-pointer rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            title={t("clearHistory")}
            aria-label={t("clearHistory")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="cursor-pointer ml-1 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            aria-label={t("close")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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

      {/* Clear history confirmation */}
      {showClearConfirm && (
        <ClearConfirmDialog
          onConfirm={() => {
            clearHistory();
            setShowClearConfirm(false);
          }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  );
}
