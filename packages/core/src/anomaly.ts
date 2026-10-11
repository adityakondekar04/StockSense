// packages/core/src/anomaly.ts
// Weekday adjustment, modified z-score outlier detection, rule-based classification, and treatment matrix

import type { DailyDataPoint } from "./intermittency";
import type { AnomalyClass, DecisionPath } from "./schemas";

export interface PromoWindow {
  startDate: string;
  endDate: string;
  note?: string | null;
}

export interface DetectedAnomaly {
  date: string;
  value: number;
  modifiedZ: number;
  weekdayMedian: number;
  residual: number;
}

export interface ClassifiedAnomaly extends DetectedAnomaly {
  class: AnomalyClass;
  reason: string;
  decisionPath: DecisionPath;
  imputedValue?: number;
  upliftFactor?: number;
}

export interface TreatmentResult {
  cleanedSeries: DailyDataPoint[];
  withoutUnknowns: DailyDataPoint[];
  anomalies: ClassifiedAnomaly[];
  promotions: Array<{ date: string; upliftFactor: number }>;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  const idx = p * (sortedValues.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  const weight = idx - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

export function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T00:00:00.000Z").getUTCDay(); // 0 = Sunday
}

export function weekdayMedians(trainSeries: DailyDataPoint[]): number[] {
  const dayGroups: number[][] = Array.from({ length: 7 }, () => []);
  for (const point of trainSeries) {
    const dow = getDayOfWeek(point.date);
    dayGroups[dow].push(point.value);
  }

  const overallMedian = median(trainSeries.map((p) => p.value));
  return dayGroups.map((values) => (values.length > 0 ? median(values) : overallMedian));
}

export function residuals(series: DailyDataPoint[], medians: number[]): number[] {
  return series.map((p) => {
    const dow = getDayOfWeek(p.date);
    return p.value - medians[dow];
  });
}

export function detectAnomalies(
  series: DailyDataPoint[],
  opts?: {
    threshold?: number;
    trainEndIndex?: number;
  }
): DetectedAnomaly[] {
  if (series.length === 0) return [];

  const threshold = opts?.threshold ?? 3.5;
  const trainEnd = opts?.trainEndIndex !== undefined ? opts.trainEndIndex : series.length;
  const trainSlice = series.slice(0, trainEnd);

  if (trainSlice.length === 0) return [];

  // Compute stats on TRAINING window only
  const medians = weekdayMedians(trainSlice);
  const trainRes = residuals(trainSlice, medians);

  const medR = median(trainRes);
  const absDeviations = trainRes.map((r) => Math.abs(r - medR));
  const mad = median(absDeviations);

  // Compute IQR fallback on training residuals if MAD == 0
  const sortedTrainRes = [...trainRes].sort((a, b) => a - b);
  const q1 = percentile(sortedTrainRes, 0.25);
  const q3 = percentile(sortedTrainRes, 0.75);
  const iqr = q3 - q1;

  const detected: DetectedAnomaly[] = [];

  for (let i = 0; i < series.length; i++) {
    const p = series[i];
    const dow = getDayOfWeek(p.date);
    const wMedian = medians[dow];
    const res = p.value - wMedian;

    let flag = false;
    let modifiedZ = 0;

    if (mad > 0) {
      modifiedZ = (0.6745 * (res - medR)) / mad;
      flag = Math.abs(modifiedZ) > threshold;
    } else {
      // MAD is 0 -> fallback to IQR
      if (iqr > 0) {
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        flag = res < lowerBound || res > upperBound;
        modifiedZ = (res - medR) / (iqr || 1);
      } else {
        // All training residuals are identical
        flag = res !== medR;
        modifiedZ = res !== medR ? (res > medR ? 99 : -99) : 0;
      }
    }

    if (flag) {
      detected.push({
        date: p.date,
        value: p.value,
        modifiedZ,
        weekdayMedian: wMedian,
        residual: res,
      });
    }
  }

  return detected;
}

export interface AnomalyContext {
  allSeries: DailyDataPoint[];
  promoWindows?: PromoWindow[];
  note?: string | null;
}

export function classifyByRules(
  anomaly: DetectedAnomaly,
  context: AnomalyContext
): { class: AnomalyClass; reason: string; decisionPath: DecisionPath } {
  const { value, weekdayMedian, date } = anomaly;
  const { allSeries, promoWindows = [], note } = context;

  // 1. Hard Data Error Rules
  if (value < 0) {
    return {
      class: "DATA_ERROR",
      reason: `Negative sales recorded: ${value}`,
      decisionPath: "RULES",
    };
  }

  if (value === 9999 || value === 99999) {
    return {
      class: "DATA_ERROR",
      reason: `Sentinel error value: ${value}`,
      decisionPath: "RULES",
    };
  }

  if (weekdayMedian > 0 && value > 10 * weekdayMedian) {
    // Check if it's a 10x digit slip vs neighbours
    const idx = allSeries.findIndex((p) => p.date === date);
    const left = idx > 0 ? allSeries[idx - 1]?.value : undefined;
    const right = idx < allSeries.length - 1 ? allSeries[idx + 1]?.value : undefined;

    if (left !== undefined && right !== undefined && left > 0 && right > 0) {
      const ratioL = value / left;
      const ratioR = value / right;
      if (
        (ratioL >= 7 && ratioL <= 13 && ratioR >= 7 && ratioR <= 13) ||
        (ratioL >= 70 && ratioL <= 130 && ratioR >= 70 && ratioR <= 130)
      ) {
        return {
          class: "DATA_ERROR",
          reason: `10x digit-slip error vs neighbours (${left}, ${right})`,
          decisionPath: "RULES",
        };
      }
    }

    return {
      class: "DATA_ERROR",
      reason: `Value ${value} exceeds 10x weekday median (${weekdayMedian})`,
      decisionPath: "RULES",
    };
  }

  // Check digit-slip against neighbours even if under 10x median
  const idx = allSeries.findIndex((p) => p.date === date);
  const left = idx > 0 ? allSeries[idx - 1]?.value : undefined;
  const right = idx < allSeries.length - 1 ? allSeries[idx + 1]?.value : undefined;
  if (left !== undefined && right !== undefined && left > 0 && right > 0) {
    const ratioL = value / left;
    const ratioR = value / right;
    if (
      (ratioL >= 8 && ratioL <= 12 && ratioR >= 8 && ratioR <= 12) ||
      (ratioL >= 80 && ratioL <= 120 && ratioR >= 80 && ratioR <= 120)
    ) {
      return {
        class: "DATA_ERROR",
        reason: `10x digit-slip error vs neighbours (${left}, ${right})`,
        decisionPath: "RULES",
      };
    }
  }

  // 2. Promotion Window Rule
  const inPromo = promoWindows.find((pw) => date >= pw.startDate && date <= pw.endDate);
  if (inPromo) {
    return {
      class: "PROMOTION",
      reason: `Inside recorded promotion window: "${inPromo.note ?? "Scheduled promo"}"`,
      decisionPath: "RULES",
    };
  }

  // 3. Run Rule: consecutive elevated days (>= 2 consecutive flagged days)
  if (idx !== -1) {
    const prevDate = idx > 0 ? allSeries[idx - 1].date : null;
    const nextDate = idx < allSeries.length - 1 ? allSeries[idx + 1].date : null;

    // Check if yesterday or tomorrow was also elevated
    const prevResidual = idx > 0 ? allSeries[idx - 1].value - weekdayMedian : 0;
    const nextResidual = idx < allSeries.length - 1 ? allSeries[idx + 1].value - weekdayMedian : 0;

    if (
      (prevDate && prevResidual > 1.5 * weekdayMedian) ||
      (nextDate && nextResidual > 1.5 * weekdayMedian)
    ) {
      return {
        class: "PROMOTION",
        reason: "Multi-day consecutive demand elevation (run rule >= 2 days)",
        decisionPath: "RULES",
      };
    }
  }

  // 4. Keyword Hint from User Note (if provided)
  if (note && note.trim().length > 0) {
    const lower = note.toLowerCase();
    if (/(sale|offer|festival|discount|campaign|monsoon|camp)/i.test(lower)) {
      return {
        class: "PROMOTION",
        reason: `Promotion indicated by user note: "${note}"`,
        decisionPath: "RULES",
      };
    }
    if (/(typo|error|wrong|mistake|entered|miskey)/i.test(lower)) {
      return {
        class: "DATA_ERROR",
        reason: `Data error indicated by user note: "${note}"`,
        decisionPath: "RULES",
      };
    }
  }

  // 5. Default Fallback
  return {
    class: "UNKNOWN",
    reason: "Isolated unexplained demand spike",
    decisionPath: "RULES",
  };
}

export function applyTreatment(
  series: DailyDataPoint[],
  anomalies: ClassifiedAnomaly[],
  medians: number[]
): TreatmentResult {
  const anomalyMap = new Map<string, ClassifiedAnomaly>(
    anomalies.map((a) => [a.date, a])
  );

  const cleanedSeries: DailyDataPoint[] = [];
  const withoutUnknowns: DailyDataPoint[] = [];
  const promotions: Array<{ date: string; upliftFactor: number }> = [];

  for (const point of series) {
    const anom = anomalyMap.get(point.date);
    const dow = getDayOfWeek(point.date);
    const wMedian = medians[dow];

    if (!anom) {
      cleanedSeries.push({ ...point });
      withoutUnknowns.push({ ...point });
      continue;
    }

    if (anom.class === "DATA_ERROR") {
      // Impute using weekday median
      anom.imputedValue = wMedian;
      cleanedSeries.push({ date: point.date, value: wMedian });
      withoutUnknowns.push({ date: point.date, value: wMedian });
    } else if (anom.class === "PROMOTION") {
      // Remove promo lift from baseline; record uplift factor
      const uplift = wMedian > 0 ? point.value / wMedian : 1;
      anom.upliftFactor = uplift;
      promotions.push({ date: point.date, upliftFactor: uplift });
      // Cleaned baseline replaces promo with normal weekday median
      cleanedSeries.push({ date: point.date, value: wMedian });
      withoutUnknowns.push({ date: point.date, value: wMedian });
    } else {
      // UNKNOWN: kept as-is in cleaned series, but excluded in withoutUnknowns
      cleanedSeries.push({ ...point });
      withoutUnknowns.push({ date: point.date, value: wMedian });
    }
  }

  return {
    cleanedSeries,
    withoutUnknowns,
    anomalies,
    promotions,
  };
}
