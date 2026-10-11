// apps/web/src/components/dashboard/ForecastView.tsx
// Screen 3: Demand Forecast & Holdout Validation matching the Landing Page theme

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CheckCircle2, ArrowRight, Info, AlertTriangle } from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { useTheme } from "../../context/ThemeContext";
import { generateForecastData } from "../../data/inventoryData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";

export const ForecastView: React.FC = () => {
  const { selectedProduct, salesHistory, isLoading, loadDemoData } = useInventory();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showTable, setShowTable] = useState(false);

  const forecastData = useMemo(() => {
    if (!selectedProduct) return null;
    return generateForecastData(selectedProduct, salesHistory);
  }, [selectedProduct, salesHistory]);

  const points = forecastData?.points ?? [];
  const metrics = forecastData?.metrics ?? {
    maeBaseline: 0,
    maeModel: 0,
    wapeBaseline: 0,
    wapeModel: 0,
    biasBaseline: 0,
    biasModel: 0,
    winner: "baseline" as const,
  };

  const holdoutChartData = useMemo(() => {
    return points
      .filter((p) => p.isHoldout)
      .map((p) => ({
        date: p.date,
        actual: p.actual ?? 0,
        model: p.model,
        baseline: p.baseline,
      }));
  }, [points]);

  const holdoutDaysCount = holdoutChartData.length;
  const holdoutActualsSum = holdoutChartData.reduce((sum, p) => sum + p.actual, 0);
  const isHoldoutTooShort = holdoutDaysCount < 14;
  const isActualsSumZero = holdoutActualsSum === 0;

  const displayModelWape = isActualsSumZero ? "n/a" : `${metrics.wapeModel}%`;
  const displayBaselineWape = isActualsSumZero ? "n/a" : `${metrics.wapeBaseline}%`;

  const seasonalWins = metrics.winner === "model";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ebebeb] dark:border-[#262626] pb-5 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!selectedProduct || !forecastData) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ebebeb] dark:border-[#262626] pb-5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
            ANALYSIS · STEP 3
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-tight mt-1">
            Demand Forecast
          </h1>
        </div>
        <EmptyState
          title="No Product Selected"
          description="Select an inventory item from the top bar or load benchmark datasets to inspect out-of-sample forecast validation."
          action={{
            label: "Onboard Products in Setup",
            to: "/setup",
          }}
          secondaryAction={{
            label: "Reset Official Demo Data",
            onClick: () => {
              void loadDemoData();
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#ebebeb] dark:border-[#262626]">
        <div>
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-1">
            ANALYSIS · {selectedProduct.sku}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-[-0.025em]">
            Demand Forecast
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 max-w-2xl">
            Comparing seasonal day-of-week smoothing against a 7-day moving average baseline on the
            30-day holdout window for <strong>{selectedProduct.name}</strong>.
          </p>
        </div>

        <Link to={`/products/${selectedProduct.sku}/scenario`}>
          <Button variant="outline" size="sm">
            <span>Scenario Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Short Holdout Alert */}
      {isHoldoutTooShort && (
        <div className="p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs font-mono text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Holdout window is under 14 days ({holdoutDaysCount} days available) — too short to
            judge model superiority reliably.
          </span>
        </div>
      )}

      {/* Selected Winner Summary Strip */}
      <Card variant="default">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-heading text-base font-semibold text-[#171717] dark:text-[#f5f5f5]">
                Selected on Holdout:{" "}
                {seasonalWins ? "Seasonal Day-of-Week Smoothing" : "7-Day Moving Average Baseline"}
              </span>
              <Badge variant="success" size="sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>Lowest Error</span>
              </Badge>
            </div>
            <p className="text-xs text-[#525252] dark:text-[#a3a3a3] max-w-2xl">
              {seasonalWins
                ? "Seasonal weekday smoothing achieved lower error on the 30-day out-of-sample holdout."
                : "The simpler 7-day moving average beat seasonal smoothing on this SKU. StockSense uses whichever model performs better."}
            </p>
          </div>

          <div className="flex items-center gap-6 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-[#ebebeb] dark:border-[#262626] md:pl-6 shrink-0 font-mono">
            <div>
              <div className="text-[10px] uppercase text-[#737373] dark:text-[#a3a3a3]">
                Holdout WAPE
              </div>
              <div className="text-xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
                {seasonalWins ? displayModelWape : displayBaselineWape}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[#737373] dark:text-[#a3a3a3]">
                Holdout MAE
              </div>
              <div className="text-xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
                {seasonalWins ? metrics.maeModel : metrics.maeBaseline} units
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdout Chart */}
      <Card variant="default">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>30-Day Holdout Comparison</CardTitle>
            <CardDescription>
              Actual daily demand vs Seasonal Model and 7-Day Baseline (days 121–150)
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-[#525252] dark:text-[#a3a3a3]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#171717] dark:bg-[#f5f5f5] inline-block" />
                Actual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#0070f3] inline-block" />
                Seasonal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#a3a3a3] inline-block" />
                Baseline
              </span>
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowTable(!showTable)}>
              {showTable ? "Show chart" : "Show table"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {!showTable ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={holdoutChartData}
                  margin={{ top: 8, right: 8, bottom: 12, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="2 2"
                    stroke={isDark ? "#262626" : "#ebebeb"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: isDark ? "#a3a3a3" : "#737373" }}
                    interval={4}
                    axisLine={{ stroke: isDark ? "#262626" : "#ebebeb" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: isDark ? "#a3a3a3" : "#737373" }}
                    axisLine={{ stroke: isDark ? "#262626" : "#ebebeb" }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-md bg-[#171717] text-white border border-[#262626] p-2.5 text-xs space-y-1 font-mono shadow-sm">
                            <div className="text-[#a3a3a3] text-[11px]">{data.date}</div>
                            <div className="font-semibold">Actual: {data.actual} units</div>
                            <div className="text-[#60a5fa]">
                              Seasonal: {data.model.toFixed(1)} units
                            </div>
                            <div className="text-[#a3a3a3]">
                              Baseline: {data.baseline.toFixed(1)} units
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke={isDark ? "#f5f5f5" : "#171717"}
                    strokeWidth={1.8}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="model"
                    stroke="#0070f3"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke={isDark ? "#737373" : "#a3a3a3"}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-md border border-[#ebebeb] dark:border-[#262626]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actual (Units)</TableHead>
                    <TableHead className="text-right">Seasonal Forecast</TableHead>
                    <TableHead className="text-right">7-Day Baseline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdoutChartData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-mono text-xs">{row.date}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {row.actual}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {row.model.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[#737373] dark:text-[#a3a3a3]">
                        {row.baseline.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Comparison Table */}
      <Card variant="default" className="overflow-hidden">
        <CardHeader>
          <CardTitle>Holdout Error Metrics</CardTitle>
          <CardDescription>
            Evaluated on the 30-day holdout period. Selecting on the same holdout slightly flatters
            the winner.
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">WAPE (%)</TableHead>
              <TableHead className="text-right">MAE (Units)</TableHead>
              <TableHead className="text-right">Bias</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="font-medium text-[#171717] dark:text-[#f5f5f5]">
                  Seasonal Day-of-Week Smoothing
                </div>
                <div className="text-xs text-[#737373] dark:text-[#a3a3a3]">
                  EWMA level (α = 0.25) + 7 weekday indices
                </div>
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {displayModelWape}
              </TableCell>
              <TableCell className="text-right font-mono">{metrics.maeModel}</TableCell>
              <TableCell className="text-right font-mono">
                {metrics.biasModel >= 0 ? `+${metrics.biasModel}` : metrics.biasModel}
              </TableCell>
              <TableCell className="text-center">
                {seasonalWins ? (
                  <Badge variant="success" size="sm">
                    Selected
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Alternative
                  </Badge>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                <div className="font-medium text-[#171717] dark:text-[#f5f5f5]">
                  7-Day Moving Average (Baseline)
                </div>
                <div className="text-xs text-[#737373] dark:text-[#a3a3a3]">
                  Unweighted 7-day rolling mean
                </div>
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {displayBaselineWape}
              </TableCell>
              <TableCell className="text-right font-mono">{metrics.maeBaseline}</TableCell>
              <TableCell className="text-right font-mono">
                {metrics.biasBaseline >= 0 ? `+${metrics.biasBaseline}` : metrics.biasBaseline}
              </TableCell>
              <TableCell className="text-center">
                {!seasonalWins ? (
                  <Badge variant="success" size="sm">
                    Selected
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Baseline
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Leakage Note */}
      <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] p-4 flex items-center gap-2.5 text-xs text-[#525252] dark:text-[#a3a3a3]">
        <Info className="w-4 h-4 text-[#737373] shrink-0" />
        <span>
          All anomaly thresholds, medians, weekday indices, and variance estimates were fitted on the
          training window only (days 1–120).
        </span>
      </div>
    </div>
  );
};
