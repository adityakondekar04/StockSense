# DESIGN.md — StockSense Visual Design System

**Product:** StockSense  
**Competition:** VORTEXA 3.0 · Problem S-02  
**Purpose:** The single source of truth for StockSense's visual language. The interface must use the same visual system as DealFlow: Vercel-inspired Geist typography, near-white canvas, near-black ink, hairline borders, restrained shadows, pill-shaped marketing CTAs, compact square app controls, and generous whitespace.

> **Core mantra:** Rules Decide, AI Advises.  
> **Visual principle:** Keep DealFlow's visual identity consistent. Adapt only the product content, information architecture, and inventory-specific data visualizations for StockSense.

---

## 1. Brand Identity & Principles

### Product domain
Adaptive inventory replenishment for small and medium retailers, community pharmacies, and primary healthcare storekeepers.

### Brand personality
Precise, calm, trustworthy, modern, operational, and data-dense without clutter. The interface should feel like a polished Vercel-style developer product—not a conventional blue/green analytics dashboard.

### Non-negotiable visual rules
1. **Match DealFlow's design language.** Use the same palette, typography, spacing, border treatment, radii, buttons, and restrained elevation. Do not introduce a separate StockSense theme.
2. **Numbers are the hero.** Reorder Point, Safety Stock, Order Quantity, stock on hand, lead time, and forecast values should be easy to scan.
3. **Always show the basis.** Place the service level and z-factor near relevant recommendations, for example: `Service level 95% · z = 1.645`.
4. **Show the source of a decision.** Use clear text labels such as `Rules`, `AI suggestion`, `AI unavailable · rules used`, and `Confirmed`.
5. **Never rely on color alone.** Every stock status includes an icon and a readable text label, such as `! Order now`, `↗ Reorder soon`, or `✓ Healthy`.
6. **Plain language first.** Explain operational implications in terms storekeepers and healthcare workers can act on.
7. **Keep the interface quiet.** Avoid colorful dashboard tiles, glowing gradients, heavy shadows, glassmorphism, decorative blobs outside the hero, and oversized status-color fills.

---

## 2. Color Palette & Design Tokens

Use the DealFlow/Vercel-inspired neutral system as the foundation. Inventory states are semantic accents and must remain small, restrained, and accessible.

### Brand and accent

| Token | Value | Usage |
|---|---|---|
| Primary / Ink | `#171717` | Wordmark, headings, primary CTA, high-emphasis data |
| On Primary | `#ffffff` | Text on primary buttons |
| Link / Active | `#0070f3` | Links, selected controls, focus accent, active navigation |
| Link Deep | `#0761d1` | Link hover / pressed state |
| Link Soft | `#d3e5ff` | Subtle active selection background only |
| Violet | `#7928ca` | Rare chart or illustration accent |
| Cyan | `#50e3c2` | Rare chart or illustration accent |
| Pink | `#ff0080` | Rare chart or illustration accent; never status chrome |
| Magenta | `#eb367f` | Hero gradient / rare illustration accent |

### Neutral palette

| Token | Value | Usage |
|---|---|---|
| Canvas | `#fafafa` | Main page background |
| Elevated Surface | `#ffffff` | Cards, menus, inputs, tables, code/data panels |
| Soft Surface | `#f2f2f2` | Inset areas and subtle secondary panels |
| Ink | `#171717` | Main headings and important values |
| Body | `#4d4d4d` | Paragraphs, labels, navigation |
| Muted | `#8f8f8f` | Metadata, captions, timestamps |
| Faint | `#a1a1a1` | Placeholder or disabled text only |
| Hairline | `#ebebeb` | Default 1px borders and dividers |
| Hairline Soft | `#f2f2f2` | Subtle separators |
| Error | `#ee0000` | Destructive actions and critical validation |
| Error Deep | `#c50000` | Error hover / pressed |
| Warning | `#f5a623` | Small warning icon, marker, or chart accent |
| Warning Soft | `#ffefcf` | Small warning label background when needed |
| Warning Deep | `#ab570a` | Warning label text |

