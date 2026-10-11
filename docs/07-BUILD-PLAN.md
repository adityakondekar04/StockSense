# 07 · Build Plan (10 hours)

## Principles

1. **Core math first, with tests.** Everything else depends on it.
2. **Working end-to-end with AI off by hour 6.** AI is added last and never blocks.
3. **One module per Antigravity prompt**, with its tests. Run tests yourselves after each.
4. **Commit after every green run.**

## Team split (4 people; adapt if fewer)

| Role | Owns |
|---|---|
| A: Math lead | `packages/core` (inventory, evaluate, simulate) |
| B: Data/backend | Prisma, import, anomaly, API routes, seed generator |
| C: Frontend | Vite app, pages, charts, print report |
| D: AI + integration | AI layer, scenario parser, audit, demo prep, tests |

With 2 or 3 people: merge C into B (use a simple layout) and keep A + D roles distinct. Cut stretch items.

## Hour by hour

| Hour | Milestone | Done when |
|---|---|---|
| 0:00 to 0:45 | Setup: monorepo, Neon project, Prisma, Vite, Tailwind, Vitest, `AGENTS.md`, docs in repo | `npm run dev` shows a blank page; `npm test` runs |
| 0:45 to 1:30 | **Write the worked-example tests by hand** (SS 180.2, ROP 680.2, EOQ 1208.3, scenario 1384.6) | Tests exist and fail |
| 1:30 to 3:00 | `core/normal`, `core/inventory`, `core/simulate` (analytic) | Tests green |
| 1:30 to 3:00 (parallel) | B: Prisma schema, migrations, CSV import with validation, seed generator | Demo data loads |
| 3:00 to 4:30 | `core/anomaly` (detection + rules), `core/forecast`, `core/evaluate` | Leakage test green |
| 3:00 to 4:30 (parallel) | C: layout, Setup page, Recommendations page against real API | Cards show z and level |
| 4:30 to 6:00 | `/analysis/run` end to end; Data Cleaning page with anomaly chart; Forecast Check page | **Full flow works with AI off** |
| 6:00 to 7:00 | Scenario Lab: `/scenarios/run`, Monte Carlo, before/after panel, "old policy" risk | Judges can change a slider |
| 7:00 to 8:00 | AI layer: LLM client, classifier, scenario parser, clamp, fallback, audit, toggle | Fallback test green |
| 8:00 to 9:00 | Edge cases, bad-input messages, limited-information states, print report, Methodology page | Checklist in section 4 all ticked |
| 9:00 to 10:00 | Demo rehearsal x3, local-Postgres fallback tested, backup screen recording, freeze code | Nobody touches code in the last 30 min |

## Cut order if you fall behind

1. Print report polish
2. Safety-stock split chart
3. Monte Carlo (keep analytic risk; state it)
4. Seasonal naive model (keep moving average baseline + weekday model)
5. Scenario text parsing (keep sliders)

**Never cut:** service level + z display, anomaly classes with different treatment, holdout comparison, before/after panel, AI-off fallback, bad-CSV messages.

## Risk register

| Risk | Mitigation |
|---|---|
| Agent writes subtly wrong formula | Hand-written tests in hour 1; read generated math line by line |
| Leakage in cleaning/forecast | Leakage test; single `fitOnTrain()` entry point |
| Neon cold start / wifi failure | Local Docker Postgres rehearsed; hit `/health` before presenting |
| LLM slow on stage | 5 s timeout, "Run without AI" toggle |
| Integration surprises late | End-to-end path by hour 6 |
| Merge conflicts | Directory ownership; one person per package |
| Scope creep | Cut order above; PRD is the checklist |

## Final checklist (hour 9)

- [ ] Service level selectable; z shown on every recommendation
- [ ] Formulas and assumptions visible in the app
- [ ] Anomalies visible, classified, treated differently, adjustment bounded and shown
- [ ] Holdout table vs baseline (including a loss case if one exists)
- [ ] Surge and delay simulation with before/after, cost, risk
- [ ] AI off: everything still works and path badges change
- [ ] Bad CSV gives row-level messages
- [ ] "Enter your own numbers" form works
- [ ] Limits slide ready
