import { useState } from "react";

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  glowColor?: string;
  variant?: "primary" | "secondary" | "ghost";
}

/**
 * GlowButton Component
 * Button with animated glow effect
 * Inspired by React Bits
 */
export default function GlowButton({
  children,
  onClick,
  disabled = false,
  className = "",
  glowColor = "rgba(249, 115, 22, 0.6)",
  variant = "primary",
}: GlowButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = "relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
    secondary: "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700",
    ghost: "bg-transparent border border-orange-500/50 text-orange-400 hover:bg-orange-500/10",
  };

  return (
    <>
      <style>
        {`
          @keyframes glow-pulse {
            0%, 100% {
              box-shadow: 0 0 20px ${glowColor}, 0 0 40px ${glowColor};
            }
            50% {
              box-shadow: 0 0 30px ${glowColor}, 0 0 60px ${glowColor};
            }
          }
        `}
      </style>
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${baseStyles} ${variantStyles[variant]} ${className} ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"
        }`}
        style={{
          animation: isHovered && !disabled && variant === "primary" 
            ? "glow-pulse 2s ease-in-out infinite" 
            : "none",
          boxShadow: isHovered && !disabled && variant !== "primary"
            ? `0 0 20px ${glowColor}`
            : "none",
        }}
      >
        {/* Shine effect */}
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            transform: "translateX(-100%)",
            animation: isHovered ? "shine 1s ease-in-out" : "none",
          }}
        />
        <style>
          {`
            @keyframes shine {
              to {
                transform: translateX(100%);
              }
            }
          `}
        </style>
        <span className="relative z-10">{children}</span>
      </button>
    </>
  );
}
