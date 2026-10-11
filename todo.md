
# StockSense: Build Steps

Small steps, in order. Each one is testable before moving to the next. Tick a box only when its **Test** passes. Test IDs (T1, T30...) refer to `docs/09-TESTING.md`. Prompt IDs (P0, P1...) refer to `docs/08-ANTIGRAVITY-PROMPTS.md`.

Gates are marked **GATE**. Do not pass a gate until it is true.

---

## Phase 0: Setup (0:00 to 0:45)

- [x] 1. **Create the npm-workspaces monorepo** (`packages/core`, `apps/api`, `apps/web`), TypeScript strict, `AGENTS.md` and `docs/` committed (P0). Test: `npm install` succeeds from the root.
- [x] 2. **Scaffold the web app** (Vite + React + TypeScript + Tailwind + react-router). Test: `npm run dev` loads a blank page on :5173.
- [x] 3. **Scaffold the API** (Express + TypeScript + cors + dotenv) with `GET /api/health`. Test: `curl localhost:4000/api/health` returns `{ ok: true }`.
- [x] 4. **Setup Vitest in `core` and `api`.** Test: `npm test` runs one placeholder test in each package.
- [x] 5. **Setup local Postgres via Docker** (`docker-compose.yml`, optional fallback).
- [x] 6. **Create the Neon project** and put the pooled string in `apps/api/.env`. Test: the health route reports `db: true` with Neon.
- [x] 7. **Add `schema.prisma`** (from `docs/04-DATABASE.md`). Test: `npx prisma format` runs with no errors.
- [x] 8. **Run the first migration** (`prisma migrate dev --name init`). Test: all tables exist, check with `npx prisma studio`.

## Phase 1: Math foundation (0:45 to 2:30)

- [x] 9. **Write the inventory tests by hand, before any code** (P1: worked example, scenario, edge cases). Test: tests run and fail because the functions don't exist yet.
- [x] 10. **Implement `normal.ts`** (`inverseNormalCDF`, `pdf`, `cdf`, `lossFn`). Test: T1 (z at 0.80/0.90/0.95/0.975/0.99/0.999) and T6 (G(1.6449) = 0.0209) pass.
- [x] 11. **Implement `sigmaLT` and `recommend()`** in `inventory.ts`. Test: T2 to T5, T7 to T10 pass (SS 180.2, ROP 680.2, EOQ 1208.3, Q 1250 with pack 50).
- [x] 12. **Handle edge cases** (service level 1.0, zero demand, zero sigma, `L̄ = 0`, `H = 0`). Test: T13, T14 pass, no NaN or Infinity anywhere.
- [x] 13. **Implement `applyScenario()` and `oldPolicyRisk()`.** Test: T11 (ROP 1384.6, SS 264.6) and T12 (z −2.73, probability 0.997) pass.
- [x] 14. **Implement seeded Monte Carlo** (`mulberry32`, Box-Muller, `monteCarloStockout`). Test: T50 to T53 pass, same seed gives identical output, analytic and simulated within 3 points.
- [x] 15. **GATE 0: core math is done.** Test: all of T1 to T14 and T50 to T53 are green, and `packages/core` has no imports from `express`, `prisma` or `react`.

## Phase 2: Data layer (1:00 to 3:00, parallel with Phase 1)

- [x] 16. **Add Zod schemas** for product, sale, promo and lead-time rows in `packages/core/src/schemas.ts`. Test: a row with a negative lead time or a text quantity is rejected with a specific message.
- [x] 17. **Write `data/generator.ts`** (fixed seed 20261011, 6 products, 150 days, planted events from `docs/10-DEMO-AND-PITCH.md`). Test: running it twice produces byte-identical CSVs, and the planted 1000, −40 and promo window are at the expected dates.
- [x] 18. **Write `seed.ts`** that loads the generated data with upserts. Test: `npm run seed` twice leaves the row counts unchanged, and the data is visible in Prisma Studio.
- [x] 19. **Build sales CSV import with row-level errors** (`POST /import/sales`). Test: T60 to T62 pass (missing column, bad date, text units, duplicate sku and date each give a specific row and reason).
- [x] 20. **Build the products, promos and lead-times imports plus `/import/demo`.** Test: T63 passes (negative lead time rejected), and `/import/demo` loads all six products.
- [x] 21. **Build products CRUD** (`GET/POST/PUT/DELETE /products`). Test: create a product with `curl`, see it in Prisma Studio, delete it and its sales cascade.


