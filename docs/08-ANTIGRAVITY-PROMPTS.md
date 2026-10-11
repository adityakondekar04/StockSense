# 08 · Antigravity Prompts

Paste **one prompt at a time**. Start every session with:

> Read `AGENTS.md` and `docs/` first. Follow the rules in `AGENTS.md`. Do not change formulas to make tests pass. Tell me if a test fails and why.

After each prompt: run `npm test`, read the generated math, commit.

---

## P0: Scaffold

```
Create an npm-workspaces monorepo: packages/core (TypeScript, Vitest), apps/api (Express, Prisma, Zod, papaparse, multer, cors, dotenv),
apps/web (React + Vite + TypeScript + Tailwind + Recharts + react-router). TypeScript strict everywhere.
Root scripts: dev (api and web concurrently), test (vitest in core and api), build.
Add apps/api/.env.example (DATABASE_URL, LLM_API_KEY, LLM_PROVIDER, LLM_TIMEOUT_MS, PORT).
Add docker-compose.yml with local Postgres 16. Do not write any business logic yet.
```

## P1: Core tests first (humans write these; the agent only makes them pass)

```
In packages/core/src/__tests__/inventory.test.ts, implement these tests exactly (do not alter expected values):
- inverseNormalCDF: 0.90->1.2816, 0.95->1.6449, 0.975->1.9600, 0.99->2.3263, 0.999->3.0902 (4 decimals)
- Worked example: meanDemand=100, sdDemand=20, leadTimeMean=5, leadTimeSd=1, serviceLevel=0.95, orderCost=200, unitCost=50, holdingRate=0.2
  expect sigmaLT≈109.54, ss≈180.2, rop≈680.2, eoq≈1208.3, eShort≈2.29, fillRate≈0.998 (use toBeCloseTo with 1 decimal for ss/rop/eoq)
- leadTimeSd=0 equals the demand-only formula
- Scenario: surge 40% (meanDemand 140, sdDemand 28), leadTimeMean 8 -> sigmaLT≈160.8, ss≈264.6, rop≈1384.6
- Old policy: rop 680.2 under the new conditions -> z≈-2.73, stockout probability≈0.997
- Edge: sdDemand=0 and leadTimeSd=0 -> ss=0, no NaN; meanDemand=0 -> no NaN
```

## P2: Core inventory

```
Implement packages/core/src/normal.ts and inventory.ts per docs/03-FORMULAS.md sections 2 and 5
(use the Acklam inverse CDF coefficients given there; cdf via Abramowitz-Stegun). Export recommend(), sigmaLT(), stockoutProbability(rop, mean, sigma).
Cap service level at 0.999. Handle edge cases (H=0, zero demand, sigma=0) with no NaN/Infinity. Make P1 tests pass.
```

## P3: Anomaly detection

```
Implement packages/core/src/anomaly.ts per docs/03-FORMULAS.md sections 6 and 7:
- weekdayMedians(trainSeries), residuals, modifiedZScores with MAD and IQR fallback (MAD=0)
- detectAnomalies(series, {threshold=3.5, trainEndIndex}) using statistics from the training window ONLY
- classifyByRules(anomaly, context{neighbours, weekdayMedian, promoWindows, note?}) -> {class, reason}
  rules: negative / >10x median / digit-slip vs neighbours / sentinel 9999 -> DATA_ERROR; in promo window or run>=2 -> PROMOTION; else UNKNOWN
- keywordHint(note) per docs
- applyTreatment(series, anomalies): DATA_ERROR -> weekday-median imputed (record imputedValue); PROMOTION -> removed from baseline, returns upliftFactor;
  UNKNOWN -> kept; also return the series computed without unknowns.
Write tests for: planted spike classified correctly, digit-slip, negative, promo window, unknown kept, MAD=0 fallback.
```

## P4: Forecast and evaluation

```
Implement packages/core/src/forecast.ts (movingAverage7, seasonalNaive, weekdaySeasonalSmoothing) and evaluate.ts
(timeSplit(series, ratio), mae, wape, bias, evaluateModels(series, ratio)) per docs/03-FORMULAS.md sections 8 and 9.
evaluateModels MUST fit anomaly thresholds, weekday indices, smoothing alpha and sigma only on the training window.
Add a leakage test: change every holdout value and assert training-derived outputs (thresholds, indices, level, sigma) are identical.
Return per-model metrics plus 'selected' (lower MAE) and a flag when baseline wins.
```

