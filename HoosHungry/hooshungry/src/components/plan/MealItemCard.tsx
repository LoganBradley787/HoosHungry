import { useState } from "react";
import { Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { planAPI, type MealItem } from "../../api/planEndpoints";

interface MealItemCardProps {
  item: MealItem;
  onItemUpdated: (item: MealItem) => void;
  onItemDeleted: (id: number) => void;
}

function NutrientRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex justify-between text-xs" style={{ color: "var(--ink-muted)" }}>
      <span>{label}</span>
      <span className="font-mono-data">{Math.round(value * 10) / 10}{unit}</span>
    </div>
  );
}

export default function MealItemCard({ item, onItemUpdated, onItemDeleted }: MealItemCardProps) {
  const [servings, setServings] = useState(Number(item.servings));
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleDecrement = async () => {
    if (servings <= 0.25 || isUpdating) return;
    const newServings = Math.max(0.25, Math.round((servings - 0.25) * 100) / 100);
    setServings(newServings);
    try {
      setIsUpdating(true);
      const updated = await planAPI.updateMealItem(item.id, newServings);
      onItemUpdated(updated);
    } catch {
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
      const updated = await planAPI.updateMealItem(item.id, newServings);
      onItemUpdated(updated);
    } catch {
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
      onItemDeleted(item.id);
    } catch {
      setIsUpdating(false);
    }
  };

  const displayCalories = Math.round(item.calories_per_serving * servings);

  return (
    <div
      className="transition-colors"
      style={{ backgroundColor: "var(--warm-white)", border: "1px solid var(--rule)", borderRadius: "6px" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--orange)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--rule)")}
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-display italic text-base truncate" style={{ color: "var(--ink)" }}>
              {item.menu_item_name}
            </h4>
            <div className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
              {displayCalories} cal · {Number(servings).toFixed(2)} serving{servings !== 1 ? "s" : ""}
            </div>
            <div className="text-xs mt-0.5 truncate" style={{ color: "var(--ink-muted)", opacity: 0.7 }}>
              {item.dining_hall} · {item.station_name}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Nutrition expand toggle */}
            <button
              onClick={() => setExpanded(e => !e)}
              className="w-7 h-7 flex items-center justify-center rounded transition-colors"
              style={{ color: "var(--ink-muted)" }}
              aria-label={expanded ? "Hide nutrition" : "Show nutrition"}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Serving Adjustment */}
            <div className="flex items-center gap-2 rounded px-1" style={{ backgroundColor: "var(--cream)" }}>
              <button
                onClick={handleDecrement}
                disabled={servings <= 0.25 || isUpdating}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease servings"
              >
                <Minus className="w-4 h-4" style={{ color: "var(--ink-muted)" }} />
              </button>
              <span className="font-mono-data text-xs min-w-[32px] text-center" style={{ color: "var(--ink)" }}>
                {Number(servings).toFixed(2)}
              </span>
              <button
                onClick={handleIncrement}
                disabled={isUpdating}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase servings"
              >
                <Plus className="w-4 h-4" style={{ color: "var(--ink-muted)" }} />
              </button>
            </div>

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-40"
              style={{ color: "var(--ink-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
              aria-label="Remove item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable nutrition panel */}
      {expanded && (
        <div
          className="px-3 sm:px-4 pb-3 pt-1 space-y-1.5 border-t"
          style={{ borderColor: "var(--rule)" }}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
            <NutrientRow label="Protein" value={item.total_protein} unit="g" />
            <NutrientRow label="Carbs" value={item.total_carbs} unit="g" />
            <NutrientRow label="Fat" value={item.total_fat} unit="g" />
            <NutrientRow label="Fiber" value={item.total_fiber} unit="g" />
            <NutrientRow label="Sodium" value={item.total_sodium} unit="mg" />
            <NutrientRow label="Sugar" value={item.total_sugar} unit="g" />
            <NutrientRow label="Cholesterol" value={item.total_cholesterol} unit="mg" />
            <NutrientRow label="Saturated Fat" value={item.total_saturated_fat} unit="g" />
            <NutrientRow label="Trans Fat" value={item.total_trans_fat} unit="g" />
          </div>
        </div>
      )}
    </div>
  );
}
