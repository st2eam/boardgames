"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AiChatMessage } from "@bbge/runtime";
import { BattleLogList } from "./BattleLogList";
import type { PlayLogEntry } from "./formatPlayLog";

export type PlayLogChatPanelProps = {
  locale: string;
  playLog?: PlayLogEntry[];
  chat?: AiChatMessage[];
  onChat?: (text: string) => void;
  nameOf?: (playerId: string) => string;
  /** Extra block above the chat form (e.g. score strip). */
  header?: ReactNode;
  /** Show recent chat lines under the form. Default true when chat has items. */
  showChatHistory?: boolean;
  logVariant?: "plain" | "chip";
  className?: string;
  placeholder?: string;
};

/**
 * Battle log + optional table-chat form for desktop aside / mobile sheet.
 */
export function PlayLogChatPanel({
  locale,
  playLog = [],
  chat = [],
  onChat,
  nameOf,
  header,
  showChatHistory = true,
  logVariant = "plain",
  className,
  placeholder,
}: PlayLogChatPanelProps) {
  const zh = locale === "zh";
  const [text, setText] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.length, chat[chat.length - 1]?.at]);

  return (
    <div
      className={[
        "flex h-full min-h-0 flex-col gap-2 overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {header}
      <BattleLogList
        locale={locale}
        entries={playLog}
        title={zh ? "战报" : "Log"}
        variant={logVariant}
        className="rounded-xl border border-border bg-white/95 p-2"
      />
      {onChat ? (
        <form
          className="flex shrink-0 gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const t = text.trim();
            if (!t) return;
            onChat(t);
            setText("");
          }}
        >
          <input
            className="min-h-11 min-w-0 flex-1 touch-manipulation rounded-lg border border-border px-2 py-2 text-xs"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              placeholder ?? (zh ? "桌边闲聊…" : "Table chat…")
            }
          />
          <button
            type="submit"
            className="min-h-11 cursor-pointer touch-manipulation rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-dark"
          >
            {zh ? "发送" : "Send"}
          </button>
        </form>
      ) : null}
      {showChatHistory && chat.length > 0 ? (
        <div
          ref={chatRef}
          className="max-h-28 shrink-0 touch-pan-y overflow-y-auto overscroll-contain rounded-lg border border-border bg-white/80 px-2 py-1 text-[11px] text-stone-600"
        >
          {chat.slice(-12).map((m, i) => (
            <p key={`${m.playerId}-${m.at}-${i}`}>
              <span className="font-semibold">
                {nameOf?.(m.playerId) ?? m.playerId}
              </span>
              : {m.text}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
