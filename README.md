<div align="center">

<img src="logo.svg" alt="StockSense Logo" width="120" height="120" />

# StockSense

### AI-Powered Adaptive Inventory Intelligence Platform
**VORTEXA 3.0 · Problem S-02 · Domain 4 (Supply Chain & Optimization)**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-stock--sense--chi--eosin.vercel.app-171717?style=for-the-badge&logo=vercel&logoColor=white)](https://stock-sense-chi-eosin.vercel.app)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-Watch%20Walkthrough-000000?style=for-the-badge&logo=quicktime&logoColor=white)](stocksense-marketing-video.mp4)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Cloud-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Tests Passing](https://img.shields.io/badge/Tests-116%20Passing-22c55e?style=for-the-badge&logo=vitest&logoColor=white)](packages/core/__tests__)

<br />

[**Explore Live Deployment**](https://stock-sense-chi-eosin.vercel.app) · [**Watch Video Walkthrough**](stocksense-marketing-video.mp4) · [**Read System Documentation**](docs/)

</div>

---

> [!IMPORTANT]
> **Core Mission Statement:**  
> *"In community healthcare and pharmacy operations, a stockout isn't just a missed retail sale—it is a patient traveling 15 kilometers without critical medication. StockSense gives storekeepers mathematically grounded, evidence-based replenishment guidance: knowing exactly **when** to reorder and **how much**, with transparent risk simulations when demand surges or distributor deliveries are delayed."*

---

## 🌐 Live Product & Video Walkthrough

| Resource | Link | Description |
| :--- | :--- | :--- |
| **🚀 Production Web App** | [**stock-sense-chi-eosin.vercel.app**](https://stock-sense-chi-eosin.vercel.app) | Full cloud deployment on Vercel with responsive dark/light UI |
| **📹 5-Minute Video Walkthrough** | [**`stocksense-marketing-video.mp4`**](stocksense-marketing-video.mp4) | End-to-end screen recording demonstrating live replenishment workflows |
| **⚙️ Backend API** | [**StockSense Express API**](https://github.com/adityakondekar04/StockSense) | RESTful Node.js + Express backend connected to Neon PostgreSQL |
| **📄 Full Specification** | [**`docs/` Directory**](docs/) | Architecture, mathematical formulas, PRD, and testing proofs |

---

## ⚡ The Challenge vs. The StockSense Solution

| Dimension | Traditional Spreadsheets / Naive ERPs | StockSense Adaptive Engine |
| :--- | :--- | :--- |
| **Lead Time Assumption** | Assumes supplier delivery is constant ($\sigma_L = 0$). Stockouts occur whenever shipments are delayed. | **Dual-Variance Formulation:** Full stochastic expansion capturing demand volatility $\sigma_d$ AND lead-time delay volatility $\sigma_L$. |
| **Anomalous Spikes** | Extreme spikes distort the historical average, leading to chronic over-ordering of slow items. | **Modified Z-Score ($\text{MAD}$):** Classifies into 4 classes (Promo, Stockout, Data Error, Unknown) with clean imputation. |
| **AI Reliability** | Unconstrained LLMs hallucinate numbers, causing dangerous inventory decisions. | **Strictly Bounded AI:** AI never computes numbers. Zod-parsed, clamped to $\pm 30\%$, with deterministic 3-way fallback. |
| **Stress Testing** | Static guesswork. | **Seeded Monte Carlo (10,000 trials):** Mulberry32 PRNG provides auditable, deterministic probability of stockout. |
| **Data Integrity** | Silently corrects or drops bad rows. | **Rule 7 (No Silent Fixes):** Surgical row/field error reports on CSV upload. Raw sales ledger is 100% immutable. |

---

## 🧠 Core Features & System Capabilities

### 1. 📐 Rigorous Mathematical Replenishment (`@stocksense/core`)
- **Dual-Variance Safety Stock:**  
  $$\sigma_{LT} = \sqrt{\bar{L} \cdot \sigma_d^2 + \bar{d}^2 \cdot \sigma_L^2} \quad \implies \quad SS = z \cdot \sigma_{LT}$$
  Protects dispensaries simultaneously against patient demand surges and supplier transit delays.
- **Continuous Review $(s, Q)$ Reorder Point:**  
  $$ROP = \lceil \bar{d} \cdot \bar{L} + SS \rceil$$
  Flags items as **ORDER NOW** immediately when inventory position ($\text{On-Hand} + \text{On-Order}$) reaches or breaches $ROP$.
- **Dynamic Service Level Slider:**  
  Adjust service levels in real time from $90\%$ to $99.9\%$. The normal factor $z$ recomputes instantly ($z = 1.645$ for $95\%$, $z = 2.326$ for $99\%$).
- **Economic Order Quantity (EOQ):**  
  Calculates optimal lot sizing balancing carrying costs ($H = h \cdot C$) against ordering fees ($S$).
- **Visual Safety Stock Decomposition:**  
  Every recommendation card decomposes safety stock into **% Demand Volatility** vs. **% Supplier Delay Volatility**.

### 2. 🔍 Statistical Anomaly Detection & Imputation
- **Modified Z-Score Algorithm:**  
  Uses Median Absolute Deviation ($\text{MAD} = \text{median}(|x_i - \tilde{x}|)$) rather than standard deviation, making outlier thresholds ($M_i > 3.5$) robust against massive volume spikes.
- **4 Distinct Anomaly Classes:**
  1. **Promotion:** Sales during verified promotional campaigns $\rightarrow$ baseline de-spiked.
  2. **Stockout:** Artificially low or zero sales due to stockouts $\rightarrow$ imputed to unconstrained demand.
  3. **Data Error:** Typographical slip (e.g. 1,000 instead of 100) $\rightarrow$ imputed to weekday median (102 units).
  4. **Unknown:** Unexplained spikes $\rightarrow$ handled via a user-controlled baseline policy toggle.
- **Immutable Historical Ledger:**  
  Raw sales records in the `Sale` table are **never overwritten**, maintaining complete auditability.

### 3. 📊 Out-of-Sample Forecasting & Scientific Validation
- **Zero Data Leakage:**  
  Strict chronological 80/20 train/holdout split. Anomaly thresholds, medians, and model parameters are fitted exclusively on the first 120 days and evaluated on days 121–150.
- **Tournament Comparison:**  
  Side-by-side evaluation of **Historical Baseline Mean**, **Exponential Smoothing** ($\alpha = 0.2$), and **Day-of-Week Seasonality** using MAPE, RMSE, and Mean Bias metrics.

### 4. 🧪 Scenario Lab & Deterministic Monte Carlo
- **Interactive Supply Chain Stress Testing:**  
  Simulate demand surges ($\pm 100\%$) and delivery delays ($0$ to $14$ days) to see stockout risk jump from $5\%$ to $99.7\%$.
- **Mulberry32 PRNG Simulation:**  
  10,000 Monte Carlo trials running on a seeded pseudo-random number generator (seed `20261011`). Identical inputs yield identical outputs on any machine.
- **Natural Language Scenario Parser:**  
  Converts plain English (*"Distributor delayed by 3 days, flu season demand +30%"*) into simulation parameters with strict boundary clamping.

### 5. 🛡️ Bounded AI Architecture & Guardrails
- **Hard Rule 1:** Math lives exclusively in `packages/core`. Zero Express, React, Prisma, or `process.env` imports. Pure deterministic functions.
- **Hard Rule 2:** LLM models are architecturally prohibited from performing arithmetic or calculating quantities.
- **Hard Rule 3:** Every AI request records its execution path:
  $$\text{RULES} \quad\longleftrightarrow\quad \text{LLM Advisory} \quad\longleftrightarrow\quad \text{LLM\_FAILED\_RULES}$$

### 6. 🔐 Enterprise Authentication & Role-Based Access Control (RBAC)
- **Cryptographic Security:** Node.js native `crypto.scrypt` password hashing with 16-byte random salts.
- **Stateless Tokens:** RFC 7519 HMAC-SHA256 (`HS256`) signed JWT tokens with 7-day expiration.
- **4 Operational Roles:**
  - `STOREKEEPER`: Place replenishment orders, confirm anomaly adjustments, print dispatch slips.
  - `ADMIN`: Full catalog management, bulk CSV ingestion, audit log inspection.
  - `ANALYST`: Calibrate service level targets ($z$), run scenario stress tests, review holdout forecasts.
  - `VIEWER`: Read-only oversight for compliance and auditor review.
- **1-Click Demo Profiles:** Pre-seeded personas on the sign-in screen for instant evaluation.

### 7. 🖨️ Physical Dispensary Dispatch Slip (`/report/:id`)
- Clean single-page physical purchase order report designed with print stylesheets (`Ctrl+P` / `window.print()`).
- Shows exact order quantities ($Q$), reorder threshold ($ROP$), unit and annual holding costs, $z$-factor, and legal disclaimers.

---

## 🏗️ Architecture & Monorepo Structure

```
StockSense/
├── packages/
│   └── core/                     # Pure mathematical inventory engine (Zero side-effects)
│       ├── src/
│       │   ├── inventory.ts      # SS, ROP, EOQ, annual costs, variance split
│       │   ├── normal.ts         # Inverse normal CDF, z-score lookup tables
│       │   ├── anomaly.ts        # Modified Z-score, median, MAD, imputation
│       │   ├── forecast.ts       # Baseline, Exp smoothing, Seasonality
│       │   ├── evaluate.ts       # MAPE, RMSE, Bias holdout validation
│       │   ├── simulate.ts       # Mulberry32 PRNG seeded Monte Carlo engine
│       │   ├── intermittency.ts  # Croston / zero-demand intermittency detection
│       │   └── schemas.ts        # Zod single-source-of-truth schemas
│       └── __tests__/            # 67 Unit Tests (100% green)
│
├── apps/
│   ├── api/                      # Node.js + Express + Prisma REST API
│   │   ├── prisma/
│   │   │   └── schema.prisma     # PostgreSQL data model
│   │   └── src/
│   │       ├── server.ts         # Express server & CORS configuration
│   │       ├── auth/             # scrypt hashing, JWT tokens, RBAC middleware
│   │       ├── analysis/         # Multi-SKU replenishment & run history
│   │       ├── scenarios/        # Scenario simulation & stress endpoints
│   │       ├── ai/               # Bounded LLM client, clamp ceiling & fallback
│   │       ├── import/           # Strict CSV validation (Rule 7: No silent fixes)
│   │       └── products/         # Master catalog CRUD & sales history
│   │
│   └── web/                      # React 18 + Vite + Tailwind CSS Frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── landing/      # Editorial minimal landing page & signal animation
│       │   │   ├── dashboard/    # Recommendations, Cleaning, Forecast, Scenario, Print
│       │   │   └── ui/           # Accessible atomic components (Radix / Tailwind)
│       │   ├── context/          # InventoryContext, AuthContext, ThemeContext
│       │   └── pages/            # LandingPage, LoginPage, SignupPage, MethodologyPage
│       └── vercel.json           # Production SPA routing & security headers
│
└── data/                         # Seeded fictional dataset generator (Seed: 20261011)
```

---

## 🗄️ Database Architecture (PostgreSQL & Prisma)

```mermaid
erDiagram
    Product ||--o{ Sale : "records immutable"
    Product ||--o{ Promo : "contains"
    Product ||--o{ LeadTimeRecord : "tracks historical"
    Product ||--o{ Anomaly : "audits detected"
    Product ||--o{ AnalysisRun : "produces snapshots"
    Product ||--o{ Scenario : "evaluates shock"

    Product {
        string id PK
        string sku UK "e.g. PCM-02"
        string name
        string unit "tablets / sachets"
        float unitCost
        float orderCost
        float holdingRate "default 0.20 (20%/yr)"
        float leadTimeMean "L̄ (days)"
        float leadTimeSd "σ_L (days)"
        int onHand
        int onOrder
        int packSize
        int minOrderQty
    }

    Sale {
        string id PK
        string productId FK
        date date "Unique per SKU per day"
        float units "IMMUTABLE raw quantity"
        int onHand
    }

    Anomaly {
        string id PK
        string productId FK
        date date
        float value "Original raw value"
        float modifiedZ "Modified Z-Score"
        enum class "PROMOTION, DATA_ERROR, UNKNOWN"
        enum decisionPath "RULES, LLM, LLM_FAILED_RULES"
        float imputedValue "Replacement value"
        boolean userConfirmed
    }

    AnalysisRun {
        string id PK
        string productId FK
        float serviceLevel "e.g. 0.95"
        float zValue "e.g. 1.645"
        json inputsJson "Serialized input snapshot"
        json resultJson "Full calculation output"
    }

    User {
        string id PK
        string email UK
        string name
        string passwordHash "scrypt salt:hash"
        enum role "STOREKEEPER, ADMIN, ANALYST, VIEWER"
    }
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, TypeScript 5.7, Tailwind CSS, Recharts, Lucide Icons |
| **Backend API** | Node.js 22, Express 4.21, TypeScript, Prisma ORM 6.4 |
| **Database** | Neon Cloud Serverless PostgreSQL (with connection pooling) |
| **Mathematical Engine** | Pure TypeScript (`@stocksense/core`), Mulberry32 PRNG, Box-Muller transform |
| **Security & Auth** | Native `crypto.scrypt` password hashing, stateless HMAC-SHA256 JWTs |
| **Validation** | Zod (single source of truth for runtime types & API boundary contracts) |
| **Testing** | Vitest (116 automated unit and integration tests) |
| **Hosting & CI/CD** | Vercel (Frontend SPA), Render (Express Web Service), GitHub Actions |

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** $\ge 20.0.0$
- **npm** $\ge 10.0.0$

### 1. Clone & Install
```bash
git clone https://github.com/adityakondekar04/StockSense.git
cd StockSense
npm install
```

### 2. Configure Environment Variables
Copy the sample environment file in `apps/api`:
```bash
cp apps/api/.env.example apps/api/.env
```
Update `apps/api/.env` with your PostgreSQL database URL (or use local Docker PostgreSQL):
```env
DATABASE_URL="postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/stocksense?sslmode=require"
PORT=4000
```

### 3. Generate Prisma Client & Run Database Migrations
```bash
npx prisma generate --schema=apps/api/prisma/schema.prisma
```

### 4. Run Automated Tests
```bash
npm test
```
*Expected: 67 core mathematical tests and 49 API integration tests passing.*

### 5. Start Development Servers
```bash
npm run dev
```
- **Web Application:** `http://localhost:5173`
- **Express API Server:** `http://localhost:4000`

---

## 📜 10 Hard Architectural Rules (Compliance Matrix)

| Rule | Requirement | Implementation in StockSense |
| :---: | :--- | :--- |
| **1** | Math lives only in `packages/core` | Pure deterministic functions. Zero Express, React, or DB imports. Verified by test `T49`. |
| **2** | AI never calculates numbers directly | LLM output is parsed with Zod schemas and clamped to $\pm 30\%$. |
| **3** | Deterministic 3-way fallback | Every AI action records its path: `RULES`, `LLM`, or `LLM_FAILED_RULES`. |
| **4** | All time units are days | Normalized at ingestion (`leadTimeMean`, `historyDays`). |
| **5** | Fit on training data only | Anomaly modified z-scores and medians fitted on first 120 days. Zero data leakage. |
| **6** | Seeded determinism | Monte Carlo uses `mulberry32` PRNG (seed `20261011`). Identical inputs yield identical outputs. |
| **7** | No silent fixes | CSV parser returns exact row, column, and reason on errors. Never invents values. |
| **8** | Fictional data only | Fictional pharmaceutical SKUs (`PCM-02`, `ORS-01`, `INS-04`, `FLU-03`, `BND-05`, `ANT-06`). |
| **9** | Tests first for math | 116 automated test suites enforcing inventory and anomaly calculations. |
| **10** | Continuous verification | Verified clean build across workspaces with zero TypeScript errors. |

---

<div align="center">

**StockSense** · Built with precision for **VORTEXA 3.0 (Problem S-02)**  
*Rules decide. AI advises. Healthcare patients stay supplied.*

</div>
