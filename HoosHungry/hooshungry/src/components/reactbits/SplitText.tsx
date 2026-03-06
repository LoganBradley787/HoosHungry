import { useEffect, useState } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  staggerDelay?: number;
  animateOnMount?: boolean;
}

/**
 * SplitText Component
 * Text that animates in character by character with stagger
 * Inspired by React Bits
 */
export default function SplitText({
  text,
  className = "",
  charClassName = "",
  delay = 0,
  staggerDelay = 0.03,
  animateOnMount = true,
}: SplitTextProps) {
  const [isVisible, setIsVisible] = useState(!animateOnMount);

  useEffect(() => {
    if (animateOnMount) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay, animateOnMount]);

  const words = text.split(" ");

  // Track global character index for consistent stagger across words
  let charIndex = 0;

  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, wordIndex) => {
        const wordStart = charIndex;
        charIndex += word.length + 1; // +1 for the space after
        return (
          <span key={wordIndex} style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
            {word.split("").map((char, i) => (
              <span
                key={i}
                className={`inline-block transition-all ${charClassName}`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)",
                  filter: isVisible ? "blur(0px)" : "blur(4px)",
                  transitionDelay: `${(wordStart + i) * staggerDelay}s`,
                  transitionDuration: "0.4s",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {char}
              </span>
            ))}
            {/* Space between words */}
            {wordIndex < words.length - 1 && (
              <span
                className="inline-block"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transitionDelay: `${(wordStart + word.length) * staggerDelay}s`,
                  transitionDuration: "0.4s",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {"\u00A0"}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