### Inventory status tokens

Inventory status must not recolor entire cards or dashboard sections. Use the neutral system for surfaces and borders, then apply the semantic color to a compact icon, dot, badge, or short label. Always include text.

| State | Accent | Suggested label | Treatment |
|---|---|---|---|
| Order now / High risk | `#ee0000` | `Order now` | Small red icon + text; optional pale red tint |
| Reorder soon / Warning | `#ab570a` | `Reorder soon` | Small amber icon + text; optional pale amber tint |
| Healthy / OK | `#0070f3` | `Healthy` | Small blue icon + text; neutral background |
| Confirmed | `#171717` | `Confirmed` | Ink text and check icon |
| AI suggestion | `#7928ca` | `AI suggestion` | Small violet label/icon, never a large purple panel |
| AI unavailable · rules used | `#4d4d4d` | `Rules used` | Neutral label with an informational icon |

**Important:** Status color is supplementary, not the sole indicator. Maintain at least 4.5:1 contrast for normal text. If the product implementation requires a dedicated green healthy state, keep it limited to a small semantic indicator and do not change the core DealFlow palette or surface treatment.

### Hero gradient

The only large decorative color treatment allowed is the DealFlow-style hero mesh gradient. Blend these stops softly and keep the gradient behind or beside the hero headline only:

- Develop: `#007cf0` → `#00dfd8`
- Preview: `#7928ca` → `#ff0080`
- Ship: `#ff4d4d` → `#f9cb28`

Do not use gradients in inventory cards, charts, table rows, sidebars, or application chrome.

---

## 3. Typography & Formatting

### Font families
- **UI and prose:** Geist Sans, with `Arial, sans-serif` fallback.
- **Code, SKUs, formulas, compact technical eyebrows:** Geist Mono, with `ui-monospace, SFMono-Regular, Menlo, monospace` fallback.
- If Geist is unavailable, use **Inter** for sans-serif and **JetBrains Mono** for monospace. Preserve the same weights, line heights, and tight display tracking.

### Typography scale

| Token | Size | Weight | Line height | Letter spacing | Usage |
|---|---:|---:|---:|---:|---|
| Display XL | 48px | 600 | 48px | -2.4px | Landing-page hero |
| Heading LG | 32px | 600 | 40px | -1.28px | Main page / section heading |
| Heading MD | 20px | 600 | 28px | -0.4px | Card and subsection heading |
| Label SM | 14px | 500 | 20px | -0.28px | Strong labels and navigation |
| Mono Eyebrow | 12px | 500 | 16px | 0 | Uppercase section labels |
| Body LG | 16px | 400 | 24px | 0 | Introductory copy |
| Body MD | 14px | 400 | 20px | 0 | Default body, table cells, navigation |
| Body SM | 12px | 400 | 16px | 0 | Captions, timestamps, metadata |
| Button LG | 16px | 500 | 20px | 0 | Marketing CTA labels |
| Button MD | 14px | 500 | 20px | 0 | Compact app/nav button labels |
| Code | 14px | 400 | 20px | 0 | SKU, formulas, technical values |

### Typography rules
- Use weight 600 for headings, 500 for buttons and strong labels, and 400 for body copy.
- Display headings use tight negative tracking. Do not loosen letter spacing.
- Use Geist Mono sparingly for section eyebrows, SKUs, formulas, model identifiers, and numeric technical details.
- Avoid using all-caps for long labels or paragraphs.
- Use sentence case for product copy and status labels.

### Number formatting
- Quantities: integers with thousands separators, e.g. `1,250 units`.
- Percentages and rates: one decimal place where appropriate, e.g. `99.8%`.
- z-factor: three decimals, e.g. `1.645`.
- Lead time: one decimal place, e.g. `3.1 days`.
- Dates and timestamps should use one consistent format throughout the product.
- Always display units alongside inventory values. Never show a bare number when the unit could be ambiguous.

---

## 4. Layout, Spacing & Responsive Behavior

### Spacing scale

Use a 4px base unit.

