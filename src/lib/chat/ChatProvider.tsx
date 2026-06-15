"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { ChatMessage, ChatScope, ToolCall } from "./types";
import { saveMessages, loadMessages, clearHistory as clearStoredHistory } from "./chat-storage";
import { DeepSeekAdapter } from "@/lib/ai/DeepSeekAdapter";
import { GlobalChatStrategy } from "@/lib/ai/GlobalChatStrategy";
import { GameChatStrategy } from "@/lib/ai/GameChatStrategy";
import type { ChatToolStrategy } from "@/lib/ai/ChatToolStrategy";
import { executeToolCall } from "@/lib/ai/tool-handlers";

const MAX_TOOL_CALL_ITERATIONS = 5;

interface ChatContextValue {
  messages: ChatMessage[];
  isStreaming: boolean;
  apiKey: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  setApiKey: (key: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface Props {
  children: ReactNode;
  scope: ChatScope;
  locale: string;
}

export function ChatProvider({ children, scope, locale }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load API key from localStorage
  useEffect(() => {
    setApiKeyState(localStorage.getItem("deepseek-api-key"));
  }, []);

  // Load chat history from IndexedDB
  useEffect(() => {
    loadMessages(scope, locale).then((msgs) => {
      setMessages(msgs);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.type === "game" ? (scope as { type: "game"; slug: string }).slug : "global", locale]);

  // Persist messages
  useEffect(() => {
    if (loaded) {
      saveMessages(scope, locale, messages);
    }
  }, [messages, scope, locale, loaded]);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem("deepseek-api-key", key);
    setApiKeyState(key);
  }, []);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    await clearStoredHistory(scope, locale);
  }, [scope, locale]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!apiKey || isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      // Snapshot before any async gap — the ref may sync during await
      const history = [...messagesRef.current, userMsg];
      setMessages((prev) => [...prev, userMsg]);

      // Select strategy
      let strategy: ChatToolStrategy;
      if (scope.type === "game") {
        strategy = new GameChatStrategy(scope.gameName, scope.rules);
      } else {
        strategy = new GlobalChatStrategy();
      }

      const systemPrompt = await strategy.getSystemPrompt(locale);
      const tools = strategy.getTools();

      setIsStreaming(true);

      try {
        await runConversation(
          apiKey,
          systemPrompt,
          tools,
          history,
          setMessages
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
        setIsStreaming(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiKey, isStreaming, scope, locale]
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        isStreaming,
        apiKey,
        isOpen,
        setIsOpen,
        sendMessage,
        clearHistory: clearMessages,
        setApiKey,
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

// ─── Conversation runner ─────────────────────────────────────────────────

async function runConversation(
  apiKey: string,
  systemPrompt: string,
  tools: ReturnType<ChatToolStrategy["getTools"]>,
  historyMessages: ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) {
  const adapter = new DeepSeekAdapter(apiKey);

  // Convert our flat ToolCall format back to OpenAI-compatible shape
  const toOpenAIToolCalls = (tcs?: ToolCall[]) => {
    if (!tcs || tcs.length === 0) return undefined;
    return tcs.map((tc) => ({
      id: tc.id,
      type: "function" as const,
      function: { name: tc.name, arguments: tc.arguments },
    }));
  };

  const buildMessages = (msgs: ChatMessage[]) => {
    const result: {
      role: "system" | "user" | "assistant" | "tool";
      content: string | null;
      tool_call_id?: string;
      tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
    }[] = [{ role: "system", content: systemPrompt }];

    for (const msg of msgs) {
      if (msg.role === "system") continue;
      const hasToolCalls = msg.toolCalls && msg.toolCalls.length > 0;
      result.push({
        role: msg.role,
        // Assistant messages with tool_calls must have content: null
        content: msg.role === "assistant" && hasToolCalls ? null : msg.content,
        tool_call_id: msg.toolCallId,
        tool_calls: hasToolCalls ? toOpenAIToolCalls(msg.toolCalls) : undefined,
      });
    }
    return result;
  };

  let currentMessages = [...historyMessages];
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
          messages: buildMessages(currentMessages),
          tools: iteration === 1 ? tools : undefined,
        },
        (chunk) => {
          if (chunk.content) {
            flusher.append(chunk.content);
          }
        }
      );

    // Always flush whatever is left so React state is fully synced
    flusher.finalize();

    // If no tool calls, we're done
    if (finishReason !== "tool_calls" || !responseToolCalls || responseToolCalls.length === 0) {
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

    // Handle tool calls
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