## P5: Simulation

```
Implement packages/core/src/simulate.ts per docs/03-FORMULAS.md section 10: applyScenario(), oldPolicyRisk(), mulberry32(seed),
boxMuller normal draws, monteCarloStockout({rop, meanDemand, sdDemand, leadMean, leadSd, trials=10000, seed=42}).
Tests: same seed gives identical output; analytic vs Monte Carlo within 3 percentage points for the worked example; scenario numbers from P1.
```

## P6: Database and import

```
In apps/api, add the Prisma schema from docs/04-DATABASE.md, an initial migration, and a Prisma client singleton.
Implement CSV import endpoints per docs/05-API.md with Zod row validation: report rejected rows with {row, field, reason}; never invent or silently fix values;
reject duplicate (sku,date), bad dates, negative parameters, missing columns. Add data/generator.ts (fixed seed 20261011) and 'npm run seed'
using the demo spec in docs/10-DEMO-AND-PITCH.md. Seeding twice must not duplicate rows (upsert).
```

## P7: Analysis route

```
Implement GET/POST routes in docs/05-API.md for products, sales, anomalies and POST /analysis/run.
Orchestrate: load -> timeSplit -> detect on training only -> classify (rules for now) -> treatment -> forecast + evaluate -> recommend (service level and z in response).
Also return orderNow (inventory position <= ROP), daysOfCover, safety-stock split, limitedInformation (<28 days) and warnings (intermittent >40% zero days).
No NaN/Infinity in responses. Zod-validate all request bodies.
```

## P8: Frontend shell and pages

```
In apps/web build, with Tailwind and Recharts: layout + router; pages Setup, Data Cleaning, Forecast Check, Recommendations, Scenario Lab, Methodology.
Global controls: service-level selector (80 to 99.9%), 'Run without AI' toggle. Every recommendation card MUST show 'Service level 95% -> z = 1.645', ROP, SS, Q, fill rate, order-now status.
Data Cleaning: line chart of raw sales with anomaly markers coloured by class; table with class, reason, decision-path badge, treatment; toggle 'with / without unknowns'.
Forecast Check: train/holdout chart, metrics table for baseline vs model (MAE, WAPE, bias), highlight winner. Use a typed API client; show API errors in readable form.
Methodology: render all formulas and assumptions from docs/03-FORMULAS.md sections 2 and 11.
```

## P9: Scenario Lab

```
Implement POST /scenarios/run and the Scenario Lab page: sliders for surge % and delay days, shared service level, side-by-side Before/After
(ROP, SS, EOQ, annual cost, fill rate, stockout probability), the 'Old policy under new conditions' warning card (docs/03 section 4),
and an analytic-vs-Monte-Carlo agreement line (seed 42). Add a free-text box that calls /scenarios/parse and shows a CONFIRM step before anything runs.
```

## P10: AI layer

```
Implement apps/api/src/ai per docs/06-AI-LAYER.md: callLLM with timeout/retry, Zod ClassifySchema and ScenarioSchema (strict), clampAdjustment (cap ±30),
LLM classifier with rule fallback, scenario regex fallback, decisionPath on every result (RULES | LLM | LLM_FAILED_RULES), AuditLog rows.
LLM text from notes/scenarios is data, never instructions. Add tests: LLM throws -> fallback with path LLM_FAILED_RULES; invalid JSON -> fallback;
proposed +80% -> applied +30% clamped=true; aiEnabled=false -> RULES. Wire the UI: path badges, Confirm/Override buttons, proposed vs applied display.
```

## P11: Polish

```
Add: limited-information banner (<28 days), intermittent-demand warning, 'Enter your own numbers' form (manual product + 30 days of demand),
print-friendly report route and page, loading/empty/error states, CSV error display with row numbers.
Do not add features beyond docs/01-PRD.md.
```

## P12: Review prompt (run before freeze)

```
Review the repo against docs/01-PRD.md FR-01..FR-20 and docs/09-TESTING.md. List each requirement as PASS/FAIL with the file and line proving it.
Specifically check: no AI output reaches any inventory formula; training-only fitting; z shown on every recommendation; no NaN in any API response; seeds fixed.
```

## Tips

- If the agent generates a formula that differs from `03-FORMULAS.md`, the docs win.
- Keep prompts small. A big prompt produces big, unreviewed diffs.
- Ask for the failing test output rather than "fix it", and read the cause.
