import { ChevronLeft, ChevronRight } from "lucide-react";
import MealSection from "./MealSection";

interface DailyMealPlanProps {
  selectedDate: Date;
  onDateChange: (direction: "prev" | "next") => void;
}

// Mock data for placeholder
const MOCK_MEALS = {
  breakfast: [
    { id: 1, name: "Scrambled Eggs", calories: 1284 },
    { id: 2, name: "Scrambled Eggs", calories: 1284 },
    { id: 3, name: "Scrambled Eggs", calories: 1284 },
  ],
  lunch: [],
  dinner: [
    { id: 4, name: "Scrambled Eggs", calories: 1284 },
    { id: 5, name: "Scrambled Eggs", calories: 1284 },
    { id: 6, name: "Scrambled Eggs", calories: 1284 },
  ],
};

export default function DailyMealPlan({
  selectedDate,
  onDateChange,
}: DailyMealPlanProps) {
  const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Daily Meal Plan</h2>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onDateChange("prev")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="text-center min-w-[180px]">
            <div className="font-semibold text-gray-800">{dayName}</div>
            <div className="text-sm text-gray-600">{monthDay}</div>
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
          totalCalories={1284}
          items={MOCK_MEALS.breakfast}
        />

        <MealSection
          title="Lunch"
          totalCalories={1284}
          items={MOCK_MEALS.lunch}
        />

        <MealSection
          title="Dinner"
          totalCalories={1284}
          items={MOCK_MEALS.dinner}
        />
      </div>
    </div>
  );
}
