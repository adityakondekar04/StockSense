// apps/web/src/data/landingData.ts
// Structured data for the StockSense landing page and interactive previews

export interface PreviewProduct {
  sku: string;
  name: string;
  unit: string;
  currentStock: number;
  rop: number;
  safetyStock: number;
  orderQty: number;
  status: "Order now" | "Reorder soon" | "Healthy";
  statusReason: string;
  avgDailyDemand: number;
  leadTimeDays: number;
  history: { day: string; demand: number; rop: number }[];
}

export const PREVIEW_PRODUCTS: PreviewProduct[] = [
  {
    sku: "PCM-02",
    name: "Paracetamol 500 mg (Strips)",
    unit: "strips",
    currentStock: 300,
    rop: 681,
    safetyStock: 180,
    orderQty: 1250,
    status: "Order now",
    statusReason: "Stock (300) is below Reorder Point (681). Estimated stockout in 3 days.",
    avgDailyDemand: 50,
    leadTimeDays: 10,
    history: [
      { day: "D-13", demand: 48, rop: 681 },
      { day: "D-12", demand: 52, rop: 681 },
      { day: "D-11", demand: 49, rop: 681 },
      { day: "D-10", demand: 55, rop: 681 },
      { day: "D-09", demand: 51, rop: 681 },
      { day: "D-08", demand: 62, rop: 681 },
      { day: "D-07", demand: 58, rop: 681 },
      { day: "D-06", demand: 49, rop: 681 },
      { day: "D-05", demand: 53, rop: 681 },
      { day: "D-04", demand: 47, rop: 681 },
      { day: "D-03", demand: 56, rop: 681 },
      { day: "D-02", demand: 54, rop: 681 },
      { day: "D-01", demand: 52, rop: 681 },
      { day: "Today", demand: 50, rop: 681 },
    ],
  },
  {
    sku: "ORS-01",
    name: "Oral Rehydration Salts (Sachets)",
    unit: "sachets",
    currentStock: 820,
    rop: 450,
    safetyStock: 120,
    orderQty: 600,
    status: "Healthy",
    statusReason: "Adequate stock coverage for 18 days at current demand.",
    avgDailyDemand: 45,
    leadTimeDays: 7,
    history: [
      { day: "D-13", demand: 42, rop: 450 },
      { day: "D-12", demand: 40, rop: 450 },
      { day: "D-11", demand: 45, rop: 450 },
      { day: "D-10", demand: 48, rop: 450 },
      { day: "D-09", demand: 44, rop: 450 },
      { day: "D-08", demand: 46, rop: 450 },
      { day: "D-07", demand: 43, rop: 450 },
      { day: "D-06", demand: 45, rop: 450 },
      { day: "D-05", demand: 49, rop: 450 },
      { day: "D-04", demand: 44, rop: 450 },
      { day: "D-03", demand: 46, rop: 450 },
      { day: "D-02", demand: 45, rop: 450 },
      { day: "D-01", demand: 47, rop: 450 },
      { day: "Today", demand: 45, rop: 450 },
    ],
  },
  {
    sku: "BND-05",
    name: "First-Aid Dressings & Bandages",
    unit: "boxes",
    currentStock: 210,
    rop: 240,
    safetyStock: 75,
    orderQty: 500,
    status: "Reorder soon",
    statusReason: "Stock approaching ROP threshold. Reorder within 48 hours.",
    avgDailyDemand: 25,
    leadTimeDays: 6,
    history: [
      { day: "D-13", demand: 24, rop: 240 },
      { day: "D-12", demand: 26, rop: 240 },
      { day: "D-11", demand: 25, rop: 240 },
      { day: "D-10", demand: 28, rop: 240 },
      { day: "D-09", demand: 23, rop: 240 },
      { day: "D-08", demand: 27, rop: 240 },
      { day: "D-07", demand: 25, rop: 240 },
      { day: "D-06", demand: 26, rop: 240 },
      { day: "D-05", demand: 24, rop: 240 },
      { day: "D-04", demand: 28, rop: 240 },
      { day: "D-03", demand: 29, rop: 240 },
      { day: "D-02", demand: 25, rop: 240 },
      { day: "D-01", demand: 26, rop: 240 },
      { day: "Today", demand: 27, rop: 240 },
    ],
  },
  {
    sku: "SAN-03",
    name: "Hand Sanitizer 500 ml",
    unit: "bottles",
    currentStock: 480,
    rop: 190,
    safetyStock: 50,
    orderQty: 300,
    status: "Healthy",
    statusReason: "Comfortable stock buffer; next reorder expected in 2 weeks.",
    avgDailyDemand: 20,
    leadTimeDays: 7,
    history: [
      { day: "D-13", demand: 18, rop: 190 },
      { day: "D-12", demand: 21, rop: 190 },
      { day: "D-11", demand: 19, rop: 190 },
      { day: "D-10", demand: 22, rop: 190 },
      { day: "D-09", demand: 20, rop: 190 },
      { day: "D-08", demand: 19, rop: 190 },
      { day: "D-07", demand: 23, rop: 190 },
      { day: "D-06", demand: 20, rop: 190 },
      { day: "D-05", demand: 18, rop: 190 },
      { day: "D-04", demand: 22, rop: 190 },
      { day: "D-03", demand: 21, rop: 190 },
      { day: "D-02", demand: 19, rop: 190 },
      { day: "D-01", demand: 20, rop: 190 },
      { day: "Today", demand: 20, rop: 190 },
    ],
  },
];

