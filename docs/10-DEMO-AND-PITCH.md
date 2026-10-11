# 10 · Demo Data, Pitch and Judge Q&A

## 1. Demo data (seeded, fictional)

Generator seed: `20261011`. 150 days per product, ending 2026-10-10 (so the last 30 days are the holdout).

| SKU | Product | Mean/day | Supplier lead time | Purpose |
|---|---|---|---|---|
| ORS-01 | ORS sachets | about 40 | 4 days, sd 0.5 | Reliable supplier; promotion event |
| PCM-02 | Paracetamol strips | about 100 | 5 days, sd 1 | Matches the worked example |
| INS-03 | Insulin vials | about 12 | 7 days, sd 3 | Erratic supplier; lead-time share of SS dominates |
| FLU-04 | Flu syrup | about 25, rising | 5 days, sd 1 | Genuine multi-day surge; scenario demo |
| BND-05 | Bandage rolls | about 30 | 3 days, sd 0.5 | Digit-slip error |
| ANT-06 | Rare antidote | about 1.5, many zero days | 10 days, sd 2 | Intermittent warning |

**Generation:** weekday pattern (weekends higher), mild trend, Poisson-style noise (rounded integers).

**Planted events**

| Product | Event | Expected class |
|---|---|---|
| ORS-01 | 5-day "Monsoon health camp" window with 2.5x demand, listed in promos | PROMOTION |
| BND-05 | One day entered as 1000 instead of 100 | DATA_ERROR |
| PCM-02 | One negative value (-40) | DATA_ERROR |
| PCM-02 | One unexplained one-day spike (3x) | UNKNOWN |
| FLU-04 | 8-day ramp-up of real demand, no promo entry | PROMOTION (run rule) or UNKNOWN, discuss honestly |
| ANT-06 | Mostly zeros | Intermittent warning |

## 2. Pitch story (30 seconds)

> "In a small-town pharmacy, a reorder level gets set once and never revisited. Then dengue season arrives, the supplier is three days late, and the shelf is empty. A stockout isn't a lost sale. It's a patient travelling 15 kilometres. StockSense recomputes the reorder point from the pharmacy's own data, shows what is unusual in it, and tells the owner what changes before it happens."

Pitch the helper/owner as the user. State plainly: this supports a store-keeper's decision; it does not replace judgement.

## 3. Five-minute demo script

| Time | Step | What to show |
|---|---|---|
| 0:00 | Story | Pitch above |
| 0:30 | Data Cleaning | Chart with 3 anomaly classes; ORS promo removed from baseline, bandage error imputed (value shown), paracetamol spike kept as Unknown with the with/without toggle |
| 1:30 | Forecast Check | Model vs baseline table on holdout; point at a product where the baseline wins and say so |
| 2:15 | Recommendations | Change service level 90 to 99 live; z and ROP move; show the supplier-reliability split on INS-03 |
| 3:00 | Scenario Lab | Type "supplier 3 days late, flu season +40%", confirm. ROP 680 to 1385; old policy stockout risk 99.7% against 5% planned |
| 4:00 | Run without AI | Toggle; badges change to Rules; everything still works |
| 4:30 | Limits | Limitations slide |

## 4. Limitations (say these before a judge asks)

1. Single location, single echelon; no multi-warehouse or quantity discounts.
2. Normal approximation of lead-time demand; weak for intermittent items (we warn and cross-check by simulation).
3. Recorded sales are not true demand when stock hits zero.
4. Shortage cost is a user estimate; results are sensitive to it.
5. Surge scenario keeps the coefficient of variation constant.
6. Holdout is short (30 days) and selecting the winner on it flatters it slightly.
7. AI suggestions are bounded and confirmable; they are not ground truth.
8. Demo data is synthetic, so accuracy figures illustrate the method and are not field results.

## 5. Judge Q&A

| Question | Answer |
|---|---|
| Why this safety-stock formula? | It covers both demand and lead-time variance, the two uncertainties the problem names. |
| What does 95% mean? | 95% chance of no stockout per replenishment cycle; fill rate is shown separately. |
| How do you avoid leakage? | All fitting uses the training window only through one function; a test mutates holdout values and checks nothing changes. |
| What if the AI is wrong? | It can only return schema-valid suggestions, clamped to ±30%, shown, and confirmable. Rules and arithmetic make every decision. |
| Does your model beat the baseline? | Show the table. On products where it doesn't, the baseline is used. |
| How is a data-entry error handled? | Flagged, visible, excluded from the baseline, imputed from the weekday median, with the imputed value shown. |
| What if the LLM is down? | Rules classify; the path badge says so. Toggle it off to see. |
| Why Monte Carlo too? | To cross-check the normal approximation; disagreement is reported. |
| Where do costs come from? | User inputs; shortage cost is labelled an assumption. |
| Is the data real? | No. Fictional, seeded, reproducible. |

## 6. Pre-demo checklist

- [ ] Local Postgres loaded with seed; Neon is optional
- [ ] `/api/health` green
- [ ] AI key present **and** tested with AI off
- [ ] Browser zoom set; demo data reset
- [ ] Backup screen recording on the desktop
- [ ] Printed copy of the limitations slide and one sample report
