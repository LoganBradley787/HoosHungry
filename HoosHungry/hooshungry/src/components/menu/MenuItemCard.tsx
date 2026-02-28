import type { MenuItem } from "../../api/endpoints";

interface MenuItemCardProps {
  item: MenuItem;
  onDetails?: (item: MenuItem) => void;
  onAddToPlan?: (item: MenuItem) => void;
}

function SmallMenuItemCard({ item }: MenuItemCardProps) {
  return (
    <div className="px-4 py-3" style={{ backgroundColor: "var(--warm-white)" }}>
      <div className="flex justify-between items-center gap-4">
        <span className="text-sm" style={{ color: "var(--ink)", fontFamily: "'DM Sans', sans-serif" }}>
          {item.item_name}
        </span>
        {item.allergens && item.allergens.length > 0 && (
          <span className="text-xs italic" style={{ color: "var(--ink-muted)" }}>
            {item.allergens
              .map((a) => (a.name === "Information Not Available" ? "Incomplete Allergen Info" : a.name))
              .join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MenuItemCard({ item, onDetails, onAddToPlan }: MenuItemCardProps) {
  const calories = item.nutrition_info?.calories ? Math.round(parseFloat(item.nutrition_info.calories)) : 0;

  if (calories === 0) return <SmallMenuItemCard item={item} />;

  const protein = item.nutrition_info?.protein ? Math.round(parseFloat(item.nutrition_info.protein)) : null;
  const carbs = item.nutrition_info?.total_carbohydrates ? Math.round(parseFloat(item.nutrition_info.total_carbohydrates)) : null;
  const fat = item.nutrition_info?.total_fat ? Math.round(parseFloat(item.nutrition_info.total_fat)) : null;

  return (
    <div className="p-5 sm:p-6" style={{ backgroundColor: "var(--warm-white)" }}>
      {/* Title row */}
      <div className="flex justify-between items-start gap-4 mb-2">
        <h3
          className="font-display italic text-lg leading-tight"
          style={{ color: "var(--ink)", fontWeight: 500 }}
        >
          {item.item_name}
        </h3>
        <span
          className="font-mono-data text-base whitespace-nowrap flex-shrink-0"
          style={{ color: "var(--ink)" }}
        >
          {calories} cal
        </span>
      </div>

      {/* Rule */}
      <hr className="editorial-rule mb-3" />

      {/* Serving size */}
      <p className="text-xs mb-2" style={{ color: "var(--ink-muted)" }}>
        {item.nutrition_info?.serving_size || "1 serving"}
      </p>

      {/* Description */}
      {item.item_description && (
        <p className="text-sm mb-3" style={{ color: "var(--ink-muted)" }}>
          {item.item_description}
        </p>
      )}

      {/* Allergens */}
      {item.allergens && item.allergens.length > 0 && (
        <p className="text-xs italic mb-3" style={{ color: "var(--ink-muted)" }}>
          {item.allergens
            .map((a) => (a.name === "Information Not Available" ? "Incomplete Allergen Info" : a.name))
            .join(", ")}
        </p>
      )}

      {/* Nutrition inline */}
      <div className="flex flex-wrap gap-3 mb-4">
        {protein !== null && (
          <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
            {protein}g P
          </span>
        )}
        {carbs !== null && (
          <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
            {carbs}g C
          </span>
        )}
        {fat !== null && (
          <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
            {fat}g F
          </span>
        )}
      </div>

      {/* Dietary tags */}
      {(item.is_vegan || item.is_vegetarian) && (
        <div className="flex gap-2 mb-4">
          {item.is_vegan && (
            <span
              className="text-xs px-2 py-0.5 rounded-sm"
              style={{ backgroundColor: "var(--cream)", color: "var(--ink-muted)", border: "1px solid var(--rule)" }}
            >
              Vegan
            </span>
          )}
          {item.is_vegetarian && !item.is_vegan && (
            <span
              className="text-xs px-2 py-0.5 rounded-sm"
              style={{ backgroundColor: "var(--cream)", color: "var(--ink-muted)", border: "1px solid var(--rule)" }}
            >
              Vegetarian
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5">
        <button
          className="text-xs transition-colors"
          style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          onClick={() => onDetails?.(item)}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
        >
          Details
        </button>
        <button
          className="text-xs flex items-center gap-1"
          style={{ color: "var(--orange)", fontFamily: "'DM Sans', sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          onClick={() => onAddToPlan?.(item)}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Add to Plan →
        </button>
      </div>
    </div>
  );
}
