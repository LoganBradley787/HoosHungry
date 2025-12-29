import { useEffect, useState, useRef } from "react";

interface FadeContentProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  blur?: boolean;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  scale?: boolean;
  stagger?: boolean;
  staggerDelay?: number;
  easing?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * FadeContent Component
 * Smooth reveal animations with various effects
 * Inspired by React Bits
 */
export default function FadeContent({
  children,
  className = "",
  delay = 0,
  duration = 600,
  blur = false,
  direction = "up",
  distance = 30,
  scale = false,
  easing = "cubic-bezier(0.4, 0, 0.2, 1)",
  threshold = 0.1,
  triggerOnce = true,
}: FadeContentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasAnimated)) {
          const timer = setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
          return () => clearTimeout(timer);
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay, threshold, triggerOnce, hasAnimated]);

  // Calculate transform based on direction
  const getTransform = () => {
    if (isVisible) {
      return scale ? "translate(0, 0) scale(1)" : "translate(0, 0)";
    }

    const transforms = [];
    
    switch (direction) {
      case "up":
        transforms.push(`translateY(${distance}px)`);
        break;
      case "down":
        transforms.push(`translateY(-${distance}px)`);
        break;
      case "left":
        transforms.push(`translateX(${distance}px)`);
        break;
      case "right":
        transforms.push(`translateX(-${distance}px)`);
        break;
      case "none":
      default:
        break;
    }

    if (scale) {
      transforms.push("scale(0.95)");
    }

    return transforms.join(" ") || "none";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        filter: blur && !isVisible ? "blur(10px)" : "blur(0px)",
        transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}, filter ${duration}ms ${easing}`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
}
