// apps/web/src/components/dashboard/CleaningView.tsx
// Screen 2: Data Cleaning & Anomaly Detection adhering to ThoughtStream design system

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
import {
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { calculateProductPolicy, type AnomalyClass } from "../../data/inventoryData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
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

  // Selected anomaly for note box
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
      <div className="space-y-8 animate-fadeIn">
        <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6 space-y-2">
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
      <div className="space-y-8 animate-fadeIn">
        <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
            Data Intelligence · Step 2
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
            Data Cleaning &amp; Anomaly Review
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
            onClick: () => { void loadDemoData(); },
          }}
        />
      </div>
    );
  }

  const deltaRop = withUnknownsPolicy.rec.ropOperational - withoutUnknownsPolicy.rec.ropOperational;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
            Data Intelligence · Step 2
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
            Data Cleaning &amp; Anomaly Review
          </h1>
          <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] mt-2 max-w-2xl font-sans">
            Inspecting 150 days of historical sales for <strong>{selectedProduct.sku} ({selectedProduct.name})</strong>.
            Statistical anomalies are transparently classified and treated without silent deletion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/products/${selectedProduct.sku}/forecast`}>
            <Button variant="outline" size="sm" className="font-mono text-xs">
              Go to Forecast Check <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ROP Sensitivity & Unknowns Toggle Strip */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#FAFAF9]">
                  Unknown Anomaly Baseline Policy
                </span>
                <span className="font-mono text-xs px-2 py-0.5 bg-white dark:bg-[#1C1917] border border-[#D6D3D1] dark:border-[#44403C] text-[#57534E] dark:text-[#A8A29E]">
                  Audit T29
                </span>
              </div>
              <p className="text-[13px] text-[#57534E] dark:text-[#A8A29E] max-w-2xl">
                When toggled on, unexplained demand spikes and dips remain in baseline variance. When toggled off, unknowns are treated using median substitution.
              </p>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#E7E5E4] dark:border-[#292524] pt-4 md:pt-0 md:pl-6">
              <div className="text-right">
                <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E] uppercase">ROP Impact Delta</div>
                <div className="font-mono text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
                  {deltaRop >= 0 ? `+${deltaRop.toLocaleString()}` : deltaRop.toLocaleString()} units
                </div>
                <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                  Current ROP: {isUnknownsIncluded ? `${withUnknownsPolicy.rec.ropOperational.toLocaleString()} units` : `${withoutUnknownsPolicy.rec.ropOperational.toLocaleString()} units`}
                </div>
              </div>

              <Button
                variant={isUnknownsIncluded ? "primary" : "secondary"}
                size="sm"
                onClick={() => toggleIncludeUnknowns(selectedProduct.sku)}
                className="font-mono text-xs"
              >
                {isUnknownsIncluded ? "Unknowns Included" : "Unknowns Excluded"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time-Series Chart */}
      <Card variant="default">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Daily Demand Series &amp; Outlier Demarcation</CardTitle>
            <CardDescription>
              120 days training window (white canvas) vs 30 days holdout window (shaded). Markers indicate detected events.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#57534E] dark:text-[#A8A29E]">
                <span className="w-2.5 h-2.5 bg-[#1C1917] dark:bg-[#FAFAF9] inline-block" /> Sales Line
              </span>
              <span className="flex items-center gap-1.5 text-[#DC2626] dark:text-[#FCA5A5]">
                <span className="w-2.5 h-2.5 bg-[#DC2626] inline-block" /> Flagged Outlier
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTable(!showTable)}
              className="font-mono text-xs"
            >
              {showTable ? "Display Chart" : "View Raw Observations"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!showTable ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="currentColor" className="text-[#E7E5E4] dark:text-[#292524]" vertical={false} />
                  <ReferenceArea
                    x1="2026-04-12"
                    x2="2026-05-11"
                    strokeOpacity={0}
                    className="fill-[#EFEDEB] dark:fill-[#292524]/60"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#78716C" }}
                    interval={20}
                    axisLine={{ stroke: "#D6D3D1" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#78716C" }}
                    axisLine={{ stroke: "#D6D3D1" }}
                    tickLine={false}
                    label={{ value: "Units / Day", angle: -90, position: "insideLeft", fontSize: 10, fill: "#78716C" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1C1917] dark:bg-[#0C0A09] text-[#FAFAF9] border border-[#D6D3D1] dark:border-[#44403C] p-3 text-xs space-y-1 font-mono rounded-none">
                            <div className="text-[#A8A29E]">{data.date}</div>
                            <div className="text-base font-bold text-white">
                              {data.demand} units
                            </div>
                            {data.isHoldout && (
                              <div className="text-[#CA8A04] text-[11px]">Holdout Out-of-Sample Window</div>
                            )}
                            {data.hasAnomaly && (
                              <div className="pt-1.5 border-t border-[#44403C] text-[11px] text-[#DC2626]">
                                Outlier: {data.anomalyClass} ({data.anomalyReason})
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
                    stroke="currentColor"
                    className="text-[#1C1917] dark:text-[#FAFAF9]"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Scatter
                    dataKey="anomalyValue"
                    fill="#DC2626"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto border border-[#E7E5E4] dark:border-[#292524]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day Index</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Observed Units</TableHead>
                    <TableHead>Window Type</TableHead>
                    <TableHead>Classification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-mono text-xs">{row.dayIndex}</TableCell>
                      <TableCell className="font-mono text-xs">{row.date}</TableCell>
                      <TableCell className="text-right font-mono font-bold">{row.demand}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.isHoldout ? "Holdout (20%)" : "Training (80%)"}
                      </TableCell>
                      <TableCell>
                        {row.hasAnomaly ? (
                          <Badge variant="error" size="sm">
                            {row.anomalyClass}
                          </Badge>
                        ) : (
                          <span className="text-[#A8A29E] font-mono text-xs">Normal</span>
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

      {/* Flagged Anomalies Registry Table */}
      <Card variant="default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Flagged Events &amp; Clinical Action Registry</CardTitle>
              <CardDescription>
                Audited anomalies for {selectedProduct.sku}. Storekeepers may confirm deterministic treatment or override classification.
              </CardDescription>
            </div>
            <span className="font-mono text-xs text-[#78716C] dark:text-[#A8A29E]">
              {productAnomalies.length} events logged
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Observed Value</TableHead>
                <TableHead className="text-right">Imputed Baseline</TableHead>
                <TableHead>Root Cause &amp; Hypothesis</TableHead>
                <TableHead>Modified Z</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productAnomalies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-[#A8A29E]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-8 h-8 rounded-none bg-[#DCFCE7] dark:bg-[#166534]/50 text-[#15803D] dark:text-[#86EFAC] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="font-serif font-bold text-sm text-[#1C1917] dark:text-[#FAFAF9]">
                        Zero Outliers Detected
                      </span>
                      <span className="text-xs text-[#78716C] dark:text-[#A8A29E] max-w-sm">
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
                      selectedAnomalyId === anom.id
                        ? "bg-[#EFEDEB] dark:bg-[#292524]"
                        : ""
                    }`}
                    onClick={() => setSelectedAnomalyId(anom.id)}
                  >
                    <TableCell className="font-mono text-xs font-semibold">{anom.date}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs uppercase font-medium">
                        {anom.class}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-[#DC2626]">
                      {anom.value}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[#78716C] dark:text-[#A8A29E]">
                      {anom.imputedValue ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-xs text-[#57534E] dark:text-[#D6D3D1]">
                      {anom.reason}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#1C1917] dark:text-[#FAFAF9]">
                      {anom.modifiedZ.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {anom.userConfirmed ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" /> Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {!anom.userConfirmed && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => confirmAnomaly(anom.id)}
                            className="font-mono text-xs py-1 px-2.5"
                          >
                            Confirm
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newClass: AnomalyClass = anom.class === "PROMOTION" ? "DATA_ERROR" : "PROMOTION";
                            overrideAnomaly(anom.id, newClass);
                          }}
                          className="font-mono text-xs py-1 px-2.5"
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
        </CardContent>
      </Card>

      {/* Storekeeper Notes Drawer */}
      {activeAnomaly && (
        <Card variant="default">
          <CardHeader>
            <CardTitle>Storekeeper Audit Note for Event {activeAnomaly.date}</CardTitle>
            <CardDescription>
              Record clinical notes or local supply chain context for this anomaly. Stored in immutable audit logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeAnomaly.note ? (
              <div className="p-3 bg-[#F5F5F4] dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] text-xs font-mono text-[#1C1917] dark:text-[#FAFAF9]">
                <strong>Existing Note:</strong> {activeAnomaly.note}
              </div>
            ) : null}

            <div className="flex gap-3">
              <Input
                placeholder="Enter context (e.g. 'Supplier truck breakdown on highway 4', 'Emergency clinic surge')..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveNote}
                className="font-mono text-xs shrink-0"
              >
                Save Audit Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
