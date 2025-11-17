import { useState } from "react";
import type { MenuItem } from "../../api/endpoints";
import { planAPI } from "../../api/planEndpoints";
import { useAuth } from "../../contexts/AuthContext";

interface MenuItemCardProps {
  item: MenuItem;
  onDetails?: (item: MenuItem) => void;
}

// Small card for sides (0 calories)
function SmallMenuItemCard({ item }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200 hover:border-orange-300 transition">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm">{item.item_name}</h4>
        {item.allergens && item.allergens.length > 0 && (
          <span className="text-xs text-gray-500 ml-2 italic">
            {item.allergens
              .map((a) =>
                a.name === "Information Not Available"
                  ? "Incomplete Allergen Info"
                  : a.name
              )
              .join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}

// Regular card for full menu items
export default function MenuItemCard({ item, onDetails }: MenuItemCardProps) {
  const calories = item.nutrition_info?.calories
    ? Math.round(parseFloat(item.nutrition_info.calories))
    : 0;

  // If no calories, render the small card
  if (calories === 0) {
    return <SmallMenuItemCard item={item} />;
  }

  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToPlan = async () => {
    if (!user) {
      alert("Please log in to add items to your plan");
      return;
    }

    const mealType = prompt(
      "Which meal? (breakfast, lunch, dinner, snack)"
    )?.toLowerCase();

    if (
      !mealType ||
      !["breakfast", "lunch", "dinner", "snack"].includes(mealType)
    ) {
      return;
    }

    try {
      setIsAdding(true);
      const today = new Date().toISOString().split("T")[0];

      await planAPI.addMealItem({
        date: today,
        menu_item_id: item.id,
        meal_type: mealType as "breakfast" | "lunch" | "dinner" | "snack",
        servings: 1,
      });

      alert("Item added to your plan!");
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Failed to add item to plan");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-5 shadow-sm border border-blue-100">
      {/* Header row: title and calories */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{item.item_name}</h3>
        <div className="text-right ml-4 flex-shrink-0">
          <div className="text-xl font-bold text-gray-800">
            {calories.toFixed(2)} cal
          </div>
          <div className="text-sm text-gray-500">
            {item.nutrition_info?.serving_size || "1 serving"}
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left column: description and allergens */}
        <div>
          {item.item_description && (
            <p className="text-sm text-gray-600 mb-3">
              {item.item_description}
            </p>
          )}

          {item.allergens && item.allergens.length > 0 && (
            <p className="text-sm text-gray-600 italic">
              {item.allergens
                .map((a) =>
                  a.name === "Information Not Available"
                    ? "Incomplete Allergen Info"
                    : a.name
                )
                .join(", ")}
            </p>
          )}
        </div>

        {/* Right column: nutrition bars */}
        <div className="space-y-2">
          {/* Protein bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              {item.nutrition_info?.protein && (
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (parseFloat(item.nutrition_info.protein) / 50) * 100,
                      100
                    )}%`,
                  }}
                />
              )}
            </div>
            <span className="text-sm text-gray-700 w-14 text-right">
              {item.nutrition_info?.protein
                ? `${Math.round(parseFloat(item.nutrition_info.protein))}g P`
                : "?? g P"}
            </span>
          </div>

          {/* Carbs bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              {item.nutrition_info?.total_carbohydrates && (
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (parseFloat(item.nutrition_info.total_carbohydrates) /
                        100) *
                        100,
                      100
                    )}%`,
                  }}
                />
              )}
            </div>
            <span className="text-sm text-gray-700 w-14 text-right">
              {item.nutrition_info?.total_carbohydrates
                ? `${Math.round(
                    parseFloat(item.nutrition_info.total_carbohydrates)
                  )}g C`
                : "?? g C"}
            </span>
          </div>

          {/* Fat bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              {item.nutrition_info?.total_fat && (
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (parseFloat(item.nutrition_info.total_fat) / 30) * 100,
                      100
                    )}%`,
                  }}
                />
              )}
            </div>
            <span className="text-sm text-gray-700 w-14 text-right">
              {item.nutrition_info?.total_fat
                ? `${Math.round(parseFloat(item.nutrition_info.total_fat))}g F`
                : "?? g F"}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <button
          className="px-8 py-2.5 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          onClick={() => onDetails?.(item)}
        >
          Details
        </button>
        <button
          className="px-8 py-2.5 bg-white border-2 border-orange-400 rounded-full text-sm font-semibold text-orange-500 hover:bg-orange-50 transition disabled:opacity-50"
          onClick={handleAddToPlan}
          disabled={isAdding}
        >
          {isAdding ? "Adding..." : "Add to Plan"}
        </button>
      </div>
    </div>
  );
}
