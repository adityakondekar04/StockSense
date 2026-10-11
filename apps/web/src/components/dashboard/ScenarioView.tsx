// apps/web/src/components/dashboard/ScenarioView.tsx
// Screen 5: Scenario Lab — What-If Simulation matching the Landing Page theme

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sliders, Sparkles, ShieldAlert, ArrowRight } from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { simulateProductScenario } from "../../data/inventoryData";
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

export const ScenarioView: React.FC = () => {
  const {
    selectedProduct,
    serviceLevel,
    aiEnabled,
    isLoading,
    loadDemoData,
  } = useInventory();

  const [demandSurgePct, setDemandSurgePct] = useState<number>(30);
  const [leadDelayDays, setLeadDelayDays] = useState<number>(3);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>("");
  const [nlpFeedback, setNlpFeedback] = useState<{
    text: string;
    path: "rules" | "llm" | "llm_failed_rules";
  } | null>(null);

  const sim = useMemo(() => {
    if (!selectedProduct) return null;
    return simulateProductScenario(
      selectedProduct,
      serviceLevel,
      demandSurgePct,
      leadDelayDays
    );
  }, [selectedProduct, serviceLevel, demandSurgePct, leadDelayDays]);

  const handleParseScenario = () => {
    if (!naturalLanguageInput.trim()) return;

    const lower = naturalLanguageInput.toLowerCase();
    let surge = 25;
    let delay = 3;
    const path: "rules" | "llm" | "llm_failed_rules" = aiEnabled ? "llm" : "rules";

    const pctMatch = lower.match(/([+-]?\d+)\s*%/);
    if (pctMatch) {
      surge = parseInt(pctMatch[1], 10);
    } else if (lower.includes("surge") || lower.includes("spike") || lower.includes("flu")) {
      surge = 40;
    } else if (lower.includes("slump") || lower.includes("drop")) {
      surge = -20;
    }

    const delayMatch = lower.match(/(\d+)\s*(day|days|d)/);
    if (delayMatch) {
      delay = parseInt(delayMatch[1], 10);
    } else if (lower.includes("delay") || lower.includes("late")) {
      delay = 4;
    }

    setDemandSurgePct(surge);
    setLeadDelayDays(delay);
    setNlpFeedback({
      text: `Parsed "${naturalLanguageInput}" → Demand ${surge >= 0 ? "+" : ""}${surge}%, Supplier delay +${delay} days.`,
      path,
    });
  };

  const handleResetSliders = () => {
    setDemandSurgePct(0);
    setLeadDelayDays(0);
    setNaturalLanguageInput("");
    setNlpFeedback(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ebebeb] dark:border-[#262626] pb-5 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!selectedProduct || !sim) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ebebeb] dark:border-[#262626] pb-5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
            ANALYSIS · STEP 5
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-tight mt-1">
            Scenario Lab
          </h1>
        </div>
        <EmptyState
          title="No Product Selected"
          description="Select an inventory item from the top bar or load benchmark datasets to test stress scenarios and what-if simulations."
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

  const { baseRec, baseCost, scenarioInput, scenarioRec, scenarioCost, oldRisk, mcSim } = sim;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#ebebeb] dark:border-[#262626]">
        <div>
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-1">
            ANALYSIS · {selectedProduct.sku}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-[-0.025em]">
            Scenario Lab
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 max-w-2xl">
            Simulate a demand surge or supplier delay for <strong>{selectedProduct.name}</strong> and
            compare old vs new recommendations side by side.
          </p>
        </div>

        <Link to={`/report/${selectedProduct.sku}`}>
          <Button variant="outline" size="sm">
            <span>Print Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Natural Language Scenario Box */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Describe a Scenario</span>
                </CardTitle>
                <Badge variant={aiEnabled ? "primary" : "neutral"} size="sm">
                  {aiEnabled ? "AI + Rules" : "Rules"}
                </Badge>
              </div>
              <CardDescription>
                Type plain text (e.g., "supplier 3 days late, flu +40%") to set sliders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., supplier 3 days late, demand +40%..."
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                />
                <Button variant="primary" size="sm" onClick={handleParseScenario} className="shrink-0">
                  Parse
                </Button>
              </div>

              {nlpFeedback && (
                <div className="rounded-md p-3 bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#ebebeb] dark:border-[#262626] text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#737373] dark:text-[#a3a3a3]">
                    <span>Proposal applied</span>
                    <span>Path: {nlpFeedback.path}</span>
                  </div>
                  <p className="text-[#171717] dark:text-[#f5f5f5]">{nlpFeedback.text}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sliders Card */}
          <Card variant="default">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>Scenario Parameters</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleResetSliders} className="h-7 px-2 text-xs">
                Reset
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demand Surge */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#525252] dark:text-[#a3a3a3]">Demand Change</span>
                  <span className="font-semibold text-[#171717] dark:text-[#f5f5f5]">
                    {demandSurgePct > 0 ? `+${demandSurgePct}%` : `${demandSurgePct}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="100"
                  step="5"
                  value={demandSurgePct}
                  onChange={(e) => setDemandSurgePct(Number(e.target.value))}
                  className="w-full accent-[#0070f3] cursor-pointer"
                  aria-label="Demand change percentage"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                  <span>-50%</span>
                  <span>0%</span>
                  <span>+100%</span>
                </div>
              </div>

              {/* Lead Time Delay */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#525252] dark:text-[#a3a3a3]">Supplier Delay</span>
                  <span className="font-semibold text-[#171717] dark:text-[#f5f5f5]">
                    +{leadDelayDays} days
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="1"
                  value={leadDelayDays}
                  onChange={(e) => setLeadDelayDays(Number(e.target.value))}
                  className="w-full accent-[#0070f3] cursor-pointer"
                  aria-label="Supplier delay in days"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                  <span>0d</span>
                  <span>+7d</span>
                  <span>+14d</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Results (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Old Policy Risk Callout */}
          <Card variant="default">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert
                      className={`w-4 h-4 ${
                        oldRisk.stockoutProbability > 0.05
                          ? "text-[#e11d48] dark:text-[#fda4af]"
                          : "text-[#15803d] dark:text-[#86efac]"
                      }`}
                    />
                    <h2 className="font-heading text-base font-semibold text-[#171717] dark:text-[#f5f5f5]">
                      Risk if you keep the old Reorder Point ({baseRec.ropOperational.toLocaleString()}{" "}
                      units)
                    </h2>
                  </div>
                  <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                    Under this scenario, keeping the old policy increases cycle stockout risk from{" "}
                    <strong>{((1 - serviceLevel) * 100).toFixed(1)}%</strong> to{" "}
                    <strong>{(oldRisk.stockoutProbability * 100).toFixed(1)}%</strong>.
                  </p>
                </div>

                <div className="text-right font-mono shrink-0">
                  <div className="text-[10px] uppercase text-[#737373] dark:text-[#a3a3a3]">
                    Stockout Risk
                  </div>
                  <div
                    className={`text-2xl font-semibold ${
                      oldRisk.stockoutProbability > 0.05
                        ? "text-[#e11d48] dark:text-[#fda4af]"
                        : "text-[#171717] dark:text-[#f5f5f5]"
                    }`}
                  >
                    {(oldRisk.stockoutProbability * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#ebebeb] dark:border-[#262626] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                <span>Analytic: {(oldRisk.stockoutProbability * 100).toFixed(1)}%</span>
                <span>
                  Monte Carlo: {(mcSim.stockoutProbability * 100).toFixed(1)}% (10,000 trials,
                  mulberry32 seed)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Before / After Comparison Table */}
          <Card variant="default" className="overflow-hidden">
            <CardHeader>
              <CardTitle>Before vs After Recommendation</CardTitle>
              <CardDescription>
                Surge scales demand variability proportionally (constant coefficient of variation)
              </CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Baseline</TableHead>
                  <TableHead className="text-right">Scenario</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Reorder Point</TableCell>
                  <TableCell className="text-right font-mono">
                    {baseRec.ropOperational.toLocaleString()} units
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {scenarioRec.ropOperational.toLocaleString()} units
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {scenarioRec.ropOperational - baseRec.ropOperational >= 0 ? "+" : ""}
                    {(scenarioRec.ropOperational - baseRec.ropOperational).toLocaleString()} units
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Safety Stock</TableCell>
                  <TableCell className="text-right font-mono">
                    {Math.ceil(baseRec.ss).toLocaleString()} units
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {Math.ceil(scenarioRec.ss).toLocaleString()} units
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {Math.ceil(scenarioRec.ss) - Math.ceil(baseRec.ss) >= 0 ? "+" : ""}
                    {(Math.ceil(scenarioRec.ss) - Math.ceil(baseRec.ss)).toLocaleString()} units
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Order Quantity (EOQ)</TableCell>
                  <TableCell className="text-right font-mono">
                    {baseRec.q.toLocaleString()} units
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {scenarioRec.q.toLocaleString()} units
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {scenarioRec.q - baseRec.q >= 0 ? "+" : ""}
                    {(scenarioRec.q - baseRec.q).toLocaleString()} units
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Mean Lead Time</TableCell>
                  <TableCell className="text-right font-mono">
                    {selectedProduct.leadTimeMean} days
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {scenarioInput.leadTimeMean} days
                  </TableCell>
                  <TableCell className="text-right font-mono">+{leadDelayDays} days</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Est. Annual Cost</TableCell>
                  <TableCell className="text-right font-mono">
                    ₹{baseCost.totalAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ₹{scenarioCost.totalAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {scenarioCost.totalAnnualCost - baseCost.totalAnnualCost >= 0 ? "+₹" : "-₹"}
                    {Math.abs(scenarioCost.totalAnnualCost - baseCost.totalAnnualCost).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 0 }
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
};
