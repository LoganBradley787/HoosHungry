import { ChevronLeft, ChevronRight } from "lucide-react";
import MealSection from "./MealSection";
import type { DailyPlanResponse } from "../../api/planEndpoints";

interface DailyMealPlanProps {
  selectedDate: Date;
  onDateChange: (direction: "prev" | "next") => void;
  dailyData: DailyPlanResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function DailyMealPlan({
  selectedDate,
  onDateChange,
  dailyData,
  loading,
  onRefresh,
}: DailyMealPlanProps) {
  const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center justify-center py-20">
          <div className="text-lg sm:text-xl text-gray-600 animate-pulse">
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
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg">
      {/* Header with Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Daily Meal Plan</h2>

        <div className="flex items-center justify-center sm:justify-end gap-4">
          <button
            onClick={() => onDateChange("prev")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="text-center min-w-[160px] sm:min-w-[180px]">
            <div className="font-semibold text-gray-800 text-sm sm:text-base">
              {dayName}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">{monthDay}</div>
          </div>

          <button
            onClick={() => onDateChange("next")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Meal Sections */}
      <div className="space-y-6">
        <MealSection
          title="Breakfast"
          totalCalories={breakfastCalories}
          items={dailyData?.meals.breakfast || []}
          onRefresh={onRefresh}
        />

        <MealSection
          title="Lunch"
          totalCalories={lunchCalories}
          items={dailyData?.meals.lunch || []}
          onRefresh={onRefresh}
        />

        <MealSection
          title="Dinner"
          totalCalories={dinnerCalories}
          items={dailyData?.meals.dinner || []}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
}
