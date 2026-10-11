# 03 · Formulas and Reference Code

All units are **days**. All formulas appear in the app's Methodology panel.

## 1. Inputs and symbols

| Symbol | Meaning |
|---|---|
| d̄ | mean daily demand (cleaned, training window) |
| σ_d | std of daily demand (or of forecast errors; state which) |
| L̄, σ_L | lead-time mean and std (days) |
| SL | service level (e.g. 0.95) |
| z | `inverseNormalCDF(SL)` |
| S | ordering cost per order |
| c | unit cost |
| h | holding rate per year (e.g. 0.20) |
| H | `h * c`, holding cost per unit per year |
| p | shortage cost per unit (user assumption) |

## 2. Core formulas

```
sigma_LT = sqrt( L̄ · σ_d²  +  d̄² · σ_L² )     # demand part + lead-time part
SS       = z · sigma_LT
ROP      = d̄ · L̄ + SS
D        = d̄ · 365
EOQ      = sqrt( 2 · D · S / H )
Q        = max(MOQ, ceil(EOQ / packSize) · packSize)     # optionally cap by shelf life

G(z)            = φ(z) − z · (1 − Φ(z))       # unit normal loss function
E[short/cycle]  = sigma_LT · G(z)
Fill rate       ≈ 1 − E[short/cycle] / Q
Cycles / year   = D / Q

Annual cost = D·c + (D/Q)·S + (Q/2 + SS)·H + (D/Q)·E[short/cycle]·p
```

**Safety-stock split** (shown as a stacked bar):
```
demandShare   = L̄ · σ_d²
leadTimeShare = d̄² · σ_L²
```
Report each as a share of `sigma_LT²`. This shows how much safety stock exists because the supplier is unreliable.

## 3. Verified worked example (use as unit tests)

Inputs: d̄=100, σ_d=20, L̄=5, σ_L=1, SL=95%, S=200, c=50, h=0.20 (H=10).

| Quantity | Value |
|---|---|
| z (95%) | 1.6449 |
| sigma_LT | 109.54 |
| **SS** | **180.2** |
| **ROP** | **680.2** |
| D | 36,500 |
| **EOQ** | **1208.3** |
| G(z) | 0.0209 |
| E[short/cycle] | 2.29 units |
| Fill rate | 99.81% |

## 4. Verified scenario example

Surge +40% (σ_d scaled equally, constant coefficient of variation) and delay +3 days:

| | Before | After |
|---|---|---|
| d̄ | 100 | 140 |
| σ_d | 20 | 28 |
| L̄ | 5 | 8 |
| sigma_LT | 109.5 | 160.8 |
| SS | 180.2 | 264.6 |
| **ROP** | **680.2** | **1384.6** |

**Old policy under new conditions:** keep ROP = 680.2 with new lead-time demand mean 1120, sigma 160.8. z = (680.2 − 1120)/160.8 = −2.73. Stockout probability per cycle = Φ(2.73) ≈ **99.7%** versus the 5% planned. The app must compute and display this explicitly.

## 4a. Service-level and z table (for the unit test)

| SL | z |
|---|---|
| 0.80 | 0.8416 |
| 0.90 | 1.2816 |
| 0.95 | 1.6449 |
| 0.975 | 1.9600 |
| 0.99 | 2.3263 |
| 0.999 | 3.0902 |

Cap service level at 0.999 (z undefined at 1.0); reject below 0.5.

## 5. Reference TypeScript (verified against Python `NormalDist`)

```ts
// packages/core/src/normal.ts
const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
            1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
            6.680131188771972e+01, -1.328068155288572e+01];
const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
           -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
           3.754408661907416e+00];

export function inverseNormalCDF(p: number): number {
  if (!(p > 0 && p < 1)) throw new RangeError("p must be in (0,1)");
  const pl = 0.02425;
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
  if (p > 1 - pl) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
            ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
  const q = p - 0.5, r = q * q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5]) * q /
         (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}

export const pdf = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

// Abramowitz-Stegun 7.1.26, max error about 1.5e-7
export function cdf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const y = 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t
            * Math.exp(-(x*x)/2);
  return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

export const lossFn = (z: number) => pdf(z) - z * (1 - cdf(z));
```

