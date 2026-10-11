// apps/web/src/components/dashboard/CleaningView.tsx
// Screen 2: Sales & Anomalies (Data Cleaning) matching the Landing Page minimalist theme

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
  ReferenceArea,
  Scatter,
} from "recharts";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { useTheme } from "../../context/ThemeContext";
import { calculateProductPolicy, type AnomalyClass } from "../../data/inventoryData";
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
import { Input } from "../ui/input";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";

export const CleaningView: React.FC = () => {
  const {
    selectedProduct,
    serviceLevel,
    includeUnknowns,
    toggleIncludeUnknowns,
    salesHistory,
    anomalies,
    confirmAnomaly,
    overrideAnomaly,
    addAnomalyNote,
    isLoading,
    loadDemoData,
  } = useInventory();

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [showTable, setShowTable] = useState(false);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const isUnknownsIncluded = selectedProduct ? (includeUnknowns[selectedProduct.sku] ?? true) : true;

  // Compute ROP with and without unknowns
  const withUnknownsPolicy = useMemo(() => {
    if (!selectedProduct) return null;
    return calculateProductPolicy(selectedProduct, serviceLevel, true);
  }, [selectedProduct, serviceLevel]);

  const withoutUnknownsPolicy = useMemo(() => {
    if (!selectedProduct) return null;
    return calculateProductPolicy(selectedProduct, serviceLevel, false);
  }, [selectedProduct, serviceLevel]);

  // Product specific anomalies
  const productAnomalies = useMemo(() => {
    if (!selectedProduct) return [];
    return anomalies.filter((a) => a.sku === selectedProduct.sku);
  }, [anomalies, selectedProduct]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return salesHistory.map((pt) => {
      const anom = pt.anomaly || productAnomalies.find((a) => a.date === pt.date);
      return {
        date: pt.date,
        dayIndex: pt.dayIndex,
        demand: pt.demand,
        isHoldout: pt.isHoldout,
        hasAnomaly: Boolean(anom),
        anomalyValue: anom ? pt.demand : null,
        anomalyClass: anom?.class,
        anomalyReason: anom?.reason,
      };
    });
  }, [salesHistory, productAnomalies]);

  const activeAnomaly = useMemo(() => {
    if (selectedAnomalyId) {
      return productAnomalies.find((a) => a.id === selectedAnomalyId);
    }
    return productAnomalies[0];
  }, [selectedAnomalyId, productAnomalies]);

  const handleSaveNote = () => {
    if (activeAnomaly && noteInput.trim()) {
      addAnomalyNote(activeAnomaly.id, noteInput.trim());
      setNoteInput("");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ebebeb] dark:border-[#262626] pb-5 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!selectedProduct || !withUnknownsPolicy || !withoutUnknownsPolicy) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ebebeb] dark:border-[#262626] pb-5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
            ANALYSIS · STEP 2
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-tight mt-1">
            Sales &amp; Anomalies
          </h1>
        </div>
        <EmptyState
          title="No Product Selected"
          description="Select an inventory item from the top bar or load benchmark datasets to inspect historical sales and anomalies."
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

  const deltaRop =
    withUnknownsPolicy.rec.ropOperational - withoutUnknownsPolicy.rec.ropOperational;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#ebebeb] dark:border-[#262626]">
        <div>
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-1">
            ANALYSIS · {selectedProduct.sku}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-[-0.025em]">
            Sales &amp; Anomalies
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 max-w-2xl">
            Review unusual demand spikes for <strong>{selectedProduct.name}</strong> ({selectedProduct.sku})
            and see how each anomaly is treated before forecasting.
          </p>
        </div>

        <Link to={`/products/${selectedProduct.sku}/forecast`}>
          <Button variant="outline" size="sm">
            <span>Demand Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Compact Unknown Anomalies Toggle Bar */}
      <Card variant="default">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-heading text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">
              Include unknown spikes in safety stock?
            </h2>
            <p className="text-xs text-[#525252] dark:text-[#a3a3a3] max-w-xl">
              Promotions are kept and data errors are replaced with the training median. Toggle whether
              unexplained spikes remain in variance.
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-[#ebebeb] dark:border-[#262626] shrink-0">
            <div className="text-left md:text-right font-mono">
              <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3]">
                Resulting Reorder Point
              </div>
              <div className="text-base font-semibold text-[#171717] dark:text-[#f5f5f5]">
                {isUnknownsIncluded
                  ? `${withUnknownsPolicy.rec.ropOperational.toLocaleString()} units`
                  : `${withoutUnknownsPolicy.rec.ropOperational.toLocaleString()} units`}{" "}
                <span className="text-xs font-normal text-[#737373] dark:text-[#a3a3a3]">
                  (Δ {deltaRop >= 0 ? `+${deltaRop}` : deltaRop})
                </span>
              </div>
            </div>

            <Button
              variant={isUnknownsIncluded ? "primary" : "outline"}
              size="sm"
              onClick={() => toggleIncludeUnknowns(selectedProduct.sku)}
            >
              {isUnknownsIncluded ? "Unknowns: Included" : "Unknowns: Excluded"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time-Series Chart */}
      <Card variant="default">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Daily Sales History (150 Days)</CardTitle>
            <CardDescription>
              Training window (days 1–120) vs shaded holdout window (days 121–150)
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-[#525252] dark:text-[#a3a3a3]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#171717] dark:bg-[#f5f5f5] inline-block" />
                Daily sales
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#e11d48] inline-block" />
                Unusual value
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTable(!showTable)}
            >
              {showTable ? "Show chart" : "Show table"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {!showTable ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 12, left: 0 }}>
                  <CartesianGrid
                    strokeDasharray="2 2"
                    stroke={isDark ? "#262626" : "#ebebeb"}
                    vertical={false}
                  />
                  <ReferenceArea
                    x1="2026-04-12"
                    x2="2026-05-11"
                    strokeOpacity={0}
                    fill={isDark ? "#1f1f1f" : "#f5f5f5"}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: isDark ? "#a3a3a3" : "#737373" }}
                    interval={20}
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
                            <div className="font-semibold text-sm">{data.demand} units</div>
                            {data.isHoldout && (
                              <div className="text-[#fcd34d] text-[10px]">Holdout window</div>
                            )}
                            {data.hasAnomaly && (
                              <div className="pt-1 border-t border-[#262626] text-[11px] text-[#fda4af]">
                                {data.anomalyClass}: {data.anomalyReason}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    stroke={isDark ? "#f5f5f5" : "#171717"}
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Scatter dataKey="anomalyValue" fill="#e11d48" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-md border border-[#ebebeb] dark:border-[#262626]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead>Window</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-mono text-xs">{row.dayIndex + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{row.date}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{row.demand}</TableCell>
                      <TableCell className="font-mono text-xs text-[#737373] dark:text-[#a3a3a3]">
                        {row.isHoldout ? "Holdout" : "Training"}
                      </TableCell>
                      <TableCell>
                        {row.hasAnomaly ? (
                          <Badge variant="error" size="sm">
                            {row.anomalyClass}
                          </Badge>
                        ) : (
                          <span className="text-[#737373] dark:text-[#a3a3a3] font-mono text-xs">
                            Normal
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flagged Anomalies Table */}
      <Card variant="default" className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Unusual Values for Review</CardTitle>
            <CardDescription>
              Confirm or override how each flagged observation is classified
            </CardDescription>
          </div>
          <span className="font-mono text-xs text-[#737373] dark:text-[#a3a3a3]">
            {productAnomalies.length} flagged
          </span>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-right">Observed</TableHead>
              <TableHead className="text-right">Treated Value</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Mod-Z</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productAnomalies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-[#737373] dark:text-[#a3a3a3]">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#15803d] dark:text-[#86efac] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-heading font-semibold text-sm text-[#171717] dark:text-[#f5f5f5]">
                      Zero Outliers Detected
                    </span>
                    <span className="text-xs text-[#737373] dark:text-[#a3a3a3] max-w-sm">
                      All observed daily sales fall safely within normal statistical variance (|z| ≤ 3.5). No adjustments required.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              productAnomalies.map((anom) => (
                <TableRow
                  key={anom.id}
                  className={`cursor-pointer ${
                    selectedAnomalyId === anom.id ? "bg-[#f5f5f5] dark:bg-[#1f1f1f]" : ""
                  }`}
                  onClick={() => setSelectedAnomalyId(anom.id)}
                >
                  <TableCell className="font-mono text-xs font-semibold">{anom.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        anom.class === "DATA_ERROR"
                          ? "error"
                          : anom.class === "PROMOTION"
                          ? "neutral"
                          : "warning"
                      }
                      size="sm"
                    >
                      {anom.class.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {anom.value}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[#525252] dark:text-[#a3a3a3]">
                    {anom.imputedValue ?? anom.value}
                  </TableCell>
                  <TableCell className="text-xs text-[#525252] dark:text-[#a3a3a3]">
                    {anom.reason}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {anom.modifiedZ.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {anom.userConfirmed ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmed</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm">
                        {anom.decisionPath}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {!anom.userConfirmed && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => confirmAnomaly(anom.id)}
                          className="py-1 px-2.5 text-xs"
                        >
                          Confirm
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newClass: AnomalyClass =
                            anom.class === "PROMOTION" ? "DATA_ERROR" : "PROMOTION";
                          overrideAnomaly(anom.id, newClass);
                        }}
                        className="py-1 px-2.5 text-xs"
                      >
                        Override
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Compact Note Box */}
      {activeAnomaly && (
        <Card variant="default">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-heading font-semibold text-[#171717] dark:text-[#f5f5f5]">
                Note for {activeAnomaly.date} ({activeAnomaly.class})
              </span>
              {activeAnomaly.note && (
                <span className="font-mono text-[#737373] dark:text-[#a3a3a3]">
                  Saved: "{activeAnomaly.note}"
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add context (e.g., health camp promo, entry typo)..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button variant="primary" size="sm" onClick={handleSaveNote} className="shrink-0">
                Save Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
