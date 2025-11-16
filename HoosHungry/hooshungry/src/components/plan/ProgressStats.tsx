export default function ProgressStats() {
  // Mock data - replace with actual state later
  const stats = {
    calories: {
      current: 3284,
      goal: 3500,
      percentage: 94,
    },
    macros: {
      fat: { percentage: 29, label: "Fat" },
      protein: { percentage: 65, label: "Protein" },
      carbs: { percentage: 85, label: "Carbs" },
    },
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
      <h3 className="font-bold text-lg mb-6">Today's Progress</h3>

      {/* Calories Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Calories</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              🔥 {stats.calories.current}
            </span>
            <span className="text-sm text-gray-500">
              / {stats.calories.goal}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 text-right mb-2">
          {stats.calories.percentage}% Goal
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats.calories.percentage}%` }}
          />
        </div>
      </div>

      {/* Macros Progress */}
      <div className="flex gap-4 justify-center">
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
                strokeDasharray={`${stats.macros.fat.percentage * 2.01} 201`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-800">
                {stats.macros.fat.percentage}%
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-2">
            {stats.macros.fat.label}
          </span>
        </div>

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
                strokeDasharray={`${
                  stats.macros.protein.percentage * 2.01
                } 201`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-800">
                {stats.macros.protein.percentage}%
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-2">
            {stats.macros.protein.label}
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
                strokeDasharray={`${stats.macros.carbs.percentage * 2.01} 201`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-800">
                {stats.macros.carbs.percentage}%
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-2">
            {stats.macros.carbs.label}
          </span>
        </div>
      </div>
    </div>
  );
}
