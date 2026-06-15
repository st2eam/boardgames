"use client";

import { useState } from "react";
import { useChat } from "@/lib/chat/ChatProvider";
import { useTranslations } from "next-intl";

interface Props {
  onClose: () => void;
}

export function ApiKeyModal({ onClose }: Props) {
  const { apiKey, setApiKey } = useChat();
  const t = useTranslations("chat");
  const tc = useTranslations("common");
  const [value, setValue] = useState(apiKey ?? "");

  const handleSave = () => {
    setApiKey(value.trim());
    onClose();
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/95 backdrop-blur-sm">
      <div className="w-full max-w-xs px-6">
        <h4 className="mb-2 text-sm font-semibold text-stone-900">
          {t("setApiKey")}
        </h4>
        <p className="mb-4 text-xs leading-relaxed text-stone-500">
          {t("apiKeyDescription")}
        </p>
        <label className="mb-1 block text-xs font-medium text-stone-700">
          {t("apiKeyLabel")}
        </label>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("apiKeyPlaceholder")}
          className="mb-3 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            {t("save")}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-stone-100 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200 transition-colors"
          >
            {tc("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
