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
          [...messagesRef.current, userMsg],
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

async function runConversation(
  apiKey: string,
  systemPrompt: string,
  tools: ReturnType<ChatToolStrategy["getTools"]>,
  historyMessages: ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) {
  const adapter = new DeepSeekAdapter(apiKey);

  const buildMessages = (msgs: ChatMessage[]) => {
    const result: {
      role: "system" | "user" | "assistant" | "tool";
      content: string;
      tool_call_id?: string;
      tool_calls?: ToolCall[];
    }[] = [{ role: "system", content: systemPrompt }];

    for (const msg of msgs) {
      if (msg.role === "system") continue;
      result.push({
        role: msg.role,
        content: msg.content,
        tool_call_id: msg.toolCallId,
        tool_calls: msg.toolCalls,
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

    const { finishReason, toolCalls: responseToolCalls } =
      await adapter.streamChat(
        {
          messages: buildMessages(currentMessages),
          tools: iteration === 1 ? tools : undefined,
        },
        (chunk) => {
          if (chunk.content) {
            assistantMsg.content += chunk.content;
            setMessages((prev) => {
              const idx = prev.findIndex((m) => m.id === assistantMsg.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = { ...assistantMsg };
                return updated;
              }
              return [...prev, { ...assistantMsg }];
            });
          }
        }
      );

    // If no tool calls, we're done
    if (finishReason !== "tool_calls" || !responseToolCalls || responseToolCalls.length === 0) {
      // Finalize assistant message
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
        // Remove empty assistant message
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

    // Execute each tool call
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
