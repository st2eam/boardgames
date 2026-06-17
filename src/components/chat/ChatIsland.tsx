"use client";

import type { ChatScope } from "@/lib/chat/types";
import { ChatProvider } from "@/lib/chat/ChatProvider";
import { ChatDialog } from "./ChatDialog";

interface Props {
  scope: ChatScope;
  locale: string;
  onClose: () => void;
}

export function ChatIsland({ scope, locale, onClose }: Props) {
  return (
    <ChatProvider scope={scope} locale={locale} onClose={onClose}>
      <ChatDialog />
    </ChatProvider>
  );
}
