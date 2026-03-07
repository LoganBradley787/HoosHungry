# Profile Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a `/profile` route with an identity card and two tabs (Overview and Settings) backed entirely by existing API endpoints.

**Architecture:** New `pages/Profile.tsx` shell renders `IdentityCard` above a tab switcher, then either `OverviewTab` or `SettingsTab`. All data flows from `useAuth()`, `useFavorites()`, `accountAPI.updateProfile()`, and `accountAPI.suggestGoals()` — no new backend endpoints required.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS utility classes, CSS custom properties from `src/index.css`, React Router v6.

---

## Context

### Design system tokens (src/index.css)
```css
--cream: #FAF7F2          /* page background */
--warm-white: #FFFCF7     /* card surfaces */
--ink: #1A1208            /* primary text */
--ink-muted: #6B5B4E      /* secondary text */
--orange: #EA580C
--orange-deep: #C2410C
--orange-mid: #F97316
--amber: #FFC831          /* active underlines, badges */
--cream-on-orange: #FFF8EF
--rule-on-orange: rgba(255,255,255,0.25)
```

### Fonts
- `.font-display` → Cormorant Garamond (headings, italic)
- `DM Sans` → body text (default)
- `DM Mono` → data/numbers

### Auth context shape
```typescript
// from src/contexts/AuthContext.tsx
interface UserProfile {
  remaining_ai_usages: number;
  plans: Plan[];
  premium_member: boolean;
  created_at: string;   // ISO date string
}
interface User {
  id: number;
  username: string;
  email: string;
  profile: UserProfile;
}
// useAuth() → { user, token, refreshUser, logout, loading }
```

### accountAPI (src/api/accountEndpoints.ts)
```typescript
accountAPI.updateProfile(data: UpdateProfileRequest): Promise<UserProfile>
// UpdateProfileRequest fields: is_vegan, is_vegetarian, is_gluten_free,
// default_calorie_goal, default_protein_goal, default_carbs_goal,
// default_fat_goal, default_fiber_goal, default_sodium_goal,
// goal_type ("maintain"|"lose"|"gain"),
// activity_level ("sedentary"|"light"|"moderate"|"active"|"very_active")

accountAPI.suggestGoals(): Promise<SuggestedGoals>
// SuggestedGoals: { calories, protein, carbs, fat, fiber, sodium }
```

