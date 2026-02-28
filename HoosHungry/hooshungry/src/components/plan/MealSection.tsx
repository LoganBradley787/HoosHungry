import { useState } from "react";
import MealItemCard from "./MealItemCard";
import type { MealItem } from "../../api/planEndpoints";

interface MealSectionProps {
  title: string;
  totalCalories: number;
  items: MealItem[];
  onRefresh: () => void;
}

export default function MealSection({ title, totalCalories, items, onRefresh }: MealSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="pb-6 last:pb-0" style={{ borderBottom: "1px solid var(--rule)" }}>
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="section-header flex-1 mb-0 mr-4">
          <span className="section-header-label">{title}</span>
          <div className="section-header-rule" />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
            {totalCalories} cal
          </span>
          <span className="text-xs" style={{ color: "var(--ink-muted)" }}>
            {isExpanded ? "↑" : "↓"}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--ink-muted)" }}>
              No items added yet
            </div>
          ) : (
            items.map((item) => (
              <MealItemCard key={item.id} item={item} onRefresh={onRefresh} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