| Token | Value |
|---|---:|
| xxs | 4px |
| xs | 8px |
| sm | 12px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 40px |
| 3xl | 64px |
| 4xl | 96px |
| section | 128px |

### Containers and grids
- Use a centered max-width container of approximately 1200px for marketing pages.
- Keep page gutters generous and consistent.
- Use precise 2-, 3-, and 4-column grids for feature sections; collapse to one column on narrow screens.
- In the operational application, prioritize readable data tables, clear filters, compact KPI summaries, and visible primary actions.
- Avoid making every metric a separate colorful card. Group related information into calm, hairline-bordered panels.
- Use whitespace to establish hierarchy rather than heavy background blocks.

### Responsive breakpoints

| Breakpoint | Width | Behavior |
|---|---:|---|
| Mobile | ≤ 640px | Single-column content; menu trigger; stacked CTAs; tables transform or provide accessible row-level layouts |
| Tablet | 768px | Two-column card grids; condensed navigation |
| Laptop | 1024px | Three- or four-column marketing grids where space permits |
| Desktop | 1200px+ | Centered max-width layout and full navigation |

StockSense must remain functional down to 375px. Prevent page-level horizontal scrolling. If a dense data table cannot reasonably collapse, use a clearly contained, keyboard-accessible table scroller rather than causing the entire page to overflow.

### Whitespace philosophy
Whitespace is structural. The canvas and hairline borders separate content; shadows are not a substitute for spacing. Use generous gaps between page sections and a tighter, consistent rhythm inside data-heavy panels.

---

## 5. Shapes, Borders & Elevation

### Radius scale

| Token | Value | Usage |
|---|---:|---|
| None | 0px | Dividers and full-width bands |
| Small | 6px | App buttons, inputs, compact controls |
| Medium | 12px | Feature cards, code blocks, standard panels |
| Large | 16px | Larger feature and pricing panels |
| Category pill | 64px | Category tabs |
| Marketing pill | 100px | Marketing CTAs |
| Full | 9999px | Circular icon controls, avatars, pill navigation |

Keep the same contextual shape system as DealFlow: pill-shaped marketing CTAs and compact 6px-radius functional controls. Do not make every element pill-shaped.

### Elevation levels

| Level | Treatment | Usage |
|---|---|---|
| 0 — Flat | 1px `#ebebeb` border, no shadow | Default cards, inputs, dividers, tables |
| 1 — Whisper | Border + `0 1px 1px rgba(0,0,0,0.04)` | Lightly raised cards |
| 2 — Floating | Very subtle layered shadow + inset hairline | Menus, dialogs, tooltips |

Default card treatment:
- White surface on `#fafafa` canvas.
- 1px hairline border.
- 12–16px radius, depending on the component.
- No heavy shadows; use only a whisper-soft shadow when needed.
- Hover may subtly strengthen the border or shadow, but must not cause layout shift.

---

## 6. Components

### Navigation
- Canvas background `#fafafa`, bottom hairline `#ebebeb`.
- Wordmark and navigation use near-black and body-grey text.
- Nav links use 14px Geist Sans and a generous pill-shaped hit area.
- Keep navigation visually quiet. Primary app actions use compact square buttons, not marketing-size pills.
- On mobile, collapse navigation behind an accessible menu trigger.

### Buttons

**Primary marketing CTA**
- Background `#171717`, white text.
- 16px / 500 Geist Sans.
- 100px radius.
- Horizontal padding 14px; height driven by line-height and touch-target requirements.
- Example: `Explore StockSense`, `Get started`.

**Secondary marketing CTA**
- White background, `#171717` text, `#ebebeb` border.
- Same pill shape as the primary marketing CTA.
- Example: `View how it works`.

**Compact primary app button**
- Background `#171717`, white text.
- 14px / 500 Geist Sans.
- 6px radius, compact horizontal padding.
- Example: `Confirm order`, `Run forecast`.

**Compact secondary / ghost app button**
- White background, ink text, 1px hairline border.
- 14px / 500 Geist Sans, 6px radius.
- Example: `Cancel`, `Export`, `View details`.

