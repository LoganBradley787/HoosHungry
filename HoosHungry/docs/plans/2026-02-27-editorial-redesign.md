# Editorial Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the generic frosted-glass AI aesthetic with a refined editorial / food-magazine look — Cormorant Garamond headings, DM Sans UI, DM Mono for numbers, cream background, thin rule dividers, no blue anywhere.

**Architecture:** Pure visual overhaul — no logic, no API, no routing changes. Each task modifies one or two files. Design tokens live in `index.css` as CSS custom properties so all components inherit them automatically.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Google Fonts (Cormorant Garamond, DM Sans, DM Mono)

**Dev server:** `cd hooshungry && npm run dev` — keep this running and visually verify after each task.

---

## Task 1: Design system tokens + Google Fonts

**Files:**
- Modify: `hooshungry/src/index.css`
- Modify: `hooshungry/index.html`

**Step 1: Add Google Fonts to `index.html`**

Open `hooshungry/index.html` and add inside `<head>`, before any other styles:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

**Step 2: Replace `hooshungry/src/index.css` entirely**

```css
@import "tailwindcss";
@import "./styles/prompt.css";

/* ── Design Tokens ─────────────────────────────────────────── */
:root {
  --cream:      #FAF7F2;
  --warm-white: #FFFCF7;
  --ink:        #1A1208;
  --ink-muted:  #6B5B4E;
  --orange:     #F48210;
  --amber:      #FFC831;
  --terracotta: #C4896A;
  --rule:       #E8E0D4;
}

/* ── Base ──────────────────────────────────────────────────── */
body {
  background-color: var(--cream);
  color: var(--ink);
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Typography helpers ────────────────────────────────────── */
.font-display {
  font-family: 'Cormorant Garamond', Georgia, serif;
}

.font-mono-data {
  font-family: 'DM Mono', monospace;
}

/* ── Rule divider ──────────────────────────────────────────── */
.editorial-rule {
  border: none;
  border-top: 1px solid var(--rule);
  margin: 0;
}

/* ── Editorial card surface ────────────────────────────────── */
.card-editorial {
  background-color: var(--warm-white);
  border: 1px solid var(--rule);
  border-radius: 8px;
}

/* ── Tab nav (hall/period selectors) ───────────────────────── */
.tab-link {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color 150ms, border-color 150ms;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  cursor: pointer;
}

.tab-link:hover {
  color: var(--ink);
}

.tab-link.active {
  color: var(--ink);
  border-bottom-color: var(--orange);
}

/* ── Section header (newspaper rule style) ─────────────────── */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.section-header-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-muted);
  white-space: nowrap;
}

.section-header-rule {
  flex: 1;
  height: 1px;
  background-color: var(--rule);
}

/* ── Existing animations (kept) ────────────────────────────── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideInStagger {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn        { animation: fadeIn 0.3s ease-out; }
.animate-slideDown     { animation: slideDown 0.2s ease-out; }
.animate-slideInStagger {
  animation: slideInStagger 0.4s ease-out forwards;
  opacity: 0;
}
```

**Step 3: Verify**

Run dev server. The page background should shift from the pink/orange gradient to a warm cream. No other changes yet — fonts won't appear until components are updated.

**Step 4: Commit**
```bash
git add hooshungry/index.html hooshungry/src/index.css
git commit -m "feat: add editorial design tokens and Google Fonts"
```

---

## Task 2: Navigation

**Files:**
- Modify: `hooshungry/src/components/common/Navigation.tsx`

**Step 1: Replace the entire file**

