// packages/core/src/evaluate.ts
// Holdout evaluation metrics (MAE, WAPE, Bias), leakage-proof time split, and model selection

import type { DailyDataPoint } from "./intermittency";
import { movingAverage7, weekdaySeasonalSmoothing } from "./forecast";

export interface EvaluationMetrics {
  mae: number;
  wape: number | null;
  bias: number;
}

export interface ModelEvaluationResult {
  baseline: EvaluationMetrics;
  model: EvaluationMetrics;
  selected: "baseline" | "model";
  baselineWins: boolean;
  holdoutDays: number;
  trainingMetrics: {
    mean: number;
    sd: number;
    alphaUsed: number;
    weekdayIndices: number[];
  };
}

export function timeSplit<T extends { date: string }>(
  series: T[],
  ratio = 0.8
): { train: T[]; holdout: T[] } {
  if (series.length === 0) {
    return { train: [], holdout: [] };
  }

  // Sort by date ascending to ensure strict temporal order
  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));
  const splitIndex = Math.max(1, Math.floor(sorted.length * ratio));

  return {
    train: sorted.slice(0, splitIndex),
    holdout: sorted.slice(splitIndex),
  };
}

export function mae(actuals: number[], forecasts: number[]): number {
  if (actuals.length === 0 || actuals.length !== forecasts.length) return 0;
  const sumAbsError = actuals.reduce((acc, y, i) => acc + Math.abs(y - forecasts[i]), 0);
  return sumAbsError / actuals.length;
}

export function wape(actuals: number[], forecasts: number[]): number | null {
  if (actuals.length === 0 || actuals.length !== forecasts.length) return null;
  const sumActual = actuals.reduce((acc, y) => acc + y, 0);
  if (sumActual === 0) return null; // Undefined when sum actual is 0 (T33)
  const sumAbsError = actuals.reduce((acc, y, i) => acc + Math.abs(y - forecasts[i]), 0);
  return sumAbsError / sumActual;
}

export function bias(actuals: number[], forecasts: number[]): number {
  if (actuals.length === 0 || actuals.length !== forecasts.length) return 0;
  // Bias = mean(forecast - actual)
  const sumDiff = actuals.reduce((acc, y, i) => acc + (forecasts[i] - y), 0);
  return sumDiff / actuals.length;
}

export function computeMetrics(actuals: number[], forecasts: number[]): EvaluationMetrics {
  return {
    mae: mae(actuals, forecasts),
    wape: wape(actuals, forecasts),
    bias: bias(actuals, forecasts),
  };
}

export function evaluateModels(
  series: DailyDataPoint[],
  ratio = 0.8
): ModelEvaluationResult {
  const { train, holdout } = timeSplit(series, ratio);
  const holdoutDays = holdout.length;

  if (holdoutDays === 0) {
    throw new Error("Holdout window cannot be empty");
  }

  const actuals = holdout.map((p) => p.value);

  // 1. Train baseline (7-day MA) on TRAIN ONLY
  const baselineForecast = movingAverage7(train, holdoutDays);
  const baselineMetrics = computeMetrics(actuals, baselineForecast);

  // 2. Train weekday-seasonal smoothing model on TRAIN ONLY
  const modelResult = weekdaySeasonalSmoothing(train, holdoutDays);
  const modelMetrics = computeMetrics(actuals, modelResult.forecast);

  // 3. Model selection: winner by lower MAE
  const baselineWins = baselineMetrics.mae <= modelMetrics.mae;
  const selected: "baseline" | "model" = baselineWins ? "baseline" : "model";

  // Compute training statistics for audit & leakage testing
  const trainSum = train.reduce((acc, p) => acc + p.value, 0);
  const trainMean = trainSum / train.length;
  const trainVar = train.reduce((acc, p) => acc + (p.value - trainMean) ** 2, 0) / (train.length || 1);
  const trainSd = Math.sqrt(trainVar);

  return {
    baseline: baselineMetrics,
    model: modelMetrics,
    selected,
    baselineWins,
    holdoutDays,
    trainingMetrics: {
      mean: trainMean,
      sd: trainSd,
      alphaUsed: modelResult.alphaUsed,
      weekdayIndices: modelResult.weekdayIndices,
    },
  };
}
