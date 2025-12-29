import { Children, cloneElement, isValidElement, useEffect, useState } from "react";

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  blur?: boolean;
  scale?: boolean;
  cascade?: boolean;
}

interface StaggerItemProps {
  children: React.ReactNode;
  index: number;
  staggerDelay: number;
  initialDelay: number;
  duration: number;
  direction: "up" | "down" | "left" | "right" | "none";
  distance: number;
  blur: boolean;
  scale: boolean;
}

function StaggerItem({
  children,
  index,
  staggerDelay,
  initialDelay,
  duration,
  direction,
  distance,
  blur,
  scale,
}: StaggerItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, initialDelay + index * staggerDelay);

    return () => clearTimeout(timer);
  }, [index, staggerDelay, initialDelay]);

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
      transforms.push("scale(0.9)");
    }

    return transforms.join(" ") || "none";
  };

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        filter: blur && !isVisible ? "blur(8px)" : "blur(0px)",
        transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), filter ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Stagger Component
 * Animates children with staggered delays
 * Inspired by React Bits
 */
export default function Stagger({
  children,
  className = "",
  staggerDelay = 100,
  initialDelay = 0,
  duration = 500,
  direction = "up",
  distance = 20,
  blur = false,
  scale = false,
  cascade = true,
}: StaggerProps) {
  if (!cascade) {
    // Render all at once without stagger
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          return (
            <StaggerItem
              key={child.key || index}
              index={index}
              staggerDelay={staggerDelay}
              initialDelay={initialDelay}
              duration={duration}
              direction={direction}
              distance={distance}
              blur={blur}
              scale={scale}
            >
              {child}
            </StaggerItem>
          );
        }
        return child;
      })}
    </div>
  );
}
