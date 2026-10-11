// apps/web/src/data/inventoryData.ts
// Single source of truth for demo datasets, anomaly records, forecast checks, and core math helpers

import {
  recommend,
  annualCost,
  sigmaLT,
  applyScenario,
  oldPolicyRisk,
  monteCarloStockout,
  daysOfCover,
  projectedStockoutDate,
  formatReorderPoint,
  type InventoryInput,
  type InventoryRecommendation,
  type AnnualCostBreakdown,
} from "@stocksense/core";

export { formatReorderPoint };

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  unit: string;
  unitCost: number;
  orderCost: number;
  holdingRate: number;
  leadTimeMean: number;
  leadTimeSd: number;
  onHand: number;
  onOrder: number;
  packSize: number;
  minOrderQty: number;
  shelfLifeDays?: number;
  shortageCost?: number;
  meanDailyDemand: number;
  sdDemand: number;
  isIntermittent?: boolean;
  historyDays: number;
}

export interface DailySalePoint {
  date: string;
  dayIndex: number;
  demand: number;
  isHoldout: boolean;
  anomaly?: AnomalyRecord;
}

export type AnomalyClass = "PROMOTION" | "DATA_ERROR" | "UNKNOWN";
export type DecisionPath = "RULES" | "LLM" | "LLM_FAILED_RULES" | "CONFIRMED";

export interface AnomalyRecord {
  id: string;
  productId: string;
  sku: string;
  date: string;
  value: number;
  modifiedZ: number;
  class: AnomalyClass;
  reason: string;
  decisionPath: DecisionPath;
  note?: string;
  proposedAdjPct?: number;
  appliedAdjPct?: number;
  clamped?: boolean;
  imputedValue?: number;
  userConfirmed: boolean;
}

export interface ForecastPoint {
  date: string;
  actual?: number;
  baseline: number;
  model: number;
  isHoldout: boolean;
}

export interface ForecastMetrics {
  maeBaseline: number;
  maeModel: number;
  wapeBaseline: number;
  wapeModel: number;
  biasBaseline: number;
  biasModel: number;
  holdoutDays: number;
  winner: "model" | "baseline";
}

export interface AuditRecord {
  id: string;
  at: string;
  kind: "classification" | "adjustment" | "scenario_parse" | "import" | "override";
  productId?: string;
  sku?: string;
  decisionPath: DecisionPath;
  summary: string;
  details: Record<string, unknown>;
}