## Phase 3: Data intelligence (3:00 to 4:30)

- [x] 22. **Implement weekday medians, residuals and modified z-score with IQR fallback** (`anomaly.ts`). Test: T25 (MAD = 0 series still flags the spike) and T26 (high Saturdays are not flagged).
- [x] 23. **Implement `detectAnomalies` using the training window only.** Test: the planted spikes in the demo data are flagged and the normal weekday pattern is not.
- [x] 24. **Implement `classifyByRules`.** Test: T20 to T24 pass (digit-slip and negative are DATA_ERROR, promo window and 3-day run are PROMOTION, isolated spike is UNKNOWN).
- [x] 25. **Implement `applyTreatment`** (impute errors, remove promotions into an uplift factor, keep unknowns, produce the without-unknowns series). Test: T27, T28 pass and `imputedValue` is returned.
- [x] 26. **Implement the forecast models** (7-day moving average, seasonal naive, weekday-seasonal smoothing). Test: the moving average matches a hand-computed 10-day example.
- [x] 27. **Implement `timeSplit`, `mae`, `wape`, `bias`.** Test: T31 to T33 pass (ordering, a hand-computed 5-point example, WAPE returns null when actuals sum to 0).
- [x] 28. **Implement `evaluateModels` with a single train-only fit function, and model selection.** Test: T30 (replace all holdout values, training outputs identical) and T34 (baseline wins on constructed data and the flag is set) pass.
- [x] 29. **GATE 3: the intelligence layer is done.** Test: T20 to T34 green, and the demo data shows three different anomaly classes.

## Phase 4: Analysis API and core screens (3:00 to 6:00)

- [x] 30. **Build `POST /analysis/run`** (P7) returning service level, z, demand stats, recommendation, cost, evaluation and anomalies. Test: the response for PCM-02 at 95% shows z 1.6449, and T64 (under 28 days gives `limitedInformation: true`) and T65 (intermittent warning) pass.
- [x] 31. **Add `orderNow`, `daysOfCover`, `projectedStockoutDate` and the safety-stock split.** Test: set on-hand below the ROP and `orderNow` becomes true, and the split shares add up to 1.
- [x] 32. **Add an API guard so no response ever contains NaN or Infinity.** Test: T67 passes with zero-demand and single-row products.
- [x] 33. **Build the web layout, router and top bar** (product selector, service-level selector, "Run without AI" toggle). Test: every nav link routes correctly and the service level persists across pages.
- [x] 34. **Build the typed API client with readable error display.** Test: stop the API, the UI shows "Cannot reach the server" instead of a blank page.
- [x] 35. **Build the Setup screen** (load demo, CSV upload, manual entry). Test: upload a CSV with one bad row and see the row number and reason, enter a product by hand with 30 days of demand and get a result.
- [x] 36. **Build the Data Cleaning screen** (chart with markers by class, table, with/without unknowns toggle). Test: the planted promotion, error and unknown each look different, and the toggle changes the recommendation.
- [x] 37. **Build the Forecast Check screen** (train/holdout chart, metrics table, winner highlight). Test: the table shows MAE, WAPE and bias for both models, and a product where the baseline wins says so.
- [x] 38. **Build the Recommendations screen** (one card per SKU). Test: every card shows "Service level 95% → z = 1.645", and changing the level to 99% updates z and ROP.
- [x] 39. **Build the Methodology screen** (formulas, assumptions, limits). Test: the formulas on screen match `docs/03-FORMULAS.md` sections 2 and 11.
- [x] 40. **GATE 1 (hour 6): the full flow works with AI off.** Test: load demo, see classified anomalies, see the holdout table, change the service level and watch z and ROP move, all with no API key set.

## Phase 5: Scenario Lab (6:00 to 7:00)

