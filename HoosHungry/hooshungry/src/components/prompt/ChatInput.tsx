import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Ask about your meal plan...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = !disabled && message.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="relative"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Animated glow effect behind input */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          opacity: isFocused ? 1 : 0,
          background: "linear-gradient(90deg, rgba(249, 115, 22, 0.15), rgba(251, 146, 60, 0.1), rgba(249, 115, 22, 0.15))",
          filter: "blur(12px)",
          transform: "scale(1.03)",
          transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      
      <div 
        className="relative flex items-end gap-2 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 border"
        style={{
          borderColor: isFocused ? "rgba(249, 115, 22, 0.5)" : "rgba(55, 65, 81, 0.5)",
          boxShadow: isFocused 
            ? "0 0 20px rgba(249, 115, 22, 0.15), 0 4px 20px rgba(0, 0, 0, 0.3)" 
            : "0 4px 20px rgba(0, 0, 0, 0.2)",
          transition: "border-color 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none px-3 py-2 text-sm sm:text-base max-h-[120px] scrollbar-thin scrollbar-thumb-gray-600"
        />
        
        <button
          type="submit"
          disabled={!canSend}
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
          style={{
            background: canSend 
              ? "linear-gradient(135deg, #f97316, #ea580c)" 
              : "rgba(55, 65, 81, 0.5)",
            color: canSend ? "white" : "rgba(156, 163, 175, 1)",
            boxShadow: canSend 
              ? "0 4px 15px rgba(249, 115, 22, 0.4)" 
              : "none",
            transform: canSend ? "scale(1)" : "scale(0.95)",
            cursor: canSend ? "pointer" : "not-allowed",
            transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send 
              className="w-5 h-5" 
              style={{ 
                transform: "translateX(1px)",
                transition: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
              }} 
            />
          )}
        </button>
      </div>
      
      {/* Character hint and count */}
      <div 
        className="flex justify-between items-center mt-2 px-1"
        style={{
          opacity: isVisible ? 0.7 : 0,
          transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 200ms",
        }}
      >
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400 text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400 text-[10px] font-mono">Shift+Enter</kbd> for new line
        </p>
        <p 
          className="text-xs text-gray-500"
          style={{
            opacity: message.length > 0 ? 1 : 0,
            transform: message.length > 0 ? "translateX(0)" : "translateX(10px)",
            transition: "opacity 200ms, transform 200ms",
          }}
        >
          {message.length} characters
        </p>
      </div>
    </form>
  );
}
