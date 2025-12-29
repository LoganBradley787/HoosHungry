import { useState, useRef } from "react";
import { Plus, Minus, RefreshCw, Check } from "lucide-react";
import type { MealSuggestion } from "../../api/promptEndpoints";

interface SuggestionCardProps {
  suggestion: MealSuggestion;
  onApply?: (suggestion: MealSuggestion) => void;
}

export default function SuggestionCard({ suggestion, onApply }: SuggestionCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleApply = async () => {
    if (isApplying || isApplied) return;

    setIsApplying(true);
    try {
      await onApply?.(suggestion);
      setIsApplied(true);
    } catch (error) {
      console.error("Failed to apply suggestion:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const ActionIcon = {
    add: Plus,
    remove: Minus,
    swap: RefreshCw,
  }[suggestion.action];

  const actionColors = {
    add: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-500/30",
      glow: "rgba(34, 197, 94, 0.15)",
    },
    remove: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/30",
      glow: "rgba(239, 68, 68, 0.15)",
    },
    swap: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/30",
      glow: "rgba(59, 130, 246, 0.15)",
    },
  };

  const colors = actionColors[suggestion.action];

  const actionLabels = {
    add: "Add to Plan",
    remove: "Remove",
    swap: "Swap",
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-xl p-3 border ${colors.border} bg-gray-800/60 backdrop-blur-sm transition-all duration-300 hover:border-opacity-60`}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${colors.glow}, transparent 40%)`,
        }}
      />

      <div className="relative z-10 flex items-start gap-3">
        {/* Action Icon */}
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          <ActionIcon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm truncate">
            {suggestion.item_name}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            {suggestion.dining_hall} • {suggestion.station}
          </p>
          <div className="flex gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-orange-400">🔥</span> {suggestion.calories} cal
            </span>
            <span className="flex items-center gap-1">
              <span className="text-blue-400">💪</span> {suggestion.protein}g protein
            </span>
          </div>
          <p className="text-xs text-gray-300 mt-2 italic leading-relaxed">
            "{suggestion.reason}"
          </p>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={isApplying || isApplied}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
            isApplied
              ? "bg-green-500/20 text-green-400 cursor-default"
              : isApplying
              ? "bg-gray-600 text-gray-400 cursor-wait"
              : `${colors.bg} ${colors.text} hover:scale-105 active:scale-95`
          }`}
        >
          {isApplied ? (
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Done
            </span>
          ) : isApplying ? (
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </span>
          ) : (
            actionLabels[suggestion.action]
          )}
        </button>
      </div>
    </div>
  );
}