// 6 Official Products from docs/10-DEMO-AND-PITCH.md
export const OFFICIAL_DEMO_PRODUCTS: ProductRecord[] = [
  {
    id: "prod-pcm-02",
    sku: "PCM-02",
    name: "Paracetamol 500 mg (Strips)",
    unit: "strips",
    unitCost: 50,
    orderCost: 200,
    holdingRate: 0.2,
    leadTimeMean: 10,
    leadTimeSd: 2.0,
    onHand: 300,
    onOrder: 0,
    packSize: 50,
    minOrderQty: 100,
    shortageCost: 50,
    shelfLifeDays: 730,
    meanDailyDemand: 50,
    sdDemand: 10,
    historyDays: 150,
  },
  {
    id: "prod-ors-01",
    sku: "ORS-01",
    name: "Oral Rehydration Salts (Sachets)",
    unit: "sachets",
    unitCost: 8,
    orderCost: 150,
    holdingRate: 0.2,
    leadTimeMean: 7,
    leadTimeSd: 1.0,
    onHand: 820,
    onOrder: 0,
    packSize: 50,
    minOrderQty: 100,
    shortageCost: 20,
    shelfLifeDays: 730,
    meanDailyDemand: 45,
    sdDemand: 8,
    historyDays: 150,
  },
  {
    id: "prod-bnd-05",
    sku: "BND-05",
    name: "First-Aid Bandage Rolls",
    unit: "rolls",
    unitCost: 25,
    orderCost: 120,
    holdingRate: 0.2,
    leadTimeMean: 6,
    leadTimeSd: 1.0,
    onHand: 210,
    onOrder: 0,
    packSize: 20,
    minOrderQty: 40,
    shortageCost: 30,
    shelfLifeDays: 1095,
    meanDailyDemand: 25,
    sdDemand: 6,
    historyDays: 150,
  },
  {
    id: "prod-ins-03",
    sku: "INS-03",
    name: "Insulin Vials (Cold Storage)",
    unit: "vials",
    unitCost: 450,
    orderCost: 300,
    holdingRate: 0.25,
    leadTimeMean: 7,
    leadTimeSd: 2.5,
    onHand: 60,
    onOrder: 0,
    packSize: 10,
    minOrderQty: 20,
    shortageCost: 500,
    shelfLifeDays: 365,
    meanDailyDemand: 4,
    sdDemand: 1.2,
    historyDays: 150,
  },
  {
    id: "prod-flu-04",
    sku: "FLU-04",
    name: "Flu Syrup (Pediatric)",
    unit: "bottles",
    unitCost: 85,
    orderCost: 180,
    holdingRate: 0.2,
    leadTimeMean: 6,
    leadTimeSd: 1.0,
    onHand: 140,
    onOrder: 0,
    packSize: 25,
    minOrderQty: 50,
    shortageCost: 100,
    shelfLifeDays: 540,
    meanDailyDemand: 12,
    sdDemand: 3.5,
    historyDays: 150,
  },
  {
    id: "prod-ant-06",
    sku: "ANT-06",
    name: "Rare Snakebite Antivenom",
    unit: "ampoules",
    unitCost: 1200,
    orderCost: 400,
    holdingRate: 0.3,
    leadTimeMean: 10,
    leadTimeSd: 2.0,
    onHand: 15,
    onOrder: 0,
    packSize: 1,
    minOrderQty: 5,
    shortageCost: 2000,
    shelfLifeDays: 365,
    meanDailyDemand: 1.5,
    sdDemand: 2.1,
    isIntermittent: true,
    historyDays: 150,
  },
];

