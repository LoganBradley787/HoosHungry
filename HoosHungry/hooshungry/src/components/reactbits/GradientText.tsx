interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animate?: boolean;
  animationDuration?: number;
}

/**
 * GradientText Component
 * Text with animated gradient colors
 * Inspired by React Bits
 */
export default function GradientText({
  children,
  className = "",
  colors = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#fb923c", "#f97316"],
  animate = true,
  animationDuration = 3,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
    backgroundSize: animate ? "200% auto" : "100% auto",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: animate ? `gradient-shift ${animationDuration}s linear infinite` : "none",
  };

  return (
    <>
      <style>
        {`
          @keyframes gradient-shift {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
        `}
      </style>
      <span className={className} style={gradientStyle}>
        {children}
      </span>
    </>
  );
}
