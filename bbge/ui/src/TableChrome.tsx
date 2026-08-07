"use client";

import { useState } from "react";
import type { AiChatMessage } from "@bbge/runtime";

interface Props {
  locale: string;
  chat: AiChatMessage[];
  thinkingId: string | null;
  onSend: (text: string) => void;
}

export function TableChrome({ locale, chat, thinkingId, onSend }: Props) {
  const [text, setText] = useState("");
  const zh = locale === "zh";
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-card space-y-3">
      {thinkingId && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {zh ? `${thinkingId} 思考中…` : `${thinkingId} is thinking…`}
        </div>
      )}
      <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
        {chat.length === 0 && (
          <p className="text-stone-400">
            {zh ? "桌边聊天" : "Table chat"}
          </p>
        )}
        {chat.map((m, i) => (
          <p key={`${m.at}-${i}`}>
            <span className="font-medium text-primary">{m.playerId}</span>:{" "}
            {m.text}
          </p>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onSend(text.trim());
          setText("");
        }}
      >
        <input
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={zh ? "说点什么…" : "Say something…"}
        />
        <button
          type="submit"
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          {zh ? "发送" : "Send"}
        </button>
      </form>
    </div>
  );
}