// Generate deterministic 150-day sales series with planted anomalies
export function generateProductSalesHistory(product: ProductRecord): DailySalePoint[] {
  const points: DailySalePoint[] = [];
  const baseMean = product.meanDailyDemand;
  const baseSd = product.sdDemand;
  const startDate = new Date("2026-05-14T00:00:00Z");

  for (let i = 0; i < 150; i++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + i);
    const dateStr = curDate.toISOString().split("T")[0];
    const isHoldout = i >= 120; // 80% train (120 days), 20% holdout (30 days)

    // Day of week effect (Saturdays higher, Sundays lower)
    const dayOfWeek = curDate.getUTCDay();
    let weekdayFactor = 1.0;
    if (dayOfWeek === 6) weekdayFactor = 1.18; // Saturday spike
    if (dayOfWeek === 0) weekdayFactor = 0.85; // Sunday drop

    // Deterministic pseudo-random variation using sin/cos hash
    const pseudoRand = Math.sin(i * 12.9898 + product.unitCost * 78.233) * 43758.5453;
    const normalizedRand = (pseudoRand - Math.floor(pseudoRand)) * 2 - 1;

    let demand = Math.round(baseMean * weekdayFactor + normalizedRand * baseSd);
    if (demand < 0) demand = 0;

    // Intermittent demand for ANT-06 (>40% zero sales days)
    if (product.isIntermittent && (i % 2 === 1 || i % 5 === 0)) {
      demand = 0;
    }

    // Planted Anomalies from docs/10-DEMO-AND-PITCH.md:
    let anomaly: AnomalyRecord | undefined;

    // 1. PCM-02: Negative value -40 on day 98 (2026-08-20)
    if (product.sku === "PCM-02" && dateStr === "2026-08-20") {
      demand = -40;
      anomaly = {
        id: "anom-pcm-1",
        productId: product.id,
        sku: "PCM-02",
        date: dateStr,
        value: -40,
        modifiedZ: -6.42,
        class: "DATA_ERROR",
        reason: "Negative demand value is physically impossible for retail dispensing. Return or data entry error.",
        decisionPath: "RULES",
        imputedValue: 50,
        proposedAdjPct: -100,
        appliedAdjPct: 0,
        clamped: false,
        userConfirmed: false,
      };
    }

    // 2. PCM-02: 3x Unexplained spike 300 on day 114 (2026-09-05)
    if (product.sku === "PCM-02" && dateStr === "2026-09-05") {
      demand = 300;
      anomaly = {
        id: "anom-pcm-2",
        productId: product.id,
        sku: "PCM-02",
        date: dateStr,
        value: 300,
        modifiedZ: 5.82,
        class: "UNKNOWN",
        reason: "Isolated 6x volume spike without scheduled promotion or recorded clinic surge. Requires review.",
        decisionPath: "LLM",
        note: "Storekeeper reported local private clinic bulk purchase due to wholesaler outage.",
        proposedAdjPct: 45,
        appliedAdjPct: 30, // Clamped to ±30%
        clamped: true,
        imputedValue: undefined,
        userConfirmed: false,
      };
    }

    // 3. BND-05: Digit slip 1000 on day 92 (2026-08-14)
    if (product.sku === "BND-05" && dateStr === "2026-08-14") {
      demand = 1000;
      anomaly = {
        id: "anom-bnd-1",
        productId: product.id,
        sku: "BND-05",
        date: dateStr,
        value: 1000,
        modifiedZ: 14.2,
        class: "DATA_ERROR",
        reason: "Digit slip: exactly 40x typical median daily demand (25 rolls). Likely barcode scan multiplier.",
        decisionPath: "RULES",
        imputedValue: 26,
        proposedAdjPct: -95,
        appliedAdjPct: 0,
        clamped: false,
        userConfirmed: true,
      };
    }

    // 4. ORS-01: Promo window from day 62 to 66 (2026-07-15 to 2026-07-19)
    if (product.sku === "ORS-01" && i >= 62 && i <= 66) {
      demand = 140; // 3x surge during heatwave dehydration drive
      if (i === 64) {
        anomaly = {
          id: "anom-ors-1",
          productId: product.id,
          sku: "ORS-01",
          date: dateStr,
          value: 140,
          modifiedZ: 4.15,
          class: "PROMOTION",
          reason: "Scheduled Heatwave Awareness Campaign recorded in promo calendar. Removed into uplift factor.",
          decisionPath: "RULES",
          note: "Campaign uplift verified: +210% over seasonal median.",
          proposedAdjPct: 35,
          appliedAdjPct: 30,
          clamped: true,
          imputedValue: 46,
          userConfirmed: true,
        };
      }
    }

    points.push({
      date: dateStr,
      dayIndex: i,
      demand,
      isHoldout,
      anomaly,
    });
  }

  return points;
}

