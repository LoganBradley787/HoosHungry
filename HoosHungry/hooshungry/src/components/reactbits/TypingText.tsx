import { useEffect, useState } from "react";

interface TypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  cursor?: boolean;
  cursorChar?: string;
}

/**
 * TypingText Component
 * Text that appears with typewriter effect
 * Inspired by React Bits
 */
export default function TypingText({
  text,
  speed = 30,
  delay = 0,
  className = "",
  onComplete,
  cursor = true,
  cursorChar = "▋",
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true);
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      onComplete?.();
    }
  }, [displayedText, text, speed, hasStarted, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText("");
    setHasStarted(false);
    setIsTyping(false);
    const timer = setTimeout(() => {
      setHasStarted(true);
      setIsTyping(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && (
        <span
          className={`inline-block ml-0.5 ${
            isTyping ? "animate-pulse" : "opacity-0"
          }`}
          style={{
            animation: isTyping ? "blink 1s step-end infinite" : "none",
          }}
        >
          {cursorChar}
        </span>
      )}
      <style>
        {`
          @keyframes blink {
            50% { opacity: 0; }
          }
        `}
      </style>
    </span>
  );
}
