import { useState, useCallback, useRef, useEffect } from "react";
import { promptAPI } from "../api/promptEndpoints";
import type { ChatMessage, MealSuggestion } from "../api/promptEndpoints";

interface UseChatOptions {
  /**
   * Initial messages to populate the chat
   */
  initialMessages?: ChatMessage[];

  /**
   * Callback when a message is sent
   */
  onMessageSent?: (message: ChatMessage) => void;

  /**
   * Callback when a response is received
   */
  onResponseReceived?: (message: ChatMessage) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Context to include with each message (unused - reserved for future use)
   */
  context?: Record<string, unknown>;
}

interface UseChatReturn {
  /**
   * All messages in the conversation
   */
  messages: ChatMessage[];

  /**
   * Whether the AI is currently generating a response
   */
  isLoading: boolean;

  /**
   * Send a message to the AI
   */
  sendMessage: (content: string) => Promise<void>;

  /**
   * Apply a meal suggestion to the user's plan
   */
  applySuggestion: (suggestion: MealSuggestion) => Promise<void>;

  /**
   * Clear all messages
   */
  clearChat: () => Promise<void>;

  /**
   * Ref to scroll to the latest message
   */
  messagesEndRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Add a system message (for confirmations, etc.)
   */
  addSystemMessage: (content: string) => void;
}

/**
 * Custom hook for managing chat state and interactions.
 * Designed to be easily connected to a backend API.
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    initialMessages = [],
    onMessageSent,
    onResponseReceived,
    onError,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyLoadedRef = useRef(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history from backend on mount
  useEffect(() => {
    promptAPI.getHistory().then((history) => {
      if (history.length > 0 && !historyLoadedRef.current) {
        setMessages(history);
      }
    }).catch(() => {
      // silently ignore — user just starts with empty chat
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  /**
   * Generate a unique ID for messages
   */
  const generateId = useCallback((prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Create user message
      const userMessage: ChatMessage = {
        id: generateId("user"),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      // Mark history as superseded so the async history load won't overwrite this
      historyLoadedRef.current = true;
      // Add user message to state
      setMessages((prev) => [...prev, userMessage]);
      onMessageSent?.(userMessage);
      setIsLoading(true);

      try {
        // Send to API
        const response = await promptAPI.sendMessage({
          message: content,
        });

        // Create assistant message
        const assistantMessage: ChatMessage = {
          id: generateId("assistant"),
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
          suggestions: response.suggestions,
        };

        // Add assistant message to state
        setMessages((prev) => [...prev, assistantMessage]);
        onResponseReceived?.(assistantMessage);
      } catch (error: unknown) {
        console.error("Failed to send message:", error);
        onError?.(error as Error);

        // Check for usage limit error (HTTP 402)
        const isUsageLimit =
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status === 402;

        const errorContent = isUsageLimit
          ? "You've used all your CavBot messages. Upgrade to premium for unlimited access."
          : "Sorry, I encountered an error. Please try again.";

        const errorMessage: ChatMessage = {
          id: generateId("error"),
          role: "assistant",
          content: errorContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, generateId, onMessageSent, onResponseReceived, onError]
  );

  /**
   * Apply a meal suggestion
   */
  const applySuggestion = useCallback(
    async (suggestion: MealSuggestion) => {
      try {
        await promptAPI.applySuggestion(suggestion);

        // Add confirmation message
        const confirmMessage: ChatMessage = {
          id: generateId("confirm"),
          role: "assistant",
          content: `✓ Successfully ${
            suggestion.action === "add"
              ? "added"
              : suggestion.action === "remove"
              ? "removed"
              : "swapped"
          } "${suggestion.item_name}" ${
            suggestion.action === "add" ? "to" : "from"
          } your plan!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, confirmMessage]);
      } catch (error) {
        console.error("Failed to apply suggestion:", error);
        onError?.(error as Error);
      }
    },
    [generateId, onError]
  );

  /**
   * Clear all messages
   */
  const clearChat = useCallback(async () => {
    try {
      await promptAPI.clearHistory();
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear chat:", error);
      onError?.(error as Error);
    }
  }, [onError]);

  /**
   * Add a system message
   */
  const addSystemMessage = useCallback(
    (content: string) => {
      const systemMessage: ChatMessage = {
        id: generateId("system"),
        role: "assistant",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    },
    [generateId]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    applySuggestion,
    clearChat,
    messagesEndRef,
    addSystemMessage,
  };
}

export default useChat;