**Icon button**
- White surface, hairline border, circular shape.
- Provide an accessible name and visible keyboard focus.
- Do not use an icon-only control when its action would be unclear.

Buttons need clear default, hover, active, disabled, and keyboard-focus states. Do not use bright indigo fills for primary buttons; the primary button remains near-black to match DealFlow.

### Inputs and forms
- White background, ink text, 1px `#ebebeb` border.
- 6px radius.
- 14px Geist Sans for standard fields; compact numeric controls may use 12–14px.
- Focus state: visible 2px focus ring using the link accent `#0070f3`, with adequate offset.
- Labels remain visible when a field is filled; do not rely on placeholder text as the label.
- Validation errors include text and an icon, not just a red border.
- Number inputs must show units and sensible minimum/maximum constraints where applicable.

### Cards and panels
- **Feature card:** white surface, 1px hairline, 12px radius, 24px padding.
- **Elevated card:** same base treatment with a restrained floating shadow, only when hierarchy requires it.
- **Data panel:** white surface, hairline border, clear title, optional caption, and aligned values.
- **KPI summary:** use large ink-colored numerals, concise labels, and muted explanatory text. Avoid full-card semantic color fills.
- **Recommendation panel:** present the recommendation, decision source, supporting values, and next action in a clear order.

### Inventory-specific components

**Stock status**
- Compact icon + explicit label.
- Examples: `! Order now`, `↗ Reorder soon`, `✓ Healthy`.
- Use a restrained semantic accent; keep the surrounding card neutral.
- Never use color as the only status cue.

**Replenishment recommendation**
Show the following where relevant:
1. Item name and SKU.
2. Current stock and projected demand.
3. Reorder Point, Safety Stock, and suggested Order Quantity.
4. Lead time and service level.
5. Service-level basis, e.g. `Service level 95% · z = 1.645`.
6. Decision source: `Rules`, `AI suggestion`, or `AI unavailable · rules used`.
7. A clear next action, such as `Review recommendation` or `Confirm order`.

**Decision-source badge**
- Use a compact neutral badge with a readable label.
- `Rules` should look authoritative and neutral.
- `AI suggestion` may use a small violet accent.
- `AI unavailable · rules used` should be transparent and reassuring, not alarming.
- `Confirmed` should include a check icon and text.
- Never imply an AI suggestion is a confirmed action.

**Tables**
- White surface and hairline separators.
- Column headers use 12px uppercase or compact 12–14px semibold text; keep labels understandable.
- Align numeric values consistently, preferably right-aligned.
- Use tabular numerals for quantities and rates.
- Row hover may use `#f2f2f2`; avoid colored zebra stripes.
- Status cells include text labels and icons.
- Provide empty, loading, error, and populated states.

**Charts**
- Use restrained, high-contrast axes, labels, and tooltips.
- Prefer thin lines, subtle area fills, and neutral grid lines.
- Use accent blue for the primary series; use violet/cyan only when multiple series need distinction.
- Use red and amber only to call attention to actual risk or warning thresholds.
- Never rely on chart color alone: provide legends, labels, tooltips, and accessible summaries.
- Tooltips may use `#171717` backgrounds with white text, small radius, and minimal shadow.
- Do not use gradients as decoration across the whole chart; subtle fills are acceptable when they improve data legibility.

**Sliders and numeric controls**
- Use accent blue `#0070f3` for the active slider track.
- Use restrained amber only for a warning-related parameter.
- Keep labels, current values, and units visible.
- Include keyboard-operable controls and a numeric alternative when precision matters.

**Code and formula blocks**
- White surface, 1px hairline, 12px radius, 16px padding.
- Use Geist Mono for formulas, SKUs, and technical values.
- Keep formulas readable and pair them with a plain-language explanation.

### Hero and marketing sections
- Near-white canvas and ink headline.
- Geist Sans 48px / 600 with -2.4px tracking on desktop.
- A soft DealFlow-style mesh gradient may appear behind or beside the hero headline only.
- Explain the product clearly in plain language.
- Keep primary and secondary CTAs as matching pills.
- Avoid stock photography, generic AI illustrations, 3D blobs, and multiple decorative systems.