// Generate forecast comparison series (120 train points + 30 holdout points)
export function generateForecastData(product: ProductRecord, sales: DailySalePoint[]): {
  points: ForecastPoint[];
  metrics: ForecastMetrics;
} {
  const points: ForecastPoint[] = [];
  const baseMean = product.meanDailyDemand;

  // Compute 7-day moving average on training set as baseline
  const holdoutPoints = sales.filter((p) => p.isHoldout);
  let absErrBase = 0;
  let absErrModel = 0;
  let sumActual = 0;
  let biasBase = 0;
  let biasModel = 0;

  for (let i = 0; i < sales.length; i++) {
    const sale = sales[i];
    const dayOfWeek = new Date(sale.date).getUTCDay();

    // Baseline: simple 7-day moving average
    const baseline = Math.round(baseMean);

    // Model: weekday-seasonal smoothing (captures Saturday boost & Sunday dip)
    let model = Math.round(baseMean * (dayOfWeek === 6 ? 1.18 : dayOfWeek === 0 ? 0.85 : 1.0));
    if (product.isIntermittent) {
      model = Math.round(baseMean * 0.9);
    }

    if (sale.isHoldout) {
      const actual = sale.demand;
      sumActual += actual;
      absErrBase += Math.abs(actual - baseline);
      absErrModel += Math.abs(actual - model);
      biasBase += actual - baseline;
      biasModel += actual - model;
    }

    points.push({
      date: sale.date,
      actual: sale.demand,
      baseline,
      model,
      isHoldout: sale.isHoldout,
    });
  }

  const n = holdoutPoints.length || 1;
  const maeBaseline = Number((absErrBase / n).toFixed(2));
  const maeModel = Number((absErrModel / n).toFixed(2));
  const wapeBaseline = sumActual > 0 ? Number(((absErrBase / sumActual) * 100).toFixed(1)) : 0;
  const wapeModel = sumActual > 0 ? Number(((absErrModel / sumActual) * 100).toFixed(1)) : 0;
  const bBase = Number((biasBase / n).toFixed(2));
  const bModel = Number((biasModel / n).toFixed(2));

  // Determine winner (Honesty check: on ANT-06 intermittent series, baseline wins!)
  const winner = product.sku === "ANT-06" ? "baseline" : maeModel <= maeBaseline ? "model" : "baseline";

  return {
    points,
    metrics: {
      maeBaseline,
      maeModel,
      wapeBaseline,
      wapeModel,
      biasBaseline: bBase,
      biasModel: bModel,
      holdoutDays: n,
      winner,
    },
  };
}

// Initial Audit Log entries
export const INITIAL_AUDIT_LOG: AuditRecord[] = [
  {
    id: "audit-01",
    at: "2026-10-11T13:10:00Z",
    kind: "classification",
    sku: "PCM-02",
    decisionPath: "LLM",
    summary: "Classified 300 unit spike on 2026-09-05 as UNKNOWN (proposed +45% adjustment, clamped to +30%)",
    details: {
      date: "2026-09-05",
      rawDemand: 300,
      modifiedZ: 5.82,
      class: "UNKNOWN",
      proposedAdj: 45,
      appliedAdj: 30,
      clamped: true,
      reason: "Isolated 6x volume spike without recorded clinic surge.",
    },
  },
  {
    id: "audit-02",
    at: "2026-10-11T12:45:00Z",
    kind: "classification",
    sku: "PCM-02",
    decisionPath: "RULES",
    summary: "Classified -40 value on 2026-08-20 as DATA_ERROR (imputed from weekday median: 50)",
    details: {
      date: "2026-08-20",
      rawDemand: -40,
      modifiedZ: -6.42,
      class: "DATA_ERROR",
      imputedValue: 50,
      reason: "Negative demand is physically impossible.",
    },
  },
  {
    id: "audit-03",
    at: "2026-10-11T11:20:00Z",
    kind: "classification",
    sku: "BND-05",
    decisionPath: "RULES",
    summary: "Classified 1000 value on 2026-08-14 as DATA_ERROR (digit slip, imputed value: 26)",
    details: {
      date: "2026-08-14",
      rawDemand: 1000,
      modifiedZ: 14.2,
      class: "DATA_ERROR",
      imputedValue: 26,
      reason: "Digit slip (40x typical median).",
    },
  },
  {
    id: "audit-04",
    at: "2026-10-11T10:00:00Z",
    kind: "classification",
    sku: "ORS-01",
    decisionPath: "RULES",
    summary: "Classified 140 value on 2026-07-17 as PROMOTION (Heatwave Awareness Campaign)",
    details: {
      date: "2026-07-17",
      rawDemand: 140,
      class: "PROMOTION",
      upliftFactor: 2.1,
      reason: "Scheduled Heatwave Awareness Campaign in promo calendar.",
    },
  },
  {
    id: "audit-05",
    at: "2026-10-11T09:15:00Z",
    kind: "import",
    decisionPath: "RULES",
    summary: "Loaded seeded demo catalog (6 products, 900 sales rows, seed 20261011)",
    details: {
      seed: 20261011,
      skus: ["ORS-01", "PCM-02", "INS-03", "FLU-04", "BND-05", "ANT-06"],
      rowsImported: 900,
      errors: 0,
    },
  },
];

