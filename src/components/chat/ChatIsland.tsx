"use client";

import type { ChatScope } from "@/lib/chat/types";
import { ChatProvider } from "@/lib/chat/ChatProvider";
import { ChatDialog } from "./ChatDialog";

interface Props {
  scope: ChatScope;
  locale: string;
  onClose: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function ChatIsland({
  scope,
  locale,
  onClose,
  isExpanded = false,
  onToggleExpand,
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatProvider scope={scope} locale={locale} onClose={onClose}>
        <ChatDialog
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
      </ChatProvider>
    </div>
  );
}
