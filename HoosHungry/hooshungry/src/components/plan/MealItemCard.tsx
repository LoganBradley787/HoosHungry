import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { planAPI, type MealItem } from "../../api/planEndpoints";

interface MealItemCardProps {
  item: MealItem;
  onRefresh: () => void;
}

export default function MealItemCard({ item, onRefresh }: MealItemCardProps) {
  // Convert servings to number if it's a string
  const [servings, setServings] = useState(Number(item.servings));
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDecrement = async () => {
    if (servings <= 0.25 || isUpdating) return;

    const newServings = Math.max(
      0.25,
      Math.round((servings - 0.25) * 100) / 100
    );
    setServings(newServings);

    try {
      setIsUpdating(true);
      await planAPI.updateMealItem(item.id, newServings);
      onRefresh();
    } catch (error) {
      console.error("Failed to update servings:", error);
      setServings(Number(item.servings));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = async () => {
    if (isUpdating) return;

    const newServings = Math.round((servings + 0.25) * 100) / 100;
    setServings(newServings);

    try {
      setIsUpdating(true);
      await planAPI.updateMealItem(item.id, newServings);
      onRefresh();
    } catch (error) {
      console.error("Failed to update servings:", error);
      setServings(Number(item.servings));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      await planAPI.deleteMealItem(item.id);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const displayCalories = Math.round(item.calories_per_serving * servings);

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:border-orange-300 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
            {item.menu_item_name}
          </h4>
          <div className="text-xs sm:text-sm text-gray-500 transition-all duration-300">
            {displayCalories} calories • {Number(servings).toFixed(2)} serving
            {servings !== 1 ? "s" : ""}
          </div>
          <div className="text-xs text-gray-400 mt-1 truncate">
            {item.dining_hall} - {item.station_name}
          </div>
        </div>

        {/* Serving Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Serving Adjustment */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={handleDecrement}
              disabled={servings <= 0.25 || isUpdating}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease servings"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>

            <span className="text-xs sm:text-sm font-medium text-gray-800 min-w-[32px] text-center transition-all duration-300">
              {Number(servings).toFixed(2)}
            </span>

            <button
              onClick={handleIncrement}
              disabled={isUpdating}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase servings"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-all duration-200 text-gray-400 hover:text-red-500 disabled:opacity-40"
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
    </div>
  );
}