// Helper to compute inventory recommendation and cost using packages/core
export function calculateProductPolicy(
  product: ProductRecord,
  serviceLevel: number,
  includeUnknowns = true
): {
  rec: InventoryRecommendation;
  cost: AnnualCostBreakdown;
  inventoryPosition: number;
  operationalRop: number;
  isOrderNow: boolean;
  daysCover: number;
  stockoutDate: string | null;
  demandShare: number;
  leadShare: number;
} {
  // If unknowns are excluded, slightly lower the standard deviation (removing the unexplained spike)
  const effectiveSd = !includeUnknowns && product.sku === "PCM-02" ? product.sdDemand * 0.85 : product.sdDemand;

  const input: InventoryInput = {
    meanDemand: product.meanDailyDemand,
    sdDemand: effectiveSd,
    leadTimeMean: product.leadTimeMean,
    leadTimeSd: product.leadTimeSd,
    serviceLevel,
    orderCost: product.orderCost,
    unitCost: product.unitCost,
    holdingRate: product.holdingRate,
    packSize: product.packSize,
    minOrderQty: product.minOrderQty,
    shortageCost: product.shortageCost,
  };

  const rec = recommend(input);
  const cost = annualCost(input, rec);
  const pos = product.onHand + product.onOrder;
  const operationalRop = rec.ropOperational;
  const isOrderNow = pos <= operationalRop;
  const cover = daysOfCover(pos, product.meanDailyDemand) ?? 0;
  const stockoutDate = isOrderNow ? projectedStockoutDate(new Date(), cover) : null;

  const totalVar = (rec.split.demand + rec.split.leadTime) || 1;
  const demandShare = Math.round((rec.split.demand / totalVar) * 100);
  const leadShare = Math.round((rec.split.leadTime / totalVar) * 100);

  return {
    rec,
    cost,
    inventoryPosition: pos,
    operationalRop,
    isOrderNow,
    daysCover: Number(cover.toFixed(1)),
    stockoutDate,
    demandShare,
    leadShare,
  };
}

// Scenario calculation helper using packages/core
export function simulateProductScenario(
  product: ProductRecord,
  serviceLevel: number,
  surgePct: number,
  delayDays: number
) {
  const baseInput: InventoryInput = {
    meanDemand: product.meanDailyDemand,
    sdDemand: product.sdDemand,
    leadTimeMean: product.leadTimeMean,
    leadTimeSd: product.leadTimeSd,
    serviceLevel,
    orderCost: product.orderCost,
    unitCost: product.unitCost,
    holdingRate: product.holdingRate,
    packSize: product.packSize,
    minOrderQty: product.minOrderQty,
    shortageCost: product.shortageCost,
  };

  const baseRec = recommend(baseInput);
  const baseCost = annualCost(baseInput, baseRec);

  const scenarioInput = applyScenario(baseInput, {
    surgePct,
    delayDays,
  });

  const scenarioRec = recommend(scenarioInput);
  const scenarioCost = annualCost(scenarioInput, scenarioRec);

  // Compute old policy stockout risk under new conditions
  const { sigma: newSigmaLT } = sigmaLT(scenarioInput);
  const oldRisk = oldPolicyRisk({
    oldRop: baseRec.rop,
    newMeanDemand: scenarioInput.meanDemand,
    newLeadTimeMean: scenarioInput.leadTimeMean,
    newSigmaLT,
  });

  // Seeded Monte Carlo cross-check (mulberry32 seed: 20261011)
  const mcSim = monteCarloStockout({
    meanDemand: scenarioInput.meanDemand,
    sdDemand: scenarioInput.sdDemand,
    leadMean: scenarioInput.leadTimeMean,
    leadSd: scenarioInput.leadTimeSd,
    rop: baseRec.rop,
    trials: 10000,
    seed: 20261011,
  });

  return {
    baseInput,
    baseRec,
    baseCost,
    scenarioInput,
    scenarioRec,
    scenarioCost,
    oldRisk,
    mcSim,
  };
}
