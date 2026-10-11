// apps/web/src/components/dashboard/ScenarioView.tsx
// Screen 5: Scenario Lab — Stress Testing & What-If Simulation adhering to ThoughtStream design system

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sliders,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { simulateProductScenario } from "../../data/inventoryData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
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

  // Stress sliders state
  const [demandSurgePct, setDemandSurgePct] = useState<number>(30); // +30%
  const [leadDelayDays, setLeadDelayDays] = useState<number>(3); // +3 days
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>("");
  const [nlpFeedback, setNlpFeedback] = useState<{
    text: string;
    path: "rules" | "llm" | "llm_failed_rules";
  } | null>(null);

  // Run simulation using core pure math
  const sim = useMemo(() => {
    if (!selectedProduct) return null;
    return simulateProductScenario(
      selectedProduct,
      serviceLevel,
      demandSurgePct,
      leadDelayDays
    );
  }, [selectedProduct, serviceLevel, demandSurgePct, leadDelayDays]);

  // Handle Natural Language scenario parsing (deterministic fallback if AI disabled)
  const handleParseScenario = () => {
    if (!naturalLanguageInput.trim()) return;

    const lower = naturalLanguageInput.toLowerCase();
    let surge = 25;
    let delay = 3;
    let path: "rules" | "llm" | "llm_failed_rules" = aiEnabled ? "llm" : "rules";

    // Extract numbers if present
    const pctMatch = lower.match(/([+-]?\d+)\s*%/);
    if (pctMatch) {
      surge = parseInt(pctMatch[1], 10);
    } else if (lower.includes("surge") || lower.includes("spike") || lower.includes("festival")) {
      surge = 35;
    } else if (lower.includes("slump") || lower.includes("drop")) {
      surge = -20;
    }

    const delayMatch = lower.match(/(\d+)\s*(day|days|d)/);
    if (delayMatch) {
      delay = parseInt(delayMatch[1], 10);
    } else if (lower.includes("delay") || lower.includes("late") || lower.includes("strike")) {
      delay = 5;
    }

    setDemandSurgePct(surge);
    setLeadDelayDays(delay);
    setNlpFeedback({
      text: `Interpreted "${naturalLanguageInput}": demand surge ${surge >= 0 ? "+" : ""}${surge}%, supplier delay +${delay} days.`,
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
      <div className="space-y-8 animate-fadeIn">
        <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6 space-y-2">
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
      <div className="space-y-8 animate-fadeIn">
        <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
            Operations &amp; Stress Testing · Step 5
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
            Scenario Stress Simulation Lab
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
            onClick: () => { void loadDemoData(); },
          }}
        />
      </div>
    );
  }

  const { baseRec, baseCost, scenarioInput, scenarioRec, scenarioCost, oldRisk, mcSim } = sim;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
            Operations &amp; Stress Testing · Step 5
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
            Scenario Stress Simulation Lab
          </h1>
          <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] mt-2 max-w-2xl font-sans">
            Stress-test replenishment robustness under hypothetical supply chain shocks for <strong>{selectedProduct.sku}</strong> ({selectedProduct.name}).
            Evaluate stockout vulnerability when demand surges or distributor lead times extend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/report/${selectedProduct.sku}`}>
            <Button variant="outline" size="sm" className="font-mono text-xs">
              Generate 1-Page Report <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Natural Language Prompt & Interactive Stress Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* NLP Scenario Box */}
          <Card variant="default">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#78716C]" /> Natural Language Stress
                </CardTitle>
                <Badge variant={aiEnabled ? "primary" : "neutral"} size="sm">
                  {aiEnabled ? "AI Active" : "Rules Parser"}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Describe a crisis or seasonal surge to adjust simulation sliders automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 'Festival surge +40% with 4 days distributor delay'..."
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  className="text-xs"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleParseScenario}
                  className="font-mono text-xs shrink-0"
                >
                  Apply
                </Button>
              </div>

              {nlpFeedback && (
                <div className="p-3 bg-[#F5F5F4] dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1C1917] dark:text-[#FAFAF9]">Parsed Parameters:</span>
                    <span className="text-[10px] uppercase text-[#78716C] dark:text-[#A8A29E]">
                      Path: {nlpFeedback.path}
                    </span>
                  </div>
                  <p className="text-[#57534E] dark:text-[#D6D3D1] font-sans text-xs">{nlpFeedback.text}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sliders Panel */}
          <Card variant="default">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#78716C]" /> Manual Stress Sliders
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetSliders}
                  className="text-xs font-mono h-7 px-2"
                >
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {/* Slider 1: Demand Surge */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-semibold text-[#1C1917] dark:text-[#FAFAF9]">
                    Demand Surge / Drop
                  </span>
                  <span className="font-bold text-sm text-[#1C1917] dark:text-[#FAFAF9]">
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
                  className="w-full accent-[#1C1917] dark:accent-[#FAFAF9] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E]">
                  <span>-50% Slump</span>
                  <span>0% Neutral</span>
                  <span>+100% Crisis Surge</span>
                </div>
              </div>

              {/* Slider 2: Lead Time Delay */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-semibold text-[#1C1917] dark:text-[#FAFAF9]">
                    Supplier Delay
                  </span>
                  <span className="font-bold text-sm text-[#1C1917] dark:text-[#FAFAF9]">
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
                  className="w-full accent-[#1C1917] dark:accent-[#FAFAF9] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E]">
                  <span>On-Time (0d)</span>
                  <span>+7d Late</span>
                  <span>+14d Critical</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Before vs After & Risk Assessment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Critical Risk Callout */}
          <Card
            variant="default"
            className={
              oldRisk.stockoutProbability > 0.05
                ? "border-t-2 border-t-[#DC2626] bg-[#FEF2F2]/40 dark:bg-[#7F1D1D]/10"
                : "border-t-2 border-t-[#65A30D]"
            }
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] shrink-0">
                  <ShieldAlert
                    className={`w-5 h-5 ${
                      oldRisk.stockoutProbability > 0.05
                        ? "text-[#DC2626]"
                        : "text-[#65A30D]"
                    }`}
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#FAFAF9]">
                      Old Policy Stockout Risk Under Shock
                    </span>
                    <span className="font-mono text-2xl font-bold text-[#DC2626]">
                      {(oldRisk.stockoutProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[13px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                    If you maintain the old Reorder Point (<strong>{baseRec.ropOperational.toLocaleString()} units</strong>) without adjusting for this shock, the probability of stockout during replenishment rises to{" "}
                    <strong>{(oldRisk.stockoutProbability * 100).toFixed(1)}%</strong>.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#78716C] dark:text-[#A8A29E] border-t border-[#E7E5E4] dark:border-[#292524]">
                    <span>
                      Effective z: {oldRisk.zEffective.toFixed(2)}
                    </span>
                    <span>
                      Monte Carlo Validation (10,000 trials):{" "}
                      <strong className="text-[#1C1917] dark:text-[#FAFAF9]">
                        {(mcSim.stockoutProbability * 100).toFixed(1)}%
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side-by-Side Comparison Table */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>Side-by-Side Policy Parameter Delta</CardTitle>
              <CardDescription>
                Comparing baseline operations against recommended stress parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inventory Metric</TableHead>
                    <TableHead className="text-right">Baseline Policy</TableHead>
                    <TableHead className="text-right">Stressed Scenario</TableHead>
                    <TableHead className="text-right">Adjustment Needed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* ROP */}
                  <TableRow>
                    <TableCell className="font-semibold">Reorder Point (ROP)</TableCell>
                    <TableCell className="text-right font-mono">{baseRec.ropOperational.toLocaleString()} units</TableCell>
                    <TableCell className="text-right font-mono font-bold">{scenarioRec.ropOperational.toLocaleString()} units</TableCell>
                    <TableCell className="text-right font-mono font-bold text-[#DC2626]">
                      +{Math.max(0, scenarioRec.ropOperational - baseRec.ropOperational).toLocaleString()} units
                    </TableCell>
                  </TableRow>

                  {/* Safety Stock */}
                  <TableRow>
                    <TableCell className="font-semibold">Safety Stock (SS)</TableCell>
                    <TableCell className="text-right font-mono">{Math.ceil(baseRec.ss).toLocaleString()} units</TableCell>
                    <TableCell className="text-right font-mono font-bold">{Math.ceil(scenarioRec.ss).toLocaleString()} units</TableCell>
                    <TableCell className="text-right font-mono font-bold text-[#78716C]">
                      +{Math.max(0, Math.ceil(scenarioRec.ss) - Math.ceil(baseRec.ss)).toLocaleString()} units
                    </TableCell>
                  </TableRow>

                  {/* Order Q */}
                  <TableRow>
                    <TableCell className="font-semibold">Order Quantity (Q*)</TableCell>
                    <TableCell className="text-right font-mono">{baseRec.q} units</TableCell>
                    <TableCell className="text-right font-mono font-bold">{scenarioRec.q} units</TableCell>
                    <TableCell className="text-right font-mono text-[#57534E] dark:text-[#A8A29E]">
                      +{scenarioRec.q - baseRec.q} units
                    </TableCell>
                  </TableRow>

                  {/* Lead Time */}
                  <TableRow>
                    <TableCell className="font-semibold">Mean Lead Time</TableCell>
                    <TableCell className="text-right font-mono">{selectedProduct.leadTimeMean} days</TableCell>
                    <TableCell className="text-right font-mono font-bold">{scenarioInput.leadTimeMean} days</TableCell>
                    <TableCell className="text-right font-mono text-[#57534E] dark:text-[#A8A29E]">
                      +{leadDelayDays} days
                    </TableCell>
                  </TableRow>

                  {/* Annual Cost */}
                  <TableRow>
                    <TableCell className="font-semibold">Est. Annual Inventory Cost</TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{baseCost.totalAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      ₹{scenarioCost.totalAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[#57534E] dark:text-[#A8A29E]">
                      +₹{(scenarioCost.totalAnnualCost - baseCost.totalAnnualCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
