# AGENTS.md: Rules for the AI coding agent (Antigravity)

You are building StockSense (VORTEXA 3.0, problem S-02). Read `docs/` before coding.

## Hard rules

1. **Math lives only in `packages/core`.** No Express, Prisma, React, fetch, or `process.env` imports there. Pure functions, fully typed.
2. **Never let AI output touch a number directly.** LLM output is parsed with Zod, clamped, and only then stored as a *suggestion*. SS, ROP, EOQ, costs and risk come only from `packages/core`.
3. **Every LLM call has a deterministic fallback** and records its path: `llm`, `rules`, or `llm_failed_rules`.
4. **All time units are days.** Convert at ingestion. Name variables with units where unclear (`leadTimeDays`).
5. **Fit on training data only.** Anomaly thresholds, medians, weekday indices and sigma estimates are computed from the training window. Never from the holdout.
6. **Determinism.** Monte Carlo uses a seeded PRNG (mulberry32). Same inputs and seed give same outputs.
7. **No silent fixes.** Invalid CSV rows produce specific errors (row, field, reason). Never invent values.
8. **Fictional data only.**
9. **Tests first for math.** Do not change a formula to make a test pass. If a test fails, report why.
10. Commit after each green test run.

## Conventions

- TypeScript strict mode. No `any`.
- Zod schemas are the single source of truth for types (`z.infer`).
- Money as numbers with 2-decimal rounding at display only. Internal calculations keep full precision.
- Quantities (units) are integers at output (ceil for ROP and Q).

## Definition of done for any module

- Types compile, tests pass, no unused exports, README docs updated if behaviour changed.
