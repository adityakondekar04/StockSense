// packages/core/src/inventory.ts
// Pure inventory calculations: SS, ROP, EOQ, fill rate, annual cost, split

import { inverseNormalCDF, lossFn } from "./normal";



export interface InventoryInput {
  meanDemand: number;
  sdDemand: number;
  leadTimeMean: number;
  leadTimeSd: number;
  serviceLevel: number;
  orderCost: number;
  unitCost: number;
  holdingRate: number;
  shortageCost?: number;
  packSize?: number;
  minOrderQty?: number;
}

export interface ReorderPointResult {
  expectedLeadTimeDemand: number;
  safetyStock: number;
  raw: number;
  operational: number;
}

export interface InventoryRecommendation {
  z: number;
  ss: number;
  rop: number;
  ropOperational: number;
  eoq: number;
  q: number;
  eShort: number;
  fillRate: number;
  split: {
    demand: number;
    leadTime: number;
  };
}

export interface AnnualCostBreakdown {
  purchaseCost: number;
  orderingCost: number;
  holdingCost: number;
  shortageCost: number;
  totalAnnualCost: number;
}

/**
 * Safely sanitizes numbers to prevent NaN, undefined, negative, or infinite values.
 */
export function safeNonNegative(val: unknown): number {
  if (typeof val !== "number" || !Number.isFinite(val) || Number.isNaN(val)) {
    return 0;
  }
  return Math.max(0, val);
}

/**
 * Reorder Point calculation:
 * ROP = Expected Lead-Time Demand + Safety Stock
 *
 * For whole-unit inventory, the operational reorder threshold is rounded UP to the nearest whole unit (Math.ceil).
 * Full-precision value is preserved in `raw` for internal calculations.
 */
export function calculateReorderPoint(
  expectedLeadTimeDemand: number,
  safetyStock: number
): ReorderPointResult {
  const safeLTD = safeNonNegative(expectedLeadTimeDemand);
  const safeSS = safeNonNegative(safetyStock);
  const raw = safeLTD + safeSS;
  const operational = Math.ceil(raw);
  return {
    expectedLeadTimeDemand: safeLTD,
    safetyStock: safeSS,
    raw,
    operational,
  };
}

/**
 * Calculates ROP from constant average daily demand and lead time:
 * ROP = (Average Daily Demand × Lead Time in Days) + Safety Stock
 */
export function calculateReorderPointFromDaily(
  averageDailyDemand: number,
  leadTimeDays: number,
  safetyStock: number
): ReorderPointResult {
  const safeD = safeNonNegative(averageDailyDemand);
  const safeLT = safeNonNegative(leadTimeDays);
  return calculateReorderPoint(safeD * safeLT, safetyStock);
}

/**
 * Formats a reorder point value for display with operational ceiling and unit label.
 * E.g. formatReorderPoint(672.513703598497, "units") -> "673 units"
 */
export function formatReorderPoint(rop: number, unit = "units"): string {
  if (typeof rop !== "number" || !Number.isFinite(rop) || Number.isNaN(rop)) {
    return `0 ${unit}`.trim();
  }
  const operational = Math.ceil(Math.max(0, rop));
  return `${operational.toLocaleString()} ${unit}`.trim();
}

export function sigmaLT(i: InventoryInput): {
  sigma: number;
  demandPart: number;
  leadPart: number;
} {
  const meanD = safeNonNegative(i.meanDemand);
  const sdD = safeNonNegative(i.sdDemand);
  const meanLT = safeNonNegative(i.leadTimeMean);
  const sdLT = safeNonNegative(i.leadTimeSd);

  const demandPart = meanLT * (sdD ** 2);
  const leadPart = (meanD ** 2) * (sdLT ** 2);
  const variance = demandPart + leadPart;

  return {
    sigma: Math.sqrt(Math.max(0, variance)),
    demandPart,
    leadPart,
  };
}

