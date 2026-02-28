# Editorial Redesign — Design Document

**Date:** 2026-02-27
**Status:** Approved
**Scope:** Frontend-only visual overhaul. No functionality, routing, API, or state changes.

---

## Direction

**Aesthetic:** Editorial / food magazine — refined and luxury register.
Inspired by publications like Kinfolk or Bon Appétit. Strong typographic hierarchy, generous whitespace, thin rule dividers instead of frosted glass cards.

---

## Design System

### Typography

| Role | Font | Notes |
|------|------|-------|
| Display / headings | Cormorant Garamond | Weights 300–600, italic for hero. Loaded from Google Fonts. |
| Body / UI | DM Sans | Weights 300–500. Nav, labels, buttons, inputs. |
| Numeric data | DM Mono | Calories, nutrition numbers — precision feel. |

Nav links: DM Sans, uppercase, `letter-spacing: 0.1em`, weight 400.

### Color Tokens (CSS custom properties in `index.css`)

```css
--cream:      #FAF7F2   /* page background */
--warm-white: #FFFCF7   /* card surfaces */
--ink:        #1A1208   /* near-black, warm undertone */
--ink-muted:  #6B5B4E   /* secondary text */
--orange:     #F48210   /* primary accent (kept from existing) */
--amber:      #FFC831   /* secondary accent (kept from existing) */
--rule:       #E8E0D4   /* dividers, card borders */
```

No blue anywhere. Blue is removed from all progress bars, macro rings, and menu item cards.

### Surfaces

- **Before:** `bg-white/60 backdrop-blur rounded-3xl shadow-lg`
- **After:** `1px solid var(--rule)` border, `background: var(--warm-white)`, `border-radius: 8px`
- No backdrop blur. No heavy drop shadows.
- Section dividers: thin horizontal `<hr>` rules.

### Page Background

- **Before:** `bg-gradient-to-r from-pink-100 via-orange-50 to-yellow-100`
- **After:** `background: var(--cream)` — solid warm cream. Orange/amber appear as accents, not washes.

---

## Components

### Navigation

- Logo + "HoosHungry" wordmark in Cormorant italic, ink-colored (no gradient text).
- Nav links: DM Sans uppercase with letter-spacing, active state = thin orange underline rule.
- No frosted glass background — nav on cream with single bottom border rule.
- Login/logout: text link with `→` arrow, not an orange pill button.

### Menu Item Cards

- Item name in Cormorant Medium + calories in DM Mono, right-aligned on same row.
- Thin rule below name row.
- Allergens/description in DM Sans 300, `var(--ink-muted)`.
- Nutrition data as inline pill tags: `35g P · 12g C · 8g F` — no progress bars.
- Actions: `Details` as plain text link, `Add to Plan →` as small outlined button.
- Border: `1px solid var(--rule)`, `border-radius: 8px`.

### Station Sections

- Station name: thin uppercase DM Sans label + full-width horizontal rule (newspaper section header style).
- Items listed below, no nested card container wrapping the station.

### Progress Stats (Plan page)

- Remove SVG circle rings.
- Calories: large Cormorant numeral (`1,240`) with `/ 2000 kcal` in DM Mono.
- Protein/Carbs/Fat: thin horizontal CSS bars.
  - Orange for calories bar.
  - Amber for protein.
  - Muted terracotta (`#C4896A`) for carbs and fat.

### Weekly Calendar (Plan page)

- Replace vertical list with horizontal scrollable strip of 7 day chips.
- Selected day: orange background, Cormorant italic date numeral.
- Days with meals: small orange dot indicator below the date number.

### Auth Forms (Login / Register)

- Full-page split layout: left half = cream with form, right half = orange-to-amber gradient with wordmark.
- Input fields: borderless, bottom-underline only (no rounded boxes).
- Submit: solid orange button, full width.

---

## Page-by-Page

### Home

- Remove frosted glass hero card — content sits on cream directly.
- Hero headline: Cormorant italic, `clamp(48px, 6vw, 80px)`.
- Feature cards: `var(--warm-white)` + `var(--rule)` borders, small orange uppercase label (`LOCATE`, `PLAN`, `PROMPT`) instead of pastel color coding.
- CTAs: `See Menus →` and `View Plan →` as text links; `Prompt AI` as the one solid orange button.

### Menu

- Hall selector: plain text tabs with orange underline on active, not pill buttons.
- Period selector: same tab style.
- Search: minimal input with bottom underline rule only.
- Station sections: newspaper-header rule treatment.

### Plan

- `Plan` page title: Cormorant italic, very large.
- Weekly calendar: horizontal day strip at top of right panel.
- Progress stats: redesigned per above.
- Meal sections (`Breakfast`, `Lunch`, `Dinner`): thin uppercase label + rule.

### Prompt

- Keep existing dark theme structure from `styles/prompt.css`.
- Update fonts: Cormorant for assistant name/chat headings, DM Mono for message content.

### Login / Register

- Split layout as described above.
- No functionality changes.

---

## What Does Not Change

- All React component logic, state, hooks, API calls.
- All routing.
- All responsive breakpoints (mobile support maintained).
- The `reactbits/` animation components.
- The `AuthContext`, `useAuth`, and all auth flows.
