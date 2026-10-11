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

export interface InventoryRecommendation {
  z: number;
  ss: number;
  rop: number;
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

export function sigmaLT(i: InventoryInput): {
  sigma: number;
  demandPart: number;
  leadPart: number;
} {
  const meanD = Math.max(0, i.meanDemand);
  const sdD = Math.max(0, i.sdDemand);
  const meanLT = Math.max(0, i.leadTimeMean);
  const sdLT = Math.max(0, i.leadTimeSd);

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
  const serviceLevel = Math.min(0.999, Math.max(0.5, i.serviceLevel));
  const z = inverseNormalCDF(serviceLevel);

  const meanD = Math.max(0, i.meanDemand);
  const meanLT = Math.max(0, i.leadTimeMean);

  const { sigma, demandPart, leadPart } = sigmaLT(i);

  // If demand or lead time is zero, SS is 0
  const ss = meanD > 0 && sigma > 0 ? z * sigma : 0;
  const rop = meanD * meanLT + ss;

  const D = meanD * 365;
  const H = Math.max(0, i.holdingRate * i.unitCost);
  const S = Math.max(0, i.orderCost);

  let eoq = 0;
  if (D > 0 && H > 0 && S > 0) {
    eoq = Math.sqrt((2 * D * S) / H);
  }

  const pack = Math.max(1, i.packSize ?? 1);
  const minOrder = Math.max(1, i.minOrderQty ?? 1);
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
  const D = Math.max(0, input.meanDemand) * 365;
  const c = Math.max(0, input.unitCost);
  const S = Math.max(0, input.orderCost);
  const H = Math.max(0, input.holdingRate * c);
  const p = Math.max(0, input.shortageCost ?? 0);
  const Q = Math.max(1, rec.q);

  const cyclesPerYear = Q > 0 ? D / Q : 0;
  const purchaseCost = D * c;
  const orderingCost = cyclesPerYear * S;
  const holdingCost = (Q / 2 + rec.ss) * H;
  const shortageCost = cyclesPerYear * rec.eShort * p;
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
  return onHand + onOrder;
}

export function daysOfCover(onHand: number, meanDemand: number): number | null {
  if (meanDemand <= 0) return null;
  return Math.max(0, onHand / meanDemand);
}

export function projectedStockoutDate(today: Date, coverDays: number | null): string | null {
  if (coverDays === null || !Number.isFinite(coverDays)) return null;
  const date = new Date(today);
  date.setDate(date.getDate() + Math.floor(coverDays));
  return date.toISOString().split("T")[0];
}
