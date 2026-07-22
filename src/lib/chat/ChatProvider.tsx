"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { ChatMessage, ChatScope } from "./types";
import { saveMessages, loadMessages, clearHistory as clearStoredHistory } from "./chat-storage";
import { loadApiKey, saveApiKey } from "./api-key-storage";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";
import { GlobalChatStrategy } from "@/lib/ai/GlobalChatStrategy";
import { GameChatStrategy } from "@/lib/ai/GameChatStrategy";
import type { ChatToolStrategy } from "@/lib/ai/ChatToolStrategy";
import type {
  AnthropicContentBlock,
  AnthropicMessage,
  ChatStreamStatus,
} from "@/lib/ai/LLMAdapter";
import { executeToolCall } from "@/lib/ai/tool-handlers";

const MAX_TOOL_CALL_ITERATIONS = 5;

export type ChatMode = "game" | "global";
export type { ChatStreamStatus };

function statusFromToolName(name: string): ChatStreamStatus {
  if (name === "web_search") return "web_search";
  if (name === "get_game_rules") return "get_game_rules";
  return "tool_use";
}

interface ChatContextValue {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamStatus: ChatStreamStatus | null;
  apiKey: string | null;
  apiKeyLoaded: boolean;
  close: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  setApiKey: (key: string) => void;
  scope: ChatScope;
  activeMode: ChatMode;
  toggleMode: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface Props {
  children: ReactNode;
  scope: ChatScope;
  locale: string;
  onClose?: () => void;
}

export function ChatProvider({ children, scope, locale, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<ChatStreamStatus | null>(null);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  const [activeMode, setActiveMode] = useState<ChatMode>(
    scope.type === "game" ? "game" : "global"
  );

  const effectiveScope: ChatScope = useMemo(() => {
    if (activeMode === "global") return { type: "global" };
    return scope;
  }, [activeMode, scope]);

  // Keep ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    loadApiKey().then((key) => {
      setApiKeyState(key);
      setApiKeyLoaded(true);
    });
  }, []);

  // Load chat history from IndexedDB (reload when mode switches)
  useEffect(() => {
    setLoaded(false);
    loadMessages(effectiveScope, locale).then((msgs) => {
      setMessages(msgs);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, scope.type === "game" ? (scope as { type: "game"; slug: string }).slug : "global", locale]);

  // Persist messages
  useEffect(() => {
    if (loaded) {
      saveMessages(effectiveScope, locale, messages);
    }
  }, [messages, effectiveScope, locale, loaded]);

  const close = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const setApiKey = useCallback((key: string) => {
    saveApiKey(key);
    setApiKeyState(key);
  }, []);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    await clearStoredHistory(effectiveScope, locale);
  }, [effectiveScope, locale]);

  const toggleMode = useCallback(() => {
    if (scope.type === "global") return;
    setActiveMode((prev) => (prev === "game" ? "global" : "game"));
  }, [scope.type]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!apiKey || isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      const history = [...messagesRef.current, userMsg];
      setMessages((prev) => [...prev, userMsg]);

      let strategy: ChatToolStrategy;
      if (activeMode === "game" && scope.type === "game") {
        strategy = new GameChatStrategy(scope.gameName, scope.slug);
      } else {
        strategy = new GlobalChatStrategy();
      }

      const systemPrompt = await strategy.getSystemPrompt(locale);
      const tools = strategy.getTools();

      setIsStreaming(true);
      setStreamStatus(null);

      try {
        await runConversation(
          apiKey,
          systemPrompt,
          tools,
          history,
          setMessages,
          setStreamStatus
        );
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              locale === "zh"
                ? "抱歉，出错了。请检查 API Key 是否正确，或稍后重试。"
                : "Sorry, something went wrong. Please check your API key or try again later.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setStreamStatus(null);
        setIsStreaming(false);
      }
    },
    [apiKey, isStreaming, scope, locale, activeMode]
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        isStreaming,
        streamStatus,
        apiKey,
        apiKeyLoaded,
        close,
        sendMessage,
        clearHistory: clearMessages,
        setApiKey,
        scope,
        activeMode,
        toggleMode,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

// ─── Batched streaming state ──────────────────────────────────────────────

/**
 * Accumulates streaming content into assistantMsg, but only calls
 * setMessages at most once per animation frame. This prevents React
 * from re-rendering on every single SSE chunk (which can be as frequent
 * as every few milliseconds), making the stream feel fluid instead of
 * janky.
 */
