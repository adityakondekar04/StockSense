# 05 · REST API

Base URL `http://localhost:4000/api`. JSON in and out. Every body is validated with Zod; failures return `400 { error, details: [{path, message}] }`.

## Health

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `{ ok, db: true/false, llmConfigured: bool }` |

## Products

| Method | Path | Body / notes |
|---|---|---|
| GET | `/products` | List |
| POST | `/products` | Create (manual entry path) |
| PUT | `/products/:id` | Update |
| DELETE | `/products/:id` | Remove with cascade |

```json
// POST /products
{ "sku":"ORS-01","name":"ORS sachets","unitCost":8,"orderCost":150,"holdingRate":0.2,
  "leadTimeMean":4,"leadTimeSd":1,"onHand":300,"onOrder":0,"packSize":50,"minOrderQty":100,
  "shortageCost":20 }
```

## Data import

| Method | Path | Notes |
|---|---|---|
| POST | `/import/sales` | multipart CSV: `date,sku,units[,on_hand]` |
| POST | `/import/products` | CSV |
| POST | `/import/lead-times` | CSV: `sku,order_date,received_date` |
| POST | `/import/promos` | CSV: `sku,start,end,note` |
| POST | `/import/demo` | Loads the seeded demo set |

Response shape (never silently drop rows):
```json
{ "imported": 148, "rejected": [ { "row": 23, "field": "units", "reason": "not a number: 'abc'" } ] }
```
Validation errors: missing columns, unparseable date, duplicate (sku, date), negative parameters.

## Sales and anomalies

| Method | Path | Notes |
|---|---|---|
| GET | `/products/:id/sales` | Raw series |
| GET | `/products/:id/anomalies?aiEnabled=true` | Flagged days with class, reason, path |
| POST | `/anomalies/:id/confirm` | `{ class?, note? }` user override or confirm |
| POST | `/anomalies/:id/note` | `{ note }` triggers re-classification |

Anomaly object:
```json
{ "id":"...","date":"2026-08-14","value":1000,"modifiedZ":41.2,
  "class":"DATA_ERROR","reason":"10x digit-slip vs neighbours (100, 96)",
  "decisionPath":"RULES","proposedAdjPct":null,"appliedAdjPct":null,"clamped":false,
  "imputedValue":104,"userConfirmed":false }
```

## Analysis

`POST /analysis/run`
```json
{ "productId":"...", "serviceLevel":0.95, "aiEnabled":true,
  "splitRatio":0.8, "includeUnknowns":true }
```
Response:
```json
{
  "limitedInformation": false,
  "warnings": ["Intermittent demand: 46% zero days"],
  "service": { "level":0.95, "z":1.6449, "type":"cycle" },
  "demand": { "mean":101.3, "sd":19.8, "basis":"training window, cleaned", "withoutUnknowns":{...} },
  "recommendation": { "ss":180, "rop":681, "eoq":1208, "q":1250, "fillRate":0.998,
     "orderNow": false, "daysOfCover": 3.1, "projectedStockoutDate": "2026-10-14",
     "split": { "demand":0.33, "leadTime":0.67 } },
  "cost": { "annual":..., "ordering":..., "holding":..., "shortage":... },
  "evaluation": { "baseline":{"mae":..,"wape":..,"bias":..}, "model":{...}, "selected":"model",
                  "holdoutDays":30 },
  "anomalies": [ ... ],
  "decisionPaths": { "rules": 3, "llm": 1, "llm_failed_rules": 0 }
}
```
`orderNow` is true when inventory position (onHand + onOrder) is at or below ROP.

## Scenarios

| Method | Path | Notes |
|---|---|---|
| POST | `/scenarios/parse` | `{ text, aiEnabled }` returns proposed `{surgePct, surgeDays?, delayDays}` + path. **Not applied yet.** |
| POST | `/scenarios/run` | `{ productId, serviceLevel, surgePct, delayDays, confirmed: true }` |

`/scenarios/run` requires `confirmed: true` when the values came from text. Response:
```json
{ "before": { ...recommendation... }, "after": { ...recommendation... },
  "oldPolicyUnderNewConditions": { "rop":680, "zEffective":-2.73, "stockoutProbability":0.997 },
  "monteCarlo": { "seed":42, "trials":10000, "stockoutProbability":0.995, "analytic":0.997, "agree":true },
  "cost": { "before":..., "after":... } }
```

## AI

| Method | Path | Notes |
|---|---|---|
| POST | `/ai/classify` | `{ anomalyId }` classification suggestion + clamp |
| POST | `/ai/adjustment` | `{ productId, context }` returns proposed and applied adjustment |
| GET | `/audit` | Latest decisions with path |

## Report

`GET /products/:id/report?serviceLevel=0.95` returns an HTML page styled for print (`@media print`), used by "Print report".

## Errors

`400` validation, `404` unknown id, `422` insufficient data (explains what is missing), `500` unexpected (never leaks stack traces). NaN or Infinity must never appear in any response.
