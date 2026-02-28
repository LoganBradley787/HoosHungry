import type { MenuItem } from "../../api/endpoints";

interface ItemDetailsPanelProps {
  item: MenuItem;
  onClose: () => void;
}

const toNumber = (value?: string | null) => {
  if (!value) return null;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : Math.round(parsed);
};

export default function ItemDetailsPanel({
  item,
  onClose,
}: ItemDetailsPanelProps) {
  const calories = toNumber(item.nutrition_info?.calories);

  const macros = [
    ["Protein", toNumber(item.nutrition_info?.protein), "g"] as const,
    ["Carbs", toNumber(item.nutrition_info?.total_carbohydrates), "g"] as const,
    ["Fat", toNumber(item.nutrition_info?.total_fat), "g"] as const,
  ];

  const micros = [
    ["Cholesterol", toNumber(item.nutrition_info?.cholesterol), "mg"] as const,
    [
      "Saturated Fat",
      toNumber(item.nutrition_info?.saturated_fat),
      "g",
    ] as const,
    ["Trans Fat", toNumber(item.nutrition_info?.trans_fat), "g"] as const,
    ["Sugars", toNumber(item.nutrition_info?.total_sugars), "g"] as const,
    [
      "Dietary Fiber",
      toNumber(item.nutrition_info?.dietary_fiber),
      "g",
    ] as const,
    ["Sodium", toNumber(item.nutrition_info?.sodium), "mg"] as const,
  ];

  const dietaryFlags = [
    item.is_vegan && "Vegan",
    item.is_vegetarian && "Vegetarian",
    item.is_gluten && "Contains Gluten",
  ].filter(Boolean) as string[];

  const allergens = item.allergens ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Centered card */}
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-fadeIn"
        style={{
          backgroundColor: "var(--warm-white)",
          border: "1px solid var(--rule)",
          borderRadius: "8px",
          boxShadow: "0 8px 40px rgba(26,18,8,0.12)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl absolute top-3 right-4 sm:top-4 sm:right-6"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="font-display italic pr-8 mb-2" style={{ fontSize: "1.75rem", color: "var(--ink)", fontWeight: 500 }}>
          {item.item_name}
        </h2>

        {/* Description */}
        {item.item_description && (
          <p className="text-sm sm:text-base text-gray-700 mb-6">
            {item.item_description}
          </p>
        )}

        {/* Calories */}
        <div className="mb-6">
          <div className="font-mono-data text-2xl sm:text-3xl mb-1" style={{ color: "var(--orange)" }}>
            {calories ?? "??"} cal
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {item.nutrition_info?.serving_size || "1 serving"}
          </div>
        </div>

        {/* Dietary flags */}
        {dietaryFlags.length > 0 && (
          <div className="mb-6">
            <h3 className="section-header-label mb-3">Dietary</h3>
            <div className="flex flex-wrap gap-2">
              {dietaryFlags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-sm"
                  style={{ backgroundColor: "var(--cream)", color: "var(--ink-muted)", border: "1px solid var(--rule)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        {item.ingredients && (
          <div className="mb-6">
            <h3 className="section-header-label mb-3">
              Ingredients
            </h3>
            <p className="text-xs sm:text-sm text-gray-700">
              {item.ingredients}
            </p>
          </div>
        )}

        {/* Allergens */}
        {allergens.length > 0 && (
          <div className="mb-6">
            <h3 className="section-header-label mb-3">
              Allergens
            </h3>
            <p className="italic text-gray-600 text-xs sm:text-sm">
              {allergens
                .map((a) =>
                  a.name === "Information Not Available"
                    ? "Incomplete Allergen Info"
                    : a.name
                )
                .join(", ")}
            </p>
          </div>
        )}

        {/* Macros */}
        <div className="mb-8">
          <h3 className="section-header-label mb-3">
            Macronutrients
          </h3>
          <div className="space-y-3">
            {macros.map(([label, value, unit]) => (
              <div key={label}>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span>{label}</span>
                  <span className="font-medium">
                    {value !== null ? `${value}${unit}` : "??"}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full" style={{ backgroundColor: "var(--rule)" }}>
                  {value !== null && (
                    <div
                      className="h-1 rounded-full"
                      style={{
                        backgroundColor: label === "Protein" ? "var(--amber)" : "var(--terracotta)",
                        width:
                          label === "Protein"
                            ? `${Math.min((value / 50) * 100, 100)}%`
                            : label === "Carbs"
                            ? `${Math.min((value / 100) * 100, 100)}%`
                            : `${Math.min((value / 30) * 100, 100)}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Micros */}
        <div className="mb-8">
          <h3 className="section-header-label mb-3">
            Micronutrients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12 text-xs sm:text-sm">
            {micros.map(([label, value, unit]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium">
                  {value !== null ? `${value}${unit}` : "??"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
