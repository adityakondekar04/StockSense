import { describe, it, expect } from "vitest";
import {
  detectAnomalies,
  classifyByRules,
  applyTreatment,
  weekdayMedians,
} from "../anomaly";
import type { DailyDataPoint } from "../intermittency";
import { generateDemoData, GENERATOR_SEED } from "../../../../data/generator";

describe("Phase 3: Anomaly Detection, Classification & Treatment (T20 - T28)", () => {
  // Helper to create date sequence
  function makeDates(n: number, startDate = "2026-06-01"): string[] {
    const dates: string[] = [];
    const d = new Date(startDate + "T00:00:00.000Z");
    for (let i = 0; i < n; i++) {
      dates.push(d.toISOString().slice(0, 10));
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return dates;
  }

  describe("T20 & T21: Data Errors (Planted 1000 digit slip & Negative value)", () => {
    it("T20: flags planted 1000 among values near 100 and classifies as DATA_ERROR (digit slip)", () => {
      const dates = makeDates(30);
      const series: DailyDataPoint[] = dates.map((date, i) => ({
        date,
        value: i === 15 ? 1000 : 100 + (i % 5),
      }));

      const flagged = detectAnomalies(series, { threshold: 3.5 });
      const spike = flagged.find((a) => a.date === dates[15]);
      expect(spike).toBeDefined();
      expect(spike?.value).toBe(1000);

      const classification = classifyByRules(spike!, { allSeries: series });
      expect(classification.class).toBe("DATA_ERROR");
      expect(classification.reason.toLowerCase()).toContain("digit-slip");
    });

    it("T21: classifies negative value as DATA_ERROR", () => {
      const dates = makeDates(30);
      const series: DailyDataPoint[] = dates.map((date, i) => ({
        date,
        value: i === 10 ? -40 : 50,
      }));

      const flagged = detectAnomalies(series, { threshold: 3.5 });
      const negativePoint = flagged.find((a) => a.date === dates[10]);
      expect(negativePoint).toBeDefined();

      const classification = classifyByRules(negativePoint!, { allSeries: series });
      expect(classification.class).toBe("DATA_ERROR");
      expect(classification.reason).toContain("Negative");
    });
  });

  describe("T22 & T23: Promotions (Promo window & Run rule)", () => {
    it("T22: classifies spike inside promo window as PROMOTION", () => {
      const dates = makeDates(30);
      const series: DailyDataPoint[] = dates.map((date, i) => ({
        date,
        value: i === 12 ? 250 : 50,
      }));

      const flagged = detectAnomalies(series, { threshold: 3.5 });
      const spike = flagged.find((a) => a.date === dates[12]);
      expect(spike).toBeDefined();

      const promoWindows = [
        {
          startDate: dates[10],
          endDate: dates[14],
          note: "Monsoon health camp",
        },
      ];

      const classification = classifyByRules(spike!, {
        allSeries: series,
        promoWindows,
      });
      expect(classification.class).toBe("PROMOTION");
      expect(classification.reason).toContain("Monsoon health camp");
    });

    it("T23: classifies a run of 3 elevated days as PROMOTION (run rule)", () => {
      const dates = makeDates(30);
      const series: DailyDataPoint[] = dates.map((date, i) => ({
        date,
        value: i >= 12 && i <= 14 ? 180 : 50,
      }));

      const flagged = detectAnomalies(series, { threshold: 3.5 });
      expect(flagged.length).toBeGreaterThanOrEqual(2);

      const day1 = flagged.find((a) => a.date === dates[12]);
      expect(day1).toBeDefined();

      const classification = classifyByRules(day1!, {
        allSeries: series,
        promoWindows: [],
      });
      expect(classification.class).toBe("PROMOTION");
      expect(classification.reason.toLowerCase()).toContain("run rule");
    });
  });

  describe("T24: Unknown Anomaly", () => {
    it("classifies isolated moderate spike without note or promo as UNKNOWN", () => {
      const dates = makeDates(30);
      const series: DailyDataPoint[] = dates.map((date, i) => ({
        date,
        value: i === 20 ? 160 : 50,
      }));

      const flagged = detectAnomalies(series, { threshold: 3.5 });
      const spike = flagged.find((a) => a.date === dates[20]);
      expect(spike).toBeDefined();

      const classification = classifyByRules(spike!, {
        allSeries: series,
        promoWindows: [],
      });
      expect(classification.class).toBe("UNKNOWN");
    });
  });

  describe("T25: MAD = 0 Fallback", () => {
    it("flags spike in constant series where MAD = 0 via IQR fallback", () => {
      const dates = makeDates(25);
      // All values 50 except one 200 spike
      const series: DailyDataPoint[] = dates.map((date, i) => ({
        date,
        value: i === 12 ? 200 : 50,
      }));

      const flagged = detectAnomalies(series, { threshold: 3.5 });
      expect(flagged.length).toBe(1);
      expect(flagged[0].date).toBe(dates[12]);
      expect(flagged[0].value).toBe(200);
    });
  });

  describe("T26: Weekday Patterns", () => {
    it("does not flag recurring high Saturdays when weekday median accounts for them", () => {
      // 5 weeks of data where Saturdays (day 6) are regularly 2x normal demand
      const dates = makeDates(35, "2026-06-01"); // 2026-06-01 is Monday
      const series: DailyDataPoint[] = dates.map((date) => {
        const dow = new Date(date + "T00:00:00Z").getUTCDay();
        return {
          date,
          value: dow === 6 ? 120 : 60, // Saturdays always 120, others 60
        };
      });

      const flagged = detectAnomalies(series, { threshold: 3.5 });
      // Regular high Saturdays should NOT be flagged as anomalies
      expect(flagged.length).toBe(0);
    });
  });

  describe("T27 & T28: Treatment Matrix", () => {
    it("T27: imputes DATA_ERROR with weekday median and sets imputedValue", () => {
      const dates = makeDates(35); // 5 weeks so weekday median is robust (4 x 50, 1 x 1000)
      const series: DailyDataPoint[] = dates.map((date, i) => ({
        date,
        value: i === 5 ? 1000 : 50,
      }));

      const medians = weekdayMedians(series);
      const flagged = detectAnomalies(series);
      const classified = flagged.map((a) => ({
        ...a,
        ...classifyByRules(a, { allSeries: series }),
      }));

      const treated = applyTreatment(series, classified, medians);
      const treatedPoint = treated.cleanedSeries.find((p) => p.date === dates[5]);
      expect(treatedPoint?.value).toBe(50); // imputed to weekday median

      const errorAnom = treated.anomalies.find((a) => a.date === dates[5]);
      expect(errorAnom?.imputedValue).toBe(50);
    });

    it("T28: withoutUnknowns series differs from cleanedSeries when UNKNOWN anomalies exist", () => {
      const dates = makeDates(35); // 5 weeks so weekday median is robust
      const series: DailyDataPoint[] = dates.map((date, i) => ({
        date,
        value: i === 5 ? 200 : 50,
      }));

      const medians = weekdayMedians(series);
      const flagged = detectAnomalies(series);
      const classified = flagged.map((a) => ({
        ...a,
        ...classifyByRules(a, { allSeries: series }),
      }));

      const treated = applyTreatment(series, classified, medians);
      // Cleaned series retains UNKNOWN value (200)
      const cleanPoint = treated.cleanedSeries.find((p) => p.date === dates[5]);
      expect(cleanPoint?.value).toBe(200);

      // withoutUnknowns replaces UNKNOWN with median (50)
      const withoutPoint = treated.withoutUnknowns.find((p) => p.date === dates[5]);
      expect(withoutPoint?.value).toBe(50);

      expect(treated.cleanedSeries).not.toEqual(treated.withoutUnknowns);
    });
  });

  describe("GATE 3: Demo Data Anomaly Classes", () => {
    it("flags and classifies anomalies across demo products into all 3 classes: DATA_ERROR, PROMOTION, and UNKNOWN", () => {
      const demo = generateDemoData(GENERATOR_SEED);

      const foundClasses = new Set<string>();

      for (const prod of demo.products) {
        const prodSales = demo.sales
          .filter((s: any) => s.sku === prod.sku)
          .map((s: any) => ({ date: s.date, value: s.units }));

        const prodPromos = demo.promos.filter((p: any) => p.sku === prod.sku);

        const detected = detectAnomalies(prodSales, { threshold: 3.5 });
        for (const anom of detected) {
          const classified = classifyByRules(anom, {
            allSeries: prodSales,
            promoWindows: prodPromos,
          });
          foundClasses.add(classified.class);
        }
      }

      expect(foundClasses.has("DATA_ERROR")).toBe(true);
      expect(foundClasses.has("PROMOTION")).toBe(true);
      expect(foundClasses.has("UNKNOWN")).toBe(true);
    });
  });
});