function createStreamFlusher(
  assistantMsg: ChatMessage,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) {
  let rafId: number | null = null;

  function flush() {
    rafId = null;
    // Read the latest content ref via closure — it's already up-to-date
    // because we mutated assistantMsg.content before scheduling.
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === assistantMsg.id);
      if (idx >= 0) {
        // Replace in-place
        const updated = [...prev];
        updated[idx] = { ...assistantMsg };
        return updated;
      }
      return [...prev, { ...assistantMsg }];
    });
  }

  return {
    append(chunk: string) {
      assistantMsg.content += chunk;
      if (rafId === null) {
        rafId = requestAnimationFrame(flush);
      }
    },
    finalize() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      flush();
    },
  };
}

// ─── Anthropic message builder ───────────────────────────────────────────

function buildAnthropicMessages(msgs: ChatMessage[]): AnthropicMessage[] {
  const result: AnthropicMessage[] = [];

  for (const msg of msgs) {
    if (msg.role === "system") continue;

    if (msg.role === "user") {
      result.push({ role: "user", content: msg.content });
      continue;
    }

    if (msg.role === "assistant") {
      const blocks: AnthropicContentBlock[] = [];
      if (msg.content) {
        blocks.push({ type: "text", text: msg.content });
      }
      if (msg.toolCalls?.length) {
        for (const tc of msg.toolCalls) {
          let input: Record<string, unknown> = {};
          try {
            input = JSON.parse(tc.arguments) as Record<string, unknown>;
          } catch {
            // keep empty input
          }
          blocks.push({
            type: "tool_use",
            id: tc.id,
            name: tc.name,
            input,
          });
        }
      }
      if (blocks.length === 0) {
        blocks.push({ type: "text", text: "" });
      }
      result.push({ role: "assistant", content: blocks });
      continue;
    }

    if (msg.role === "tool") {
      const toolResult: AnthropicContentBlock = {
        type: "tool_result",
        tool_use_id: msg.toolCallId ?? "",
        content: msg.content,
      };
      const last = result[result.length - 1];
      if (last?.role === "user" && Array.isArray(last.content)) {
        last.content.push(toolResult);
      } else {
        result.push({ role: "user", content: [toolResult] });
      }
    }
  }

  return result;
}

// ─── Conversation runner ─────────────────────────────────────────────────

async function runConversation(
  apiKey: string,
  systemPrompt: string,
  tools: ReturnType<ChatToolStrategy["getTools"]>,
  historyMessages: ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setStreamStatus: React.Dispatch<React.SetStateAction<ChatStreamStatus | null>>
) {
  const adapter = new DeepSeekAdapter(apiKey);

  const currentMessages = [...historyMessages];
  let iteration = 0;

  while (iteration < MAX_TOOL_CALL_ITERATIONS) {
    iteration++;

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    const flusher = createStreamFlusher(assistantMsg, setMessages);

    const { finishReason, toolCalls: responseToolCalls } =
      await adapter.streamChat(
        {
          system: systemPrompt,
          messages: buildAnthropicMessages(currentMessages),
          tools,
        },
        (chunk) => {
          if (chunk.status) {
            setStreamStatus(chunk.status);
          }
          if (chunk.content) {
            setStreamStatus(null);
            flusher.append(chunk.content);
          }
        }
      );

    flusher.finalize();

    if (finishReason !== "tool_calls" || !responseToolCalls || responseToolCalls.length === 0) {
      setStreamStatus(null);
      if (assistantMsg.content) {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === assistantMsg.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...assistantMsg };
            return updated;
          }
          return [...prev, { ...assistantMsg }];
        });
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
      }
      currentMessages.push(assistantMsg);
      return;
    }

    // Client tool calls (e.g. get_game_rules). Web search is server-side
    // and completes inside the same Anthropic stream.
    assistantMsg.toolCalls = responseToolCalls;
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === assistantMsg.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...assistantMsg };
        return updated;
      }
      return [...prev, { ...assistantMsg }];
    });
    currentMessages.push(assistantMsg);

    for (const tc of responseToolCalls) {
      setStreamStatus(statusFromToolName(tc.name));

      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.arguments);
      } catch {
        // ignore parse errors
      }

      const result = await executeToolCall(tc.name, args);

      const toolMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "tool",
        content: result,
        toolCallId: tc.id,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, toolMsg]);
      currentMessages.push(toolMsg);
    }
  }
}
