import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import MealItemCard from "./MealItemCard";

interface MealItem {
  id: number;
  name: string;
  calories: number;
}

interface MealSectionProps {
  title: string;
  totalCalories: number;
  items: MealItem[];
}

export default function MealSection({
  title,
  totalCalories,
  items,
}: MealSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
      {/* Section Header */}
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-gray-800">
            {totalCalories} calories
          </div>
          <div className="text-xs text-gray-500">{items.length} items</div>
        </div>
      </div>

      {/* Meal Items */}
      {isExpanded && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No items added yet
            </div>
          ) : (
            items.map((item) => (
              <MealItemCard
                key={item.id}
                name={item.name}
                calories={item.calories}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