### UserProfile fields available via accountEndpoints
These are on `UserProfile` from `accountEndpoints.ts` (different from AuthContext's UserProfile):
```typescript
is_vegan, is_vegetarian, is_gluten_free: boolean
default_calorie_goal, default_protein_goal, default_carbs_goal,
default_fat_goal, default_fiber_goal, default_sodium_goal: number | null
goal_type: "maintain" | "lose" | "gain"
activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active"
```
These are NOT on the AuthContext user object — fetch them fresh in the Settings tab.

### useFavorites (src/hooks/useFavorites.ts)
```typescript
const { favorites } = useFavorites();
// favorites is Set<string>, so favorites.size gives count
```

### Page layout pattern (see src/pages/Plan.tsx)
```tsx
<div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
  <Navigation />
  {/* Orange title strip */}
  <div style={{ backgroundColor: "var(--orange-deep)" }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-display italic" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, color: "var(--cream-on-orange)" }}>
        Title
      </h1>
    </div>
  </div>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* content */}
  </div>
</div>
```

### Verification command (no JS test suite exists)
```bash
cd hooshungry && npm run build
```
Expected: exits 0 with no TypeScript errors. Also run `npm run lint` to check for ESLint errors.

---

## Task 1: Add profile.css

**Files:**
- Create: `hooshungry/src/styles/profile.css`

**Step 1: Create the stylesheet**

```css
/* hooshungry/src/styles/profile.css */

/* Identity Card */
.profile-identity-card {
  background: var(--warm-white);
  border: 1px solid rgba(26, 18, 8, 0.08);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.profile-identity-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--orange), var(--amber));
}

.profile-premium-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--amber);
  color: var(--ink);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

/* Tab switcher */
.profile-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(26, 18, 8, 0.1);
  margin-bottom: 1.5rem;
}

.profile-tab-btn {
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  transition: color 200ms, border-color 200ms;
  font-family: "DM Sans", sans-serif;
}

.profile-tab-btn:hover {
  color: var(--ink);
}

.profile-tab-btn.active {
  color: var(--ink);
  border-bottom-color: var(--amber);
}

/* Section headings within tabs */
.profile-section-heading {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.25rem;
  font-style: italic;
  font-weight: 400;
  color: var(--ink);
  margin-bottom: 1rem;
}

/* Stat cards in Overview */
.profile-stat-card {
  background: var(--warm-white);
  border: 1px solid rgba(26, 18, 8, 0.08);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.profile-stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: 0.375rem;
}

.profile-stat-value {
  font-family: "DM Mono", monospace;
  font-size: 1.5rem;
  color: var(--ink);
  line-height: 1;
}

/* AI usage progress bar */
.profile-progress-track {
  height: 6px;
  background: rgba(26, 18, 8, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 0.625rem;
}

.profile-progress-fill {
  height: 100%;
  background: var(--orange);
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dietary pref tags */
.profile-pref-tag {
  display: inline-flex;
  align-items: center;
  background: rgba(234, 88, 12, 0.08);
  color: var(--orange-deep);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  border: 1px solid rgba(234, 88, 12, 0.2);
}

/* Settings form */
.profile-field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(26, 18, 8, 0.06);
}

.profile-field-label {
  font-size: 0.9rem;
  color: var(--ink);
}

.profile-field-sublabel {
  font-size: 0.75rem;
  color: var(--ink-muted);
  margin-top: 0.125rem;
}

/* Toggle switch */
.profile-toggle {
  position: relative;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.profile-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.profile-toggle-track {
  position: absolute;
  inset: 0;
  background: rgba(26, 18, 8, 0.12);
  border-radius: 999px;
  cursor: pointer;
  transition: background 200ms;
}

.profile-toggle input:checked + .profile-toggle-track {
  background: var(--orange);
}

.profile-toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 200ms;
  pointer-events: none;
}

.profile-toggle input:checked ~ .profile-toggle-thumb {
  transform: translateX(18px);
}

/* Select dropdowns */
.profile-select {
  background: var(--warm-white);
  border: 1px solid rgba(26, 18, 8, 0.15);
  border-radius: 6px;
  padding: 0.375rem 2rem 0.375rem 0.625rem;
  font-size: 0.875rem;
  color: var(--ink);
  font-family: "DM Sans", sans-serif;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236B5B4E'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.625rem center;
  cursor: pointer;
}

/* Goal inputs grid */
.profile-goals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .profile-goals-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.profile-goal-field label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: 0.25rem;
}

.profile-goal-field input {
  width: 100%;
  background: var(--warm-white);
  border: 1px solid rgba(26, 18, 8, 0.15);
  border-radius: 6px;
  padding: 0.4rem 0.625rem;
  font-size: 0.9rem;
  font-family: "DM Mono", monospace;
  color: var(--ink);
  transition: border-color 150ms;
}

.profile-goal-field input:focus {
  outline: none;
  border-color: var(--orange);
}

/* Suggest Goals button */
.profile-suggest-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--orange-deep);
  background: rgba(234, 88, 12, 0.06);
  border: 1px solid rgba(234, 88, 12, 0.2);
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  transition: background 150ms;
  font-family: "DM Sans", sans-serif;
}

.profile-suggest-btn:hover {
  background: rgba(234, 88, 12, 0.12);
}

.profile-suggest-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Save button */
.profile-save-btn {
  background: var(--orange-deep);
  color: var(--cream-on-orange);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.625rem 1.5rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: background 150ms, transform 100ms;
  font-family: "DM Sans", sans-serif;
}

.profile-save-btn:hover {
  background: var(--orange);
}

.profile-save-btn:active {
  transform: scale(0.98);
}

.profile-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Inline feedback */
.profile-feedback {
  font-size: 0.8rem;
  font-weight: 500;
}

.profile-feedback.success {
  color: #2d7a2d;
}

.profile-feedback.error {
  color: #c0392b;
}
```

**Step 2: Verify build**

```bash
cd hooshungry && npm run build
```
Expected: exits 0 (CSS files don't affect TypeScript compilation, but confirms no import errors yet).

**Step 3: Commit**

```bash
cd hooshungry && git add src/styles/profile.css && git commit -m "feat: add profile page stylesheet"
```

---

## Task 2: IdentityCard component

**Files:**
- Create: `hooshungry/src/components/profile/IdentityCard.tsx`

**Step 1: Create the component**

```tsx
// hooshungry/src/components/profile/IdentityCard.tsx
import { useAuth } from "../../contexts/AuthContext";

function formatMemberSince(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function IdentityCard() {
  const { user } = useAuth();
  if (!user) return null;

  const { username, email, profile } = user;

  return (
    <div className="profile-identity-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="font-display italic"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--ink)", lineHeight: 1.1 }}
          >
            {username}
          </h2>
          {email && (
            <p style={{ fontSize: "0.875rem", color: "var(--ink-muted)", marginTop: "0.25rem" }}>
              {email}
            </p>
          )}
        </div>
        {profile.premium_member && (
          <span className="profile-premium-badge" style={{ marginTop: "0.25rem", flexShrink: 0 }}>
            ★ Premium
          </span>
        )}
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--ink-muted)", marginTop: "0.5rem" }}>
        Member since {formatMemberSince(profile.created_at)}
      </p>
    </div>
  );
}
```

**Step 2: Verify**

```bash
cd hooshungry && npm run build
```
Expected: exits 0.

**Step 3: Commit**

```bash
cd hooshungry && git add src/components/profile/IdentityCard.tsx && git commit -m "feat: add IdentityCard component"
```

---

## Task 3: OverviewTab component

**Files:**
- Create: `hooshungry/src/components/profile/OverviewTab.tsx`

**Step 1: Create the component**

```tsx
// hooshungry/src/components/profile/OverviewTab.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";

export default function OverviewTab() {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  if (!user) return null;

  const { profile } = user;
  const aiTotal = profile.premium_member ? null : 10;
  const aiRemaining = profile.remaining_ai_usages;
  const aiPct = aiTotal ? Math.round((aiRemaining / aiTotal) * 100) : 100;

  const activeDietPrefs = [
    profile.premium_member ? null : null, // placeholder to keep array pattern clear
    ...([] as string[]),
  ];
  const dietTags: string[] = [];
  // We need dietary pref flags — these come from accountEndpoints UserProfile,
  // not AuthContext. We only show what AuthContext exposes.
  // The OverviewTab shows a read-only snapshot; see note below.

  return (
    <div className="space-y-6">
      {/* AI Usage */}
      <div>
        <h3 className="profile-section-heading">CavBot Usage</h3>
        <div className="profile-stat-card">
          <div className="profile-stat-label">Messages Remaining</div>
          {profile.premium_member ? (
            <div className="profile-stat-value" style={{ color: "var(--orange-deep)" }}>
              Unlimited
            </div>
          ) : (
            <>
              <div className="profile-stat-value">{aiRemaining} / {aiTotal}</div>
              <div className="profile-progress-track">
                <div
                  className="profile-progress-fill"
                  style={{ width: `${aiPct}%` }}
                />
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--ink-muted)", marginTop: "0.5rem" }}>
                {aiRemaining === 0
                  ? "You've used all free messages."
                  : `${aiRemaining} free message${aiRemaining === 1 ? "" : "s"} left`}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Favorites */}
      <div>
        <h3 className="profile-section-heading">Favorites</h3>
        <Link to="/menu" style={{ textDecoration: "none" }}>
          <div
            className="profile-stat-card"
            style={{ cursor: "pointer", transition: "box-shadow 150ms" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(234,88,12,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
          >
            <div className="profile-stat-label">Saved Items</div>
            <div className="flex items-end justify-between">
              <div className="profile-stat-value">{favorites.size}</div>
              <span style={{ fontSize: "0.75rem", color: "var(--orange-deep)", fontWeight: 500 }}>
                View in Menu →
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
```

> **Note on dietary prefs in OverviewTab:** The `AuthContext` User object does not include `is_vegan`, `is_vegetarian`, `is_gluten_free` — those live on the `accountEndpoints.UserProfile`. The Settings tab fetches these on mount. To show them in Overview without a redundant fetch, pass them down as props from the parent `Profile.tsx` after the Settings tab has fetched them, OR fetch them once in `Profile.tsx` and pass to both tabs. Task 5 (Profile shell) handles this data lift.

**Step 2: Verify**

```bash
cd hooshungry && npm run build
```
Expected: exits 0.

**Step 3: Commit**

```bash
cd hooshungry && git add src/components/profile/OverviewTab.tsx && git commit -m "feat: add OverviewTab component"
```

---

## Task 4: SettingsTab component

**Files:**
- Create: `hooshungry/src/components/profile/SettingsTab.tsx`

**Step 1: Create the component**

```tsx
// hooshungry/src/components/profile/SettingsTab.tsx
import { useState } from "react";
import { accountAPI, UpdateProfileRequest } from "../../api/accountEndpoints";
import type { UserProfile } from "../../api/accountEndpoints";
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
          {/* Dietary toggles */}
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

          {/* Goal type */}
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

          {/* Activity level */}
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
```

**Step 2: Verify**

```bash
cd hooshungry && npm run build
```
Expected: exits 0.

**Step 3: Commit**

```bash
cd hooshungry && git add src/components/profile/SettingsTab.tsx && git commit -m "feat: add SettingsTab component"
```

---

## Task 5: Profile page shell

**Files:**
- Create: `hooshungry/src/pages/Profile.tsx`

**Step 1: Create the page**

The page fetches the full `UserProfile` from `accountEndpoints` once on mount (for Settings tab). It passes this down to both `OverviewTab` and `SettingsTab`, updating local state when Settings saves.

```tsx
// hooshungry/src/pages/Profile.tsx
import { useState, useEffect } from "react";
import Navigation from "../components/common/Navigation";
import IdentityCard from "../components/profile/IdentityCard";
import OverviewTab from "../components/profile/OverviewTab";
import SettingsTab from "../components/profile/SettingsTab";
import { accountAPI } from "../api/accountEndpoints";
import type { UserProfile } from "../api/accountEndpoints";
import { useAuth } from "../contexts/AuthContext";
import FadeContent from "../components/reactbits/FadeContent";
import "../styles/profile.css";

type Tab = "overview" | "settings";

export default function Profile() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [extProfile, setExtProfile] = useState<UserProfile | null>(null);
  const [showTitle, setShowTitle] = useState(false);

  // Fetch the extended profile (dietary prefs + goal fields) on mount
  useEffect(() => {
    if (!token) return;
    // accountAPI.updateProfile with empty object returns current profile via PATCH,
    // but we need a GET. Use suggestGoals as a lightweight check — actually, we
    // need the profile fields. The correct approach: call updateProfile with {}
    // which returns the current UserProfile without changing anything.
    accountAPI.updateProfile({}).then(setExtProfile).catch(() => {});
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => setShowTitle(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <Navigation />

      {/* Orange title strip */}
      <div style={{ backgroundColor: "var(--orange-deep)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1
            className="font-display italic"
            style={{
              fontSize: "clamp(3rem, 8vw, 6rem)",
              fontWeight: 300,
              color: "var(--cream-on-orange)",
              opacity: showTitle ? 1 : 0,
              transform: showTitle ? "translateY(0)" : "translateY(50px)",
              filter: showTitle ? "blur(0px)" : "blur(12px)",
              transition:
                "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1), transform 700ms cubic-bezier(0.4, 0, 0.2, 1), filter 700ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Profile
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeContent direction="up" delay={200} duration={600} distance={24}>
          <div className="space-y-6">
            {/* Identity Card */}
            <IdentityCard />

            {/* Tab content */}
            <div>
              {/* Tab switcher */}
              <div className="profile-tabs">
                <button
                  className={`profile-tab-btn ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`profile-tab-btn ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  Settings
                </button>
              </div>

              {/* Tab panels */}
              {activeTab === "overview" && (
                <OverviewTab extProfile={extProfile} />
              )}
              {activeTab === "settings" && extProfile && (
                <SettingsTab
                  profile={extProfile}
                  onSaved={setExtProfile}
                />
              )}
              {activeTab === "settings" && !extProfile && (
                <div style={{ padding: "2rem 0", color: "var(--ink-muted)", fontSize: "0.875rem" }}>
                  Loading…
                </div>
              )}
            </div>
          </div>
        </FadeContent>
      </div>
    </div>
  );
}
```

> **Important:** The `accountAPI.updateProfile({})` trick (PATCH with empty body) returns the current profile without mutation, since the view only sets fields present in `request.data`. Verify this works against the backend before shipping (the Django view iterates `request.data` keys, so an empty dict is a no-op). If it doesn't, add a dedicated `GET /accounts/profile/` endpoint to the backend.

**Step 2: Update OverviewTab to accept extProfile prop**

The `OverviewTab` needs updating to accept `extProfile` and show dietary preferences. Edit `src/components/profile/OverviewTab.tsx`:

Replace the entire `OverviewTab` component with:

```tsx
// hooshungry/src/components/profile/OverviewTab.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import type { UserProfile } from "../../api/accountEndpoints";

interface Props {
  extProfile: UserProfile | null;
}

export default function OverviewTab({ extProfile }: Props) {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  if (!user) return null;

  const { profile } = user;
  const aiTotal = profile.premium_member ? null : 10;
  const aiRemaining = profile.remaining_ai_usages;
  const aiPct = aiTotal ? Math.round((aiRemaining / aiTotal) * 100) : 100;

  const dietTags: string[] = [];
  if (extProfile?.is_vegan) dietTags.push("Vegan");
  if (extProfile?.is_vegetarian) dietTags.push("Vegetarian");
  if (extProfile?.is_gluten_free) dietTags.push("Gluten-Free");

  return (
    <div className="space-y-6">
      {/* AI Usage */}
      <div>
        <h3 className="profile-section-heading">CavBot Usage</h3>
        <div className="profile-stat-card">
          <div className="profile-stat-label">Messages Remaining</div>
          {profile.premium_member ? (
            <div className="profile-stat-value" style={{ color: "var(--orange-deep)" }}>
              Unlimited
            </div>
          ) : (
            <>
              <div className="profile-stat-value">{aiRemaining} / {aiTotal}</div>
              <div className="profile-progress-track">
                <div className="profile-progress-fill" style={{ width: `${aiPct}%` }} />
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--ink-muted)", marginTop: "0.5rem" }}>
                {aiRemaining === 0
                  ? "You've used all free messages."
                  : `${aiRemaining} free message${aiRemaining === 1 ? "" : "s"} left`}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Favorites */}
      <div>
        <h3 className="profile-section-heading">Favorites</h3>
        <Link to="/menu" style={{ textDecoration: "none" }}>
          <div
            className="profile-stat-card"
            style={{ cursor: "pointer", transition: "box-shadow 150ms" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(234,88,12,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
          >
            <div className="profile-stat-label">Saved Items</div>
            <div className="flex items-end justify-between">
              <div className="profile-stat-value">{favorites.size}</div>
              <span style={{ fontSize: "0.75rem", color: "var(--orange-deep)", fontWeight: 500 }}>
                View in Menu →
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Dietary Preferences */}
      <div>
        <h3 className="profile-section-heading">Dietary Preferences</h3>
        <div
          className="profile-stat-card"
          style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}
        >
          {dietTags.length > 0 ? (
            <>
              {dietTags.map(tag => (
                <span key={tag} className="profile-pref-tag">{tag}</span>
              ))}
              <button
                onClick={() => {/* handled by parent tab switch */}}
                style={{
                  marginLeft: "auto",
                  fontSize: "0.75rem",
                  color: "var(--ink-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {/* Navigation to Settings tab is handled in Profile.tsx below */}
              </button>
            </>
          ) : extProfile === null ? (
            <span style={{ fontSize: "0.875rem", color: "var(--ink-muted)" }}>Loading…</span>
          ) : (
            <span style={{ fontSize: "0.875rem", color: "var(--ink-muted)" }}>None set</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

> **Simplification note:** The "Edit in Settings →" affordance inside OverviewTab would require passing a tab-switch callback from the parent. Keep it simple: the tab bar is always visible, users can switch themselves. Remove the inner button entirely (it's empty in the code above).

**Step 3: Verify**

```bash
cd hooshungry && npm run build
```
Expected: exits 0.

**Step 4: Commit**

```bash
cd hooshungry && git add src/pages/Profile.tsx src/components/profile/OverviewTab.tsx && git commit -m "feat: add Profile page shell with tab layout"
```

---

## Task 6: Wire up route and navigation

**Files:**
- Modify: `hooshungry/src/App.tsx`
- Modify: `hooshungry/src/components/common/Navigation.tsx`

**Step 1: Add route in App.tsx**

In `src/App.tsx`, add the Profile import and route inside `<PrivateRoute>`:

```tsx
// Add import at top
import Profile from "./pages/Profile";

// Inside <Route element={<PrivateRoute />}>:
<Route path="/profile" element={<Profile />} />
```

The full updated `App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Plan from "./pages/Plan";
import Prompt from "./pages/Prompt";
import Profile from "./pages/Profile";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PrivateRoute from "./components/auth/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route path="/plan" element={<Plan />} />
          <Route path="/prompt" element={<Prompt />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**Step 2: Update Navigation.tsx to link username to /profile**

In `src/components/common/Navigation.tsx`, the username display (currently a `<span>`) becomes a `<Link to="/profile">`. Add the Link import (already imported via react-router-dom). Replace:

```tsx
// BEFORE (line ~60):
<span className="hidden lg:inline text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
  {user.username}
</span>
```

With:

```tsx
// AFTER:
<Link
  to="/profile"
  className="hidden lg:inline text-sm transition-colors"
  style={{ color: "rgba(255,255,255,0.65)" }}
  onMouseEnter={e => (e.currentTarget.style.color = "var(--cream-on-orange)")}
  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
>
  {user.username}
</Link>
```

**Step 3: Verify**

```bash
cd hooshungry && npm run build && npm run lint
```
Expected: both exit 0.

**Step 4: Commit**

```bash
cd hooshungry && git add src/App.tsx src/components/common/Navigation.tsx && git commit -m "feat: wire /profile route and nav username link"
```

---

## Task 7: Backend verification — PATCH with empty body

Before shipping, confirm the backend accepts a PATCH with an empty body as a no-op.

**Step 1: Test manually with curl (backend must be running on port 8000)**

```bash
TOKEN=$(cat ~/.authtoken 2>/dev/null || echo "your-token-here")
curl -s -X PATCH http://localhost:8000/accounts/profile/update/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool
```

Expected: returns the current profile JSON with all fields, no errors.

**Step 2: If the endpoint fails** (returns 400 or error), add a GET endpoint to the backend.

In `hooshungrybackend/accounts/views.py`, add:

```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Return the current user's extended profile fields."""
    profile = request.user.profile
    serializer = UserProfileSerializer(profile)
    return Response(serializer.data)
```

In `hooshungrybackend/accounts/urls.py`, add:

```python
path('profile/', views.get_profile, name='get_profile'),
```

Then update `src/api/accountEndpoints.ts` to add:

```typescript
getProfile: async (): Promise<UserProfile> => {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${ACCOUNTS_BASE}/profile/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
},
```

And update `Profile.tsx` to call `accountAPI.getProfile()` instead of `accountAPI.updateProfile({})`.

**Step 3: Run build again if backend changes were made**

```bash
cd hooshungry && npm run build
```

**Step 4: Commit (only if backend changes were needed)**

```bash
# In backend dir:
cd ~/Documents/HoosHungryBackend/HoosHungryBackend/hooshungrybackend
git add accounts/views.py accounts/urls.py
git commit -m "feat: add GET /accounts/profile/ endpoint"

# In frontend dir:
cd ~/Documents/HoosHungry/HoosHungry/hooshungry
git add src/api/accountEndpoints.ts src/pages/Profile.tsx
git commit -m "feat: use dedicated GET profile endpoint"
```

---

## Task 8: Final lint and build check

```bash
cd hooshungry && npm run build && npm run lint
```

Expected: both exit 0 with no errors or warnings beyond the pre-existing ones documented in CLAUDE.md (`promptEndpoints.ts` unused import, `ChatMessage.tsx` NodeJS namespace, etc.).

If new lint errors appear in files you touched, fix them before committing.
