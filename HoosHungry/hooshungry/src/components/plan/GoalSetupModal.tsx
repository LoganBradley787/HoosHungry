import { useState } from "react";
import { accountAPI, type SuggestedGoals } from "../../api/accountEndpoints";
import { planAPI } from "../../api/planEndpoints";

type GoalType = "maintain" | "lose" | "gain";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

interface GoalSetupModalProps {
  currentDate: Date;
  onClose: () => void;
  onSaved: () => void;
}

const GOAL_OPTIONS: { value: GoalType; label: string; desc: string }[] = [
  { value: "maintain", label: "Maintain Weight", desc: "Keep current weight steady" },
  { value: "lose", label: "Lose Weight", desc: "Moderate calorie deficit" },
  { value: "gain", label: "Gain Muscle", desc: "Slight calorie surplus" },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Mostly sitting, little exercise" },
  { value: "light", label: "Lightly Active", desc: "Light exercise 1–3 days/week" },
  { value: "moderate", label: "Moderately Active", desc: "Moderate exercise 3–5 days/week" },
  { value: "active", label: "Very Active", desc: "Hard exercise 6–7 days/week" },
  { value: "very_active", label: "Extremely Active", desc: "Physical job + hard training" },
];

export default function GoalSetupModal({ currentDate, onClose, onSaved }: GoalSetupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goalType, setGoalType] = useState<GoalType>("maintain");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [editedGoals, setEditedGoals] = useState<SuggestedGoals | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      setError(null);
      try {
        await accountAPI.updateProfile({ goal_type: goalType, activity_level: activityLevel });
        const suggested = await accountAPI.suggestGoals();
        setEditedGoals({ ...suggested });
        setStep(3);
      } catch {
        setError("Failed to load suggestions. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!editedGoals) return;
    setSaving(true);
    setError(null);
    try {
      const dateStr = currentDate.toISOString().split("T")[0];
      await accountAPI.updateProfile({
        default_calorie_goal: editedGoals.calories,
        default_protein_goal: editedGoals.protein,
        default_carbs_goal: editedGoals.carbs,
        default_fat_goal: editedGoals.fat,
      });
      await planAPI.updateGoals(dateStr, {
        daily_calorie_goal: editedGoals.calories,
        daily_protein_goal: editedGoals.protein,
        daily_carbs_goal: editedGoals.carbs,
        daily_fat_goal: editedGoals.fat,
        daily_fiber_goal: editedGoals.fiber,
        daily_sodium_goal: editedGoals.sodium,
      });
      onSaved();
      onClose();
    } catch {
      setError("Failed to save goals. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const nutrientKeys: (keyof SuggestedGoals)[] = ["calories", "protein", "carbs", "fat", "fiber", "sodium"];
  const nutrientLabels: Record<keyof SuggestedGoals, string> = {
    calories: "Calories (kcal)",
    protein: "Protein (g)",
    carbs: "Carbs (g)",
    fat: "Fat (g)",
    fiber: "Fiber (g)",
    sodium: "Sodium (mg)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-lg p-6 sm:p-8"
        style={{ backgroundColor: "var(--warm-white)", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
            {step === 1 ? "Your Goal" : step === 2 ? "Activity Level" : "Your Targets"}
          </h2>
          <button
            onClick={onClose}
            style={{ color: "var(--ink-muted)" }}
            aria-label="Close"
            className="text-lg"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className="h-0.5 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: s <= step ? "var(--orange)" : "var(--rule)" }}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 text-sm p-3 rounded" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {/* Step 1: Goal type */}
        {step === 1 && (
          <div className="space-y-3">
            {GOAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setGoalType(opt.value)}
                className="w-full text-left p-4 rounded-lg border-2 transition-all"
                style={{
                  borderColor: goalType === opt.value ? "var(--orange)" : "var(--rule)",
                  backgroundColor: goalType === opt.value ? "var(--cream)" : "transparent",
                }}
              >
                <div className="font-display italic" style={{ color: "var(--ink)" }}>{opt.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Activity level */}
        {step === 2 && (
          <div className="space-y-3">
            {ACTIVITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setActivityLevel(opt.value)}
                className="w-full text-left p-4 rounded-lg border-2 transition-all"
                style={{
                  borderColor: activityLevel === opt.value ? "var(--orange)" : "var(--rule)",
                  backgroundColor: activityLevel === opt.value ? "var(--cream)" : "transparent",
                }}
              >
                <div className="font-display italic" style={{ color: "var(--ink)" }}>{opt.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Review & edit */}
        {step === 3 && editedGoals && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              Based on your selections. Edit any value before saving.
            </p>
            {nutrientKeys.map(key => (
              <div key={key}>
                <label
                  className="text-xs uppercase tracking-widest block mb-1"
                  style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {nutrientLabels[key]}
                </label>
                <input
                  type="number"
                  value={editedGoals[key]}
                  onChange={e =>
                    setEditedGoals(g => g ? { ...g, [key]: Number(e.target.value) } : g)
                  }
                  className="w-full px-3 py-2 rounded border font-mono-data text-sm"
                  style={{
                    borderColor: "var(--rule)",
                    backgroundColor: "var(--cream)",
                    color: "var(--ink)",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          {step > 1 && !loading && !saving && (
            <button
              onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
              className="flex-1 py-2 rounded border text-sm"
              style={{ borderColor: "var(--rule)", color: "var(--ink-muted)" }}
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 py-2 rounded text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "var(--orange)", color: "white" }}
            >
              {loading ? "Loading…" : "Next"}
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 rounded text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "var(--orange)", color: "white" }}
            >
              {saving ? "Saving…" : "Save Goals"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