- [x] 41. **Build `POST /scenarios/run`.** Test: surge 40% and delay 3 days returns ROP 680 → 1385 and old-policy risk 99.7%, and zero and zero returns identical before and after (T53).
- [x] 42. **Build the Scenario Lab UI** (sliders, side-by-side Before/After with cost and risk). Test: moving the delay slider updates the After column within 2 seconds.
- [x] 43. **Add the "Old policy under new conditions" card and the analytic-vs-Monte-Carlo line.** Test: the card shows 99.7% against 5% planned, and the agreement line shows both numbers.

## Phase 6: AI layer (7:00 to 8:00)

- [x] 44. **Build `callLLM` with timeout, retry and strict Zod schemas.** Test: T40 (provider throws), T41 (invalid JSON) and T42 (extra field) all fall back with path `LLM_FAILED_RULES`.
- [x] 45. **Build `clampAdjustment` (±30%).** Test: T43 (+80% becomes +30, clamped true) and T44 (−45% becomes −30) pass.
- [x] 46. **Build the LLM classifier with the rule precedence** from `docs/business-logic.md`, and write an `AuditLog` row for each decision. Test: T45 (AI off, provider never called, path `RULES`) and T46 (a note saying "ignore previous instructions") pass.
- [x] 47. **Build scenario text parsing** (`POST /scenarios/parse`, regex fallback) with a confirm step. Test: T47 ("supplier 4 days late, flu season +40%" gives delay 4, surge 40), T48 (no numbers gives an empty proposal) and T66 (running without `confirmed: true` is rejected) pass.
- [x] 48. **Wire the UI for AI** (path badges, Confirm and Override buttons, proposed vs applied display, free-text scenario box). Test: with the API key removed the badges read "Rules" and nothing breaks.
- [x] 49. **Build the Decision Log screen** (`/audit`). Test: every classification and scenario parse from the last 10 minutes is listed with its path.
- [x] 50. **Add the static boundary check.** Test: T49 passes, nothing in `packages/core` imports from the AI layer or reads an LLM result.
- [x] 51. **GATE 6: AI is bounded.** Test: T40 to T49 green, and unplugging the internet leaves the app fully working.

## Phase 7: Hardening and polish (8:00 to 9:00)

- [x] 52. **Add the limited-information banner and the intermittent-demand warning to the UI.** Test: a product with 20 days shows the banner, ANT-06 shows the intermittent warning.
- [x] 53. **Build the print report** (`/report/:id`, print stylesheet). Test: the browser print preview is one clean page with service level, z, formulas used and the neutral assumptions note.
- [x] 54. **Add loading, empty and error states to every screen** (`docs/screens.md`). Test: open each screen with an empty database and see a helpful empty state, not a blank page.
- [x] 55. **Run the self-review prompt (P12)** and fix every FAIL. Test: the report lists FR-01 to FR-20 all PASS with file proofs.
- [x] 56. **Run the manual live-test script** (`docs/09-TESTING.md` section 7) on the demo laptop. Test: all 7 steps work against the local Postgres.

## Phase 8: Rehearse and freeze (9:00 to 10:00)

- [x] 57. **Full offline run-through.** Turn off wifi, remove the LLM key, switch to local Postgres, and run the 5-minute demo script end to end on the actual demo laptop. Fix anything that breaks.
- [x] 58. **Rehearse three times with a timer** and practise the judge Q&A (`docs/10-DEMO-AND-PITCH.md`). Test: the demo fits in 5 minutes and each member can answer the "what if the AI is wrong" question.
- [x] 59. **Record a backup screen capture** and print the limitations slide. Test: the recording plays on the demo laptop.
- [x] 60. **Code freeze, 30 minutes before the end.** Test: `git status` is clean and the tagged commit is the one running on the laptop.

---

## If you fall behind (cut in this order)

1. Print report polish (step 53)
2. Safety-stock split chart (part of 31)
3. Monte Carlo line (steps 14 and 43, keep the analytic risk)
4. Seasonal naive model (part of 26)
5. Free-text scenario parsing (step 47, keep the sliders)

**Never cut:** steps 10 to 13 (z and formulas), 24 to 25 (classes with different treatment), 28 (holdout), 38 (z on every card), 41 to 42 (before/after), 44 to 46 (fallback), 19 (CSV messages), 57 (offline run).
