# Meal Planner Enhancement Design
_Date: 2026-03-05_

## Context

HoosHungry is a web app for UVA students to browse dining hall menus and plan meals. The Plan page currently supports weekly/daily meal planning with calorie and macro (protein/carbs/fat) tracking. This document describes a comprehensive enhancement to make it a more useful nutrition planner.

## Scope

- Primary audience: UVA students eating at UVA dining halls
- Custom food logging is out of scope for now (dining-hall-only)
- Approach: Incremental enhancement of the existing Plan page — no new routes, no redesign

---

## Backend Changes

### 1. Extend `MealItem` model
Cache all 10 nutrients from `NutritionInfo` (currently only 4 are stored).

New per-serving fields:
- `fiber_per_serving`, `sodium_per_serving`, `sugar_per_serving`
- `cholesterol_per_serving`, `saturated_fat_per_serving`, `trans_fat_per_serving`

New computed total fields (auto-calculated on save, same pattern as existing totals):
- `total_fiber`, `total_sodium`, `total_sugar`
- `total_cholesterol`, `total_saturated_fat`, `total_trans_fat`

### 2. Extend `DailyMealPlan` model
Aggregate all nutrients from meal items.

New fields:
- `total_fiber`, `total_sodium`, `total_sugar`
- `total_cholesterol`, `total_saturated_fat`, `total_trans_fat`

`calculate_totals()` updated to sum all of them.

### 3. Extend `Plan` model
Add optional secondary nutrient goals:
- `daily_fiber_goal` (IntegerField, nullable)
- `daily_sodium_goal` (IntegerField, nullable)

### 4. Extend `UserProfile` model
Add guided goal setup fields:
- `goal_type`: CharField with choices `maintain | lose | gain`
- `activity_level`: CharField with choices `sedentary | light | moderate | active | very_active`

Existing default macro goal fields (`default_calorie_goal`, etc.) remain unchanged.

### 5. New/Modified Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/plan/history/?days=30` | Returns list of `{date, total_calories, total_protein, total_carbs, total_fat}` for the past N days. Powers trend charts. |
| `GET` | `/accounts/profile/goals/suggest/` | Computes and returns suggested calorie + macro targets based on user's `goal_type` and `activity_level`. Uses a simple formula (maintain ~2000 kcal base, lose −300, gain +300; multiplied by activity factor). |
| `PATCH` | `/accounts/profile/` | Extended to accept `goal_type` and `activity_level` in addition to existing dietary prefs. |
| `PATCH` | `/plan/goals/` | Extended to accept `daily_fiber_goal` and `daily_sodium_goal`. |

All existing endpoints (`/plan/week/`, `/plan/daily/`, `/plan/item/`) updated to include extended nutrition fields in their responses — no breaking changes to existing fields.

---

## Frontend Changes

### 1. Goal Setup Modal (new)
**Trigger:** Automatically shown on first Plan page visit when no goals are set. Also accessible via a "Set Goals" button in `ProgressStats`.

**Flow:**
1. Step 1 — Goal type: Three large tap-friendly cards: "Maintain Weight", "Lose Weight", "Gain Muscle"
2. Step 2 — Activity level: Five options from Sedentary to Very Active
3. App calls `GET /accounts/profile/goals/suggest/` → displays suggested calorie + macro targets
4. User can edit the suggested values inline, then saves (calls `PATCH /accounts/profile/` + `PATCH /plan/goals/`)

Goals stored on the user profile auto-populate new weekly plans going forward.

### 2. `ProgressStats` — Extended
Current: calorie ring + protein/carbs/fat bars.

New layout:
- **Primary section (unchanged):** Calorie ring + protein/carbs/fat progress bars
- **Secondary section (always visible):** Fiber and sodium as smaller progress bars with goal tracking
- **"More nutrients" expand toggle:** Reveals cholesterol, saturated fat, trans fat, sugar as a read-only list (consumed totals only, no goal targets) — collapsed by default
- **"Set Goals" button** added to the section header

### 3. `CalorieTrend` (new component)
Location: Right column, below `WeeklyCalendar`.

Features:
- Bar chart showing daily calorie intake for the selected period
- Bars colored by % of goal achieved: green (≥90%), orange (60–89%), red (<60%)
- 7-day rolling average overlaid as a line
- Horizontal dashed line at the daily calorie goal
- Toggle between 7-day and 30-day view
- Data source: `GET /plan/history/?days=30`

### 4. `DailyMealPlan` — Snack Section
Add a Snack `MealSection` below Dinner. The model already supports `meal_type='snack'`; it's simply not rendered. Minor addition.

### 5. `MealItemCard` — Nutrition Expand
Each meal item card gets a chevron toggle:
- **Collapsed (default):** Item name, servings, total calories
- **Expanded:** Full macro breakdown (protein/carbs/fat) + extended nutrients (fiber, sodium, sugar, cholesterol, saturated fat, trans fat) for that specific item

---

## Data Flow Summary

```
UserProfile.goal_type + activity_level
    → /goals/suggest/ → suggested targets
    → saved to UserProfile.default_*_goal
    → copied to Plan.daily_*_goal on plan creation

NutritionInfo (all 10 fields)
    → cached in MealItem (per-serving + total)
    → aggregated in DailyMealPlan.calculate_totals()
    → returned in /plan/daily/ response
    → displayed in ProgressStats (primary + secondary + expandable)
    → displayed in MealItemCard (expandable)

DailyMealPlan history
    → /plan/history/?days=30
    → CalorieTrend bar chart with rolling average
```

---

## Out of Scope (deferred)

- Custom food logging (non-dining-hall items)
- Streak tracking
- Meal templates / favorites / copy-day
- Full TDEE calculator with biometric inputs (height, weight, age)
- Export / sharing