export const CAPABILITY_ITEMS = [
  { label: "Demand Forecasting", detail: "Train vs holdout validation with MAE & WAPE" },
  { label: "Statistical Safety Stock", detail: "Demand & lead-time variability modeling" },
  { label: "Reorder Recommendations", detail: "Continuous review (s, Q) replenishment policy" },
  { label: "Scenario Simulation", detail: "What-if surge & delay cross-checked via Monte Carlo" },
  { label: "Transparent Calculations", detail: "Zero black-box math; every figure has an audit trail" },
];

export const PROBLEM_SOLUTION_ITEMS = [
  {
    problemTitle: "Unexpected Stockouts",
    problemText:
      "Spreadsheets rely on static minimum levels or gut-feel rules. When demand fluctuates or a supplier runs a few days late, stock quietly depletes until patients or customers find an empty shelf.",
    solutionTitle: "Variability-Aware Reorder Point",
    solutionText:
      "StockSense recalculates Reorder Points based on empirical daily demand variance and supplier lead-time standard deviation, alerting you when inventory position drops below the safety threshold.",
    metricHighlight: "Protects against both demand surges and supplier delays simultaneously.",
  },
  {
    problemTitle: "Excess Capital Tied in Safety Stock",
    problemText:
      "Fearing stockouts, managers order excessive buffer quantities. This freezes working capital, increases holding costs, and causes perishable healthcare products to expire on shelves.",
    solutionTitle: "Controlled Service-Level Calibration",
    solutionText:
      "Choose your target cycle service level (e.g. 95% → z = 1.645). StockSense determines the exact mathematical safety stock required, preventing unnecessary overstocking.",
    metricHighlight: "Clear trade-off between target service level, holding cost, and safety buffer.",
  },
  {
    problemTitle: "Uncertain Supplier Deliveries",
    problemText:
      "Storekeepers only discover the damage of a delayed delivery after running out. Traditional software cannot test 'what-if' lead times without changing production configurations.",
    solutionTitle: "Interactive Scenario Lab",
    solutionText:
      "Simulate a 3-day supplier delay or a 40% flu season surge in real time. Compare old policy stockout risks against revised recommendations before placing purchase orders.",
    metricHighlight: "Side-by-side risk and cost impact before committing purchase orders.",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Bring in your inventory data",
    description:
      "Get started in seconds with seeded demo data, enter items manually via structured forms, or upload your own CSV files. StockSense validates each row with clear row-level error reporting.",
    tags: ["CSV Ingestion", "Manual Entry", "Seeded Demo Data"],
  },
  {
    step: "02",
    title: "Understand your recommendations",
    description:
      "Review Reorder Points (when to reorder), Economic Order Quantity (how much to order), and Safety Stock. Every card shows the selected service level, corresponding z-factor, and current inventory position.",
    tags: ["Reorder Point (ROP)", "Order Quantity (EOQ)", "Service Level z-factor"],
  },
  {
    step: "03",
    title: "Test what could change",
    description:
      "Run interactive scenarios to test what happens if suppliers run late or demand spikes. Compare the revised policy against the baseline with expected stockout risk cross-checked via Monte Carlo simulation.",
    tags: ["Scenario Lab", "Lead-Time Delay", "Monte Carlo Validation"],
  },
];

export const CORE_FEATURES = [
  {
    title: "Adaptive Reorder Recommendations",
    category: "Core Replenishment",
    description:
      "Distinguishes between Reorder Point (when to trigger replenishment) and Order Quantity (how much to order with pack-size rounding and MOQ constraints).",
    badge: "Deterministic Math",
  },
  {
    title: "Explainable Safety Stock",
    category: "Statistical Modeling",
    description:
      "Explicitly models both daily demand variability (σD) and supplier lead-time variability (σL) combined into σLT, scaled by your chosen service level z-factor.",
    badge: "Dual Variance",
  },
  {
    title: "Demand Anomaly Review",
    category: "Data Integrity",
    description:
      "Flags unusual spikes using weekday-adjusted modified z-scores. Classifies into promotions, data errors, or unknowns while keeping raw historical data visible and intact.",
    badge: "Transparent Cleaning",
  },
  {
    title: "Holdout Forecast Evaluation",
    category: "Evaluation",
    description:
      "Compares model forecasts with a simple naive baseline on a chronological holdout period. Evaluates MAE, WAPE, and bias with strict train-only parameter fitting.",
    badge: "No Data Leakage",
  },
  {
    title: "Interactive Scenario Lab",
    category: "Decision Support",
    description:
      "Simulates demand surges and delivery delays. Shows old-policy stockout risk side-by-side with updated recommendations, validated by seeded Monte Carlo simulation.",
    badge: "What-If Simulation",
  },
  {
    title: "Transparent AI Assistance",
    category: "Architecture",
    description:
      "AI provides suggestions for anomaly classification and text scenario parsing, but never computes inventory formulas directly. Automatic local rules fallback when offline.",
    badge: "Rules Decide, AI Advises",
  },
];
