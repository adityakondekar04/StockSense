// packages/core/src/intermittency.ts
// Detection of intermittent / erratic demand

export interface DailyDataPoint {
  date: string;
  value: number;
}

export function zeroDayShare(series: DailyDataPoint[]): number {
  if (series.length === 0) return 0;
  const zeroDays = series.filter((p) => p.value === 0).length;
  return zeroDays / series.length;
}

export function isIntermittent(series: DailyDataPoint[], threshold = 0.40): boolean {
  return zeroDayShare(series) > threshold;
}
