import { useState } from "react";
import { accountAPI } from "../../api/accountEndpoints";
import type { UpdateProfileRequest, UserProfile } from "../../api/accountEndpoints";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  profile: UserProfile;
  onSaved: (updated: UserProfile) => void;
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  maintain: "Maintain Weight",
  lose: "Lose Weight",
  gain: "Gain Muscle",
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary",
  light: "Lightly Active",
  moderate: "Moderately Active",
  active: "Very Active",
  very_active: "Extremely Active",
};

export default function SettingsTab({ profile, onSaved }: Props) {
  const { refreshUser } = useAuth();

  const [form, setForm] = useState<UpdateProfileRequest>({
    is_vegan: profile.is_vegan,
    is_vegetarian: profile.is_vegetarian,
    is_gluten_free: profile.is_gluten_free,
    goal_type: profile.goal_type,
    activity_level: profile.activity_level,
    default_calorie_goal: profile.default_calorie_goal,
    default_protein_goal: profile.default_protein_goal,
    default_carbs_goal: profile.default_carbs_goal,
    default_fat_goal: profile.default_fat_goal,
    default_fiber_goal: profile.default_fiber_goal,
    default_sodium_goal: profile.default_sodium_goal,
  });

  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const setBool = (key: keyof UpdateProfileRequest, value: boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  const setStr = (key: keyof UpdateProfileRequest, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const setNum = (key: keyof UpdateProfileRequest, value: string) =>
    setForm(f => ({ ...f, [key]: value === "" ? null : Number(value) }));

  const handleSuggest = async () => {
    setSuggesting(true);
    setFeedback(null);
    try {
      const goals = await accountAPI.suggestGoals();
      setForm(f => ({
        ...f,
        default_calorie_goal: goals.calories,
        default_protein_goal: goals.protein,
        default_carbs_goal: goals.carbs,
        default_fat_goal: goals.fat,
        default_fiber_goal: goals.fiber,
        default_sodium_goal: goals.sodium,
      }));
    } catch {
      setFeedback({ type: "error", message: "Could not fetch suggestions. Try again." });
    } finally {
      setSuggesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await accountAPI.updateProfile(form);
      await refreshUser();
      onSaved(updated);
      setFeedback({ type: "success", message: "Settings saved." });
    } catch {
      setFeedback({ type: "error", message: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Preferences */}
      <div>
        <h3 className="profile-section-heading">Preferences</h3>
        <div
          style={{
            background: "var(--warm-white)",
            border: "1px solid rgba(26,18,8,0.08)",
            borderRadius: 10,
            padding: "0 1.25rem",
          }}
        >
          {(
            [
              { key: "is_vegan" as const, label: "Vegan", sub: "Excludes all animal products" },
              { key: "is_vegetarian" as const, label: "Vegetarian", sub: "Excludes meat and fish" },
              { key: "is_gluten_free" as const, label: "Gluten-Free", sub: "Excludes gluten-containing items" },
            ] as const
          ).map(({ key, label, sub }) => (
            <div key={key} className="profile-field-row">
              <div>
                <div className="profile-field-label">{label}</div>
                <div className="profile-field-sublabel">{sub}</div>
              </div>
              <label className="profile-toggle">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={e => setBool(key, e.target.checked)}
                />
                <span className="profile-toggle-track" />
                <span className="profile-toggle-thumb" />
              </label>
            </div>
          ))}

          <div className="profile-field-row">
            <div className="profile-field-label">Fitness Goal</div>
            <select
              className="profile-select"
              value={form.goal_type ?? "maintain"}
              onChange={e => setStr("goal_type", e.target.value)}
            >
              {Object.entries(GOAL_TYPE_LABELS).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          </div>

          <div className="profile-field-row" style={{ borderBottom: "none" }}>
            <div className="profile-field-label">Activity Level</div>
            <select
              className="profile-select"
              value={form.activity_level ?? "moderate"}
              onChange={e => setStr("activity_level", e.target.value)}
            >
              {Object.entries(ACTIVITY_LABELS).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Nutritional Goals */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
          <h3 className="profile-section-heading" style={{ marginBottom: 0 }}>Nutritional Goals</h3>
          <button
            className="profile-suggest-btn"
            onClick={handleSuggest}
            disabled={suggesting}
          >
            {suggesting ? "Loading..." : "✦ Suggest Goals"}
          </button>
        </div>
        <div className="profile-goals-grid">
          {(
            [
              { key: "default_calorie_goal" as const, label: "Calories", unit: "kcal" },
              { key: "default_protein_goal" as const, label: "Protein", unit: "g" },
              { key: "default_carbs_goal" as const, label: "Carbs", unit: "g" },
              { key: "default_fat_goal" as const, label: "Fat", unit: "g" },
              { key: "default_fiber_goal" as const, label: "Fiber", unit: "g" },
              { key: "default_sodium_goal" as const, label: "Sodium", unit: "mg" },
            ] as const
          ).map(({ key, label, unit }) => (
            <div key={key} className="profile-goal-field">
              <label>{label} ({unit})</label>
              <input
                type="number"
                min={0}
                value={form[key] ?? ""}
                onChange={e => setNum(key, e.target.value)}
                placeholder="—"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save row */}
      <div className="flex items-center gap-4">
        <button
          className="profile-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {feedback && (
          <span className={`profile-feedback ${feedback.type}`}>
            {feedback.message}
          </span>
        )}
      </div>
    </div>
  );
}
