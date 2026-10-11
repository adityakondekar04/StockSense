// packages/core/src/forecast.ts
// Time-series forecasting models: 7-day Moving Average (Baseline), Seasonal Naive, and Weekday-Seasonal Exponential Smoothing

import type { DailyDataPoint } from "./intermittency";
import { getDayOfWeek } from "./anomaly";

export function movingAverage7(series: DailyDataPoint[], horizon: number): number[] {
  if (series.length === 0 || horizon <= 0) return Array(Math.max(0, horizon)).fill(0);

  const windowSize = Math.min(7, series.length);
  const lastN = series.slice(-windowSize);
  const sum = lastN.reduce((acc, p) => acc + p.value, 0);
  const mean = sum / windowSize;

  return Array(horizon).fill(mean);
}

export function seasonalNaive(series: DailyDataPoint[], horizon: number): number[] {
  if (series.length === 0 || horizon <= 0) return Array(Math.max(0, horizon)).fill(0);

  const result: number[] = [];
  const windowSize = Math.min(7, series.length);
  const lastWeek = series.slice(-windowSize);

  for (let h = 0; h < horizon; h++) {
    const val = lastWeek[h % windowSize].value;
    result.push(val);
  }

  return result;
}

export function weekdaySeasonalSmoothing(
  series: DailyDataPoint[],
  horizon: number,
  opts?: { alpha?: number }
): { forecast: number[]; alphaUsed: number; weekdayIndices: number[] } {
  if (series.length === 0 || horizon <= 0) {
    return {
      forecast: Array(Math.max(0, horizon)).fill(0),
      alphaUsed: 0.3,
      weekdayIndices: Array(7).fill(1),
    };
  }

  // 1. Compute overall mean and weekday indices
  const overallSum = series.reduce((acc, p) => acc + p.value, 0);
  const overallMean = overallSum / series.length;

  const weekdaySums = Array(7).fill(0);
  const weekdayCounts = Array(7).fill(0);

  for (const point of series) {
    const dow = getDayOfWeek(point.date);
    weekdaySums[dow] += point.value;
    weekdayCounts[dow]++;
  }

  const weekdayIndices: number[] = Array(7).fill(1);
  if (overallMean > 0) {
    for (let d = 0; d < 7; d++) {
      if (weekdayCounts[d] > 0) {
        const dMean = weekdaySums[d] / weekdayCounts[d];
        weekdayIndices[d] = Math.max(0.01, dMean / overallMean);
      }
    }
  }

  // 2. Deseasonalize series
  const deseasonalized = series.map((p) => {
    const dow = getDayOfWeek(p.date);
    const idx = weekdayIndices[dow];
    return p.value / idx;
  });

  // 3. Select alpha (0.2, 0.3, 0.4) on the last 14 training points if not specified
  let chosenAlpha = opts?.alpha ?? 0.3;
  if (opts?.alpha === undefined && deseasonalized.length > 14) {
    const candidateAlphas = [0.2, 0.3, 0.4];
    let bestError = Infinity;
    const testWindow = deseasonalized.slice(-14);

    for (const alpha of candidateAlphas) {
      let level = deseasonalized[0];
      let errorSum = 0;
      for (let i = 1; i < deseasonalized.length; i++) {
        const pred = level;
        if (i >= deseasonalized.length - 14) {
          errorSum += Math.abs(testWindow[i - (deseasonalized.length - 14)] - pred);
        }
        level = alpha * deseasonalized[i] + (1 - alpha) * level;
      }
      if (errorSum < bestError) {
        bestError = errorSum;
        chosenAlpha = alpha;
      }
    }
  }

  // 4. Run exponential smoothing to find final level
  let level = deseasonalized[0];
  for (let i = 1; i < deseasonalized.length; i++) {
    level = chosenAlpha * deseasonalized[i] + (1 - chosenAlpha) * level;
  }

  // 5. Generate forecasts over horizon
  const forecast: number[] = [];
  const lastDate = new Date(series[series.length - 1].date + "T00:00:00.000Z");

  for (let h = 1; h <= horizon; h++) {
    const futureDate = new Date(lastDate);
    futureDate.setUTCDate(futureDate.getUTCDate() + h);
    const futureDow = futureDate.getUTCDay();
    const futureIdx = weekdayIndices[futureDow];
    forecast.push(Math.max(0, level * futureIdx));
  }

  return {
    forecast,
    alphaUsed: chosenAlpha,
    weekdayIndices,
  };
}
