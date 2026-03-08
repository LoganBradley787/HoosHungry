import type { MenuItem } from "../../api/endpoints";
import type { RatingResult } from "../../api/ratingEndpoints";

interface ItemDetailsPanelProps {
  item: MenuItem;
  onClose: () => void;
  ratingData?: RatingResult;
  onVote?: (isUpvote: boolean | null) => void;
}

const toNumber = (value?: string | null) => {
  if (!value) return null;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : Math.round(parsed);
};

export default function ItemDetailsPanel({
  item,
  onClose,
  ratingData,
  onVote,
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

  const upvotes = ratingData?.upvotes ?? 0;
  const downvotes = ratingData?.downvotes ?? 0;
  const userVote = ratingData?.user_vote ?? null;
  const totalVotes = upvotes + downvotes;
  const upPct = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;
  const downPct = totalVotes > 0 ? 100 - upPct : 0;

  const handleThumb = (isUpvote: boolean) => {
    if (!onVote) return;
    if (userVote === (isUpvote ? "up" : "down")) {
      onVote(null);
    } else {
      onVote(isUpvote);
    }
  };

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
          aria-label="Close"
          className="text-2xl absolute top-3 right-4 sm:top-4 sm:right-6"
          style={{ color: "var(--ink-muted)" }}
        >
          ×
        </button>

        {/* Title */}
        <h2 className="font-display italic pr-8 mb-2" style={{ fontSize: "1.75rem", color: "var(--ink)", fontWeight: 500 }}>
          {item.item_name}
        </h2>

        {/* Description */}
        {item.item_description && (
          <p className="text-sm sm:text-base mb-6" style={{ color: "var(--ink-muted)" }}>
            {item.item_description}
          </p>
        )}

        {/* Calories */}
        <div className="mb-6">
          <div className="font-mono-data text-2xl sm:text-3xl mb-1" style={{ color: "var(--orange)" }}>
            {calories ?? "??"} cal
          </div>
          <div className="text-xs sm:text-sm" style={{ color: "var(--ink-muted)" }}>
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
            <p className="text-xs sm:text-sm" style={{ color: "var(--ink-muted)" }}>
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
            <p className="italic text-xs sm:text-sm" style={{ color: "var(--ink-muted)" }}>
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
                <span style={{ color: "var(--ink-muted)" }}>{label}</span>
                <span className="font-medium">
                  {value !== null ? `${value}${unit}` : "??"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Community Rating */}
        <div className="mb-8">
          <h3 className="section-header-label mb-3">Community Rating</h3>
          {totalVotes === 0 ? (
            <p className="text-xs sm:text-sm mb-3" style={{ color: "var(--ink-muted)" }}>
              No ratings yet — be the first!
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              {/* Upvotes bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--ink-muted)" }}>👍 Liked it</span>
                  <span className="font-medium" style={{ color: "var(--ink)" }}>
                    {upvotes} ({upPct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: "var(--rule)" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: "var(--amber)",
                      width: `${upPct}%`,
                      transition: "width 400ms ease",
                    }}
                  />
                </div>
              </div>
              {/* Downvotes bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--ink-muted)" }}>👎 Didn't like it</span>
                  <span className="font-medium" style={{ color: "var(--ink)" }}>
                    {downvotes} ({downPct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: "var(--rule)" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: "var(--orange-deep)",
                      width: `${downPct}%`,
                      transition: "width 400ms ease",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vote buttons */}
          <div className="flex items-center gap-3">
            {onVote ? (
              <>
                <span className="text-xs" style={{ color: "var(--ink-muted)" }}>Your vote:</span>
                <button
                  onClick={() => handleThumb(true)}
                  className="focus-visible:ring-1 focus-visible:ring-current focus-visible:outline-none rounded-sm"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "1.1rem",
                    color: userVote === "up" ? "var(--amber)" : "var(--ink-muted)",
                    transition: "color 150ms ease",
                    padding: "4px 8px",
                  }}
                  aria-label="Thumbs up"
                >
                  👍
                </button>
                <button
                  onClick={() => handleThumb(false)}
                  className="focus-visible:ring-1 focus-visible:ring-current focus-visible:outline-none rounded-sm"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "1.1rem",
                    color: userVote === "down" ? "var(--orange-deep)" : "var(--ink-muted)",
                    transition: "color 150ms ease",
                    padding: "4px 8px",
                  }}
                  aria-label="Thumbs down"
                >
                  👎
                </button>
                {userVote && (
                  <button
                    onClick={() => onVote(null)}
                    aria-label="Remove your vote"
                    className="text-xs focus-visible:ring-1 focus-visible:ring-current focus-visible:outline-none rounded-sm"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--ink-muted)", padding: "4px 0",
                      textDecoration: "underline",
                    }}
                  >
                    Remove vote
                  </button>
                )}
              </>
            ) : (
              <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                Log in to rate this item.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
