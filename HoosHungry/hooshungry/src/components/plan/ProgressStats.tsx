import type { DailyPlanResponse } from "../../api/planEndpoints";

interface ProgressStatsProps {
  dailyData: DailyPlanResponse | null;
  goals?: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  } | null;
}

export default function ProgressStats({
  dailyData,
  goals,
}: ProgressStatsProps) {
  const currentCalories = dailyData?.total_calories || 0;
  const goalCalories = goals?.calories || 2000;
  const caloriePercentage = Math.min(
    Math.round((currentCalories / goalCalories) * 100),
    100
  );

  const currentProtein = dailyData?.total_protein || 0;
  const goalProtein = goals?.protein || 150;
  const proteinPercentage = Math.min(
    Math.round((currentProtein / goalProtein) * 100),
    100
  );

  const currentCarbs = dailyData?.total_carbs || 0;
  const goalCarbs = goals?.carbs || 250;
  const carbsPercentage = Math.min(
    Math.round((currentCarbs / goalCarbs) * 100),
    100
  );

  const currentFat = dailyData?.total_fat || 0;
  const goalFat = goals?.fat || 65;
  const fatPercentage = Math.min(Math.round((currentFat / goalFat) * 100), 100);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
      <h3 className="font-bold text-lg mb-6">Today's Progress</h3>

      {/* Calories Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Calories</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              🔥 {currentCalories}
            </span>
            <span className="text-sm text-gray-500">/ {goalCalories}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 text-right mb-2">
          {caloriePercentage}% Goal
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${caloriePercentage}%` }}
          />
        </div>
      </div>

      {/* Macros Progress */}
      <div className="flex gap-4 justify-center">
        {/* Protein */}
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${proteinPercentage * 2.01} 201`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-800">
                {proteinPercentage}%
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-2">Protein</span>
          <span className="text-xs text-gray-500">
            {Math.round(currentProtein)}g
          </span>
        </div>

        {/* Carbs */}
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#8b5cf6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${carbsPercentage * 2.01} 201`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-800">
                {carbsPercentage}%
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-2">Carbs</span>
          <span className="text-xs text-gray-500">
            {Math.round(currentCarbs)}g
          </span>
        </div>

        {/* Fat */}
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#f59e0b"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${fatPercentage * 2.01} 201`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-800">
                {fatPercentage}%
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-2">Fat</span>
          <span className="text-xs text-gray-500">
            {Math.round(currentFat)}g
          </span>
        </div>
      </div>
    </div>
  );
}
