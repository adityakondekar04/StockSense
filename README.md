# StockSense: Adaptive Inventory Replenishment Engine

VORTEXA 3.0 · Problem S-02 · Domain 4 (Supply Chain & Optimization)

> A stockout isn't a lost sale. It's a patient travelling 15 km. StockSense tells a small pharmacy or health-centre store-keeper **when** to reorder and **how much**, and shows what changes when demand surges or a supplier runs late.

## What it does

- Computes **safety stock, reorder point and order quantity (EOQ)** protecting against demand AND lead-time variability.
- Lets the user pick a **service level**; every recommendation shows the level and its **z-factor**.
- Finds **unusual demand values**, keeps them visible, classifies them (promotion / data error / unknown), and handles each class differently.
- Uses AI to help classify anomalies and propose a forecast adjustment, **always bounded, shown, and with a deterministic fallback**.
- Compares the forecast with a **baseline on a holdout period** (MAE, plus WAPE and bias).
- **Scenario Lab:** simulate a demand surge or supplier delay and see old vs new recommendation, expected cost and stockout risk side by side.

## Tech stack (final)

| Layer | Choice |
|---|---|
| Frontend | React + Vite, TypeScript, Tailwind CSS, Recharts |
| Backend | Node.js + Express, TypeScript |
| Database | Neon PostgreSQL via Prisma |
| Validation | Zod (CSV rows, API bodies, LLM output) |
| AI | LLM API behind one `callLLM()` with timeout, schema check, clamp, and deterministic fallback |
| Math | Pure TypeScript package (`packages/core`), no DB or network imports |
| CSV | `papaparse` |
| Tests | Vitest |

```
React + Vite  ->  Express API  ->  Neon PostgreSQL (Prisma)
                      |
                      +-> packages/core (pure math, tested)
                      +-> AI layer (LLM -> validate -> clamp -> fallback)
```

## Repo layout

```
stocksense/
  README.md
  AGENTS.md                 # rules for the Antigravity agent
  docs/                     # these spec files
  packages/core/            # pure TS: inventory, anomaly, forecast, evaluate, simulate
  apps/api/                 # Express + Prisma + AI layer
  apps/web/                 # React + Vite + Tailwind + Recharts
  data/                     # seeded generator + demo CSVs
```

## Docs index

| File | Purpose |
|---|---|
| `docs/01-PRD.md` | Requirements traced to the booklet, scope, acceptance tests |
| `docs/02-ARCHITECTURE.md` | Components, data flow, failure behaviour, monorepo setup |
| `docs/03-FORMULAS.md` | Every formula, worked example, TS reference code |
| `docs/04-DATABASE.md` | Prisma schema and seed strategy |
| `docs/05-API.md` | REST endpoints with request/response shapes |
| `docs/06-AI-LAYER.md` | AI roles, schemas, clamp, fallback, prompts |
| `docs/07-BUILD-PLAN.md` | Hour-by-hour plan and team split |
| `docs/08-ANTIGRAVITY-PROMPTS.md` | Copy-paste prompts, one per module |
| `docs/09-TESTING.md` | Test plan with expected values |
| `docs/10-DEMO-AND-PITCH.md` | Demo data, 5-minute script, judge Q&A, limits |
| `todo.md` | **Start here.** 60 small, testable build steps in order, with gates |
| `docs/navigation.md` | Route map, top bar, user flows, cross-links |
| `docs/screens.md` | Every screen: contents, data source, states, acceptance check |
| `docs/business-logic.md` | Who decides what, function map, classification precedence, validation rules |
| `docs/ui-guidelines.md` | Terminology, colours, badges, charts, number formats, print and accessibility |

## Quick start

```bash
git clone <repo> && cd stocksense
npm install                       # workspaces: core, api, web
cp apps/api/.env.example apps/api/.env   # set DATABASE_URL, optional LLM_API_KEY
npx prisma migrate dev --schema apps/api/prisma/schema.prisma
npm run seed                      # seeded fictional demo data
npm run dev                       # api :4000, web :5173
npm test                          # core math tests must be green
```

## Ground rules (from the booklet)

1. **Rules decide, AI advises.** AI never computes SS, ROP, EOQ or edits history.
2. **Fictional data only.**
3. **Works with AI off.** A "Run without AI" toggle proves it.
4. **Honest limits.** See `docs/10-DEMO-AND-PITCH.md`.
