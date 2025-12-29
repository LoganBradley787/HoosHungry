import { useEffect, useState, Children, cloneElement, isValidElement } from "react";

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale";
}

interface AnimatedItemProps {
  children: React.ReactNode;
  index: number;
  staggerDelay: number;
  initialDelay: number;
  animation: string;
}

function AnimatedItem({ 
  children, 
  index, 
  staggerDelay, 
  initialDelay,
  animation 
}: AnimatedItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, initialDelay + index * staggerDelay);
    return () => clearTimeout(timer);
  }, [index, staggerDelay, initialDelay]);

  const animations = {
    "fade-up": {
      initial: { opacity: 0, transform: "translateY(20px)" },
      visible: { opacity: 1, transform: "translateY(0)" },
    },
    "fade-in": {
      initial: { opacity: 0 },
      visible: { opacity: 1 },
    },
    "slide-left": {
      initial: { opacity: 0, transform: "translateX(30px)" },
      visible: { opacity: 1, transform: "translateX(0)" },
    },
    "slide-right": {
      initial: { opacity: 0, transform: "translateX(-30px)" },
      visible: { opacity: 1, transform: "translateX(0)" },
    },
    "scale": {
      initial: { opacity: 0, transform: "scale(0.9)" },
      visible: { opacity: 1, transform: "scale(1)" },
    },
  };

  const currentAnimation = animations[animation as keyof typeof animations] || animations["fade-up"];

  return (
    <div
      style={{
        ...currentAnimation.initial,
        ...(isVisible ? currentAnimation.visible : {}),
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * AnimatedList Component
 * List with staggered entrance animations for children
 * Inspired by React Bits
 */
export default function AnimatedList({
  children,
  className = "",
  staggerDelay = 100,
  initialDelay = 0,
  animation = "fade-up",
}: AnimatedListProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          return (
            <AnimatedItem
              key={child.key || index}
              index={index}
              staggerDelay={staggerDelay}
              initialDelay={initialDelay}
              animation={animation}
            >
              {child}
            </AnimatedItem>
          );
        }
        return child;
      })}
    </div>
  );
}
