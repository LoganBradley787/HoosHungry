import type { ChatMessage as ChatMessageType, MealSuggestion } from "../../api/promptEndpoints";
import SuggestionCard from "./SuggestionCard";
import { TypingText } from "../reactbits";
import { useState, useEffect } from "react";

interface ChatMessageProps {
  message: ChatMessageType;
  onApplySuggestion?: (suggestion: MealSuggestion) => void;
  isLatest?: boolean;
}

export default function ChatMessage({ 
  message, 
  onApplySuggestion,
  isLatest = false 
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [typingComplete, setTypingComplete] = useState(!isLatest);
  const [isVisible, setIsVisible] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Orchestrate entrance animations
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setIsVisible(true), 50));
    timers.push(setTimeout(() => setShowAvatar(true), 100));
    timers.push(setTimeout(() => setShowBubble(true), 150));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Show suggestions after typing completes
  useEffect(() => {
    if (typingComplete && message.suggestions && message.suggestions.length > 0) {
      const timer = setTimeout(() => setShowSuggestions(true), 200);
      return () => clearTimeout(timer);
    }
  }, [typingComplete, message.suggestions]);

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(15px)",
        transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] ${
          isUser ? "order-2" : "order-1"
        }`}
      >
        {/* Avatar for assistant */}
        {!isUser && (
          <div 
            className="flex items-center gap-2 mb-2"
            style={{
              opacity: showAvatar ? 1 : 0,
              transform: showAvatar ? "translateX(0) scale(1)" : "translateX(-10px) scale(0.9)",
              transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">CavBot</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md shadow-lg shadow-orange-500/20"
              : "bg-gray-800/80 backdrop-blur-sm text-gray-100 rounded-bl-md border border-gray-700/50"
          }`}
          style={{
            opacity: showBubble ? 1 : 0,
            transform: showBubble 
              ? "translateX(0) scale(1)" 
              : (isUser ? "translateX(15px) scale(0.95)" : "translateX(-15px) scale(0.95)"),
            transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {isUser ? (
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : isLatest && !typingComplete ? (
            <TypingText
              text={message.content}
              speed={12}
              className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap"
              onComplete={() => setTypingComplete(true)}
              cursor={true}
            />
          ) : (
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>

        {/* Suggestions with staggered animation */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && typingComplete && (
          <div 
            className="mt-3 space-y-2"
            style={{
              opacity: showSuggestions ? 1 : 0,
              transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {message.suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                style={{
                  opacity: showSuggestions ? 1 : 0,
                  transform: showSuggestions ? "translateY(0)" : "translateY(10px)",
                  transition: `opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms, transform 400ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`,
                }}
              >
                <SuggestionCard
                  suggestion={suggestion}
                  onApply={onApplySuggestion}
                />
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-xs text-gray-500 mt-1.5 ${
            isUser ? "text-right" : "text-left"
          }`}
          style={{
            opacity: showBubble ? 0.7 : 0,
            transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 200ms",
          }}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
