import { describe, it, expect } from "vitest";
import {
  timeSplit,
  mae,
  wape,
  bias,
  evaluateModels,
} from "../evaluate";
import type { DailyDataPoint } from "../intermittency";

describe("Phase 3: Leakage & Evaluation Tests (T30 - T34)", () => {
  describe("T31: Time Split Ordering", () => {
    it("ensures all train dates are strictly earlier than all holdout dates", () => {
      const series: DailyDataPoint[] = [];
      const d = new Date("2026-05-01T00:00:00Z");
      for (let i = 0; i < 50; i++) {
        series.push({ date: d.toISOString().slice(0, 10), value: 50 + i });
        d.setUTCDate(d.getUTCDate() + 1);
      }

      const { train, holdout } = timeSplit(series, 0.8);
      expect(train.length).toBe(40);
      expect(holdout.length).toBe(10);

      const maxTrainDate = train[train.length - 1].date;
      const minHoldoutDate = holdout[0].date;
      expect(maxTrainDate < minHoldoutDate).toBe(true);
    });
  });

  describe("T32 & T33: Metric Calculations (MAE, WAPE, Bias)", () => {
    it("T32: matches exactly on a hand-computed 5-point example", () => {
      // actuals:   [10, 20, 30, 40, 50]
      // forecasts: [12, 18, 33, 40, 45]
      // errors (forecast - actual): [+2, -2, +3, 0, -5]
      // abs errors: [2, 2, 3, 0, 5], sum = 12
      // sum actual = 150
      // MAE = 12 / 5 = 2.4
      // WAPE = 12 / 150 = 0.08
      // Bias = (+2 - 2 + 3 + 0 - 5) / 5 = -2 / 5 = -0.4
      const actuals = [10, 20, 30, 40, 50];
      const forecasts = [12, 18, 33, 40, 45];

      expect(mae(actuals, forecasts)).toBeCloseTo(2.4, 4);
      expect(wape(actuals, forecasts)).toBeCloseTo(0.08, 4);
      expect(bias(actuals, forecasts)).toBeCloseTo(-0.4, 4);
    });

    it("T33: WAPE returns null (not NaN) when sum of actuals is 0", () => {
      const actuals = [0, 0, 0, 0];
      const forecasts = [2, 1, 0, 3];

      const wapeVal = wape(actuals, forecasts);
      expect(wapeVal).toBeNull();
      expect(Number.isNaN(wapeVal)).toBe(false);
    });
  });

  describe("T30: Leakage Test (Fit on Training Only)", () => {
    it("changing every holdout value produces identical training-derived outputs", () => {
      const series1: DailyDataPoint[] = [];
      const d1 = new Date("2026-05-01T00:00:00Z");
      for (let i = 0; i < 50; i++) {
        series1.push({ date: d1.toISOString().slice(0, 10), value: 100 });
        d1.setUTCDate(d1.getUTCDate() + 1);
      }

      // Series 2 has the exact same 40 training days, but completely wild holdout values
      const series2: DailyDataPoint[] = series1.map((p, i) => {
        if (i >= 40) {
          // Mutate holdout values drastically
          return { date: p.date, value: 9999 + i * 50 };
        }
        return { ...p };
      });

      const res1 = evaluateModels(series1, 0.8);
      const res2 = evaluateModels(series2, 0.8);

      // Training metrics must be byte-for-byte identical
      expect(res1.trainingMetrics.mean).toBe(res2.trainingMetrics.mean);
      expect(res1.trainingMetrics.sd).toBe(res2.trainingMetrics.sd);
      expect(res1.trainingMetrics.alphaUsed).toBe(res2.trainingMetrics.alphaUsed);
      expect(res1.trainingMetrics.weekdayIndices).toEqual(res2.trainingMetrics.weekdayIndices);
    });
  });

  describe("T34: Model Selection & Baseline Wins Flag", () => {
    it("selects baseline when baseline MAE is lower, and sets baselineWins flag", () => {
      // Flat stable training data where moving average predicts the holdout better than a fluctuating seasonal model
      const series: DailyDataPoint[] = [];
      const d = new Date("2026-05-01T00:00:00Z");
      for (let i = 0; i < 40; i++) {
        series.push({ date: d.toISOString().slice(0, 10), value: 100 });
        d.setUTCDate(d.getUTCDate() + 1);
      }
      // Holdout values also exactly 100
      for (let i = 0; i < 10; i++) {
        series.push({ date: d.toISOString().slice(0, 10), value: 100 });
        d.setUTCDate(d.getUTCDate() + 1);
      }

      const res = evaluateModels(series, 0.8);
      expect(res.baselineWins).toBe(true);
      expect(res.selected).toBe("baseline");
    });
  });
});
