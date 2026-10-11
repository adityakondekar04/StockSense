# 01 · Product Requirements (PRD)

## 1. Problem

For each product, decide **when to reorder** (reorder point) and **how much** (order quantity) when demand and supplier lead time are both uncertain, and sales data contains spikes and errors. Static reorder levels fail when conditions change.

## 2. Users

- **Primary:** pharmacy owner / primary health centre store-keeper / small retailer.
- **Secondary:** a helper entering data, a judge testing live.
- Output includes a **printable one-page summary**. This is decision support, not a replacement for judgement.

## 3. Scope

**In:** single location, single echelon, continuous-review (s, Q) policy on inventory position, cycle service level, normal approximation with simulation cross-check, lost-sales cost model.

**Out:** multi-warehouse, quantity discounts, joint ordering, full perishable optimization, auth/accounts.

## 4. Functional requirements

| ID | Requirement | Booklet clause | Acceptance test |
|---|---|---|---|
| FR-01 | Load data from CSV, manual entry, or built-in demo | Live testing | Bad CSV shows row + reason, no crash |
| FR-02 | Per-product inputs: unit cost, order cost, holding rate, lead-time mean/sd, on-hand, on-order, pack size, MOQ | Inputs list | Fields feed formulas |
| FR-03 | Demand mean and std from cleaned training history | Real calculations | Matches hand calc |
| FR-04 | Lead-time mean/sd from history or manual | Lead time variability | Changing sd_L changes SS |
| FR-05 | Safety stock and reorder point with demand + lead-time variance | Core | SS 180.2, ROP 680.2 for worked example |
| FR-06 | EOQ with pack-size / MOQ rounding | How much | EOQ 1208.3 for worked example |
| FR-07 | User-selected service level (80 to 99.9%) | Explicit | Slider/dropdown |
| FR-08 | Every recommendation shows service level and z | Explicit | "95% -> z = 1.645" on every card |
| FR-09 | Formulas + assumptions on screen | Explicit | Methodology panel |
| FR-10 | Detect unusual demand and keep visible | Explicit | Marked on chart, never deleted |
| FR-11 | Classify: promotion / data error / unknown | Explicit | Class + reason + decision path stored |
| FR-12 | Handle each class differently | Explicit | Visible handling table; numbers change |
| FR-13 | AI classifies / proposes adjustment, bounded and shown | Explicit | +80% proposal clamps to cap, UI shows proposed vs applied |
| FR-14 | Forecast model + simple baseline | Explicit | Both on same data |
| FR-15 | Holdout comparison, forecast did not see holdout | Explicit | Time split; leakage test passes |
| FR-16 | Simulate demand surge / supplier delay | Explicit | Two controls |
| FR-17 | Before/after: recommendation, expected cost, stockout risk | Explicit | Side-by-side |
| FR-18 | Record decision path (llm / rules / fallback) | Common rule: local fallback | "Run without AI" toggle works |
| FR-19 | "Enter your own numbers" path | Reproducible testing | Form needs no file |
| FR-20 | Print/export one-page report | Usability | Clean print layout |

## 5. Non-functional requirements

| Area | Requirement |
|---|---|
| Determinism | Same inputs + seed give same outputs |
| Resilience | Core works if LLM is down; demo has a DB fallback (see architecture) |
| Speed | Recompute under 2 s for about 10 SKUs |
| Explainability | Every number traces to a formula, input, or rule |
| Safety | LLM output Zod-validated and clamped; invalid output discarded |
| Data | Fictional only; generator seed documented |

## 6. Key definitions

- **Service level:** cycle service level, the probability of no stockout in a replenishment cycle. Fill rate shown as a secondary metric.
- **Inventory position:** on-hand + on-order - backorders. Reorder triggers on position.
- **Anomaly:** demand day with modified z-score above threshold (default 3.5) after weekday adjustment.

## 7. Anomaly handling matrix

| Class | Baseline treatment | Note |
|---|---|---|
| Data error | Excluded, imputed from weekday median (imputed value shown) | |
| Promotion | Removed from baseline; stored as uplift factor | |
| Unknown | Kept with warning; recommendation shown with and without | |

## 8. Success criteria

1. All FR-01 to FR-20 demonstrable live.
2. Every unit test in `09-TESTING.md` green.
3. Works end-to-end with AI off.
4. Honest holdout table, including any product where the baseline wins.
