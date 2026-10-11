# Business Logic

Where every rule lives, who decides what, and in which file. Formulas are in `03-FORMULAS.md`; this file is the map and the precedence rules.

## 1. Principle: who decides what

| Decision | Decided by | AI role |
|---|---|---|
| Safety stock, reorder point, EOQ, cost, fill rate, stockout probability | `packages/core` formulas | None, ever |
| Whether a day is an anomaly | Statistical detection | None |
| What class an anomaly is | Rules, with AI allowed to suggest in the cases below | Suggest only |
| Forecast adjustment applied | Clamp function after user confirmation | Proposes |
| Whether demand history is edited | Never edited; treatment produces a cleaned copy | None |
| Scenario parameters | The user, after confirmation | Parses text into a proposal |

## 2. Core functions (pure TypeScript, `packages/core/src`)

| File | Function | Does | Tests |
|---|---|---|---|
| `normal.ts` | `inverseNormalCDF(p)` | z for a service level | T1 |
| | `pdf(x)`, `cdf(x)`, `lossFn(z)` | Normal helpers and loss function | T6 |
| `inventory.ts` | `sigmaLT(input)` | Std of lead-time demand, with demand and lead-time parts | T2, T8 |
| | `recommend(input)` | z, SS, ROP, EOQ, Q, expected shortage, fill rate, split | T3 to T10 |
| | `annualCost(input, result)` | Purchase + ordering + holding + shortage cost | Cost unit test |
| | `inventoryPosition(onHand, onOrder)` | `onHand + onOrder` | Trivial test |
| | `daysOfCover(onHand, meanDemand)` | `onHand / meanDemand`, null if demand is 0 | Edge test |
| | `projectedStockoutDate(today, cover)` | `today + cover` days, rounded down | Date test |
| `anomaly.ts` | `weekdayMedians`, `residuals` | Weekday-adjusted values (train only) | T26 |
| | `modifiedZScores`, `iqrFlags` | Detection with MAD = 0 fallback | T25 |
| | `detectAnomalies(series, opts)` | Flags using the training window | T20 |
| | `classifyByRules(a, ctx)` | Class + reason from rules | T20 to T24 |
| | `keywordHint(note)` | Class hint from keywords | Keyword test |
| | `applyTreatment(series, anomalies)` | Cleaned series, uplift factors, without-unknowns series | T27, T28 |
| `forecast.ts` | `movingAverage7`, `seasonalNaive`, `weekdaySeasonalSmoothing` | Forecasts | Hand-computed test |
| `evaluate.ts` | `timeSplit`, `mae`, `wape`, `bias`, `evaluateModels` | Holdout comparison, fit on train only | T30 to T34 |
| `simulate.ts` | `applyScenario`, `oldPolicyRisk`, `mulberry32`, `monteCarloStockout` | Scenario maths and seeded simulation | T11, T12, T50 to T53 |
| `intermittency.ts` | `zeroDayShare(series)` | Share of zero days; warn above 0.40 | T65 |

## 3. API-side logic (`apps/api/src`)

| File | Does | Tests |
|---|---|---|
| `import/validators.ts` | Zod row validation, row-level errors, duplicate detection | T60 to T63 |
| `analysis/run.ts` | Orchestrates split, detect, classify, treat, forecast, evaluate, recommend | T64, T65 |
| `analysis/limits.ts` | `limitedInformation` when under 28 days of history | T64 |
| `ai/llm.ts` | `callLLM` with timeout, retry, schema validation | T40 to T42 |
| `ai/clamp.ts` | `clampAdjustment(proposed, cap)` | T43, T44 |
| `ai/classifier.ts` | Anomaly classification with precedence below | T45, T46 |
| `ai/scenarioParser.ts` | Text to scenario proposal, regex fallback | T47, T48 |
| `audit/log.ts` | Writes `AuditLog` rows with the decision path | Audit test |
| `http/safeJson.ts` | Rejects NaN and Infinity before a response is sent | T67 |

## 4. Classification precedence (this refines `06-AI-LAYER.md`)

Order of evaluation for each flagged day:

1. **Hard data-error rules always win.** Negative value, non-integer for a unit-count product, sentinel value (9999), or more than 10 times the weekday median is `DATA_ERROR`. AI cannot override these.
2. **Promo window.** A day inside a user-entered promo window is `PROMOTION`. AI cannot override this either.
3. **Soft rules** (digit-slip heuristic, run of 2 or more elevated days) give a class with a stated reason.
4. **AI may only act where rules left the day `UNKNOWN`, or to confirm a soft-rule result.** It may move `UNKNOWN` to `PROMOTION` or `DATA_ERROR` if its output passes the schema, and the reason is stored.
5. **User confirmation is final.** A user override replaces everything and is recorded as such.

Decision path stored on the anomaly: `RULES`, `LLM`, or `LLM_FAILED_RULES`. A user override additionally sets `userConfirmed = true`.

## 5. Treatment rules

| Class | Cleaned series | Recommendation |
|---|---|---|
| `DATA_ERROR` | Value replaced by the weekday median; the imputed value is stored and shown | Uses cleaned series |
| `PROMOTION` | Removed from baseline demand; uplift = (value / weekday median) stored per event | Uses cleaned series; uplift available for planning |
| `UNKNOWN` | Kept as is, with a warning | Shown **with and without** unknowns so the owner sees the sensitivity |

## 6. Adjustment rules

- The proposed adjustment (percent) comes from the AI or the user. It applies to the next-period baseline demand only.
- `applied = clamp(proposed, -cap, +cap)`, default cap 30%.
- Both values are stored; the UI shows `Proposed +80% → Applied +30% (clamped)`.
- Adjusted demand feeds the recommendation only after the user clicks Confirm. Until then it is displayed as a suggestion.

## 7. Recommendation status rules

| Field | Rule |
|---|---|
| `orderNow` | `inventoryPosition <= ROP` |
| `daysOfCover` | `onHand / meanDemand` (null if mean demand is 0) |
| `projectedStockoutDate` | Only when `orderNow`: `today + daysOfCover` |
| `limitedInformation` | Under 28 days of history |
| `intermittent` | More than 40% of days have zero sales |
| Service level bounds | Reject below 0.50; cap at 0.999 |

## 8. Scenario rules

- Surge scales mean and standard deviation by the same factor (constant coefficient of variation).
- Delay adds days to mean lead time; an optional extra lead-time sd can be added.
- Text input is parsed into a proposal and **cannot run until the user confirms** (`confirmed: true`).
- Monte Carlo uses seed 42 and 10,000 trials. Analytic and simulated results are both shown; if they differ by more than 3 percentage points, flag it and trust the simulation.

## 9. Validation rules (import and manual entry)

| Check | Result |
|---|---|
| Missing required column | Reject file, name the column |
| Unparseable date | Reject row, give row number |
| Non-numeric units or cost | Reject row |
| Duplicate (sku, date) | Reject the duplicate, keep the first |
| Negative lead time, cost, or holding rate | Reject |
| Unknown SKU in sales or promos | Reject row with "unknown product" |
| Nothing is ever auto-filled | No invented values; missing optional fields stay empty |

## 10. Things the system must never do

1. Feed an AI output into SS, ROP, EOQ, cost or risk.
2. Edit or delete stored sales history.
3. Use holdout data to fit thresholds, indices, or parameters.
4. Present a suggestion as a decision, or run a scenario from unconfirmed text.
5. Return NaN or Infinity.
6. Present anomaly flags as proof of an error or of wrongdoing; they are prompts for review.
