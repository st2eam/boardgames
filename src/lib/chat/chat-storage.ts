import { get, set, del } from "idb-keyval";
import type { ChatMessage, ChatScope } from "./types";

function storageKey(scope: ChatScope, locale: string): string {
  if (scope.type === "global") return `chat:global:${locale}`;
  return `chat:game:${scope.slug}:${locale}`;
}

export async function saveMessages(
  scope: ChatScope,
  locale: string,
  messages: ChatMessage[]
): Promise<void> {
  await set(storageKey(scope, locale), messages);
}

export async function loadMessages(
  scope: ChatScope,
  locale: string
): Promise<ChatMessage[]> {
  const result = await get<ChatMessage[]>(storageKey(scope, locale));
  return result ?? [];
}

export async function clearHistory(
  scope: ChatScope,
  locale: string
): Promise<void> {
  await del(storageKey(scope, locale));
}
