# 10 · Demo & Pitch Guide (VORTEXA 3.0, Problem S-02)

## 1. Five-Minute Live Demo Script

**Total Time:** 5 minutes (strict stop at 04:45 to leave 15s buffer).  
**Presenter Roles:**
- **Speaker 1 (Product & Business Context):** Minutes 0:00–1:30.
- **Speaker 2 (Math, Simulation & AI Guardrails):** Minutes 1:30–4:15.
- **Speaker 1 (Summary & Handover):** Minutes 4:15–5:00.

---

### Minute 0:00 – 1:00: The Problem & Live Setup (`/setup`)
- **Visual:** Open StockSense on the laptop (`localhost:5173/setup`).
- **Talking points:**
  - "Small healthcare facilities and pharmacies face a constant dilemma: stockouts cause treatment failure, while excess stock ties up critical working capital and risks expiry."
  - "Spreadsheets assume constant demand and fixed supplier lead times. In reality, both fluctuate violently."
- **Action:**
  - Click **"Reset Official Demo Data"** or demonstrate the CSV dropzones.
  - Click **"Simulate Invalid CSV"**: point out rows 14, 28, 42 flagged with exact field and reason (Rule 7: No silent fixes).
  - Click **"Replenishment Recommendations"** in the top bar.

---

### Minute 1:00 – 2:00: Primary Recommendations (`/recommendations`)
- **Visual:** Screen 4 (`/recommendations`).
- **Talking points:**
  - "Notice the top bar: target service level is 95%, with normal factor z = 1.645 shown explicitly on every card."
  - "PCM-02 Paracetamol is flagged **Order Now** because inventory position (300) has breached the Reorder Point (681)."
  - "Safety stock (180 units) is split visually: 55% caused by demand variability, 45% caused by supplier delivery delays."
- **Action:**
  - Change the service level slider in the top bar from **95% to 99%**.
  - Show all cards recomputing instantaneously: z changes to 2.326, ROP jumps from 681 to 755.
  - Explain: "Pure deterministic math in `@stocksense/core`. Zero LLM hallucinations touching core quantities."

---

### Minute 2:00 – 3:00: Data Cleaning & Anomaly Review (`/products/PCM-02/cleaning`)
- **Visual:** Screen 2 (`/products/PCM-02/cleaning`).
- **Talking points:**
  - "We don't silently delete outliers. We classify them into 4 explicit classes: Promotions, Stockouts, Data Errors, and Unknowns."
  - "Notice the Feb 18 data error: 1000 units instead of 100. It is imputed using weekday median (102 units), never deleted."
  - "Look at the **Unknown Anomaly Baseline Policy** toggle. When toggled off, ROP changes by 24 units."
- **Action:**
  - Click **Confirm** on an anomaly or show the Storekeeper Audit Note box.
  - Point to the **Decision Path Badge**: reads `RULES` or `LLM Advisory`.

---

### Minute 3:00 – 4:00: Scenario Lab & Monte Carlo Stress Testing (`/products/PCM-02/scenario`)
- **Visual:** Screen 5 (`/products/PCM-02/scenario`).
- **Talking points:**
  - "What happens during a flu surge when distributors are delayed?"
- **Action:**
  - Set Demand Surge slider to **+40%** and Supplier Delay slider to **+3 days**.
  - Point to the **Old Policy Card**:
    - *"If you maintain the old reorder point of 680 under these conditions, your stockout probability spikes from 5% to 99.7%."*
  - Point to the **Agreement Line**:
    - *"Analytic CDF: 99.7% · Monte Carlo (10,000 trials, seed 20261011): 99.5%."*
  - Type in natural language prompt: *"Supplier 4 days late, clinic surge +30%"* -> click **Parse Scenario** -> shows interpreted parameters with bounded clamping.

---

### Minute 4:00 – 4:45: Out-of-Sample Forecast & 1-Page Printable Report
- **Visual:**
  - Quick click to `/products/PCM-02/forecast`: Show honest 30-day holdout chart where baseline or seasonal model wins without data leakage. Point to the **Honesty Note**: *"Selecting on the same holdout slightly flatters the winner."*
  - Quick click to `/report/PCM-02`: Click **Print Dispatch Report** (or Ctrl+P preview).
- **Talking points:**
  - "A clean, single-page physical dispatch slip for the dispensary storekeeper. Contains exact order numbers, z-values, formulas, and neutral advisory disclaimers."

---

### Minute 4:45 – 5:00: Conclusion & Handover
- **Closing statement:**
  - "StockSense combines rigorous stochastic inventory theory with pragmatic storekeeper UX. Pure math in the engine, explainable guardrails on AI, zero silent failures. Thank you—we welcome questions."

---

## 2. Judge Q&A Defense Guide

### Q1: "What if the AI is wrong or hallucinations occur?"
> **Answer:**  
> "In StockSense, the AI is architecturally prohibited from calculating numbers. Rule 1 & Rule 2 of our core specification state:
> 1. All safety stock, reorder point, and lot sizing calculations live exclusively in `@stocksense/core` as pure TypeScript functions with zero AI dependencies.
> 2. LLMs only propose narrative hypotheses and unstructured text interpretations. Every LLM response is parsed against strict Zod schemas, clamped to a hard ±30% ceiling, and stored as an advisory suggestion.
> 3. If the LLM throws an error, times out, or hallucinates an invalid field, the system automatically falls back to deterministic rules with decision path `LLM_FAILED_RULES`. The storekeeper is always in control."

### Q2: "Why did you use dual-variance safety stock instead of standard textbook SS = z · σ · √L?"
> **Answer:**  
> "The standard textbook formula assumes lead time $L$ is constant ($\sigma_L = 0$). In small-business and healthcare retail in India, supplier delays are the primary cause of stockouts.  
> We use the complete dual-variance expansion:
> $$\sigma_{LT} = \sqrt{\bar{L} \cdot \sigma_d^2 + \bar{d}^2 \cdot \sigma_L^2}$$  
> This captures both demand volatility and supplier unreliability. If supplier delivery standard deviation is zero, it collapses mathematically to the standard formula."

### Q3: "How do you avoid data leakage in anomaly detection and forecasting?"
> **Answer:**  
> "We enforce a strict chronological 80/20 train/holdout split. Anomaly modified z-score thresholds, weekday medians, and model parameters are fitted exclusively on the first 120 days. Holdout observations (days 121–150) are strictly out-of-sample and are never inspected during fitting (verified by automated test T30)."

### Q4: "Why Mulberry32 PRNG for Monte Carlo instead of Math.random()?"
> **Answer:**  
> "Auditable determinism (Rule 6). In regulated inventory environments, simulations must be reproducible. With seeded Mulberry32, identical scenario inputs yield identical results on any machine, allowing judges and auditors to verify numerical convergence."

---

## 3. Limitations & Assumptions Slide / Handout

1. **Cycle Service Level vs Fill Rate:**
   - CSL guarantees probability of zero stockouts per replenishment cycle; fill rate measures fraction of total units satisfied directly from stock. Both are displayed.
2. **Normal Approximation:**
   - Assumes lead-time demand is approximately normal. For highly intermittent SKUs (>40% zero sales like ANT-06), an explicit **Intermittent Demand Warning** is displayed.
3. **Continuous Review (s, Q):**
   - Assumes inventory position is reviewed on every transaction, triggering an order $Q$ as soon as position $\le ROP$.
4. **Decision Support:**
   - StockSense is an operational advisory tool; physical purchase commitments must always be authorized by clinic managers.