```ts
// packages/core/src/inventory.ts
export interface InventoryInput {
  meanDemand: number; sdDemand: number;
  leadTimeMean: number; leadTimeSd: number;
  serviceLevel: number;
  orderCost: number; unitCost: number; holdingRate: number;
  shortageCost?: number; packSize?: number; minOrderQty?: number;
}

export function sigmaLT(i: InventoryInput) {
  const demandPart = i.leadTimeMean * i.sdDemand ** 2;
  const leadPart = i.meanDemand ** 2 * i.leadTimeSd ** 2;
  return { sigma: Math.sqrt(demandPart + leadPart), demandPart, leadPart };
}

export function recommend(i: InventoryInput) {
  const z = inverseNormalCDF(Math.min(i.serviceLevel, 0.999));
  const { sigma, demandPart, leadPart } = sigmaLT(i);
  const ss = z * sigma;
  const rop = i.meanDemand * i.leadTimeMean + ss;
  const D = i.meanDemand * 365;
  const H = i.holdingRate * i.unitCost;
  const eoq = Math.sqrt((2 * D * i.orderCost) / H);
  const pack = i.packSize ?? 1;
  const q = Math.max(i.minOrderQty ?? 1, Math.ceil(eoq / pack) * pack);
  const eShort = sigma * lossFn(z);
  const fillRate = 1 - eShort / q;
  const total = demandPart + leadPart || 1;
  return { z, ss, rop, eoq, q, eShort, fillRate,
           split: { demand: demandPart / total, leadTime: leadPart / total } };
}
```

Edge cases the code must handle: `H = 0`, `d̄ = 0`, `sigma_LT = 0` (SS = 0, no divide by zero in fill rate), `L̄ = 0`.

## 6. Anomaly detection

**Weekday adjustment:** compute the median per weekday (training only); residual = value − weekday median.

**Modified z-score** on residuals:
```
M_i = 0.6745 · (r_i − median(r)) / MAD         # MAD = median(|r − median(r)|)
flag if |M_i| > 3.5   (configurable)
```
If `MAD == 0`: fall back to IQR (flag outside Q1 − 1.5·IQR, Q3 + 1.5·IQR).

## 7. Classification rules (fallback and always-on baseline)

| Class | Rule (thresholds configurable) |
|---|---|
| Data error | value < 0; non-integer for unit goods; > 10 × weekday median; digit-slip (≈ 10× or 100× both neighbours); sentinel (9999, 99999) |
| Promotion | inside a promo window from `promos`, or run of ≥ 2 consecutive flagged days |
| Unknown | any other flagged day |

Keyword rules for a free-text note: `sale|offer|festival|discount|campaign` → promotion; `typo|error|wrong|mistake|entered` → data error.

## 8. Forecasting

| Model | Definition |
|---|---|
| Baseline | 7-day moving average (mean of last 7 cleaned days), flat over the horizon |
| Seasonal naive | value from the same weekday last week |
| Model | Weekday-seasonal level: `forecast(day) = level × weekdayIndex(day)` with level from simple exponential smoothing (alpha 0.2 to 0.4, chosen on the last 14 training days) |

The user asked for "moving average and statistical forecasting methods": the above satisfies that without needing an ML library.

## 9. Evaluation

```
MAE  = mean(|actual − forecast|)
WAPE = Σ|actual − forecast| / Σ actual        (undefined if Σ actual = 0: report n/a)
Bias = mean(forecast − actual)
```
Split by time, default 80/20. Report MAE for both models (the minimum you listed), plus WAPE and bias. If the model loses on a product, show it and use the better method for that product, labelled "selected on holdout".

## 10. Scenario simulation

**Apply scenario:**
```
d̄' = d̄ · (1 + surgePct/100)
σ_d' = σ_d · (1 + surgePct/100)       # constant coefficient of variation (state it)
L̄' = L̄ + delayDays
σ_L' = σ_L (optionally + extraSd)
```

**Analytic risk for a given ROP under new conditions:**
```
z_old = (ROP_old − d̄'·L̄') / sigma_LT'
P(stockout per cycle) = 1 − Φ(z_old) = Φ(−z_old)
```

**Seeded Monte Carlo (10,000 trials, seed 42):**
1. Lead time: round `max(1, N(L̄', σ_L'))`.
2. Lead-time demand: sum over the lead time of `max(0, N(d̄', σ_d'))` daily draws.
3. P(stockout) = share of trials where lead-time demand > ROP.
4. Report both and show "analytic vs simulated". If they differ by more than 3 points, flag and trust the simulation.

PRNG: `mulberry32(seed)`; normals via Box-Muller.

```ts
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

## 11. Assumptions (shown on screen)

1. Daily demand is independent and approximately normal; poor fit for intermittent items (warn when more than 40% zero days).
2. Lead time independent of demand.
3. Recorded sales equal demand (understated on stocked-out days; flagged if on-hand data exists).
4. Shortage cost is a user estimate; lost-sales assumption.
5. Constant unit cost; no quantity discounts.
6. Service level means cycle service level (Type 1); fill rate shown separately.
