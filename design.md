# DESIGN.md: StockSense Visual Design System

Single source of truth for the visual design system of StockSense (VORTEXA 3.0, Problem S-02).

## 1. Brand Identity & Principles

- **Domain:** Adaptive inventory replenishment for small & medium retailers, community pharmacies, and primary healthcare storekeepers.
- **Core Mantra:** "Rules Decide, AI Advises."
- **Visual Personality:** Professional, trustworthy, calm, high-contrast, data-dense without clutter.
- **Core Principles:**
  1. **Numbers are the hero:** Key metrics (Reorder Point, Safety Stock, Order Quantity) are prominently displayed.
  2. **Always show the basis:** Service level and z-factor appear beside every recommendation (`Service level 95% → z = 1.645`).
  3. **Show the source of a decision:** Clear badge paths (`Rules`, `AI (suggestion)`, `AI failed, rules used`, `Confirmed`).
  4. **Never rely on colour alone:** Every status pairs colour with an icon and text label (e.g., Red + AlertTriangle + "Order now").
  5. **Plain language:** Written for storekeepers and healthcare workers, not abstract statisticians.

---

## 2. Color Palette & Design Tokens

### Neutral Palette (Slate)
- Background: `bg-slate-50` (`#f8fafc`)
- Surface Cards: `bg-white` (`#ffffff`)
- Borders: `border-slate-200` (`#e2e8f0`) / subtle `border-slate-100`
- Subtle Fills: `bg-slate-100` (`#f1f5f9`)
- Muted Text: `text-slate-500` (`#64748b`)
- Secondary Text: `text-slate-600` (`#475569`)
- Body/Heading: `text-slate-900` (`#0f172a`)

### Primary Accent (Indigo)
- Primary Action: `bg-indigo-600` (`#4f46e5`), hover `bg-indigo-700` (`#4338ca`), active `bg-indigo-800`
- Subtle Tints: `bg-indigo-50` (`#eef2ff`), border `border-indigo-100` / `border-indigo-200`
- Text Accent: `text-indigo-600` / `text-indigo-700`

### Semantic Status Tokens
- **Order now / High Risk:**
  - Background: `bg-red-50` (`#fef2f2`)
  - Border: `border-red-200` (`#fecaca`)
  - Text & Icon: `text-red-700` / `text-red-600`
- **Reorder soon / Warning:**
  - Background: `bg-amber-50` (`#fffbeb`)
  - Border: `border-amber-200` (`#fde68a`)
  - Text & Icon: `text-amber-700` / `text-amber-600`
- **Healthy / OK:**
  - Background: `bg-emerald-50` (`#ecfdf5`)
  - Border: `border-emerald-200` (`#a7f3d0`)
  - Text & Icon: `text-emerald-700` / `text-emerald-600`

---

## 3. Typography & Formatting

- **Font Family:** Inter / System sans-serif stack (`font-sans`).
- **Monospace:** JetBrains Mono / font-mono for SKUs, formulas, and numeric counters.
- **Scale:**
  - Display / Hero: `text-4xl` to `text-5xl`, `font-extrabold`, leading `1.12`
  - Section Titles: `text-3xl` to `text-4xl`, `font-extrabold`, tracking `tight`
  - Card Titles: `text-lg` to `text-xl`, `font-bold`
  - Body: `text-base` / `text-sm`, `text-slate-600`, leading `relaxed`
  - Eyebrow Badges: `text-xs`, uppercase, `font-semibold`, tracking `wider`
  - Captions / Meta: `text-xs` / `text-[11px]`, `text-slate-500`

### Number Formatting
- Units: Integers with thousands separators (`1,250 units`)
- Percentages & Rates: 1 decimal (`99.8%`)
- z-Factor: 3 decimals (`1.645`)
- Lead times: 1 decimal (`3.1 days`)

---

## 4. Components & Elevation

- **Cards:** `bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow`
- **Buttons:**
  - Primary: `bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500`
  - Secondary: `bg-white hover:bg-slate-50 text-slate-700 font-medium px-5 py-3 rounded-xl border border-slate-300 shadow-sm`
- **Sliders & Inputs:**
  - Sliders: `accent-indigo-600` / `accent-amber-600`
  - Number Inputs: `bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500`
- **Charts:** Recharts `ResponsiveContainer`, `AreaChart`, custom gradients, dark tooltips (`bg-slate-900 text-white text-xs`).

---

## 5. Responsive Behavior & Accessibility

- Laptop-first (1280px), fully functional down to mobile (375px).
- Strict contrast compliance (minimum 4.5:1 for body and labels).
- Visible keyboard focus rings (`focus:ring-2 focus:ring-indigo-500`).
- No horizontal scrolling; smooth section anchoring.
