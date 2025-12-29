import { useEffect, useState } from "react";
import { Trash2, Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import SuggestionChips from "./SuggestionChips";
import { useChat } from "../../hooks/useChat";
import { SplitText, GradientText, BlurText, Stagger, FadeContent } from "../reactbits";
import type { MealSuggestion } from "../../api/promptEndpoints";

interface ChatContainerProps {
  className?: string;
}

export default function ChatContainer({ className = "" }: ChatContainerProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    applySuggestion,
    clearChat,
    messagesEndRef,
  } = useChat();

  // Animation states
  const [showHeader, setShowHeader] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showInput, setShowInput] = useState(false);

  // Orchestrate staggered animations
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setShowHeader(true), 100));
    timers.push(setTimeout(() => setShowContent(true), 300));
    timers.push(setTimeout(() => setShowInput(true), 500));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const handleApplySuggestion = (suggestion: MealSuggestion) => {
    applySuggestion(suggestion);
  };

  const handleClearChat = () => {
    clearChat();
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header - Slides in from top */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b border-gray-700/30 bg-gray-800/30 backdrop-blur-sm"
        style={{
          opacity: showHeader ? 1 : 0,
          transform: showHeader ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="relative"
            style={{
              opacity: showHeader ? 1 : 0,
              transform: showHeader ? "scale(1)" : "scale(0.8)",
              transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) 100ms, transform 500ms cubic-bezier(0.4, 0, 0.2, 1) 100ms",
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {/* Online indicator with pulse */}
            <div className="absolute -bottom-0.5 -right-0.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-gray-800"></span>
              </span>
            </div>
          </div>
          <div
            style={{
              opacity: showHeader ? 1 : 0,
              transform: showHeader ? "translateX(0)" : "translateX(-10px)",
              transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 150ms, transform 400ms cubic-bezier(0.4, 0, 0.2, 1) 150ms",
            }}
          >
            <h2 className="font-semibold text-white flex items-center gap-2">
              <GradientText 
                colors={["#f97316", "#fb923c", "#f97316"]}
                animate={true}
                animationDuration={3}
              >
                CavBot
              </GradientText>
            </h2>
            <p className="text-xs text-gray-400">Your AI meal planning assistant</p>
          </div>
        </div>

        {hasMessages && (
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-red-400 transition-all duration-300 group"
            title="Clear chat"
            style={{
              opacity: showHeader ? 1 : 0,
              transform: showHeader ? "scale(1)" : "scale(0.8)",
              transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 200ms, transform 400ms cubic-bezier(0.4, 0, 0.2, 1) 200ms, background-color 200ms, color 200ms",
            }}
          >
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* Messages Area - Fades in */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        style={{
          opacity: showContent ? 1 : 0,
          transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {!hasMessages ? (
          <EmptyState onSelectPrompt={handleSendMessage} disabled={isLoading} show={showContent} />
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                onApplySuggestion={handleApplySuggestion}
                isLatest={index === messages.length - 1 && message.role === "assistant"}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area - Slides in from bottom */}
      <div 
        className="p-4 border-t border-gray-700/30 bg-gray-800/30 backdrop-blur-sm"
        style={{
          opacity: showInput ? 1 : 0,
          transform: showInput ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {hasMessages && (
          <div 
            className="mb-3 overflow-x-auto pb-2 -mx-4 px-4"
            style={{
              opacity: showInput ? 1 : 0,
              transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 100ms",
            }}
          >
            <SuggestionChips onSelect={handleSendMessage} disabled={isLoading} />
          </div>
        )}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

// Empty state component with animations
function EmptyState({
  onSelectPrompt,
  disabled,
  show,
}: {
  onSelectPrompt: (prompt: string) => void;
  disabled: boolean;
  show: boolean;
}) {
  const [showLogo, setShowLogo] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showChips, setShowChips] = useState(false);

  useEffect(() => {
    if (!show) return;
    
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setShowLogo(true), 100));
    timers.push(setTimeout(() => setShowTitle(true), 300));
    timers.push(setTimeout(() => setShowSubtitle(true), 500));
    timers.push(setTimeout(() => setShowFeatures(true), 700));
    timers.push(setTimeout(() => setShowChips(true), 1000));
    
    return () => timers.forEach(clearTimeout);
  }, [show]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
      {/* Animated Logo */}
      <div 
        className="relative mb-8"
        style={{
          opacity: showLogo ? 1 : 0,
          transform: showLogo ? "scale(1)" : "scale(0.5)",
          filter: showLogo ? "blur(0px)" : "blur(10px)",
          transition: "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), filter 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-0 rounded-full bg-orange-500/10 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
      </div>

      {/* Title with split text animation */}
      <div
        style={{
          opacity: showTitle ? 1 : 0,
          transform: showTitle ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {showTitle && (
            <SplitText 
              text="Hey there! I'm CavBot" 
              delay={0}
              staggerDelay={0.04}
            />
          )}
        </h3>
      </div>
      
      {/* Subtitle with blur text animation */}
      <div 
        className="text-gray-400 mb-10 max-w-md text-sm sm:text-base"
        style={{
          opacity: showSubtitle ? 1 : 0,
          transform: showSubtitle ? "translateY(0)" : "translateY(15px)",
          filter: showSubtitle ? "blur(0px)" : "blur(8px)",
          transition: "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0, 0.2, 1), filter 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        I can help you plan your meals, find nutritious options, and optimize your dining hall experience.
      </div>

      {/* Feature highlights - Staggered animation */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 w-full max-w-2xl"
        style={{
          opacity: showFeatures ? 1 : 0,
          transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {[
          { icon: "🎯", title: "Personalized", desc: "Based on your goals" },
          { icon: "🍽️", title: "Real Menus", desc: "Today's dining options" },
          { icon: "⚡", title: "Instant", desc: "Quick recommendations" },
        ].map((feature, index) => (
          <div
            key={feature.title}
            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300 hover:bg-gray-800/60"
            style={{
              opacity: showFeatures ? 1 : 0,
              transform: showFeatures ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
              transition: `opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms, transform 500ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`,
            }}
          >
            <div className="text-2xl mb-2">{feature.icon}</div>
            <div className="font-semibold text-white text-sm">{feature.title}</div>
            <div className="text-xs text-gray-400">{feature.desc}</div>
          </div>
        ))}
      </div>

      {/* Suggestion chips */}
      <div 
        className="w-full max-w-2xl"
        style={{
          opacity: showChips ? 1 : 0,
          transform: showChips ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <p className="text-sm text-gray-500 mb-4">Try asking about:</p>
        <SuggestionChips onSelect={onSelectPrompt} disabled={disabled} />
      </div>
    </div>
  );
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div 
      className="flex justify-start mb-4"
      style={{
        animation: "fade-in-up 400ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <style>
        {`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <span className="text-white text-sm font-bold">C</span>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 border border-gray-700/50">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-orange-400 rounded-full"
                style={{
                  animation: "bounce-dot 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
          <style>
            {`
              @keyframes bounce-dot {
                0%, 60%, 100% {
                  transform: translateY(0);
                  opacity: 0.4;
                }
                30% {
                  transform: translateY(-6px);
                  opacity: 1;
                }
              }
            `}
          </style>
        </div>
      </div>
    </div>
  );
}
