import { describe, it, expect } from "vitest";
import {
  ProductInputSchema,
  SaleRowSchema,
  PromoRowSchema,
  LeadTimeRowSchema,
  ClassifySchema,
  ScenarioSchema,
} from "../schemas";

describe("Step 16: Zod Schemas Validation", () => {
  it("rejects a product row with a negative lead time with a specific message", () => {
    const invalidProduct = {
      sku: "TEST-01",
      name: "Test Medicine",
      unitCost: 10,
      orderCost: 50,
      holdingRate: 0.2,
      leadTimeMean: -5, // negative
      leadTimeSd: 1,
    };
    const result = ProductInputSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.path.includes("leadTimeMean"))).toBe(true);
      expect(result.error.errors.some((e) => e.message.toLowerCase().includes("non-negative"))).toBe(true);
    }
  });

  it("rejects a sale row with a text quantity with a specific message", () => {
    const invalidSale = {
      sku: "TEST-01",
      date: "2026-08-14",
      units: "abc", // invalid text
    };
    const result = SaleRowSchema.safeParse(invalidSale);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.path.includes("units"))).toBe(true);
    }
  });

  it("rejects a sale row with an invalid date format", () => {
    const invalidDate = {
      sku: "TEST-01",
      date: "invalid-date",
      units: 100,
    };
    const result = SaleRowSchema.safeParse(invalidDate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message.includes("Invalid date format"))).toBe(true);
    }
  });

  it("validates promo date order (endDate >= startDate)", () => {
    const invalidPromo = {
      sku: "TEST-01",
      startDate: "2026-08-10",
      endDate: "2026-08-05", // earlier
    };
    const result = PromoRowSchema.safeParse(invalidPromo);
    expect(result.success).toBe(false);
  });

  it("validates lead time record dates (receivedDate >= orderDate)", () => {
    const invalidLT = {
      sku: "TEST-01",
      orderDate: "2026-08-10",
      receivedDate: "2026-08-05",
    };
    const result = LeadTimeRowSchema.safeParse(invalidLT);
    expect(result.success).toBe(false);
  });

  it("enforces strict schema on ClassifySchema (rejects unexpected properties)", () => {
    const extraField = {
      class: "PROMOTION",
      adjustmentPct: 15,
      reason: "Sale promotion",
      unwanted: "injection",
    };
    const result = ClassifySchema.safeParse(extraField);
    expect(result.success).toBe(false);
  });

  it("enforces strict schema on ScenarioSchema", () => {
    const extraField = {
      surgePct: 20,
      delayDays: 3,
      referencedText: "Supplier delay",
      malicious: true,
    };
    const result = ScenarioSchema.safeParse(extraField);
    expect(result.success).toBe(false);
  });
});