```tsx
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import brand_img from "../../assets/brand_img.png";
import { useState } from "react";

export default function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/plan", label: "Plan" },
    { to: "/prompt", label: "Prompt" },
  ];

  return (
    <nav style={{ borderBottom: "1px solid var(--rule)", backgroundColor: "var(--cream)" }}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={brand_img}
            alt="HoosHungry"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          <span
            className="font-display text-xl sm:text-2xl font-normal italic"
            style={{ color: "var(--ink)" }}
          >
            HoosHungry
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`tab-link ${location.pathname === link.to ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <span className="hidden lg:inline text-sm" style={{ color: "var(--ink-muted)" }}>
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm flex items-center gap-1 transition-colors"
                style={{ color: "var(--ink-muted)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--orange)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
              >
                Logout →
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="text-sm flex items-center gap-1 transition-colors"
              style={{ color: "var(--ink-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--orange)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
            >
              Login →
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 transition-colors"
          style={{ color: "var(--ink-muted)" }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-4 py-4 space-y-4 animate-slideDown"
          style={{ borderTop: "1px solid var(--rule)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block tab-link ${location.pathname === link.to ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "1rem" }}>
            {user ? (
              <button
                onClick={handleLogout}
                className="text-sm"
                style={{ color: "var(--ink-muted)" }}
              >
                Logout →
              </button>
            ) : (
              <a
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm"
                style={{ color: "var(--ink-muted)" }}
              >
                Login →
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
```

**Step 2: Verify**

Nav should now be cream background, Cormorant italic wordmark, small-caps tab links, no frosted glass, no orange pill button.

**Step 3: Commit**
```bash
git add hooshungry/src/components/common/Navigation.tsx
git commit -m "feat: editorial navigation with tab links"
```

---

## Task 3: Home page

**Files:**
- Modify: `hooshungry/src/pages/Home.tsx`

**Step 1: Replace the entire file**

```tsx
import globe from "../assets/globe.png";
import plan from "../assets/plan.png";
import stars from "../assets/stars.png";
import Navigation from "../components/common/Navigation";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Hero */}
        <div className="max-w-2xl mb-16 sm:mb-24">
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
          >
            UVA Dining · Plan Smarter
          </p>
          <h1
            className="font-display italic mb-6 leading-tight"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              color: "var(--ink)",
              fontWeight: 300,
            }}
          >
            Finally, dining hall planning that just works.
          </h1>
          <p className="text-base sm:text-lg mb-8" style={{ color: "var(--ink-muted)" }}>
            Pick a hall, browse menu items, make a plan. How hungry are you, Hoo?
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/menu"
              className="text-sm transition-colors"
              style={{ color: "var(--ink-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
            >
              See Menus →
            </Link>
            <Link
              to="/plan"
              className="text-sm transition-colors"
              style={{ color: "var(--ink-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
            >
              View Plan →
            </Link>
            <Link
              to="/prompt"
              className="px-5 py-2.5 text-sm font-medium text-white rounded-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Prompt AI
            </Link>
          </div>
        </div>

        {/* Rule */}
        <hr className="editorial-rule mb-12" />

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px" style={{ backgroundColor: "var(--rule)" }}>
          <Link to="/menu" className="block">
            <div
              className="p-6 sm:p-8 transition-colors group"
              style={{ backgroundColor: "var(--warm-white)" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--cream)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--warm-white)")}
            >
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--orange)", fontFamily: "'DM Sans', sans-serif" }}
              >
                Browse
              </p>
              <img src={globe} alt="" className="w-6 h-6 object-contain mb-3 opacity-60" />
              <h3 className="font-display text-xl italic mb-2" style={{ color: "var(--ink)" }}>
                Browse Dining Halls
              </h3>
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                Any location, any time of day.
              </p>
            </div>
          </Link>

          <Link to="/plan" className="block">
            <div
              className="p-6 sm:p-8 transition-colors"
              style={{ backgroundColor: "var(--warm-white)" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--cream)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--warm-white)")}
            >
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--orange)", fontFamily: "'DM Sans', sans-serif" }}
              >
                Plan
              </p>
              <img src={plan} alt="" className="w-6 h-6 object-contain mb-3 opacity-60" />
              <h3 className="font-display text-xl italic mb-2" style={{ color: "var(--ink)" }}>
                Make a Plan
              </h3>
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                Click, click: simple as that.
              </p>
            </div>
          </Link>

          <Link to="/prompt" className="block sm:col-span-2 md:col-span-1">
            <div
              className="p-6 sm:p-8 transition-colors"
              style={{ backgroundColor: "var(--warm-white)" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--cream)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--warm-white)")}
            >
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--orange)", fontFamily: "'DM Sans', sans-serif" }}
              >
                Prompt
              </p>
              <img src={stars} alt="" className="w-6 h-6 object-contain mb-3 opacity-60" />
              <h3 className="font-display text-xl italic mb-2" style={{ color: "var(--ink)" }}>
                Ask CavBot
              </h3>
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                Food tailored to your goals.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
```

**Step 2: Verify**

Hero headline in Cormorant italic, cream background, three feature cards in a ruled grid, no frosted glass.

**Step 3: Commit**
```bash
git add hooshungry/src/pages/Home.tsx
git commit -m "feat: editorial home page"
```

---

## Task 4: Menu selectors — PillButton → tab style

**Files:**
- Modify: `hooshungry/src/components/menu/PillButton.tsx`
- Modify: `hooshungry/src/pages/Menu.tsx`

**Step 1: Replace `PillButton.tsx`**

```tsx
import type { ReactNode } from "react";

interface PillButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export default function PillButton({ active, onClick, children }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`tab-link ${active ? "active" : ""}`}
    >
      {children}
    </button>
  );
}
```

**Step 2: Update the selector wrapper divs in `Menu.tsx`**

Find the hall selector wrapper (currently `flex gap-1 sm:gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1 shadow-sm overflow-x-auto`) and change the outer `div` that holds the pill buttons for halls:

```tsx
{/* Hall selector */}
<div className="flex items-center gap-6 overflow-x-auto">
  <PillButton active={hall === "ohill"} onClick={() => setHall("ohill")}>OHill</PillButton>
  <PillButton active={hall === "newcomb"} onClick={() => setHall("newcomb")}>Newcomb</PillButton>
  <PillButton active={hall === "runk"} onClick={() => setHall("runk")}>Runk</PillButton>
</div>
```

And the period selector wrapper:

```tsx
{/* Period selector */}
<div className="flex items-center gap-6 overflow-x-auto">
  {loadingPeriods ? (
    <span className="text-xs" style={{ color: "var(--ink-muted)" }}>Loading…</span>
  ) : availablePeriods.length === 0 ? (
    <span className="text-xs" style={{ color: "var(--orange)" }}>Closed today</span>
  ) : (
    availablePeriods.map((p) => (
      <PillButton
        key={p.key}
        active={period === p.key}
        onClick={() => setPeriod(p.key as any)}
      >
        {p.name}
      </PillButton>
    ))
  )}
</div>
```

Also update the Menu page outer wrapper and title:

```tsx
<div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
  <Navigation />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <h1
      className="font-display italic mb-8"
      style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, color: "var(--ink)" }}
    >
      Menu
    </h1>
    {/* selector row */}
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 pb-4" style={{ borderBottom: "1px solid var(--rule)" }}>
      {/* halls */}
      {/* periods */}
      {/* search */}
    </div>
    ...
```

**Step 3: Verify**

Hall and period selectors are now plain text tabs with orange underlines. No frosted pill capsules.

**Step 4: Commit**
```bash
git add hooshungry/src/components/menu/PillButton.tsx hooshungry/src/pages/Menu.tsx
git commit -m "feat: tab-style hall and period selectors"
```

---

## Task 5: Search filter

**Files:**
- Modify: `hooshungry/src/components/menu/SearchFilter.tsx`

**Step 1: Update the search input and filter button styling only** (keep all logic identical)

Replace the search input's `className`:
```tsx
// Before
className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"

// After
className="w-full py-2 pl-8 pr-3 text-sm bg-transparent focus:outline-none transition-all"
style={{
  borderBottom: "1px solid var(--rule)",
  color: "var(--ink)",
  fontFamily: "'DM Sans', sans-serif",
}}
```

Move the search icon (svg) to `left-0` and size it `w-4 h-4`.

Replace the filter button:
```tsx
<button
  onClick={() => setIsFilterOpen(!isFilterOpen)}
  className="text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-colors"
  style={{
    color: selectedAllergens.length > 0 ? "var(--orange)" : "var(--ink-muted)",
    fontFamily: "'DM Sans', sans-serif",
  }}
>
  Filter
  {selectedAllergens.length > 0 && (
    <span
      className="text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center"
      style={{ backgroundColor: "var(--orange)", color: "white" }}
    >
      {selectedAllergens.length}
    </span>
  )}
</button>
```

Replace the filter dropdown container:
```tsx
<div
  className="absolute top-full mt-2 right-0 left-0 sm:left-auto shadow-xl p-5 sm:p-6 w-full sm:w-80 z-10 animate-slideDown"
  style={{
    backgroundColor: "var(--warm-white)",
    border: "1px solid var(--rule)",
    borderRadius: "8px",
  }}
>
```

**Step 2: Verify**

Search input is a minimal underline field. Filter button is plain text. Dropdown uses warm-white background with rule border.

**Step 3: Commit**
```bash
git add hooshungry/src/components/menu/SearchFilter.tsx
git commit -m "feat: editorial search filter styling"
```

---

## Task 6: Station sections + Info banner

**Files:**
- Modify: `hooshungry/src/components/menu/StationSection.tsx`
- Modify: `hooshungry/src/components/menu/InfoBanner.tsx`

**Step 1: Replace `StationSection.tsx`**

```tsx
import { useState } from "react";
import type { MenuItem, Station } from "../../api/endpoints";
import MenuItemCard from "./MenuItemCard";

interface StationSectionProps {
  station: Station;
  onDetails: (item: MenuItem) => void;
  onAddToPlan: (item: MenuItem) => void;
}

export default function StationSection({ station, onDetails, onAddToPlan }: StationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const mainItems = station.menu_items.filter((item) => {
    const calories = item.nutrition_info?.calories ? Math.round(parseFloat(item.nutrition_info.calories)) : 0;
    return calories > 0;
  });

  const sides = station.menu_items.filter((item) => {
    const calories = item.nutrition_info?.calories ? Math.round(parseFloat(item.nutrition_info.calories)) : 0;
    return calories === 0;
  });

  return (
    <div className="mb-10">
      {/* Newspaper-style section header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="section-header w-full text-left mb-6"
      >
        <span className="section-header-label">{station.name}</span>
        <div className="section-header-rule" />
        <span
          className="text-xs whitespace-nowrap"
          style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
        >
          {station.menu_items.length} items {isExpanded ? "↑" : "↓"}
        </span>
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {mainItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px mb-px" style={{ backgroundColor: "var(--rule)" }}>
            {mainItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onDetails={() => onDetails(item)}
                onAddToPlan={() => onAddToPlan(item)}
              />
            ))}
          </div>
        )}

        {sides.length > 0 && (
          <div className="mt-4">
            <div className="section-header mb-3">
              <span className="section-header-label">Sides & Add-ons</span>
              <div className="section-header-rule" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: "var(--rule)" }}>
              {sides.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Replace `InfoBanner.tsx`**

```tsx
interface InfoBannerProps {
  dayName: string;
  date: string;
  hallHours: { open_time: string; close_time: string };
  periodName: string;
  periodHours: { start_time: string; end_time: string };
}

export default function InfoBanner({ dayName, date, hallHours, periodName, periodHours }: InfoBannerProps) {
  return (
    <div
      className="flex flex-wrap justify-between items-center py-3 px-0 mb-6 gap-2"
      style={{ borderBottom: "1px solid var(--rule)" }}
    >
      <span className="text-xs" style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}>
        {dayName}, {date}
      </span>
      <span className="text-xs" style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}>
        Hall {hallHours.open_time}–{hallHours.close_time}
      </span>
      <span className="text-xs" style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}>
        {periodName} {periodHours.start_time}–{periodHours.end_time}
      </span>
    </div>
  );
}
```

**Step 3: Verify**

Station names appear as thin uppercase labels with a full-width rule. Info banner is a plain text row with rule below.

**Step 4: Commit**
```bash
git add hooshungry/src/components/menu/StationSection.tsx hooshungry/src/components/menu/InfoBanner.tsx
git commit -m "feat: newspaper section headers for stations"
```

---

## Task 7: Menu item cards

**Files:**
- Modify: `hooshungry/src/components/menu/MenuItemCard.tsx`

**Step 1: Replace the entire file**

```tsx
import type { MenuItem } from "../../api/endpoints";

interface MenuItemCardProps {
  item: MenuItem;
  onDetails?: (item: MenuItem) => void;
  onAddToPlan?: (item: MenuItem) => void;
}

function SmallMenuItemCard({ item }: MenuItemCardProps) {
  return (
    <div
      className="px-4 py-3"
      style={{ backgroundColor: "var(--warm-white)" }}
    >
      <div className="flex justify-between items-center gap-4">
        <span
          className="text-sm"
          style={{ color: "var(--ink)", fontFamily: "'DM Sans', sans-serif" }}
        >
          {item.item_name}
        </span>
        {item.allergens && item.allergens.length > 0 && (
          <span className="text-xs italic" style={{ color: "var(--ink-muted)" }}>
            {item.allergens
              .map((a) => (a.name === "Information Not Available" ? "Incomplete Allergen Info" : a.name))
              .join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MenuItemCard({ item, onDetails, onAddToPlan }: MenuItemCardProps) {
  const calories = item.nutrition_info?.calories ? Math.round(parseFloat(item.nutrition_info.calories)) : 0;

  if (calories === 0) return <SmallMenuItemCard item={item} />;

  const protein = item.nutrition_info?.protein ? Math.round(parseFloat(item.nutrition_info.protein)) : null;
  const carbs = item.nutrition_info?.total_carbohydrates ? Math.round(parseFloat(item.nutrition_info.total_carbohydrates)) : null;
  const fat = item.nutrition_info?.total_fat ? Math.round(parseFloat(item.nutrition_info.total_fat)) : null;

  return (
    <div className="p-5 sm:p-6" style={{ backgroundColor: "var(--warm-white)" }}>
      {/* Title row */}
      <div className="flex justify-between items-start gap-4 mb-2">
        <h3
          className="font-display italic text-lg leading-tight"
          style={{ color: "var(--ink)", fontWeight: 500 }}
        >
          {item.item_name}
        </h3>
        <span
          className="font-mono-data text-base whitespace-nowrap flex-shrink-0"
          style={{ color: "var(--ink)" }}
        >
          {calories} cal
        </span>
      </div>

      {/* Rule */}
      <hr className="editorial-rule mb-3" />

      {/* Serving size */}
      <p className="text-xs mb-2" style={{ color: "var(--ink-muted)" }}>
        {item.nutrition_info?.serving_size || "1 serving"}
      </p>

      {/* Description */}
      {item.item_description && (
        <p className="text-sm mb-3" style={{ color: "var(--ink-muted)" }}>
          {item.item_description}
        </p>
      )}

      {/* Allergens */}
      {item.allergens && item.allergens.length > 0 && (
        <p className="text-xs italic mb-3" style={{ color: "var(--ink-muted)" }}>
          {item.allergens
            .map((a) => (a.name === "Information Not Available" ? "Incomplete Allergen Info" : a.name))
            .join(", ")}
        </p>
      )}

      {/* Nutrition pills */}
      <div className="flex flex-wrap gap-3 mb-4">
        {protein !== null && (
          <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
            {protein}g P
          </span>
        )}
        {carbs !== null && (
          <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
            {carbs}g C
          </span>
        )}
        {fat !== null && (
          <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
            {fat}g F
          </span>
        )}
      </div>

      {/* Dietary tags */}
      {(item.is_vegan || item.is_vegetarian) && (
        <div className="flex gap-2 mb-4">
          {item.is_vegan && (
            <span
              className="text-xs px-2 py-0.5 rounded-sm"
              style={{ backgroundColor: "var(--cream)", color: "var(--ink-muted)", border: "1px solid var(--rule)" }}
            >
              Vegan
            </span>
          )}
          {item.is_vegetarian && !item.is_vegan && (
            <span
              className="text-xs px-2 py-0.5 rounded-sm"
              style={{ backgroundColor: "var(--cream)", color: "var(--ink-muted)", border: "1px solid var(--rule)" }}
            >
              Vegetarian
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5">
        <button
          className="text-xs transition-colors"
          style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
          onClick={() => onDetails?.(item)}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
        >
          Details
        </button>
        <button
          className="text-xs flex items-center gap-1 transition-colors"
          style={{ color: "var(--orange)", fontFamily: "'DM Sans', sans-serif" }}
          onClick={() => onAddToPlan?.(item)}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Add to Plan →
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Verify**

Menu item cards: Cormorant italic name, DM Mono calorie number, thin rule, nutrition as `35g P · 12g C · 8g F` inline text, no blue bars.

**Step 3: Commit**
```bash
git add hooshungry/src/components/menu/MenuItemCard.tsx
git commit -m "feat: editorial menu item cards — no progress bars, Cormorant headings"
```

---

## Task 8: Modals — AddToPlanPopup + ItemDetailsPanel

**Files:**
- Modify: `hooshungry/src/components/menu/AddToPlanPopup.tsx`
- Modify: `hooshungry/src/components/menu/ItemDetailsPanel.tsx`

**Step 1: Update `AddToPlanPopup.tsx` — styling only, keep all logic**

Change the modal card wrapper:
```tsx
// Before
<div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-fadeIn">

// After
<div
  className="relative w-full max-w-md p-8 animate-fadeIn"
  style={{
    backgroundColor: "var(--warm-white)",
    border: "1px solid var(--rule)",
    borderRadius: "8px",
    boxShadow: "0 8px 40px rgba(26,18,8,0.12)",
  }}
>
```

Update heading from `text-2xl font-bold` to:
```tsx
<h2 className="font-display italic text-2xl mb-2" style={{ color: "var(--ink)" }}>
```

Update meal choice buttons:
```tsx
// Before
className={`w-full px-4 py-2 rounded-lg border text-sm font-medium transition ${
  userMealChoice === m
    ? "border-orange-500 bg-orange-50 text-orange-700"
    : "border-gray-300 hover:bg-gray-50"
}`}

// After
className="w-full px-4 py-2.5 text-sm text-left transition-colors"
style={{
  border: `1px solid ${userMealChoice === m ? "var(--orange)" : "var(--rule)"}`,
  backgroundColor: userMealChoice === m ? "var(--cream)" : "transparent",
  color: userMealChoice === m ? "var(--orange)" : "var(--ink-muted)",
  borderRadius: "4px",
  fontFamily: "'DM Sans', sans-serif",
}}
```

Update Cancel/Add buttons:
```tsx
// Cancel
<button
  className="px-4 py-2 text-sm transition-colors"
  style={{ color: "var(--ink-muted)" }}
  onClick={onClose}
>
  Cancel
</button>

// Add / Log In
<button
  disabled={!selectedMeal || isSaving}
  onClick={handleConfirm}
  className="px-5 py-2 text-sm text-white transition-opacity disabled:opacity-40"
  style={{ backgroundColor: "var(--orange)", borderRadius: "4px" }}
>
  {isSaving ? "Adding…" : "Add"}
</button>
```

**Step 2: Update `ItemDetailsPanel.tsx` — styling only**

Modal wrapper:
```tsx
<div
  className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-fadeIn"
  style={{
    backgroundColor: "var(--warm-white)",
    border: "1px solid var(--rule)",
    borderRadius: "8px",
    boxShadow: "0 8px 40px rgba(26,18,8,0.12)",
  }}
>
```

Title:
```tsx
<h2 className="font-display italic pr-8 mb-2" style={{ fontSize: "1.75rem", color: "var(--ink)", fontWeight: 500 }}>
```

Calories display — change `text-blue-700` to:
```tsx
<div className="font-mono-data text-2xl sm:text-3xl mb-1" style={{ color: "var(--orange)" }}>
```

Section headings (`Dietary`, `Ingredients`, etc.):
```tsx
<h3 className="section-header-label mb-3">Dietary</h3>
```

Macro bars — replace the blue `bg-blue-500` bars with:
- Protein: `backgroundColor: "var(--amber)"`
- Carbs: `backgroundColor: "var(--terracotta)"`
- Fat: `backgroundColor: "var(--terracotta)"`
- Track: `backgroundColor: "var(--rule)"`

Dietary tags:
```tsx
<span
  className="px-2 py-0.5 text-xs rounded-sm"
  style={{ backgroundColor: "var(--cream)", color: "var(--ink-muted)", border: "1px solid var(--rule)" }}
>
```

**Step 3: Verify**

Both modals use warm-white surface, Cormorant heading, orange calories, no blue.

**Step 4: Commit**
```bash
git add hooshungry/src/components/menu/AddToPlanPopup.tsx hooshungry/src/components/menu/ItemDetailsPanel.tsx
git commit -m "feat: editorial modal styling"
```

---

## Task 9: Plan page + DailyMealPlan

**Files:**
- Modify: `hooshungry/src/pages/Plan.tsx`
- Modify: `hooshungry/src/components/plan/DailyMealPlan.tsx`

**Step 1: Update `Plan.tsx`**

Change page wrapper and title:
```tsx
// Wrapper
<div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>

// Title
<h1
  className="font-display italic mb-8"
  style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, color: "var(--ink)" }}
>
  Plan
</h1>
```

**Step 2: Update `DailyMealPlan.tsx`**

Loading state wrapper:
```tsx
<div className="card-editorial p-6 sm:p-8">
```

Main wrapper:
```tsx
<div className="card-editorial p-4 sm:p-6 lg:p-8">
```

Header:
```tsx
<h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
  Daily Meal Plan
</h2>
```

Date display:
```tsx
<div className="text-center min-w-[160px] sm:min-w-[180px]">
  <div className="font-display italic" style={{ color: "var(--ink)", fontSize: "1.1rem" }}>
    {dayName}
  </div>
  <div className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>{monthDay}</div>
</div>
```

Nav arrows: keep `ChevronLeft`/`ChevronRight` but update button style:
```tsx
className="w-8 h-8 flex items-center justify-center transition-colors rounded"
style={{ color: "var(--ink-muted)" }}
```

**Step 3: Verify**

Plan page title is large Cormorant italic. Daily plan card uses `card-editorial` surface.

**Step 4: Commit**
```bash
git add hooshungry/src/pages/Plan.tsx hooshungry/src/components/plan/DailyMealPlan.tsx
git commit -m "feat: editorial plan page and daily meal plan"
```

---

## Task 10: Meal sections + Meal item cards

**Files:**
- Modify: `hooshungry/src/components/plan/MealSection.tsx`
- Modify: `hooshungry/src/components/plan/MealItemCard.tsx`

**Step 1: Update `MealSection.tsx`**

Replace section header block (keep all `isExpanded` logic):
```tsx
<div
  className="flex items-center justify-between mb-4 cursor-pointer"
  onClick={() => setIsExpanded(!isExpanded)}
>
  <div className="section-header flex-1 mb-0 mr-4">
    <span className="section-header-label">{title}</span>
    <div className="section-header-rule" />
  </div>
  <div className="flex items-center gap-3 flex-shrink-0">
    <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
      {totalCalories} cal
    </span>
    <span className="text-xs" style={{ color: "var(--ink-muted)" }}>
      {isExpanded ? "↑" : "↓"}
    </span>
  </div>
</div>
```

Empty state:
```tsx
<div className="py-8 text-center text-sm" style={{ color: "var(--ink-muted)" }}>
  No items added yet
</div>
```

**Step 2: Update `MealItemCard.tsx`** — styling only, keep all serving/delete logic

Card wrapper:
```tsx
<div
  className="p-3 sm:p-4 transition-colors"
  style={{ backgroundColor: "var(--warm-white)", border: "1px solid var(--rule)", borderRadius: "6px" }}
  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--orange)")}
  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--rule)")}
>
```

Item name:
```tsx
<h4 className="font-display italic text-base truncate" style={{ color: "var(--ink)" }}>
```

Calories/servings:
```tsx
<div className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
  {displayCalories} cal · {Number(servings).toFixed(2)} serving{servings !== 1 ? "s" : ""}
</div>
```

Location:
```tsx
<div className="text-xs mt-0.5 truncate" style={{ color: "var(--ink-muted)", opacity: 0.7 }}>
  {item.dining_hall} · {item.station_name}
</div>
```

Serving controls wrapper:
```tsx
<div className="flex items-center gap-1 rounded px-1" style={{ backgroundColor: "var(--cream)" }}>
```

Delete button hover: change `hover:bg-red-50 hover:text-red-500` to inline style onMouseEnter/Leave.

**Step 3: Verify**

Meal sections use newspaper rule headers. Meal item cards use editorial surface with orange hover border.

**Step 4: Commit**
```bash
git add hooshungry/src/components/plan/MealSection.tsx hooshungry/src/components/plan/MealItemCard.tsx
git commit -m "feat: editorial meal section and item card styling"
```

---

## Task 11: Progress stats

**Files:**
- Modify: `hooshungry/src/components/plan/ProgressStats.tsx`

**Step 1: Replace the entire file** — keep all percentage calculation logic, replace the render

```tsx
import type { DailyPlanResponse } from "../../api/planEndpoints";

interface ProgressStatsProps {
  dailyData: DailyPlanResponse | null;
  goals?: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null } | null;
}

function MacroBar({
  label,
  current,
  goal,
  unit,
  color,
}: {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min(Math.round((current / goal) * 100), 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
        >
          {label}
        </span>
        <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
          {Math.round(current)}{unit} / {goal}{unit}
        </span>
      </div>
      <div className="w-full h-1 rounded-full" style={{ backgroundColor: "var(--rule)" }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ProgressStats({ dailyData, goals }: ProgressStatsProps) {
  const currentCalories = dailyData?.total_calories || 0;
  const goalCalories = goals?.calories || 2000;
  const caloriePercentage = Math.min(Math.round((currentCalories / goalCalories) * 100), 100);

  return (
    <div className="card-editorial p-5 sm:p-6">
      {/* Calories headline */}
      <div className="mb-6">
        <p
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
        >
          Today's Progress
        </p>
        <div className="flex items-baseline gap-2">
          <span
            className="font-display italic"
            style={{ fontSize: "2.5rem", color: "var(--ink)", lineHeight: 1, fontWeight: 400 }}
          >
            {currentCalories.toLocaleString()}
          </span>
          <span className="font-mono-data text-sm" style={{ color: "var(--ink-muted)" }}>
            / {goalCalories} kcal
          </span>
        </div>
        <div className="w-full h-1 rounded-full mt-3" style={{ backgroundColor: "var(--rule)" }}>
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{ width: `${caloriePercentage}%`, backgroundColor: "var(--orange)" }}
          />
        </div>
      </div>

      <hr className="editorial-rule mb-5" />

      <MacroBar
        label="Protein"
        current={dailyData?.total_protein || 0}
        goal={goals?.protein || 150}
        unit="g"
        color="var(--amber)"
      />
      <MacroBar
        label="Carbs"
        current={dailyData?.total_carbs || 0}
        goal={goals?.carbs || 250}
        unit="g"
        color="var(--terracotta)"
      />
      <MacroBar
        label="Fat"
        current={dailyData?.total_fat || 0}
        goal={goals?.fat || 65}
        unit="g"
        color="var(--terracotta)"
      />
    </div>
  );
}
```

**Step 2: Verify**

Calories as large Cormorant numeral, three horizontal bars in orange/amber/terracotta. No SVG rings, no blue.

**Step 3: Commit**
```bash
git add hooshungry/src/components/plan/ProgressStats.tsx
git commit -m "feat: horizontal macro bars replace SVG ring progress"
```

---

## Task 12: Weekly calendar → horizontal strip

**Files:**
- Modify: `hooshungry/src/components/plan/WeeklyCalendar.tsx`

**Step 1: Replace the entire file** — keep all date/navigation logic, replace render

```tsx
import { forwardRef, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DailySummary } from "../../api/planEndpoints";

interface WeeklyCalendarProps {
  weekDates: Date[];
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
  onWeekChange: (direction: "prev" | "next") => void;
  weekSummary?: DailySummary[];
}

const WeeklyCalendar = forwardRef<HTMLDivElement, WeeklyCalendarProps>(
  ({ weekDates, selectedDate, onDaySelect, onWeekChange, weekSummary }, ref) => {
    const selectedDayRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      selectedDayRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, [selectedDate]);

    const formatDateKey = (date: Date) => date.toISOString().split("T")[0];
    const isSelectedDate = (date: Date) => formatDateKey(date) === formatDateKey(selectedDate);
    const getSummaryForDate = (date: Date) => weekSummary?.find((s) => s.date === formatDateKey(date));

    const getDateRangeText = () => {
      const firstDay = weekDates[0];
      const lastDay = weekDates[6];
      const firstMonth = firstDay.toLocaleDateString("en-US", { month: "short" });
      const lastMonth = lastDay.toLocaleDateString("en-US", { month: "short" });
      if (firstMonth === lastMonth) return `${firstMonth} ${firstDay.getDate()}–${lastDay.getDate()}`;
      return `${firstMonth} ${firstDay.getDate()} – ${lastMonth} ${lastDay.getDate()}`;
    };

    return (
      <div ref={ref} className="card-editorial p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Weekly Plan
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onWeekChange("prev")}
              className="w-6 h-6 flex items-center justify-center transition-colors"
              style={{ color: "var(--ink-muted)" }}
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
              {getDateRangeText()}
            </span>
            <button
              onClick={() => onWeekChange("next")}
              className="w-6 h-6 flex items-center justify-center transition-colors"
              style={{ color: "var(--ink-muted)" }}
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal day strip */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weekDates.map((date, index) => {
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            const dayNum = date.getDate();
            const isSelected = isSelectedDate(date);
            const summary = getSummaryForDate(date);
            const hasMeals = summary?.has_meals || false;

            return (
              <button
                key={index}
                ref={isSelected ? selectedDayRef : null}
                onClick={() => onDaySelect(date)}
                className="flex flex-col items-center py-3 px-3 rounded flex-shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: isSelected ? "var(--orange)" : "transparent",
                  minWidth: "52px",
                  border: isSelected ? "none" : "1px solid var(--rule)",
                }}
              >
                <span
                  className="text-xs uppercase tracking-wide mb-1"
                  style={{
                    color: isSelected ? "rgba(255,255,255,0.8)" : "var(--ink-muted)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.6rem",
                  }}
                >
                  {dayName}
                </span>
                <span
                  className="font-display italic leading-none"
                  style={{
                    fontSize: "1.4rem",
                    color: isSelected ? "white" : "var(--ink)",
                    fontWeight: 400,
                  }}
                >
                  {dayNum}
                </span>
                {/* Meal dot indicator */}
                <div
                  className="w-1 h-1 rounded-full mt-2"
                  style={{
                    backgroundColor: hasMeals
                      ? isSelected ? "rgba(255,255,255,0.7)" : "var(--orange)"
                      : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

WeeklyCalendar.displayName = "WeeklyCalendar";
export default WeeklyCalendar;
```

**Step 2: Verify**

Weekly calendar is a compact horizontal strip with Cormorant date numerals. Selected day has orange background. Days with meals have an orange dot.

**Step 3: Commit**
```bash
git add hooshungry/src/components/plan/WeeklyCalendar.tsx
git commit -m "feat: horizontal weekly calendar strip"
```

---

## Task 13: Auth forms — split layout

**Files:**
- Modify: `hooshungry/src/components/auth/Login.tsx`
- Modify: `hooshungry/src/components/auth/Register.tsx`

**Step 1: Replace `Login.tsx`** — keep all state/logic, replace layout

```tsx
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 0",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--rule)",
    color: "var(--ink)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    outline: "none",
  } as React.CSSProperties;

  const labelStyle = {
    display: "block",
    fontSize: "0.65rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "var(--ink-muted)",
    marginBottom: "6px",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: form */}
      <div
        className="flex flex-col justify-center px-8 sm:px-16 w-full lg:w-1/2"
        style={{ backgroundColor: "var(--cream)" }}
      >
        <div className="max-w-sm w-full mx-auto">
          <h1
            className="font-display italic mb-2"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "var(--ink)", fontWeight: 300 }}
          >
            Welcome back.
          </h1>
          <p className="text-sm mb-10" style={{ color: "var(--ink-muted)" }}>
            Log in to access your meal plan.
          </p>

          {error && (
            <div className="mb-6 text-sm py-2 px-3 rounded-sm" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--orange)", borderRadius: "4px" }}
            >
              Log In
            </button>
          </form>

          <p className="mt-8 text-sm" style={{ color: "var(--ink-muted)" }}>
            No account?{" "}
            <a href="/register" style={{ color: "var(--orange)" }}>
              Register →
            </a>
          </p>
        </div>
      </div>

      {/* Right: brand panel (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-col justify-center items-center w-1/2"
        style={{ background: "linear-gradient(135deg, var(--orange), var(--amber))" }}
      >
        <h2
          className="font-display italic text-white"
          style={{ fontSize: "clamp(3rem, 5vw, 5rem)", fontWeight: 300, opacity: 0.95 }}
        >
          HoosHungry
        </h2>
        <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif" }}>
          UVA Dining · Plan Smarter
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Replace `Register.tsx`** — same structure as Login, adjust for 3 fields

```tsx
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(username, password, email);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 0",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--rule)",
    color: "var(--ink)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    outline: "none",
  } as React.CSSProperties;

  const labelStyle = {
    display: "block",
    fontSize: "0.65rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "var(--ink-muted)",
    marginBottom: "6px",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: form */}
      <div
        className="flex flex-col justify-center px-8 sm:px-16 w-full lg:w-1/2"
        style={{ backgroundColor: "var(--cream)" }}
      >
        <div className="max-w-sm w-full mx-auto">
          <h1
            className="font-display italic mb-2"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "var(--ink)", fontWeight: 300 }}
          >
            Create account.
          </h1>
          <p className="text-sm mb-10" style={{ color: "var(--ink-muted)" }}>
            Start planning your meals today.
          </p>

          {error && (
            <div className="mb-6 text-sm py-2 px-3 rounded-sm" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label style={labelStyle}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Email (optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
            </div>
            <button
              type="submit"
              className="w-full py-3 text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--orange)", borderRadius: "4px" }}
            >
              Register
            </button>
          </form>

          <p className="mt-8 text-sm" style={{ color: "var(--ink-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--orange)" }}>
              Log in →
            </Link>
          </p>
        </div>
      </div>

      {/* Right: brand panel */}
      <div
        className="hidden lg:flex flex-col justify-center items-center w-1/2"
        style={{ background: "linear-gradient(135deg, var(--orange), var(--amber))" }}
      >
        <h2
          className="font-display italic text-white"
          style={{ fontSize: "clamp(3rem, 5vw, 5rem)", fontWeight: 300, opacity: 0.95 }}
        >
          HoosHungry
        </h2>
        <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif" }}>
          UVA Dining · Plan Smarter
        </p>
      </div>
    </div>
  );
}
```

**Step 3: Verify**

Login/Register: left half cream with underline inputs, right half orange-to-amber gradient with Cormorant wordmark.

**Step 4: Commit**
```bash
git add hooshungry/src/components/auth/Login.tsx hooshungry/src/components/auth/Register.tsx
git commit -m "feat: split-panel auth forms with underline inputs"
```

---

## Task 14: Prompt page fonts

**Files:**
- Modify: `hooshungry/src/components/prompt/ChatContainer.tsx`

**Step 1: Update font references only — keep all animation and logic untouched**

In `ChatContainer`, find the `CavBot` heading and subtitle:
```tsx
// Before
<h2 className="font-semibold text-white flex items-center gap-2">

// After
<h2 className="font-display italic text-xl text-white flex items-center gap-2">
```

The subtitle "Your AI meal planning assistant":
```tsx
// Before
<p className="text-xs text-gray-400">

// After
<p className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
```

In `EmptyState`, find the `h3` "Hey there! I'm CavBot":
```tsx
// Before
<h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">

// After
<h3 className="font-display italic text-white mb-3" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 400 }}>
```

The feature card titles:
```tsx
// Before
<div className="font-semibold text-white text-sm">

// After
<div className="text-sm text-white" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
```

**Step 2: Verify**

Prompt page preserves its dark theme but CavBot heading is now Cormorant italic.

**Step 3: Commit**
```bash
git add hooshungry/src/components/prompt/ChatContainer.tsx
git commit -m "feat: Cormorant headings in prompt/CavBot"
```

---

## Task 15: Final pass — remove remaining blue

**Files:**
- Search all `.tsx` files for `text-blue`, `bg-blue`, `border-blue`, `stroke="#3b82f6"`, `stroke="#8b5cf6"`, `ring-blue`

**Step 1: Search**
```bash
grep -r "blue\|#3b82f6\|#8b5cf6" hooshungry/src --include="*.tsx" -l
```

**Step 2: For each file found**, replace:
- `text-blue-*` → `text-[var(--orange)]` or `text-[var(--ink-muted)]` depending on context
- `bg-blue-*` → `bg-[var(--amber)]`
- `ring-blue-*` / `focus:ring-blue-*` → `focus:ring-orange-300` (or remove)
- SVG stroke blue → `var(--amber)` or `var(--orange)`

**Step 3: Verify**

No blue anywhere in the app. Run dev server and check all pages.

**Step 4: Commit**
```bash
git add -u
git commit -m "fix: remove all blue from design — consistent warm palette"
```

---

## Verification Checklist

Before declaring complete, check every page in the dev server:

- [ ] **Home**: Cream background, Cormorant italic hero, ruled feature cards, no frosted glass
- [ ] **Menu**: Tab selectors, newspaper station headers, editorial item cards with DM Mono calories
- [ ] **Plan**: Large Cormorant page title, horizontal day strip, horizontal macro bars, no blue rings
- [ ] **Login/Register**: Split layout, underline inputs, orange gradient right panel
- [ ] **Prompt**: Dark theme preserved, Cormorant "CavBot" heading
- [ ] **Nav**: Cream bar, italic wordmark, small-caps tab links
- [ ] No blue anywhere

Final commit if any loose ends:
```bash
git add -u
git commit -m "feat: complete editorial redesign"
```
