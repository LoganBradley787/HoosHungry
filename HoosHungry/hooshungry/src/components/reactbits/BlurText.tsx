import { useEffect, useState } from "react";

interface BlurTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  animateOnMount?: boolean;
}

/**
 * BlurText Component
 * Text that reveals with a blur-to-clear animation
 * Inspired by React Bits
 */
export default function BlurText({
  text,
  delay = 0,
  duration = 0.8,
  className = "",
  animateOnMount = true,
}: BlurTextProps) {
  const [isVisible, setIsVisible] = useState(!animateOnMount);

  useEffect(() => {
    if (animateOnMount) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay, animateOnMount]);

  return (
    <span
      className={`inline-block transition-all ${className}`}
      style={{
        filter: isVisible ? "blur(0px)" : "blur(10px)",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transitionDuration: `${duration}s`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {text}
    </span>
  );
}
