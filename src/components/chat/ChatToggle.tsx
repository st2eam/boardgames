"use client";

import type { ChatScope } from "@/lib/chat/types";
import { ChatProvider } from "@/lib/chat/ChatProvider";
import { FloatingChatButton } from "./FloatingChatButton";

interface Props {
  scope: ChatScope;
  locale: string;
}

export function ChatToggle({ scope, locale }: Props) {
  return (
    <ChatProvider scope={scope} locale={locale}>
      <FloatingChatButton />
    </ChatProvider>
  );
}
