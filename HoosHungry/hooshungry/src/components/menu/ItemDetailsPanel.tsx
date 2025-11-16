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

export default function ItemDetailsPanel({ item, onClose }: ItemDetailsPanelProps) {
  const calories = toNumber(item.nutrition_info?.calories);

  const macros = [
    ["Protein", toNumber(item.nutrition_info?.protein), "g"] as const,
    ["Carbs", toNumber(item.nutrition_info?.total_carbohydrates), "g"] as const,
    ["Fat", toNumber(item.nutrition_info?.total_fat), "g"] as const,
  ];

  const micros = [
    ["Cholesterol", toNumber(item.nutrition_info?.cholesterol), "mg"] as const,
    ["Saturated Fat", toNumber(item.nutrition_info?.saturated_fat), "g"] as const,
    ["Trans Fat", toNumber(item.nutrition_info?.trans_fat), "g"] as const,
    ["Sugars", toNumber(item.nutrition_info?.total_sugars), "g"] as const,
    ["Dietary Fiber", toNumber(item.nutrition_info?.dietary_fiber), "g"] as const,
    ["Sodium", toNumber(item.nutrition_info?.sodium), "mg"] as const,
  ];

  const dietaryFlags = [
    item.is_vegan && "Vegan",
    item.is_vegetarian && "Vegetarian",
    item.is_gluten && "Contains Gluten",
  ].filter(Boolean) as string[];

  const allergens = item.allergens ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      {/* Click outside to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Centered card */}
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-xl p-8 overflow-y-auto animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl absolute top-4 right-6"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-2">{item.item_name}</h2>

        {/* Description */}
        {item.item_description && (
          <p className="text-gray-700 mb-6">{item.item_description}</p>
        )}

        {/* Calories */}
        <div className="mb-6">
          <div className="text-3xl font-semibold text-blue-700 mb-1">
            {calories ?? "??"} cal
          </div>
          <div className="text-sm text-gray-500">
            {item.nutrition_info?.serving_size || "1 serving"}
          </div>
        </div>

        {/* Dietary flags */}
        {dietaryFlags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Dietary</h3>
            <div className="flex flex-wrap gap-2">
              {dietaryFlags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium"
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
            <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
            <p className="text-sm text-gray-700">
              {item.ingredients}
            </p>
          </div>
        )}

        {/* Allergens */}
        {allergens.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Allergens</h3>
            <p className="italic text-gray-600 text-sm">
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
          <h3 className="text-lg font-semibold mb-3">Macronutrients</h3>
          <div className="space-y-3">
            {macros.map(([label, value, unit]) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{label}</span>
                  <span className="font-medium">
                    {value !== null ? `${value}${unit}` : "??"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  {value !== null && (
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{
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
          <h3 className="text-lg font-semibold mb-3">Micronutrients</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12 text-sm">
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