### Footer
- Near-white canvas with top hairline.
- Body-grey text and 14px Geist Sans.
- Generous vertical spacing and restrained link groups.
- No large colored footer blocks.

---

## 7. Accessibility & Interaction

- Maintain at least **4.5:1 contrast** for normal text and labels.
- Never communicate status, errors, or chart meaning through color alone.
- All interactive controls must be keyboard accessible.
- Use a clearly visible focus ring: 2px, accent blue `#0070f3`, with enough offset to distinguish it from the border.
- Provide accessible names for icon buttons and chart summaries.
- Maintain appropriate touch targets, ideally at least 44×44px for primary touch interactions, even if the visible icon or button chrome is compact.
- Respect reduced-motion preferences. Motion should be brief and functional.
- Avoid hover-only information; critical data must also be available on focus or click.
- Show helpful empty, loading, error, and success states.
- Do not use flashing, pulsing, or animated risk indicators.

---

## 8. Motion & Interaction States

- Keep transitions subtle and functional, generally around 150–200ms.
- Use gentle border-color or shadow changes for card hover.
- Do not scale components on hover if it changes surrounding layout.
- Use clear pressed states for buttons.
- Loading states should preserve layout and communicate what is happening.
- Confirmations should be explicit. A recommendation is not an order until the user confirms it.
- When AI fails, show that the rules-based result is being used, without presenting the fallback as an AI result.

---

## 9. Do's and Don'ts

### Do
- Keep the DealFlow/Vercel-inspired palette: `#fafafa` canvas, `#ffffff` surfaces, `#171717` ink, `#4d4d4d` body text, and `#ebebeb` hairlines.
- Use Geist Sans and Geist Mono with the defined type scale and tight display tracking.
- Keep marketing CTAs pill-shaped and functional app controls compact with 6px corners.
- Use hairline borders before adding any shadow.
- Make the inventory numbers and recommendation basis easy to scan.
- Label decision sources clearly and distinguish AI suggestions from confirmed actions.
- Pair every status icon/color with plain-language text.
- Use restrained accent colors in charts and small semantic indicators only.
- Preserve generous whitespace and predictable alignment.
- Keep responsive behavior and keyboard access in mind from the start.

### Don't
- Do not revert to an indigo-dominant dashboard or use the old slate/indigo StockSense palette as the main visual theme.
- Do not use emerald, amber, red, or violet as large card backgrounds.
- Do not add heavy shadows, glassmorphism, neon glows, gradients outside the hero, or decorative blobs.
- Do not make every KPI a brightly colored tile.
- Do not use a different font, button shape, radius system, or spacing scale on different pages.
- Do not use color as the only indication of stock status or model state.
- Do not present AI advice as an automatically confirmed decision.
- Do not sacrifice readability to fit dense tables onto a small screen.
- Do not invent unsupported metrics or imply that forecasts are guaranteed.

---

## 10. Implementation Checklist

Before shipping a page or component, verify:

- [ ] It uses the DealFlow-aligned palette, Geist typography, spacing, and radii.
- [ ] The page background is `#fafafa` and standard surfaces are white.
- [ ] Borders use the `#ebebeb` hairline; shadows are restrained.
- [ ] Marketing CTAs use the pill shape; app controls use compact 6px corners.
- [ ] Headings use the correct weight and negative tracking.
- [ ] Inventory numbers include units and use consistent formatting.
- [ ] Replenishment recommendations show the basis, including service level and z-factor when relevant.
- [ ] Rules, AI suggestions, fallbacks, and confirmed actions are clearly distinguished.
- [ ] Statuses have both an icon and a text label.
- [ ] Focus states, contrast, keyboard access, and responsive layouts are tested.
- [ ] No page-level horizontal scrolling occurs at 375px.
- [ ] No new visual language has been introduced without a deliberate system-wide decision.
**Final rule:** StockSense must look and feel like it belongs to the same product family as DealFlow. The domain changes; the design language does not.