export function recommend(i: InventoryInput): InventoryRecommendation {
  const rawSL = typeof i.serviceLevel === "number" && Number.isFinite(i.serviceLevel) ? i.serviceLevel : 0.95;
  const serviceLevel = Math.min(0.999, Math.max(0.5, rawSL));
  const z = inverseNormalCDF(serviceLevel);

  const meanD = safeNonNegative(i.meanDemand);
  const meanLT = safeNonNegative(i.leadTimeMean);

  const { sigma, demandPart, leadPart } = sigmaLT(i);

  // If demand or lead time is zero, SS is 0
  const ss = meanD > 0 && sigma > 0 ? z * sigma : 0;
  const expectedLeadTimeDemand = meanD * meanLT;
  const ropResult = calculateReorderPoint(expectedLeadTimeDemand, ss);
  const rop = ropResult.raw;
  const ropOperational = ropResult.operational;

  const D = meanD * 365;
  const H = safeNonNegative(safeNonNegative(i.holdingRate) * safeNonNegative(i.unitCost));
  const S = safeNonNegative(i.orderCost);

  let eoq = 0;
  if (D > 0 && H > 0 && S > 0) {
    eoq = Math.sqrt((2 * D * S) / H);
  }

  const pack = Math.max(1, Math.floor(safeNonNegative(i.packSize ?? 1)) || 1);
  const minOrder = Math.max(1, Math.floor(safeNonNegative(i.minOrderQty ?? 1)) || 1);
  const q = eoq > 0 ? Math.max(minOrder, Math.ceil(eoq / pack) * pack) : minOrder;

  const eShort = sigma > 0 ? sigma * lossFn(z) : 0;
  const fillRate = q > 0 ? Math.max(0, Math.min(1, 1 - eShort / q)) : 1;

  const totalVar = demandPart + leadPart;
  const split =
    totalVar > 0
      ? { demand: demandPart / totalVar, leadTime: leadPart / totalVar }
      : { demand: 1, leadTime: 0 };

  return {
    z,
    ss,
    rop,
    ropOperational,
    eoq,
    q,
    eShort,
    fillRate,
    split,
  };
}

export function annualCost(
  input: InventoryInput,
  rec: InventoryRecommendation
): AnnualCostBreakdown {
  const D = safeNonNegative(input.meanDemand) * 365;
  const c = safeNonNegative(input.unitCost);
  const S = safeNonNegative(input.orderCost);
  const H = safeNonNegative(safeNonNegative(input.holdingRate) * c);
  const p = safeNonNegative(input.shortageCost ?? 0);
  const Q = Math.max(1, safeNonNegative(rec.q));

  const cyclesPerYear = Q > 0 ? D / Q : 0;
  const purchaseCost = D * c;
  const orderingCost = cyclesPerYear * S;
  const holdingCost = (Q / 2 + safeNonNegative(rec.ss)) * H;
  const shortageCost = cyclesPerYear * safeNonNegative(rec.eShort) * p;
  const totalAnnualCost = purchaseCost + orderingCost + holdingCost + shortageCost;

  return {
    purchaseCost,
    orderingCost,
    holdingCost,
    shortageCost,
    totalAnnualCost,
  };
}

export function inventoryPosition(onHand: number, onOrder: number): number {
  return safeNonNegative(onHand) + safeNonNegative(onOrder);
}

export function daysOfCover(onHand: number, meanDemand: number): number | null {
  const safeD = safeNonNegative(meanDemand);
  if (safeD <= 0) return null;
  const safeOH = safeNonNegative(onHand);
  return safeOH / safeD;
}

export function projectedStockoutDate(today: Date, coverDays: number | null): string | null {
  if (coverDays === null || !Number.isFinite(coverDays) || isNaN(coverDays)) return null;
  const date = new Date(today);
  if (isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + Math.floor(Math.max(0, coverDays)));
  return date.toISOString().split("T")[0];
}
