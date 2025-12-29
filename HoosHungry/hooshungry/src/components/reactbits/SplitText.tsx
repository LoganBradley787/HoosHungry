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

  const characters = text.split("");

  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {characters.map((char, index) => (
        <span
          key={index}
          className={`inline-block transition-all ${charClassName}`}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            filter: isVisible ? "blur(0px)" : "blur(4px)",
            transitionDelay: `${index * staggerDelay}s`,
            transitionDuration: "0.4s",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
