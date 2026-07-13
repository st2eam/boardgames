"use client";

import { useState } from "react";
import { motion } from "motion/react";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-10 flex flex-col justify-end rounded-2xl bg-white/95 backdrop-blur-sm"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-4">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
          <svg
            className="h-6 w-6 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
            />
          </svg>
        </div>
        <h4 className="mb-1 text-sm font-semibold text-stone-900">
          {t("setApiKey")}
        </h4>
        <p className="mb-5 max-w-[260px] text-center text-xs leading-relaxed text-stone-500">
          {t("apiKeyDescription")}
        </p>
      </div>

      <div className="border-t border-stone-100 bg-white px-5 py-4">
        <label className="mb-1.5 block text-xs font-medium text-stone-600">
          {t("apiKeyLabel")}
        </label>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("apiKeyPlaceholder")}
          className="mb-3 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-accent/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            {tc("cancel")}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent/20 hover:bg-accent/90 transition-colors cursor-pointer"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
