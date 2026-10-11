import { describe, it, expect } from "vitest";
import { inverseNormalCDF, lossFn } from "../normal";
import { sigmaLT, recommend } from "../inventory";
import { applyScenario, oldPolicyRisk } from "../simulate";

describe("Phase 1: Math Foundation - Inventory & Normal Tests", () => {
  describe("T1: inverseNormalCDF", () => {
    it("matches verified z values at standard service levels to 4 decimals", () => {
      expect(inverseNormalCDF(0.80)).toBeCloseTo(0.8416, 4);
      expect(inverseNormalCDF(0.90)).toBeCloseTo(1.2816, 4);
      expect(inverseNormalCDF(0.95)).toBeCloseTo(1.6449, 4);
      expect(inverseNormalCDF(0.975)).toBeCloseTo(1.9600, 4);
      expect(inverseNormalCDF(0.99)).toBeCloseTo(2.3263, 4);
      expect(inverseNormalCDF(0.999)).toBeCloseTo(3.0902, 4);
    });
  });

  describe("T6: Loss function G(z)", () => {
    it("G(1.6449) ≈ 0.0209", () => {
      expect(lossFn(1.6449)).toBeCloseTo(0.0209, 4);
    });
  });

  describe("T2 to T5, T7, T10: Worked Example", () => {
    const input = {
      meanDemand: 100,
      sdDemand: 20,
      leadTimeMean: 5,
      leadTimeSd: 1,
      serviceLevel: 0.95,
      orderCost: 200,
      unitCost: 50,
      holdingRate: 0.2, // H = 10
      packSize: 50,
      minOrderQty: 100,
    };

    it("computes sigma_LT ≈ 109.54 (T2)", () => {
      const { sigma } = sigmaLT(input);
      expect(sigma).toBeCloseTo(109.54, 2);
    });

    it("computes SS ≈ 180.2 (T3)", () => {
      const res = recommend(input);
      expect(res.ss).toBeCloseTo(180.2, 1);
    });

    it("computes ROP ≈ 680.2 (T4)", () => {
      const res = recommend(input);
      expect(res.rop).toBeCloseTo(680.2, 1);
    });

    it("computes EOQ ≈ 1208.3 (T5)", () => {
      const res = recommend(input);
      expect(res.eoq).toBeCloseTo(1208.3, 1);
    });

    it("computes expected shortage eShort ≈ 2.29 and fill rate ≈ 0.998 (T7)", () => {
      const res = recommend(input);
      expect(res.eShort).toBeCloseTo(2.29, 2);
      expect(res.fillRate).toBeCloseTo(0.998, 3);
    });

    it("computes Q = 1250 with pack size 50 and MOQ 100 (T10)", () => {
      const res = recommend(input);
      expect(res.q).toBe(1250);
    });
  });

  describe("T8 & T9: Lead time variability isolation", () => {
    it("T8: σ_L = 0 reduces to demand-only formula (z * σ_d * sqrt(L̄) ≈ 73.5)", () => {
      const input = {
        meanDemand: 100,
        sdDemand: 20,
        leadTimeMean: 5,
        leadTimeSd: 0,
        serviceLevel: 0.95,
        orderCost: 200,
        unitCost: 50,
        holdingRate: 0.2,
      };
      const res = recommend(input);
      const demandOnlySS = res.z * input.sdDemand * Math.sqrt(input.leadTimeMean);
      expect(res.ss).toBeCloseTo(demandOnlySS, 4);
      expect(res.ss).toBeCloseTo(73.56, 1);
    });

    it("T9: doubling σ_d with σ_L = 0 doubles SS (ratio = 2.0)", () => {
      const input1 = {
        meanDemand: 100,
        sdDemand: 20,
        leadTimeMean: 5,
        leadTimeSd: 0,
        serviceLevel: 0.95,
        orderCost: 200,
        unitCost: 50,
        holdingRate: 0.2,
      };
      const input2 = { ...input1, sdDemand: 40 };
      const res1 = recommend(input1);
      const res2 = recommend(input2);
      expect(res2.ss / res1.ss).toBeCloseTo(2.0, 4);
    });
  });

  describe("T11 & T12: Scenario simulation and old policy risk", () => {
    it("T11: +40% surge and +3 days delay -> ROP 1384.6, SS 264.6, sigmaLT 160.8", () => {
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
      const scenarioInput = applyScenario(base, { surgePct: 40, delayDays: 3 });
      expect(scenarioInput.meanDemand).toBeCloseTo(140, 2);
      expect(scenarioInput.sdDemand).toBeCloseTo(28, 2);
      expect(scenarioInput.leadTimeMean).toBe(8);

      const { sigma } = sigmaLT(scenarioInput);
      expect(sigma).toBeCloseTo(160.8, 1);

      const rec = recommend(scenarioInput);
      expect(rec.ss).toBeCloseTo(264.6, 1);
      expect(rec.rop).toBeCloseTo(1384.6, 1);
    });

    it("T12: old policy ROP 680.2 under new conditions -> z ≈ -2.73, stockout probability ≈ 0.997", () => {
      const risk = oldPolicyRisk({
        oldRop: 680.2,
        newMeanDemand: 140,
        newLeadTimeMean: 8,
        newSigmaLT: 160.8,
      });
      expect(risk.zEffective).toBeCloseTo(-2.735, 2);
      expect(risk.stockoutProbability).toBeCloseTo(0.997, 3);
    });
  });

  describe("T13 & T14: Edge cases", () => {
    it("T13: service level 1.0 is capped at 0.999 without Infinity", () => {
      const res = recommend({
        meanDemand: 100,
        sdDemand: 20,
        leadTimeMean: 5,
        leadTimeSd: 1,
        serviceLevel: 1.0,
        orderCost: 200,
        unitCost: 50,
        holdingRate: 0.2,
      });
      expect(Number.isFinite(res.z)).toBe(true);
      expect(Number.isFinite(res.ss)).toBe(true);
      expect(Number.isFinite(res.rop)).toBe(true);
      expect(res.z).toBeCloseTo(3.0902, 4);
    });

    it("T14: handles zero demand, zero sigma, L̄ = 0, H = 0 with no NaN or Infinity", () => {
      const resZeroDemand = recommend({
        meanDemand: 0,
        sdDemand: 0,
        leadTimeMean: 0,
        leadTimeSd: 0,
        serviceLevel: 0.95,
        orderCost: 200,
        unitCost: 50,
        holdingRate: 0,
      });
      expect(Number.isNaN(resZeroDemand.ss)).toBe(false);
      expect(Number.isNaN(resZeroDemand.rop)).toBe(false);
      expect(Number.isNaN(resZeroDemand.eoq)).toBe(false);
      expect(Number.isNaN(resZeroDemand.fillRate)).toBe(false);
      expect(Number.isFinite(resZeroDemand.ss)).toBe(true);
      expect(Number.isFinite(resZeroDemand.rop)).toBe(true);
      expect(Number.isFinite(resZeroDemand.eoq)).toBe(true);
      expect(Number.isFinite(resZeroDemand.fillRate)).toBe(true);
      expect(resZeroDemand.ss).toBe(0);
      expect(resZeroDemand.rop).toBe(0);
    });
  });
});
