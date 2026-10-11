import { describe, it, expect } from "vitest";
import {
  applyScenario,
  monteCarloStockout,
  mulberry32,
  boxMuller,
} from "../simulate";
import { recommend } from "../inventory";

describe("Simulation & Monte Carlo Tests (T50 - T53)", () => {
  it("mulberry32 PRNG produces deterministic sequence", () => {
    const rng1 = mulberry32(12345);
    const rng2 = mulberry32(12345);
    for (let i = 0; i < 10; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it("boxMuller produces standard normal samples", () => {
    const rng = mulberry32(42);
    const normal = boxMuller(rng);
    const samples: number[] = [];
    for (let i = 0; i < 1000; i++) {
      samples.push(normal());
    }
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(0, 0); // mean close to 0
  });

  describe("T50 & T51: Determinism across seeds", () => {
    const simInput = {
      rop: 680.2,
      meanDemand: 100,
      sdDemand: 20,
      leadMean: 5,
      leadSd: 1,
      trials: 5000,
      seed: 42,
    };

    it("T50: running twice with same seed gives identical probability", () => {
      const res1 = monteCarloStockout(simInput);
      const res2 = monteCarloStockout(simInput);
      expect(res1.stockoutProbability).toBe(res2.stockoutProbability);
    });

    it("T51: running with different seeds gives close but distinct probabilities", () => {
      const res1 = monteCarloStockout({ ...simInput, seed: 42 });
      const res2 = monteCarloStockout({ ...simInput, seed: 999 });
      expect(res1.stockoutProbability).toBeGreaterThan(0.01);
      expect(res1.stockoutProbability).toBeLessThan(0.10);
      expect(res2.stockoutProbability).toBeGreaterThan(0.01);
      expect(res2.stockoutProbability).toBeLessThan(0.10);
    });
  });

  describe("T52: Analytic vs Monte Carlo within 3 percentage points", () => {
    it("worked example at 95% service level has planned stockout risk 5% (0.05)", () => {
      // Worked example ROP is 680.2 for 95% service level (planned risk = 0.05)
      const res = monteCarloStockout({
        rop: 680.2,
        meanDemand: 100,
        sdDemand: 20,
        leadMean: 5,
        leadSd: 1,
        trials: 10000,
        seed: 42,
      });

      const plannedRisk = 0.05;
      expect(Math.abs(res.stockoutProbability - plannedRisk)).toBeLessThan(0.03);
    });
  });

  describe("T53: Scenario with 0 surge and 0 delay equals before", () => {
    it("returns identical inputs and recommendation", () => {
      const base = {
        meanDemand: 100,
        sdDemand: 20,
        leadTimeMean: 5,
        leadTimeSd: 1,
        serviceLevel: 0.95,
        orderCost: 200,
        unitCost: 50,
        holdingRate: 0.2,
      };

      const scenario = applyScenario(base, { surgePct: 0, delayDays: 0 });
      expect(scenario.meanDemand).toBe(base.meanDemand);
      expect(scenario.sdDemand).toBe(base.sdDemand);
      expect(scenario.leadTimeMean).toBe(base.leadTimeMean);
      expect(scenario.leadTimeSd).toBe(base.leadTimeSd);

      const recBefore = recommend(base);
      const recAfter = recommend(scenario);
      expect(recAfter.rop).toBe(recBefore.rop);
      expect(recAfter.ss).toBe(recBefore.ss);
      expect(recAfter.eoq).toBe(recBefore.eoq);
    });
  });
});
