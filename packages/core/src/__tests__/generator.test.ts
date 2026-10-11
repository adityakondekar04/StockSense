import { describe, it, expect } from "vitest";
import { generateDemoData, GENERATOR_SEED } from "../../../../data/generator";

describe("Step 17: Seeded Demo Generator", () => {
  it("produces identical data when called twice with the same seed", () => {
    const run1 = generateDemoData(GENERATOR_SEED);
    const run2 = generateDemoData(GENERATOR_SEED);
    expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
  });

  it("generates exactly 6 products and 150 days of sales per product (900 rows total)", () => {
    const data = generateDemoData(GENERATOR_SEED);
    expect(data.products.length).toBe(6);
    expect(data.sales.length).toBe(6 * 150);
  });

  it("plants the digit slip (1000) on BND-05 at 2026-08-14", () => {
    const data = generateDemoData(GENERATOR_SEED);
    const row = data.sales.find((s) => s.sku === "BND-05" && s.date === "2026-08-14");
    expect(row).toBeDefined();
    expect(row?.units).toBe(1000);
  });

  it("plants the negative value (-40) on PCM-02 at 2026-08-20", () => {
    const data = generateDemoData(GENERATOR_SEED);
    const row = data.sales.find((s) => s.sku === "PCM-02" && s.date === "2026-08-20");
    expect(row).toBeDefined();
    expect(row?.units).toBe(-40);
  });

  it("plants the 3x unexplained spike (300) on PCM-02 at 2026-09-05", () => {
    const data = generateDemoData(GENERATOR_SEED);
    const row = data.sales.find((s) => s.sku === "PCM-02" && s.date === "2026-09-05");
    expect(row).toBeDefined();
    expect(row?.units).toBe(300);
  });

  it("plants the ORS-01 promo window from 2026-07-15 to 2026-07-19", () => {
    const data = generateDemoData(GENERATOR_SEED);
    const promo = data.promos.find((p) => p.sku === "ORS-01");
    expect(promo).toBeDefined();
    expect(promo?.startDate).toBe("2026-07-15");
    expect(promo?.endDate).toBe("2026-07-19");
  });

  it("ensures ANT-06 is intermittent with > 40% zero sales days", () => {
    const data = generateDemoData(GENERATOR_SEED);
    const antSales = data.sales.filter((s) => s.sku === "ANT-06");
    const zeroDays = antSales.filter((s) => s.units === 0).length;
    const zeroShare = zeroDays / antSales.length;
    expect(zeroShare).toBeGreaterThan(0.40);
  });
});
