# Screens

One section per screen. Each lists purpose, contents, data source, states, and an acceptance check. Routes are in `navigation.md`.

Shared on every screen: top bar (product, service level + z, AI toggle), footer links, "limited information" banner when history is under 28 days.

---

## Screen 1: Setup (`/setup`)

**Purpose:** get data into the system, three ways.

| Section | Contents |
|---|---|
| Load demo | One button. Loads the 6 seeded products. Shows the generator seed |
| Upload CSV | Four drop zones: sales, products, lead times (optional), promos (optional). Template download links |
| Result panel | "Imported 148 rows, rejected 2" with a table: row, field, reason |
| Manual entry link | Goes to `/setup/manual` |
| Settings | Anomaly threshold (default 3.5), adjustment cap (default ±30%), holdout ratio (default 80/20), shortage-cost multiplier |

**Data:** `POST /import/*`, `POST /import/demo`.
**States:** empty (nothing loaded), uploading, partial success (valid rows kept only after the user confirms), error.
**Acceptance:** a CSV with one bad row shows its row number and reason and does not crash (T61).

### Screen 1b: Enter your own numbers (`/setup/manual`)

Form: SKU, name, unit cost, order cost, holding rate, lead-time mean and sd, on-hand, on-order, pack size, MOQ. Below it, a table to paste at least 28 days of `date, units`. Validation is inline and specific. **Calculate** saves the product and goes to Recommendations.

---

## Screen 2: Data Cleaning (`/products/:id/cleaning`)

**Purpose:** show what is unusual in the sales history and what we did about it.

| Section | Contents |
|---|---|
| Chart | Daily sales line, training/holdout shading, anomaly markers (shape and colour per class, see `ui-guidelines.md`) |
| Anomaly table | Date, value, modified z-score, class, reason, **path badge** (Rules / AI / AI failed, rules used), treatment, imputed value, proposed vs applied adjustment, Confirm / Override |
| Treatment summary | Counts per class and how each is handled (see PRD section 7) |
| Toggle | "Include unknowns" on or off, with the resulting ROP shown for both |
| Note box | Free-text note per anomaly that re-runs classification |

**Data:** `GET /products/:id/anomalies`, `POST /anomalies/:id/confirm`, `POST /anomalies/:id/note`.
**States:** no anomalies found (a positive message, not an empty box), AI off, AI failed.
**Acceptance:** the demo shows three classes with different treatments, and the toggle changes the ROP.

---

## Screen 3: Forecast Check (`/products/:id/forecast`)

**Purpose:** prove the forecast beats (or doesn't beat) a simple baseline.

| Section | Contents |
|---|---|
| Chart | Training line, holdout actuals, baseline forecast, model forecast |
| Metrics table | MAE, WAPE, bias for baseline and model, holdout length, "Selected: model/baseline (on holdout)" |
| Honesty note | A fixed text: "Selecting on the same holdout slightly flatters the winner. Holdout is N days." |
| Leakage note | "All thresholds and parameters were fitted on the training window only." |

**Data:** the `evaluation` object from `POST /analysis/run`.
**States:** holdout under 14 days shows "too short to judge", WAPE shows "n/a" when actuals sum to 0.
**Acceptance:** at least one product shows the baseline winning, and says so.

---

## Screen 4: Recommendations (`/recommendations`)

**Purpose:** the main answer. When to reorder and how much.

**One card per product:**

| Field | Example |
|---|---|
| Header | `PCM-02 Paracetamol strips` + status chip **Order now** / **OK** |
| Service line | `Service level 95% → z = 1.645` (always visible) |
| Numbers | Reorder point 681 · Safety stock 180 · Order quantity 1250 · Days of cover 3.1 · Fill rate 99.8% |
| Position | On hand 300 + on order 0 = inventory position 300 |
| Stockout date | "At current demand, stock runs out around 14 Oct" (only when Order now) |
| Split bar | Safety stock caused by demand variability vs supplier lead-time variability |
| Cost | Annual cost with ordering, holding, shortage parts |
| Warnings | Intermittent demand, limited information, unknown anomalies kept |
| Links | Review data · What if? · Print |

Cards are sorted with **Order now** first.
**Data:** `POST /analysis/run` per product.
**Acceptance:** changing the service level from 90 to 99% updates z and ROP on every card.

---

## Screen 5: Scenario Lab (`/products/:id/scenario`)

**Purpose:** show what changes when conditions change.

| Section | Contents |
|---|---|
| Controls | Surge % slider, surge days, supplier delay days slider, optional extra lead-time sd, service level (shared) |
| Text box | "Describe a scenario" → **Parse** → proposal with path badge → **Confirm** |
| Before / After | Two columns: ROP, SS, EOQ, annual cost, fill rate, cycle stockout risk |
| Old policy card | "If you keep the old reorder point of 680, the chance of a stockout becomes 99.7% (planned: 5%)" |
| Agreement line | "Analytic 99.7% · Simulated 99.5% (10,000 trials, seed 42)" |
| Assumption note | "Surge scales variability equally (constant coefficient of variation)" |

**Data:** `POST /scenarios/parse`, `POST /scenarios/run`.
**States:** unconfirmed text proposal (Run disabled), invalid values (rejected inline), zero and zero (shows "no change").
**Acceptance:** surge 40% and delay 3 days gives ROP 680 → 1385 and the 99.7% card.

---

## Screen 6: Methodology (`/methodology`)

**Purpose:** transparency. Anchored sections: `#safety-stock`, `#reorder-point`, `#eoq`, `#service-level`, `#anomalies`, `#forecast`, `#holdout`, `#simulation`, `#ai`, `#limits`.

Contents: every formula (from `03-FORMULAS.md` sections 2 and 11), assumptions, what AI can and cannot do, limitations list, definitions of cycle service level and fill rate.
**Acceptance:** each number on the Recommendations screen has a "How is this calculated?" link landing on the right anchor.

---

## Screen 7: Decision Log (`/audit`)

**Purpose:** show which path produced each decision.

Table: time, kind (classification, adjustment, scenario parse, import), product, path badge, detail (expandable JSON in readable form). Filters: kind, path, product. Reached from any AI badge's "Why?" link.
**States:** empty ("No decisions yet").
**Acceptance:** after toggling AI off and reclassifying, the new row shows `RULES`.

---

## Screen 8: Print Report (`/report/:id`)

**Purpose:** a one-page summary the store-keeper can print.

Contents: product and date, service level and z, recommendation numbers, anomaly summary (counts and treatments), holdout result in one line, scenario section if one was run, assumptions and limits note ("Decision support; not a guarantee"), fictional-data note.
**Acceptance:** browser print preview is a single clean page with no navigation chrome.

---

## Cross-cutting UI states

| State | Behaviour |
|---|---|
| Loading | Skeleton blocks, never a blank page |
| Empty | Explains why and offers the next action |
| Error | Plain-language message and a retry button; no stack traces |
| Limited information | Yellow banner: "Based on N days. Treat as indicative." |
| AI off / failed | Path badge text changes; no error shown for expected fallback |
