# UI Guidelines

Keep the interface consistent so five people building in parallel produce one product. Tailwind + Recharts.

## 1. Principles

1. **Numbers are the hero.** The reorder point, order quantity and status are the biggest elements on a card.
2. **Always show the basis.** Service level and z appear next to every recommendation.
3. **Show the source of a decision.** Every AI-influenced value carries a path badge.
4. **Never rely on colour alone.** Use shape, label or icon as well (accessibility and projector washout).
5. **Plain language.** Write for a pharmacy owner, not a statistician.

## 2. Terminology (use these words everywhere)

| Use | Not |
|---|---|
| Reorder point | ROP, trigger level (ROP is allowed in small text) |
| Safety stock | Buffer |
| Order quantity | Lot size |
| Service level | Confidence |
| Order now / OK | Alert / Healthy |
| Unusual value | Outlier (in UI text) |
| Rules / AI / AI failed, rules used | Heuristic, fallback (badge text) |
| Suggestion | Decision, result (for AI output) |

## 3. Colour tokens (Tailwind)

| Purpose | Token | Notes |
|---|---|---|
| Primary action | `indigo-600` | Buttons, links |
| Order now | `red-600` bg `red-50` + icon "!" | Plus the words "Order now" |
| OK | `emerald-600` bg `emerald-50` + check icon | |
| Warning banner | `amber-100` border `amber-400` | Limited information, intermittent demand |
| Neutral | `slate-*` | Text and borders |

### Anomaly classes (colour + shape + label)

| Class | Colour | Marker shape | Label |
|---|---|---|---|
| Promotion | `blue-600` | Diamond | Promotion |
| Data error | `red-600` | Cross (X) | Data error |
| Unknown | `amber-500` | Circle with "?" | Unknown |

### Path badges

| Path | Style | Text |
|---|---|---|
| `RULES` | slate outline | Rules |
| `LLM` | indigo filled | AI (suggestion) |
| `LLM_FAILED_RULES` | amber outline | AI failed, rules used |
| User confirmed | green outline | Confirmed by you |

## 4. Components

| Component | Rule |
|---|---|
| Recommendation card | Fixed order of fields: header, service line, key numbers, position, split bar, cost, warnings, links |
| Service line | Format exactly: `Service level 95% → z = 1.645` |
| Metric tile | Label small, value large, unit always shown |
| Table | Sticky header, right-aligned numbers, 1 decimal for rates, integers for units |
| Banner | One line, an icon, a dismiss only when informational |
| Confirm / Override | Paired buttons, Confirm primary, Override secondary |
| Toggle | Labelled with text ("Run without AI"), not an icon |

## 5. Charts (Recharts)

- Line for sales, thin grey; anomaly markers drawn on top (shape + colour per class).
- Training and holdout separated by a shaded background and a labelled vertical line.
- Forecast lines: baseline dashed grey, model solid indigo.
- Axis titles with units ("units per day"). Date ticks every 14 days.
- Tooltip shows date, value, and for anomalies the class and reason.
- Every chart has a "Show table" toggle for the same data.
- Keep the Before/After comparison as paired columns, not overlaid charts.
- Safety-stock split: a single stacked bar, two segments labelled with percentages.

## 6. Number formatting

| Quantity | Format |
|---|---|
| Units | Integer with thousands separator (`1,250`) |
| Rates and percentages | One decimal (`99.8%`) |
| z | Three decimals (`1.645`) |
| Currency | Rupee symbol, two decimals, thousands separator |
| Days | One decimal (`3.1 days`) |
| Dates | `14 Oct 2026` |

Rounding happens only at display. Units for reorder point and order quantity are rounded **up**.

## 7. Copy rules

- Neutral and factual. Anomalies are "unusual values for review", never "errors found" unless the rules say data error.
- AI output is labelled "suggestion". The word "predicts" is not used for stockouts; use "at current demand, stock is expected to run out around".
- Every page with calculated numbers links to Methodology.
- Footer note: "Decision support using fictional demo data. Not a guarantee."

## 8. Layout and responsiveness

- Laptop-first (1280 px). Must remain usable at 1024 px (projector) and not break at 768 px.
- Content width max 1200 px, 24 px gutters.
- Cards in a 2-column grid at 1280 px, 1 column below 1024 px.
- Top bar sticks to the top; page content scrolls.

## 9. Print stylesheet (`/report/:id`)

- Hide navigation, top bar, buttons and footer links.
- A4 portrait, 15 mm margins, black text on white, charts converted to the same data in tables if they fail to render.
- Show product, date, service level, z, numbers, assumptions note and the fictional-data note.

## 10. Accessibility checklist

- [ ] Contrast at least 4.5:1 for text
- [ ] Every input has a visible label
- [ ] Tab order follows reading order
- [ ] Focus ring visible
- [ ] Charts have a table alternative
- [ ] Status never conveyed by colour alone
- [ ] Error messages state the problem and the fix

## 11. Empty, loading and error copy

| State | Message |
|---|---|
| No products | "No products yet. Load the demo data or upload your own." + button |
| Loading | Skeleton blocks |
| No anomalies | "No unusual values found in the training window." |
| API down | "Cannot reach the server. Check that the API is running." + Retry |
| AI unavailable | Silent; badge shows "AI failed, rules used" |
| Bad CSV | "2 rows were not imported. See the list below." |
