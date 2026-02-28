import { useState, useEffect } from "react";
import { Flame, Beef, Leaf, Sun, Moon, Sparkles, Zap, Heart } from "lucide-react";

interface SuggestionChipsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

interface ChipData {
  icon: React.ElementType;
  label: string;
  prompt: string;
  gradient: string;
  shadowColor: string;
}

const SUGGESTION_CHIPS: ChipData[] = [
  {
    icon: Beef,
    label: "High Protein",
    prompt: "What high protein options are available today that would help me hit my protein goals?",
    gradient: "from-red-500 to-rose-600",
    shadowColor: "rgba(239, 68, 68, 0.3)",
  },
  {
    icon: Flame,
    label: "Low Calorie",
    prompt: "Can you suggest some low calorie meal options for today?",
    gradient: "from-orange-500 to-amber-600",
    shadowColor: "rgba(249, 115, 22, 0.3)",
  },
  {
    icon: Leaf,
    label: "Vegetarian",
    prompt: "What vegetarian options are available at the dining halls today?",
    gradient: "from-green-500 to-emerald-600",
    shadowColor: "rgba(34, 197, 94, 0.3)",
  },
  {
    icon: Sun,
    label: "Breakfast",
    prompt: "What are some healthy breakfast options to start my day?",
    gradient: "from-yellow-500 to-orange-500",
    shadowColor: "rgba(234, 179, 8, 0.3)",
  },
  {
    icon: Moon,
    label: "Light Dinner",
    prompt: "Suggest a light dinner that won't make me feel too full before bed.",
    gradient: "from-purple-500 to-violet-600",
    shadowColor: "rgba(168, 85, 247, 0.3)",
  },
  {
    icon: Sparkles,
    label: "Optimize",
    prompt: "Can you look at my current plan and suggest improvements based on my goals?",
    gradient: "from-orange-500 to-amber-500",
    shadowColor: "rgba(244, 130, 16, 0.3)",
  },
  {
    icon: Zap,
    label: "Quick Energy",
    prompt: "What are good pre-workout or energy-boosting meal options available?",
    gradient: "from-amber-400 to-yellow-500",
    shadowColor: "rgba(251, 191, 36, 0.3)",
  },
  {
    icon: Heart,
    label: "Heart Healthy",
    prompt: "What heart-healthy, low sodium options are available today?",
    gradient: "from-pink-500 to-rose-500",
    shadowColor: "rgba(236, 72, 153, 0.3)",
  },
];

function Chip({ 
  chip, 
  onSelect, 
  disabled,
  index,
}: { 
  chip: ChipData; 
  onSelect: (prompt: string) => void; 
  disabled?: boolean;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const Icon = chip.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50); // 50ms stagger
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <button
      onClick={() => onSelect(chip.prompt)}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative flex items-center gap-2 px-4 py-2.5 rounded-full
        bg-gray-800/60 backdrop-blur-sm
        border border-gray-700/50
        text-sm font-medium text-gray-200
        hover:border-gray-600
        disabled:opacity-50 disabled:cursor-not-allowed
        group
        active:scale-95
      `}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? (isHovered && !disabled ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)")
          : "translateY(15px) scale(0.95)",
        boxShadow: isHovered && !disabled 
          ? `0 0 20px ${chip.shadowColor}, 0 4px 12px rgba(0,0,0,0.3)` 
          : "0 4px 12px rgba(0,0,0,0.2)",
        transition: isVisible 
          ? "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)"
          : "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Gradient background on hover */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${chip.gradient} transition-opacity duration-300`}
        style={{ opacity: isHovered && !disabled ? 0.15 : 0 }}
      />
      
      {/* Icon with gradient */}
      <div className={`relative bg-gradient-to-r ${chip.gradient} p-1.5 rounded-full`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      
      {/* Label */}
      <span className="relative">{chip.label}</span>
    </button>
  );
}

export default function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTION_CHIPS.map((chip, index) => (
        <Chip
          key={chip.label}
          chip={chip}
          onSelect={onSelect}
          disabled={disabled}
          index={index}
        />
      ))}
    </div>
  );
}
