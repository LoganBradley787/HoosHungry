import { useMemo } from "react";

interface OrbsProps {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  className?: string;
}

interface Orb {
  id: number;
  size: number;
  color: string;
  left: string;
  top: string;
  animationDuration: string;
  animationDelay: string;
  opacity: number;
}

/**
 * Orbs Component
 * Floating animated orbs background effect
 * Inspired by React Bits
 */
export default function Orbs({
  count = 6,
  colors = [
    "rgba(249, 115, 22, 0.3)",
    "rgba(234, 88, 12, 0.3)",
    "rgba(194, 65, 12, 0.3)",
    "rgba(251, 146, 60, 0.3)",
  ],
  minSize = 100,
  maxSize = 400,
  className = "",
}: OrbsProps) {
  const orbs = useMemo<Orb[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * (maxSize - minSize) + minSize,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 20 + 20}s`,
      animationDelay: `${Math.random() * -20}s`,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [count, colors, minSize, maxSize]);

  return (
    <>
      <style>
        {`
          @keyframes float-orb {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(30px, -30px) scale(1.1);
            }
            50% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            75% {
              transform: translate(-30px, -20px) scale(1.05);
            }
          }
        `}
      </style>
      <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
        {orbs.map((orb) => (
          <div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.left,
              top: orb.top,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              opacity: orb.opacity,
              filter: "blur(40px)",
              animation: `float-orb ${orb.animationDuration} ease-in-out infinite`,
              animationDelay: orb.animationDelay,
            }}
          />
        ))}
      </div>
    </>
  );
}
