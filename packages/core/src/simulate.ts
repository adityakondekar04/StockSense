// packages/core/src/simulate.ts
// Scenario application, analytic risk, and seeded Monte Carlo simulation

import { cdf } from "./normal";
import type { InventoryInput } from "./inventory";

export interface ScenarioParams {
  surgePct: number;
  delayDays: number;
  extraLeadTimeSd?: number;
}

export interface OldPolicyRiskResult {
  zEffective: number;
  stockoutProbability: number;
}

export interface MonteCarloInput {
  rop: number;
  meanDemand: number;
  sdDemand: number;
  leadMean: number;
  leadSd: number;
  trials?: number;
  seed?: number;
}

export interface MonteCarloResult {
  stockoutProbability: number;
  trials: number;
  seed: number;
}

export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function boxMuller(random: () => number): () => number {
  let haveSpare = false;
  let spare = 0;

  return function () {
    if (haveSpare) {
      haveSpare = false;
      return spare;
    }

    let u1 = random();
    let u2 = random();
    while (u1 <= 1e-15) {
      u1 = random();
    }

    const mag = Math.sqrt(-2.0 * Math.log(u1));
    const angle = 2.0 * Math.PI * u2;

    spare = mag * Math.sin(angle);
    haveSpare = true;
    return mag * Math.cos(angle);
  };
}

export function applyScenario(
  base: InventoryInput,
  params: ScenarioParams
): InventoryInput {
  const surgeFactor = 1 + params.surgePct / 100;
  return {
    ...base,
    meanDemand: Math.max(0, base.meanDemand * surgeFactor),
    sdDemand: Math.max(0, base.sdDemand * surgeFactor),
    leadTimeMean: Math.max(0, base.leadTimeMean + params.delayDays),
    leadTimeSd: Math.max(0, base.leadTimeSd + (params.extraLeadTimeSd ?? 0)),
  };
}

export function oldPolicyRisk(opts: {
  oldRop: number;
  newMeanDemand: number;
  newLeadTimeMean: number;
  newSigmaLT: number;
}): OldPolicyRiskResult {
  const newMeanLeadTimeDemand = opts.newMeanDemand * opts.newLeadTimeMean;
  if (opts.newSigmaLT <= 0) {
    return {
      zEffective: opts.oldRop >= newMeanLeadTimeDemand ? 999 : -999,
      stockoutProbability: opts.oldRop >= newMeanLeadTimeDemand ? 0 : 1,
    };
  }

  const zEffective = (opts.oldRop - newMeanLeadTimeDemand) / opts.newSigmaLT;
  // P(stockout per cycle) = 1 - Φ(z_effective) = Φ(-z_effective)
  const stockoutProbability = cdf(-zEffective);

  return {
    zEffective,
    stockoutProbability,
  };
}

export function monteCarloStockout(input: MonteCarloInput): MonteCarloResult {
  const trials = input.trials ?? 10000;
  const seed = input.seed ?? 42;
  const rng = mulberry32(seed);
  const nextNormal = boxMuller(rng);

  let stockouts = 0;

  for (let i = 0; i < trials; i++) {
    // 1. Lead time draw (at least 1 day integer)
    const rawLT = input.leadMean + input.leadSd * nextNormal();
    const leadDays = Math.max(1, Math.round(rawLT));

    // 2. Sum daily demand over lead time
    let leadTimeDemand = 0;
    for (let d = 0; d < leadDays; d++) {
      const dailyDraw = input.meanDemand + input.sdDemand * nextNormal();
      leadTimeDemand += Math.max(0, dailyDraw);
    }

    // 3. Stockout if demand exceeds ROP
    if (leadTimeDemand > input.rop) {
      stockouts++;
    }
  }

  return {
    stockoutProbability: stockouts / trials,
    trials,
    seed,
  };
}
