import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MenuItem } from "../../api/endpoints";
import { planAPI } from "../../api/planEndpoints";
import { useAuth } from "../../contexts/AuthContext";

interface AddToPlanPopupProps {
  item: MenuItem;
  stationMealType: string;
  onClose: () => void;
}

type Meal = "breakfast" | "lunch" | "dinner";
type Normalized = Meal | "needs-choice";

/**
 * Convert the dining hall's period name into a concrete meal plan bucket.
 * Breakfast → breakfast
 * Brunch → lunch
 * Late Night → dinner
 * All Day / Grill / other → needs-choice
 */
const normalizeMeal = (raw: string): Normalized => {
  const value = raw.toLowerCase();

  if (value.includes("breakfast")) return "breakfast";
  if (value.includes("brunch")) return "lunch";
  if (value.includes("lunch")) return "lunch";
  if (value.includes("dinner")) return "dinner";
  if (value.includes("late")) return "dinner";

  return "needs-choice";
};

export default function AddToPlanPopup({
  item,
  stationMealType,
  onClose,
}: AddToPlanPopupProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const normalized = normalizeMeal(stationMealType);

  // If the meal type is clear, we pre-select it. Otherwise require the user to pick.
  const [userMealChoice, setUserMealChoice] = useState<Meal | null>(
    normalized === "needs-choice" ? null : normalized
  );

  const selectedMeal = userMealChoice;

  /**
   * Sends the item to the user's meal plan.
   */
  const handleConfirm = async () => {
    if (!user || !selectedMeal) return;

    try {
      setIsSaving(true);

      const today = new Date().toISOString().split("T")[0];

      await planAPI.addMealItem({
        date: today,
        menu_item_id: item.id,
        meal_type: selectedMeal,
        servings: 1,
      });

      onClose();
    } catch (err) {
      console.error("Failed to add item:", err);
      alert("Failed to add item to plan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      {/* Outside click closes popup */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-md p-8 animate-fadeIn"
        style={{
          backgroundColor: "var(--warm-white)",
          border: "1px solid var(--rule)",
          borderRadius: "8px",
          boxShadow: "0 8px 40px rgba(26,18,8,0.12)",
        }}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
        >
          ×
        </button>

        {/* ---- LOGIN REQUIRED ---- */}
        {!user ? (
          <>
            <h2 className="font-display italic text-2xl mb-2" style={{ color: "var(--ink)" }}>Log In Required</h2>
            <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
              You must be logged in to add items to your meal plan.
            </p>

            <div className="flex justify-end gap-3 mt-8">
              <button
                className="px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer" }}
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="px-5 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: "var(--orange)", borderRadius: "4px" }}
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ---- ADD TO PLAN ---- */}
            <h2 className="font-display italic text-2xl mb-2" style={{ color: "var(--ink)" }}>Add to Plan</h2>
            <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>{item.item_name}</p>

            {normalized === "needs-choice" ? (
              <>
                <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
                  Which meal do you want to add this item to?
                </p>

                {/* Vertical 3-button list */}
                <div className="flex flex-col gap-3 mb-6">
                  {(["breakfast", "lunch", "dinner"] as Meal[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setUserMealChoice(m)}
                      className="w-full px-4 py-2.5 text-sm text-left transition-colors"
                      style={{
                        border: `1px solid ${userMealChoice === m ? "var(--orange)" : "var(--rule)"}`,
                        backgroundColor: userMealChoice === m ? "var(--cream)" : "transparent",
                        color: userMealChoice === m ? "var(--orange)" : "var(--ink-muted)",
                        borderRadius: "4px",
                        fontFamily: "'DM Sans', sans-serif",
                        cursor: "pointer",
                      }}
                    >
                      {m[0].toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="mb-6">
                <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
                  Add to{" "}
                  <span className="font-semibold">
                    {normalized[0].toUpperCase() + normalized.slice(1)}
                  </span>
                  ?
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer" }}
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                disabled={!selectedMeal || isSaving}
                onClick={handleConfirm}
                className="px-5 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: "var(--orange)", borderRadius: "4px" }}
              >
                {isSaving ? "Adding..." : "Add"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
