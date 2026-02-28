import type { DailyPlanResponse } from "../../api/planEndpoints";

interface ProgressStatsProps {
  dailyData: DailyPlanResponse | null;
  goals?: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null } | null;
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
  goal: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min(Math.round((current / goal) * 100), 100);
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
          {Math.round(current)}{unit} / {goal}{unit}
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

export default function ProgressStats({ dailyData, goals }: ProgressStatsProps) {
  const currentCalories = dailyData?.total_calories || 0;
  const goalCalories = goals?.calories || 2000;
  const caloriePercentage = Math.min(Math.round((currentCalories / goalCalories) * 100), 100);

  return (
    <div className="card-editorial p-5 sm:p-6">
      {/* Calories headline */}
      <div className="mb-6">
        <p
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
        >
          Today's Progress
        </p>
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

      <MacroBar
        label="Protein"
        current={dailyData?.total_protein || 0}
        goal={goals?.protein || 150}
        unit="g"
        color="var(--amber)"
      />
      <MacroBar
        label="Carbs"
        current={dailyData?.total_carbs || 0}
        goal={goals?.carbs || 250}
        unit="g"
        color="var(--terracotta)"
      />
      <MacroBar
        label="Fat"
        current={dailyData?.total_fat || 0}
        goal={goals?.fat || 65}
        unit="g"
        color="var(--terracotta)"
      />
    </div>
  );
}
