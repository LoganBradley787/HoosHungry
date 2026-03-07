# Profile Page Design

*Date: 2026-03-07*

---

## Overview

A dedicated `/profile` route giving authenticated users an identity card at the top, followed by two tabs: **Overview** (stats at a glance) and **Settings** (editable preferences and nutritional goals). No placeholder scaffolding — every element is fully functional against existing backend endpoints.

---

## Architecture

### New files

| File | Purpose |
|------|---------|
| `pages/Profile.tsx` | Route-level shell: identity card + tab switcher + tab content |
| `components/profile/IdentityCard.tsx` | Top card: username, email, member since, premium badge |
| `components/profile/OverviewTab.tsx` | Stats: AI usage bar, favorites count, dietary pref tags |
| `components/profile/SettingsTab.tsx` | Editable preferences and nutritional goals |
| `styles/profile.css` | Page-specific CSS following the cream/orange design system |

### Modified files

| File | Change |
|------|--------|
| `App.tsx` | Add `/profile` route inside `<PrivateRoute>` |
| `components/common/Navigation.tsx` | Username becomes a `<Link to="/profile">` |

### No backend changes

All data is available through existing endpoints:
- `useAuth()` — `user.username`, `user.email`, `user.profile.created_at`, `user.profile.premium_member`, `user.profile.remaining_ai_usages`, dietary pref flags
- `accountAPI.updateProfile()` — PATCH `/accounts/profile/update/`
- `accountAPI.suggestGoals()` — GET `/accounts/profile/goals/suggest/`
- `useFavorites()` — favorites list (count derived from array length)

---

## Components

### IdentityCard

Always visible above the tabs.

- Large username in `font-display` (Cormorant Garamond)
- Email in `--ink-muted` beneath
- "Member since [Month YYYY]" formatted from `user.profile.created_at`
- "Premium" badge (amber pill) shown only if `premium_member === true`
- Warm cream card surface (`--warm-white`) with subtle orange top border accent

### Overview Tab

Read-only stats panel.

**AI Usage**
- Label: "CavBot Messages"
- Progress bar: `remaining_ai_usages / 10` (or unlimited if premium)
- Count: "X remaining" text

**Favorites**
- Count from `useFavorites().favorites.length`
- Tappable — navigates to `/menu`

**Dietary Preferences**
- Read-only pill tags for active flags: Vegan, Vegetarian, Gluten-Free
- "None set" state if all false
- "Edit in Settings →" affordance

### Settings Tab

Two sections with a single shared Save state.

**Preferences section**
- Toggle row for each: Vegan, Vegetarian, Gluten-Free
- Dropdown for Goal Type: Maintain / Lose Weight / Gain Muscle
- Dropdown for Activity Level: Sedentary / Lightly Active / Moderately Active / Very Active / Extremely Active
- Changes are held in local state until Save

**Nutritional Goals section**
- Number inputs for: Calories, Protein (g), Carbs (g), Fat (g), Fiber (g), Sodium (mg)
- "Suggest Goals" button — calls `accountAPI.suggestGoals()` and fills inputs
- Inputs pre-populated from `user.profile` on mount

**Save behavior**
- Single "Save Changes" button at bottom
- Calls `accountAPI.updateProfile()` with all dirty fields
- Calls `refreshUser()` from `useAuth()` after success to sync context
- Inline success/error feedback (no modal)

---

## Visual Design

Follows the cream/orange design system defined in `index.css`.

- Page background: `--cream`
- Card surfaces: `--warm-white`
- Tab active indicator: `--amber` underline (matches nav pattern)
- Section headings: `font-display`, `--ink`
- Body text: DM Sans, `--ink-muted`
- Progress bar fill: `--orange`
- Premium badge: `--amber` background, `--ink` text
- Save button: orange pill style matching existing CTAs

---

## Routing & Navigation

- Route: `/profile` added inside `<PrivateRoute>` in `App.tsx`
- Nav: `user.username` in `Navigation.tsx` wraps in `<Link to="/profile">` with hover underline
- No new nav tab — profile is accessed via the username link to keep the nav uncluttered
