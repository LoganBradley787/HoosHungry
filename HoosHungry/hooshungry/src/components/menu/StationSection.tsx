import { useState } from "react";
import type { MenuItem, Station } from "../../api/endpoints";
import MenuItemCard from "./MenuItemCard";
import type { RatingResult } from "../../api/ratingEndpoints";

interface StationSectionProps {
  station: Station;
  onDetails: (item: MenuItem) => void;
  onAddToPlan: (item: MenuItem) => void;
  onFavorite?: (item: MenuItem) => void;
  isFavorite?: (name: string) => boolean;
  getRating?: (item_name: string) => RatingResult;
  onVote?: (item_name: string, isUpvote: boolean | null) => void;
}

export default function StationSection({ station, onDetails, onAddToPlan, onFavorite, isFavorite, getRating, onVote }: StationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const mainItems = station.menu_items.filter((item) => {
    const calories = item.nutrition_info?.calories ? Math.round(parseFloat(item.nutrition_info.calories)) : 0;
    return calories > 0;
  });

  const sides = station.menu_items.filter((item) => {
    const calories = item.nutrition_info?.calories ? Math.round(parseFloat(item.nutrition_info.calories)) : 0;
    return calories === 0;
  });

  return (
    <div className="mb-10">
      {/* Newspaper-style section header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="section-header w-full text-left"
        style={{ background: "none", cursor: "pointer", border: "none" }}
      >
        <span className="section-header-label">{station.name}</span>
        <div className="section-header-rule" />
        <span
          className="text-xs whitespace-nowrap"
          style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
        >
          {station.menu_items.length} items {isExpanded ? "↑" : "↓"}
        </span>
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {mainItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px mb-px" style={{ backgroundColor: "var(--rule)" }}>
            {mainItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onDetails={() => onDetails(item)}
                onAddToPlan={() => onAddToPlan(item)}
                onFavorite={onFavorite}
                isFavorited={isFavorite?.(item.item_name)}
                ratingData={getRating?.(item.item_name)}
                onVote={onVote ? (isUpvote) => onVote(item.item_name, isUpvote) : undefined}
              />
            ))}
          </div>
        )}

        {sides.length > 0 && (
          <div className="mt-4">
            <div className="section-header">
              <span className="section-header-label">Sides & Add-ons</span>
              <div className="section-header-rule" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: "var(--rule)" }}>
              {sides.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onFavorite={onFavorite}
                  isFavorited={isFavorite?.(item.item_name)}
                  ratingData={getRating?.(item.item_name)}
                  onVote={onVote ? (isUpvote) => onVote(item.item_name, isUpvote) : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
