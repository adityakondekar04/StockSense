# 02 · Architecture

## 1. Overview

```
 React + Vite (apps/web)
        |  REST/JSON
        v
 Express API (apps/api) ---- Prisma ----> Neon PostgreSQL
   |        |
   |        +-- AI layer: callLLM -> Zod validate -> clamp -> fallback
   |
   +-- @stocksense/core  (pure TypeScript math, no I/O)
```

**Design principle:** the API is a thin orchestration layer. Anything that produces a number a judge will question lives in `packages/core` and is unit tested.

## 2. Monorepo setup (npm workspaces)

```
package.json            { "workspaces": ["packages/*", "apps/*"] }
packages/core/          name: @stocksense/core
apps/api/               name: @stocksense/api
apps/web/               name: @stocksense/web
```

Shared Zod schemas live in `packages/core/src/schemas.ts` and are imported by both api and web, so types never drift.

## 3. Components

| Component | Responsibility |
|---|---|
| `core/inventory` | z, SS, ROP, EOQ, loss function, fill rate, annual cost |
| `core/anomaly` | Weekday adjustment, modified z-score, rule classifier, treatment |
| `core/forecast` | Moving average, seasonal naive, weekday-seasonal smoothing |
| `core/evaluate` | Time split, MAE / WAPE / bias, leakage-safe fit |
| `core/simulate` | Scenario application, analytic risk, seeded Monte Carlo |
| `api/routes` | products, sales, import, analysis, scenarios, ai, audit |
| `api/ai` | LLM client, classifier, scenario parser, clamp |
| `api/db` | Prisma client, repositories |
| `web/pages` | Setup, Data Cleaning, Forecast Check, Recommendations, Scenario Lab, Methodology |

## 4. Data flow: one analysis request

1. Web calls `POST /api/analysis/run` with `{productId, serviceLevel, aiEnabled}`.
2. API loads product, sales, promos, lead times from Postgres.
3. Split by time (default 80/20). **Everything below uses the training window only.**
4. `core/anomaly` flags outliers. Classifier runs: LLM (if enabled and a note exists) else rules. Result is clamped and stored with `decisionPath`.
5. Treatment applied to produce the cleaned series.
6. `core/forecast` produces baseline and model forecasts; `core/evaluate` scores both on the holdout.
7. `core/inventory` computes SS, ROP, EOQ, cost, fill rate with the chosen z.
8. API returns one JSON payload; web renders cards and charts.

## 5. Failure behaviour

| Failure | Behaviour |
|---|---|
| LLM timeout / error / invalid JSON | Log `llm_failed_rules`, use rules, continue |
| LLM proposes out-of-range adjustment | Clamp to cap, show proposed vs applied |
| Bad CSV row | Reject with row, field, reason; keep valid rows only if user confirms |
| Too little history (under 28 days) | Return result with `limitedInformation: true` and a visible warning |
| sigma = 0, zero demand, lead time 0 | Handled explicitly in core; no NaN/Infinity ever returned |
| Neon unreachable at demo | Switch `DATABASE_URL` to a local Postgres (Docker) and re-seed. Core math has no DB dependency |

**Demo resilience:** keep `docker-compose.yml` with a local Postgres and run the seed script on it. Venue wifi is the most likely failure, so rehearse on the local DB.

## 6. Security and privacy

- Fictional data only. No auth (explicitly out of scope; state it).
- `.env` never committed. LLM key read server-side only.
- Zod validation on every request body. Reject unknown fields.
- CORS limited to the web origin.

## 7. Environment variables

```
DATABASE_URL=postgresql://...        # Neon, or local Postgres
LLM_API_KEY=                          # optional
LLM_PROVIDER=gemini|groq|openai       # optional
LLM_TIMEOUT_MS=5000
PORT=4000
```

## 8. Key decisions

| Decision | Reason |
|---|---|
| Math in a pure package | Testable without DB/UI; protects against agent-generated bugs |
| Fit on train only | Prevents leakage; judged explicitly |
| Seeded PRNG | Reproducible Monte Carlo across judges |
| Suggestions stored separately from facts | AI output can never overwrite history or results |
| Audit table | Shows who/what decided each classification |
