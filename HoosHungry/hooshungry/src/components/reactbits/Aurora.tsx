import { useEffect, useRef } from "react";

interface AuroraProps {
  colorStops?: string[];
  speed?: number;
  blur?: string;
  opacity?: number;
  className?: string;
}

/**
 * Aurora Background Component
 * Creates a beautiful animated aurora/northern lights effect
 * Inspired by React Bits
 */
export default function Aurora({
  colorStops = ["#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12"],
  speed = 1,
  blur = "100px",
  opacity = 0.5,
  className = "",
}: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const drawAurora = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create multiple aurora waves
      for (let i = 0; i < 5; i++) {
        const gradient = ctx.createLinearGradient(
          0,
          0,
          canvas.width,
          canvas.height
        );

        colorStops.forEach((color, index) => {
          gradient.addColorStop(index / (colorStops.length - 1), color);
        });

        ctx.globalAlpha = opacity / (i + 1);
        ctx.fillStyle = gradient;

        ctx.beginPath();

        const yOffset = canvas.height * 0.3 + i * 50;
        const amplitude = 100 + i * 30;
        const frequency = 0.002 - i * 0.0003;

        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 10) {
          const y =
            yOffset +
            Math.sin(x * frequency + time * speed + i) * amplitude +
            Math.sin(x * frequency * 2 + time * speed * 1.5 + i * 2) *
              (amplitude / 2);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
      }

      time += 0.01;
      animationId = requestAnimationFrame(drawAurora);
    };

    drawAurora();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [colorStops, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ filter: `blur(${blur})` }}
    />
  );
}
