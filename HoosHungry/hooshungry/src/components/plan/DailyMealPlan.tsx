import { ChevronLeft, ChevronRight } from "lucide-react";
import MealSection from "./MealSection";
import type { DailyPlanResponse } from "../../api/planEndpoints";

interface DailyMealPlanProps {
  selectedDate: Date;
  onDateChange: (direction: "prev" | "next") => void;
  dailyData: DailyPlanResponse | null;
  loading: boolean;
  onItemUpdated: (item: import("../../api/planEndpoints").MealItem) => void;
  onItemDeleted: (id: number) => void;
}

export default function DailyMealPlan({
  selectedDate,
  onDateChange,
  dailyData,
  loading,
  onItemUpdated,
  onItemDeleted,
}: DailyMealPlanProps) {
  const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="card-editorial p-6 sm:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-lg sm:text-xl animate-pulse" style={{ color: "var(--ink-muted)" }}>
            Loading meal plan...
          </div>
        </div>
      </div>
    );
  }

  const breakfastCalories =
    dailyData?.meals.breakfast.reduce(
      (sum, item) => sum + item.total_calories,
      0
    ) || 0;
  const lunchCalories =
    dailyData?.meals.lunch.reduce(
      (sum, item) => sum + item.total_calories,
      0
    ) || 0;
  const dinnerCalories =
    dailyData?.meals.dinner.reduce(
      (sum, item) => sum + item.total_calories,
      0
    ) || 0;

  return (
    <div className="card-editorial p-4 sm:p-6 lg:p-8">
      {/* Header with Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>Daily Meal Plan</h2>

        <div className="flex items-center justify-center sm:justify-end gap-4">
          <button
            onClick={() => onDateChange("prev")}
            className="w-8 h-8 flex items-center justify-center transition-colors rounded"
            aria-label="Previous day"
            style={{ color: "var(--ink-muted)" }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center min-w-[160px] sm:min-w-[180px]">
            <div className="font-display italic" style={{ color: "var(--ink)", fontSize: "1.1rem" }}>
              {dayName}
            </div>
            <div className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>{monthDay}</div>
          </div>

          <button
            onClick={() => onDateChange("next")}
            className="w-8 h-8 flex items-center justify-center transition-colors rounded"
            aria-label="Next day"
            style={{ color: "var(--ink-muted)" }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Meal Sections */}
      <div className="space-y-6">
        <MealSection
          title="Breakfast"
          totalCalories={breakfastCalories}
          items={dailyData?.meals.breakfast || []}
          onItemUpdated={onItemUpdated} onItemDeleted={onItemDeleted}
        />

        <MealSection
          title="Lunch"
          totalCalories={lunchCalories}
          items={dailyData?.meals.lunch || []}
          onItemUpdated={onItemUpdated} onItemDeleted={onItemDeleted}
        />

        <MealSection
          title="Dinner"
          totalCalories={dinnerCalories}
          items={dailyData?.meals.dinner || []}
          onItemUpdated={onItemUpdated} onItemDeleted={onItemDeleted}
        />
      </div>
    </div>
  );
}
