# Navigation

How users move through StockSense. Frontend is React + react-router. Laptop-first.

## 1. Global layout

```
+--------------------------------------------------------------------------+
| StockSense   Setup | Cleaning | Forecast | Recommendations | Scenario |... |
| Product: [ORS-01 v]   Service level: [95% v] (z = 1.645)   [AI: ON/OFF]   |
+--------------------------------------------------------------------------+
|                                                                          |
|   page content                                                           |
|                                                                          |
+--------------------------------------------------------------------------+
| Decision log · Methodology · Limits (footer links)                       |
+--------------------------------------------------------------------------+
```

**Top bar controls (global, persisted in `localStorage` and in the URL query):**

| Control | Behaviour |
|---|---|
| Product selector | Sets the active SKU for Cleaning, Forecast, Scenario, Report. Recommendations shows all |
| Service level | 80 to 99.9%, shows z next to it, applies to every calculation |
| AI toggle | "Run without AI" switch. Defaults to OFF-state if no API key is configured |

## 2. Route map

| Route | Screen | Primary user action |
|---|---|---|
| `/` | Redirect | To `/setup` if no products exist, otherwise `/recommendations` |
| `/setup` | 1. Setup | Load data (demo, CSV, manual) |
| `/setup/manual` | 1b. Enter your own numbers | Type a product and daily demand |
| `/products/:id/cleaning` | 2. Data Cleaning | Review anomalies and their treatment |
| `/products/:id/forecast` | 3. Forecast Check | Compare model and baseline on holdout |
| `/recommendations` | 4. Recommendations | Read when and how much to reorder |
| `/products/:id/scenario` | 5. Scenario Lab | Simulate surge or delay |
| `/methodology` | 6. Methodology | Read formulas, assumptions, limits |
| `/audit` | 7. Decision Log | See which path made each decision |
| `/report/:id` | 8. Print Report | Print a one-page summary |
| `*` | Not found | Link back to Recommendations |

Deep links must work on refresh. Example: `/products/abc/scenario?sl=0.95&surge=40&delay=3` restores the controls.

## 3. Navigation bar items

| Label | Route | Visible when |
|---|---|---|
| Setup | `/setup` | Always |
| Cleaning | `/products/:id/cleaning` | A product is selected |
| Forecast | `/products/:id/forecast` | A product is selected |
| Recommendations | `/recommendations` | Always |
| Scenario Lab | `/products/:id/scenario` | A product is selected |
| Decision Log | `/audit` | Always |
| Methodology | `/methodology` | Always |

Items needing a product are disabled with a tooltip ("Select a product first") instead of hidden, so judges can see them.

## 4. User flows

### Flow A: First-time (judge) flow
```
/setup -> Load demo -> /recommendations -> click a card
   -> /products/:id/cleaning -> /products/:id/forecast
   -> /products/:id/scenario -> Print report (/report/:id)
```

### Flow B: Bring your own data
```
/setup -> Upload CSV -> [errors shown by row] -> fix or confirm valid rows
   -> /recommendations
```

### Flow C: Enter your own numbers (judge types data)
```
/setup/manual -> product details + at least 28 days of demand -> Calculate
   -> /recommendations (new product highlighted)
```

### Flow D: Scenario with text
```
/products/:id/scenario -> type "supplier 3 days late, flu +40%" -> Parse
   -> proposal shown with path badge -> CONFIRM -> Before/After shown
```

### Flow E: Anomaly review
```
/products/:id/cleaning -> click an anomaly -> add a note -> reclassify (rules or AI)
   -> Confirm or Override -> recommendation updates -> entry appears in /audit
```

### Flow F: Offline proof
```
Top bar: AI toggle OFF -> every page still works -> badges read "Rules"
```

## 5. Cross-links (every screen offers the next step)

| From | Link | To |
|---|---|---|
| Recommendation card | "Review data" | Cleaning for that SKU |
| Recommendation card | "What if?" | Scenario Lab for that SKU |
| Recommendation card | "Print" | Report |
| Cleaning | "See forecast check" | Forecast |
| Forecast | "See recommendation" | Recommendations |
| Scenario result | "Print before/after" | Report with scenario section |
| Any AI badge | "Why?" | Decision Log filtered to that item |
| Any formula value | "How is this calculated?" | Methodology anchor (e.g. `#safety-stock`) |

## 6. States that affect navigation

| Situation | Behaviour |
|---|---|
| No products | Every product page shows an empty state with a "Load demo data" button |
| Selected product deleted | Fall back to the first product, show a notice |
| API unreachable | Banner at the top of every page; navigation stays usable |
| Under 28 days of history | Pages load but show a "limited information" banner |
| Unconfirmed scenario text | Scenario Lab blocks the Run button until confirmed |

## 7. Breadcrumbs and titles

- Page title format: `StockSense · <Screen> · <SKU>`.
- Breadcrumb on product pages: `Recommendations / ORS-01 / Scenario Lab`.
- Browser back always returns to the previous screen with its controls restored.

## 8. Keyboard and accessibility

- All nav items and the top-bar controls are reachable with Tab, in left-to-right order.
- Service level and AI toggle are labelled inputs, not icon-only.
- Every chart has a data table alternative (a "Show table" toggle).
- Focus is moved to the page heading after a route change.
