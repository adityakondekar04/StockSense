import { describe, it, expect } from "vitest";
import {
  movingAverage7,
  seasonalNaive,
  weekdaySeasonalSmoothing,
} from "../forecast";
import type { DailyDataPoint } from "../intermittency";

describe("Phase 3: Forecasting Models (Step 26)", () => {
  it("moving average matches hand-computed 10-day example", () => {
    // 10 days of values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    // Last 7 values: [40, 50, 60, 70, 80, 90, 100]
    // Sum = 490, Mean = 490 / 7 = 70
    const series: DailyDataPoint[] = [
      { date: "2026-06-01", value: 10 },
      { date: "2026-06-02", value: 20 },
      { date: "2026-06-03", value: 30 },
      { date: "2026-06-04", value: 40 },
      { date: "2026-06-05", value: 50 },
      { date: "2026-06-06", value: 60 },
      { date: "2026-06-07", value: 70 },
      { date: "2026-06-08", value: 80 },
      { date: "2026-06-09", value: 90 },
      { date: "2026-06-10", value: 100 },
    ];

    const horizon = 5;
    const forecast = movingAverage7(series, horizon);
    expect(forecast.length).toBe(horizon);
    expect(forecast.every((v) => v === 70)).toBe(true);
  });

  it("seasonal naive projects the same values from the previous 7 days", () => {
    const series: DailyDataPoint[] = [
      { date: "2026-06-01", value: 11 },
      { date: "2026-06-02", value: 22 },
      { date: "2026-06-03", value: 33 },
      { date: "2026-06-04", value: 44 },
      { date: "2026-06-05", value: 55 },
      { date: "2026-06-06", value: 66 },
      { date: "2026-06-07", value: 77 },
    ];

    const horizon = 7;
    const forecast = seasonalNaive(series, horizon);
    expect(forecast).toEqual([11, 22, 33, 44, 55, 66, 77]);
  });

  it("weekday seasonal smoothing adjusts forecasts according to weekday indices", () => {
    // 28 days of data with high weekends
    const series: DailyDataPoint[] = [];
    const d = new Date("2026-06-01T00:00:00Z"); // Monday
    for (let i = 0; i < 28; i++) {
      const dateStr = d.toISOString().slice(0, 10);
      const dow = d.getUTCDay();
      // Weekends 100, weekdays 50
      const val = dow === 0 || dow === 6 ? 100 : 50;
      series.push({ date: dateStr, value: val });
      d.setUTCDate(d.getUTCDate() + 1);
    }

    const { forecast, weekdayIndices } = weekdaySeasonalSmoothing(series, 7);
    expect(forecast.length).toBe(7);
    // Sunday (0) and Saturday (6) indices should be higher than Monday (1)
    expect(weekdayIndices[0]).toBeGreaterThan(weekdayIndices[1]);
    expect(weekdayIndices[6]).toBeGreaterThan(weekdayIndices[1]);
  });
});
