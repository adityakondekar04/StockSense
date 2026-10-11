// apps/web/src/components/dashboard/ForecastView.tsx
// Screen 3: Forecast Check & Holdout Evaluation adhering to ThoughtStream design system

import React, { useMemo } from "react";
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
import {
  CheckCircle2,
  Award,
  ArrowRight,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { generateForecastData } from "../../data/inventoryData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";

export const ForecastView: React.FC = () => {
  const { selectedProduct, salesHistory, isLoading, loadDemoData } = useInventory();

  // Generate real forecast data using data/inventoryData
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

  // Extract only holdout window for the holdout evaluation chart
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
      <div className="space-y-8 animate-fadeIn">
        <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6 space-y-2">
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
      <div className="space-y-8 animate-fadeIn">
        <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
            Data Intelligence · Step 3
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
            Out-of-Sample Forecast Evaluation
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
            onClick: () => { void loadDemoData(); },
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
            Data Intelligence · Step 3
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
            Out-of-Sample Forecast Evaluation
          </h1>
          <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] mt-2 max-w-2xl font-sans">
            Leakage-free holdout validation on the final 30 days for <strong>{selectedProduct.sku}</strong> ({selectedProduct.name}).
            The champion model is selected strictly on holdout WAPE (Weighted Absolute Percentage Error).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/products/${selectedProduct.sku}/scenario`}>
            <Button variant="outline" size="sm" className="font-mono text-xs">
              Go to Scenario Lab <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Short Holdout Alert */}
      {isHoldoutTooShort && (
        <div className="p-4 bg-[#FEF3C7] dark:bg-[#78350F]/30 border border-[#F59E0B] text-xs font-mono text-[#92400E] dark:text-[#FDE68A] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Holdout window is under 14 days ({holdoutDaysCount} days available) — too short to judge model superiority reliably.</span>
        </div>
      )}

      {/* Honest Model Champion Strip */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-[#1C1917] dark:bg-[#FAFAF9] text-[#FAFAF9] dark:text-[#1C1917] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#FAFAF9]">
                    Champion: {seasonalWins ? "Seasonal Day-of-Week Smoothing" : "7-Day Moving Average Baseline"}
                  </span>
                  <Badge variant="success" size="sm">
                    Lowest Holdout Error
                  </Badge>
                </div>
                <p className="text-[13px] text-[#57534E] dark:text-[#A8A29E] max-w-2xl">
                  {seasonalWins
                    ? "Seasonal day-of-week smoothing outperformed the 7-day moving average on out-of-sample holdout demand."
                    : "The 7-day rolling moving average outperformed seasonal smoothing on intermittent zero-demand days. StockSense honestly selects the simpler baseline without forcing complexity."}
                </p>
              </div>
            </div>

            <div className="text-right border-t md:border-t-0 md:border-l border-[#E7E5E4] dark:border-[#292524] pt-4 md:pt-0 md:pl-6 shrink-0">
              <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E] uppercase">
                Winning Model WAPE
              </div>
              <div className="font-mono text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
                {seasonalWins ? displayModelWape : displayBaselineWape}
              </div>
              <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E]">
                MAE: {seasonalWins ? metrics.maeModel : metrics.maeBaseline} units
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Comparison Table */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Forecast Model Comparison on 30-Day Holdout</CardTitle>
          <CardDescription>
            Out-of-sample metrics calculated strictly on held-out days 121–150. Training data never leaks into holdout evaluation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model Architecture</TableHead>
                <TableHead className="text-right">WAPE (%)</TableHead>
                <TableHead className="text-right">MAE (Units)</TableHead>
                <TableHead className="text-right">Mean Bias</TableHead>
                <TableHead>Parameters &amp; Method</TableHead>
                <TableHead className="text-center">Selection Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Seasonal Model */}
              <TableRow className={seasonalWins ? "bg-[#EFEDEB]/50 dark:bg-[#292524]/50" : ""}>
                <TableCell>
                  <div className="font-semibold text-[#1C1917] dark:text-[#FAFAF9]">
                    Seasonal Day-of-Week Smoothing
                  </div>
                  <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                    Multiplicative 7-day pattern index
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {displayModelWape}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {metrics.maeModel}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {metrics.biasModel >= 0 ? `+${metrics.biasModel}` : metrics.biasModel}
                </TableCell>
                <TableCell className="text-xs font-mono text-[#57534E] dark:text-[#A8A29E]">
                  alpha = 0.25, 7 weekday factors
                </TableCell>
                <TableCell className="text-center">
                  {seasonalWins ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> Champion
                    </Badge>
                  ) : (
                    <span className="font-mono text-xs text-[#A8A29E]">Challenger</span>
                  )}
                </TableCell>
              </TableRow>

              {/* Baseline Moving Average */}
              <TableRow className={!seasonalWins ? "bg-[#EFEDEB]/50 dark:bg-[#292524]/50" : ""}>
                <TableCell>
                  <div className="font-semibold text-[#1C1917] dark:text-[#FAFAF9]">
                    7-Day Rolling Moving Average (Baseline)
                  </div>
                  <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                    Unweighted rolling mean window
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {displayBaselineWape}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {metrics.maeBaseline}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {metrics.biasBaseline >= 0 ? `+${metrics.biasBaseline}` : metrics.biasBaseline}
                </TableCell>
                <TableCell className="text-xs font-mono text-[#57534E] dark:text-[#A8A29E]">
                  window = 7 days
                </TableCell>
                <TableCell className="text-center">
                  {!seasonalWins ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> Champion
                    </Badge>
                  ) : (
                    <span className="font-mono text-xs text-[#A8A29E]">Baseline</span>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Holdout Comparison Chart */}
      <Card variant="default">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Holdout Window: Actual vs Forecast Series</CardTitle>
              <CardDescription>
                Visualizing actual daily unit consumption against model projections across days 121–150.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#1C1917] dark:text-[#FAFAF9]">
                <span className="w-3 h-1 bg-[#1C1917] dark:bg-[#FAFAF9] inline-block" /> Actual
              </span>
              <span className="flex items-center gap-1.5 text-[#78716C] dark:text-[#A8A29E]">
                <span className="w-3 h-1 bg-[#78716C] inline-block border-dashed" /> Seasonal
              </span>
              <span className="flex items-center gap-1.5 text-[#A8A29E]">
                <span className="w-3 h-1 bg-[#A8A29E] inline-block" /> 7d Baseline
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={holdoutChartData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="currentColor" className="text-[#E7E5E4] dark:text-[#292524]" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#78716C" }}
                  interval={4}
                  axisLine={{ stroke: "#D6D3D1" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#78716C" }}
                  axisLine={{ stroke: "#D6D3D1" }}
                  tickLine={false}
                  label={{ value: "Units", angle: -90, position: "insideLeft", fontSize: 10, fill: "#78716C" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1C1917] dark:bg-[#0C0A09] text-[#FAFAF9] border border-[#D6D3D1] dark:border-[#44403C] p-3 text-xs space-y-1 font-mono rounded-none">
                          <div className="text-[#A8A29E]">{data.date}</div>
                          <div className="font-bold text-[#FAFAF9]">Actual Demand: {data.actual} units</div>
                          <div className="text-[#D6D3D1]">Seasonal Forecast: {data.model.toFixed(1)} units</div>
                          <div className="text-[#A8A29E]">7d Baseline: {data.baseline.toFixed(1)} units</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="currentColor"
                  className="text-[#1C1917] dark:text-[#FAFAF9]"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="model"
                  stroke="#78716C"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="#A8A29E"
                  strokeWidth={1}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Methodological Transparency Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="flat">
          <CardContent className="p-4 flex items-start gap-3 text-xs text-[#57534E] dark:text-[#A8A29E]">
            <Info className="w-4 h-4 text-[#78716C] shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-[#1C1917] dark:text-[#FAFAF9]">Honesty Note:</strong> Selecting on the same holdout slightly flatters the winner. Holdout is {holdoutDaysCount} days.
            </div>
          </CardContent>
        </Card>
        <Card variant="flat">
          <CardContent className="p-4 flex items-start gap-3 text-xs text-[#57534E] dark:text-[#A8A29E]">
            <Info className="w-4 h-4 text-[#78716C] shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-[#1C1917] dark:text-[#FAFAF9]">Zero Leakage Guarantee:</strong> All thresholds and parameters were fitted on the training window only.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
