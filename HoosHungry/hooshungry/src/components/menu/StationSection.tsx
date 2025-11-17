import { useState } from "react";
import type { MenuItem, Station } from "../../api/endpoints";
import MenuItemCard from "./MenuItemCard";

interface StationSectionProps {
  station: Station;
  onDetails: (item: MenuItem) => void;
  onAddToPlan: (item: MenuItem) => void;
}

export default function StationSection({ station, onDetails, onAddToPlan }: StationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Separate items into main dishes and sides
  const mainItems = station.menu_items.filter((item) => {
    const calories = item.nutrition_info?.calories
      ? Math.round(parseFloat(item.nutrition_info.calories))
      : 0;
    return calories > 0;
  });

  const sides = station.menu_items.filter((item) => {
    const calories = item.nutrition_info?.calories
      ? Math.round(parseFloat(item.nutrition_info.calories))
      : 0;
    return calories === 0;
  });

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{station.name}</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 flex items-center gap-2 hover:text-gray-800 transition-colors"
        >
          <span className="text-sm">{station.menu_items.length} items</span>
          <span
            className={`transform transition-transform duration-300 ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
          >
            ▼
          </span>
        </button>
      </div>

      {/* Animated content wrapper */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="transition-all duration-300">
          {/* Main Items in 2-column grid */}
          {mainItems.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {mainItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onDetails={() => onDetails(item)}
                  onAddToPlan={() => onAddToPlan(item)}
                />
              ))}
            </div>
          )}

          {/* Sides in multi-column grid at bottom */}
          {sides.length > 0 && (
            <>
              {mainItems.length > 0 && (
                <h3 className="text-sm font-semibold text-gray-600 mb-3 mt-6">
                  Sides & Add-ons
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sides.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
