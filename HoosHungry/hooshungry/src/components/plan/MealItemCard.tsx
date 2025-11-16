import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface MealItemCardProps {
  name: string;
  calories: number;
}

export default function MealItemCard({ name, calories }: MealItemCardProps) {
  const [servings, setServings] = useState(1);

  const handleDecrement = () => {
    if (servings > 1) {
      setServings(servings - 1);
    }
  };

  const handleIncrement = () => {
    setServings(servings + 1);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-orange-300 transition-all duration-300 flex items-center gap-4">
      {/* Item Info */}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800">{name}</h4>
        <div className="text-sm text-gray-500 transition-all duration-300">
          {calories} calories • {servings} serving{servings !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Serving Controls */}
      <div className="flex items-center gap-3">
        {/* Serving Adjustment */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
          <button
            onClick={handleDecrement}
            disabled={servings === 1}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Decrease servings"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>

          <span className="text-sm font-medium text-gray-800 min-w-[20px] text-center transition-all duration-300">
            {servings}
          </span>

          <button
            onClick={handleIncrement}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all duration-200"
            aria-label="Increase servings"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Delete Button */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-all duration-200 text-gray-400 hover:text-red-500"
          aria-label="Remove item"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
