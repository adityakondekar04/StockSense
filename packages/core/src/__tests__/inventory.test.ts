import { describe, it, expect } from "vitest";
import { inverseNormalCDF, lossFn } from "../normal";
import {
  sigmaLT,
  recommend,
  calculateReorderPoint,
  calculateReorderPointFromDaily,
  formatReorderPoint,
  safeNonNegative,
} from "../inventory";
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
      expect(resZeroDemand.ropOperational).toBe(0);
    });
  });

  describe("Reorder Point (ROP) Calculations, Rounding & Formatting", () => {
    describe("Formula & Operational Rounding", () => {
      it("calculates ROP = Expected Lead-Time Demand + Safety Stock", () => {
        const result = calculateReorderPoint(500, 172.513703598497);
        expect(result.expectedLeadTimeDemand).toBe(500);
        expect(result.safetyStock).toBeCloseTo(172.513703598497, 6);
        expect(result.raw).toBeCloseTo(672.513703598497, 6);
        expect(result.operational).toBe(673);
      });

      it("calculates ROP from constant daily demand and lead time days", () => {
        // Average Daily Demand = 50, Lead Time = 10 days, Safety Stock = 172.5137...
        const result = calculateReorderPointFromDaily(50, 10, 172.513703598497);
        expect(result.expectedLeadTimeDemand).toBe(500);
        expect(result.raw).toBeCloseTo(672.513703598497, 6);
        expect(result.operational).toBe(673);
      });

      it("preserves exact integer values without extra rounding", () => {
        const result = calculateReorderPoint(100, 50);
        expect(result.raw).toBe(150);
        expect(result.operational).toBe(150);
      });

      it("rounds fractional operational threshold up using Math.ceil", () => {
        const result1 = calculateReorderPoint(10, 0.0001);
        expect(result1.raw).toBe(10.0001);
        expect(result1.operational).toBe(11);

        const result2 = calculateReorderPoint(26, 0.986006720127);
        expect(result2.raw).toBeCloseTo(26.986006720127, 6);
        expect(result2.operational).toBe(27);
      });
    });

    describe("Benchmark Product Validations (Requirement 6 & 7)", () => {
      it("PCM-02: current stock 300, raw ROP ≈ 672.5137, operational threshold 673 units (Status: Order Now)", () => {
        const pcmInput = {
          meanDemand: 50,
          sdDemand: 10,
          leadTimeMean: 10,
          leadTimeSd: 2.0,
          serviceLevel: 0.95,
          orderCost: 200,
          unitCost: 15,
          holdingRate: 0.2,
        };

        const rec = recommend(pcmInput);

        // Verify statistical components:
        // Expected Lead Time Demand = 50 * 10 = 500
        // Variance = 10 * 10^2 + 50^2 * 2^2 = 1000 + 10000 = 11000
        // sigma_LT = sqrt(11000) ≈ 104.88088
        // z(0.95) ≈ 1.64485
        // SS = 1.64485 * 104.88088 ≈ 172.513703598497
        // raw ROP = 500 + 172.513703598497 = 672.513703598497
        expect(rec.rop).toBeCloseTo(672.513703598497, 4);
        expect(rec.ropOperational).toBe(673);

        // Status comparison: current stock 300 <= operational threshold 673 -> Order Now
        const currentStock = 300;
        const isOrderNow = currentStock <= rec.ropOperational;
        expect(isOrderNow).toBe(true);
      });

      it("ANT-06: current stock 15, raw ROP ≈ 26.9860, operational threshold 27 units (Status: Order Now)", () => {
        const antInput = {
          meanDemand: 1.5,
          sdDemand: 2.1,
          leadTimeMean: 10,
          leadTimeSd: 2.0,
          serviceLevel: 0.95,
          orderCost: 400,
          unitCost: 1200,
          holdingRate: 0.3,
        };

        const rec = recommend(antInput);

        // Expected Lead Time Demand = 1.5 * 10 = 15
        // Variance = 10 * (2.1)^2 + (1.5)^2 * (2)^2 = 44.1 + 9 = 53.1
        // sigma_LT = sqrt(53.1) ≈ 7.28697
        // SS = 1.64485 * 7.28697 ≈ 11.986006720127
        // raw ROP = 15 + 11.986006720127 = 26.986006720127
        expect(rec.rop).toBeCloseTo(26.986006720127, 4);
        expect(rec.ropOperational).toBe(27);

        // Status comparison: current stock 15 <= operational threshold 27 -> Order Now
        const currentStock = 15;
        const isOrderNow = currentStock <= rec.ropOperational;
        expect(isOrderNow).toBe(true);
      });

      it("BND-05: current stock 210, raw ROP ≈ 197.7008, operational threshold 198 units (Status: In Stock / Adequate)", () => {
        const bndInput = {
          meanDemand: 25,
          sdDemand: 6,
          leadTimeMean: 6,
          leadTimeSd: 1.0,
          serviceLevel: 0.95,
          orderCost: 120,
          unitCost: 25,
          holdingRate: 0.2,
        };

        const rec = recommend(bndInput);

        // Expected Lead Time Demand = 25 * 6 = 150
        // Variance = 6 * (6)^2 + (25)^2 * (1)^2 = 216 + 625 = 841
        // sigma_LT = sqrt(841) = 29
        // SS = 1.64485 * 29 ≈ 47.700755128877
        // raw ROP = 150 + 47.700755128877 = 197.700755128877
        expect(rec.rop).toBeCloseTo(197.700755128877, 4);
        expect(rec.ropOperational).toBe(198);

        // Status comparison: current stock 210 <= operational threshold 198 is false -> Adequate
        const currentStock = 210;
        const isOrderNow = currentStock <= rec.ropOperational;
        expect(isOrderNow).toBe(false);
      });
    });

    describe("Boundary & Edge Conditions (Requirement 8)", () => {
      it("handles negative demand or negative safety stock safely", () => {
        const result = calculateReorderPoint(-50, -20);
        expect(result.expectedLeadTimeDemand).toBe(0);
        expect(result.safetyStock).toBe(0);
        expect(result.raw).toBe(0);
        expect(result.operational).toBe(0);
      });

      it("handles NaN, Infinity, and non-finite inputs safely without crashing", () => {
        const result1 = calculateReorderPoint(NaN, 50);
        expect(result1.expectedLeadTimeDemand).toBe(0);
        expect(result1.safetyStock).toBe(50);
        expect(result1.raw).toBe(50);
        expect(result1.operational).toBe(50);

        const result2 = calculateReorderPoint(100, Infinity);
        expect(result2.expectedLeadTimeDemand).toBe(100);
        expect(result2.safetyStock).toBe(0);
        expect(result2.raw).toBe(100);
        expect(result2.operational).toBe(100);

        expect(safeNonNegative(undefined)).toBe(0);
        expect(safeNonNegative(null)).toBe(0);
        expect(safeNonNegative("invalid")).toBe(0);
      });

      it("handles recommend() with zero demand and zero lead time", () => {
        const rec = recommend({
          meanDemand: 0,
          sdDemand: 0,
          leadTimeMean: 0,
          leadTimeSd: 0,
          serviceLevel: 0.95,
          orderCost: 100,
          unitCost: 10,
          holdingRate: 0.2,
        });
        expect(rec.rop).toBe(0);
        expect(rec.ropOperational).toBe(0);
        expect(rec.ss).toBe(0);
      });
    });

    describe("Display Formatting (Requirement 5)", () => {
      it("formats reorder point with ceiling and unit label", () => {
        expect(formatReorderPoint(672.513703598497)).toBe("673 units");
        expect(formatReorderPoint(26.986006720127)).toBe("27 units");
        expect(formatReorderPoint(197.700755128877)).toBe("198 units");
      });

      it("supports custom unit names", () => {
        expect(formatReorderPoint(197.700755128877, "rolls")).toBe("198 rolls");
        expect(formatReorderPoint(26.986006720127, "ampoules")).toBe("27 ampoules");
        expect(formatReorderPoint(1500.25, "boxes")).toBe("1,501 boxes");
      });

      it("formats exact integer values cleanly", () => {
        expect(formatReorderPoint(500)).toBe("500 units");
        expect(formatReorderPoint(0)).toBe("0 units");
      });

      it("formats invalid or negative inputs safely", () => {
        expect(formatReorderPoint(-10)).toBe("0 units");
        expect(formatReorderPoint(NaN)).toBe("0 units");
        expect(formatReorderPoint(Infinity)).toBe("0 units");
      });
    });
  });
});
