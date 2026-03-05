import { useState } from "react";
import type { DailyPlanResponse } from "../../api/planEndpoints";

interface ProgressStatsProps {
  dailyData: DailyPlanResponse | null;
  goals?: DailyPlanResponse["goals"] | null;
  onSetGoalsClick: () => void;
}

function MacroBar({
  label,
  current,
  goal,
  unit,
  color,
}: {
  label: string;
  current: number;
  goal: number | null;
  unit: string;
  color: string;
}) {
  const pct = goal && goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
        >
          {label}
        </span>
        <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
          {Math.round(current)}{unit}{goal ? ` / ${goal}${unit}` : ""}
        </span>
      </div>
      <div className="w-full h-1 rounded-full" style={{ backgroundColor: "var(--rule)" }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function NutrientReadout({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div
      className="flex justify-between text-xs py-1"
      style={{ borderBottom: "1px solid var(--rule)", color: "var(--ink-muted)" }}
    >
      <span>{label}</span>
      <span className="font-mono-data">{Math.round(value * 10) / 10}{unit}</span>
    </div>
  );
}

export default function ProgressStats({ dailyData, goals, onSetGoalsClick }: ProgressStatsProps) {
  const [showMore, setShowMore] = useState(false);

  const currentCalories = dailyData?.total_calories || 0;
  const goalCalories = goals?.calories || 2000;
  const caloriePercentage = Math.min(Math.round((currentCalories / goalCalories) * 100), 100);

  return (
    <div className="card-editorial p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
        >
          Today's Progress
        </p>
        <button
          onClick={onSetGoalsClick}
          className="text-xs underline transition-colors"
          style={{ color: "var(--ink-muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--orange)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
        >
          Set Goals
        </button>
      </div>

      {/* Calories headline */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span
            className="font-display italic"
            style={{ fontSize: "2.5rem", color: "var(--ink)", lineHeight: 1, fontWeight: 400 }}
          >
            {currentCalories.toLocaleString()}
          </span>
          <span className="font-mono-data text-sm" style={{ color: "var(--ink-muted)" }}>
            / {goalCalories} kcal
          </span>
        </div>
        <div className="w-full h-1 rounded-full mt-3" style={{ backgroundColor: "var(--rule)" }}>
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{ width: `${caloriePercentage}%`, backgroundColor: "var(--orange)" }}
          />
        </div>
      </div>

      <hr className="editorial-rule mb-5" />

      {/* Primary macros */}
      <MacroBar
        label="Protein"
        current={dailyData?.total_protein || 0}
        goal={goals?.protein ?? 150}
        unit="g"
        color="var(--amber)"
      />
      <MacroBar
        label="Carbs"
        current={dailyData?.total_carbs || 0}
        goal={goals?.carbs ?? 250}
        unit="g"
        color="var(--terracotta)"
      />
      <MacroBar
        label="Fat"
        current={dailyData?.total_fat || 0}
        goal={goals?.fat ?? 65}
        unit="g"
        color="var(--terracotta)"
      />

      <hr className="editorial-rule mb-4 mt-2" />

      {/* Secondary: fiber & sodium */}
      <MacroBar
        label="Fiber"
        current={dailyData?.total_fiber || 0}
        goal={goals?.fiber ?? 28}
        unit="g"
        color="var(--amber)"
      />
      <MacroBar
        label="Sodium"
        current={dailyData?.total_sodium || 0}
        goal={goals?.sodium ?? 2300}
        unit="mg"
        color="var(--terracotta)"
      />

      {/* Expand toggle */}
      <button
        onClick={() => setShowMore(s => !s)}
        className="mt-2 text-xs transition-colors"
        style={{ color: "var(--ink-muted)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--orange)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
      >
        {showMore ? "Hide nutrients ↑" : "More nutrients ↓"}
      </button>

      {showMore && (
        <div className="mt-3 space-y-0">
          <NutrientReadout label="Sugar" value={dailyData?.total_sugar || 0} unit="g" />
          <NutrientReadout label="Cholesterol" value={dailyData?.total_cholesterol || 0} unit="mg" />
          <NutrientReadout label="Saturated Fat" value={dailyData?.total_saturated_fat || 0} unit="g" />
          <NutrientReadout label="Trans Fat" value={dailyData?.total_trans_fat || 0} unit="g" />
        </div>
      )}
    </div>
  );
}
