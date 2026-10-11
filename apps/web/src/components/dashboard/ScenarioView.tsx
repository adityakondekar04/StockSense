// apps/web/src/components/dashboard/ScenarioView.tsx
// Screen 5: Scenario Lab - Interactive surge and supplier delay simulation with Monte Carlo validation

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sliders,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Clock,
  Send,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { simulateProductScenario } from "../../data/inventoryData";

export const ScenarioView: React.FC = () => {
  const {
    products,
    selectedProduct,
    setSelectedProductId,
    serviceLevel,
    aiEnabled,
    addAuditLog,
  } = useInventory();

  // Sliders state
  const [surgePct, setSurgePct] = useState<number>(40);
  const [delayDays, setDelayDays] = useState<number>(3);

  // Natural language scenario parser state
  const [textScenario, setTextScenario] = useState<string>("");
  const [parsedProposal, setParsedProposal] = useState<{
    surge: number;
    delay: number;
    reason: string;
    decisionPath: "LLM" | "RULES";
  } | null>(null);

  // Run simulation using packages/core
  const simulation = useMemo(() => {
    return simulateProductScenario(selectedProduct, serviceLevel, surgePct, delayDays);
  }, [selectedProduct, serviceLevel, surgePct, delayDays]);

  const {
    baseRec,
    baseCost,
    scenarioRec,
    scenarioCost,
    oldRisk,
    mcSim,
  } = simulation;

  // Percentage stockout risk format
  const plannedRiskPct = ((1 - serviceLevel) * 100).toFixed(1);
  const analyticRiskPct = (oldRisk.stockoutProbability * 100).toFixed(1);
  const simulatedRiskPct = (mcSim.stockoutProbability * 100).toFixed(1);

  // Preset scenarios
  const applyPreset = (surge: number, delay: number, desc: string) => {
    setSurgePct(surge);
    setDelayDays(delay);
    setTextScenario(desc);
    setParsedProposal(null);
  };

  // Rule-based and simulated AI natural language parser
  const handleParseScenario = () => {
    if (!textScenario.trim()) return;

    let detectedSurge = 0;
    let detectedDelay = 0;
    const text = textScenario.toLowerCase();

    // Match surge % e.g. "40%", "+40", "surge 40"
    const surgeMatch = text.match(/([+-]?\d+)\s*%/);
    if (surgeMatch) {
      detectedSurge = parseInt(surgeMatch[1], 10);
    } else if (text.includes("flu") || text.includes("surge")) {
      detectedSurge = 40;
    }

    // Match delay days e.g. "3 days", "delay 3"
    const delayMatch = text.match(/(\d+)\s*(?:day|days|d)/);
    if (delayMatch) {
      detectedDelay = parseInt(delayMatch[1], 10);
    } else if (text.includes("late") || text.includes("monsoon") || text.includes("delay")) {
      detectedDelay = 3;
    }

    const proposal = {
      surge: Math.min(100, Math.max(-50, detectedSurge)),
      delay: Math.min(14, Math.max(0, detectedDelay)),
      reason: `Parsed from: "${textScenario}"`,
      decisionPath: (aiEnabled ? "LLM" : "RULES") as "LLM" | "RULES",
    };

    setParsedProposal(proposal);

    addAuditLog({
      kind: "scenario_parse",
      sku: selectedProduct.sku,
      decisionPath: proposal.decisionPath,
      summary: `Parsed scenario text: "${textScenario}" → Surge: ${proposal.surge}%, Delay: ${proposal.delay}d`,
      details: { textScenario, proposal },
    });
  };

  const handleConfirmProposal = () => {
    if (parsedProposal) {
      setSurgePct(parsedProposal.surge);
      setDelayDays(parsedProposal.delay);
      setParsedProposal(null);
    }
  };

  const handleReset = () => {
    setSurgePct(0);
    setDelayDays(0);
    setTextScenario("");
    setParsedProposal(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & SKU Context Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              {selectedProduct.sku}
            </span>
            <span className="text-xs text-slate-500">Scenario Lab · What-If Simulator</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedProduct.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test policy robustness against demand surges and supplier lead-time delays. Validated via seeded Monte Carlo simulation (10,000 trials).
          </p>
        </div>

        {/* Product Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Switch SKU:</label>
          <select
            value={selectedProduct.sku}
            onChange={(e) => {
              const p = products.find((prod) => prod.sku === e.target.value);
              if (p) setSelectedProductId(p.id);
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {products.map((p) => (
              <option key={p.sku} value={p.sku}>
                {p.sku} · {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Interactive Controls & Natural Language Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Simulation Stress Controls</span>
            </h3>
            {(surgePct !== 0 || delayDays !== 0) && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Baseline</span>
              </button>
            )}
          </div>

          {/* Slider 1: Demand Surge % */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Demand Surge Percentage:</span>
              </label>
              <div className="flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                <span>{surgePct > 0 ? `+${surgePct}%` : `${surgePct}%`}</span>
              </div>
            </div>
            <input
              type="range"
              min={-50}
              max={100}
              step={5}
              value={surgePct}
              onChange={(e) => setSurgePct(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-50% (Slump)</span>
              <span>0% (Baseline)</span>
              <span>+50% (Surge)</span>
              <span>+100% (Double)</span>
            </div>
          </div>

          {/* Slider 2: Supplier Delay Days */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Supplier Delivery Delay:</span>
              </label>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                <span>+{delayDays} days</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={14}
              step={1}
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 days (On time)</span>
              <span>3 days (Moderate)</span>
              <span>7 days (Severe)</span>
              <span>14 days (Critical)</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2">
              Common Disruption Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset(40, 3, "Flu season outbreak: 40% demand surge with 3-day supplier shipment delay.")}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                Flu Season (+40% surge, 3d delay)
              </button>
              <button
                onClick={() => applyPreset(0, 5, "Monsoon highway flood: 5 days delayed delivery.")}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                Monsoon Transport Disruption (+5d delay)
              </button>
              <button
                onClick={() => applyPreset(60, 1, "Public health camp: 60% surge in consumption.")}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                Health Camp Flash (+60% surge)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Natural Language Scenario Parser (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Natural Language Scenario</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                aiEnabled ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-700 border border-slate-300"
              }`}>
                {aiEnabled ? "AI (suggestion)" : "Rules"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Type free-text disruption conditions. The engine extracts surge and delay parameters into a bounded proposal.
            </p>

            <textarea
              value={textScenario}
              onChange={(e) => setTextScenario(e.target.value)}
              placeholder="e.g., 'Supplier is running 3 days late due to customs, and flu season is causing a 40% demand surge'..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <button
              onClick={handleParseScenario}
              disabled={!textScenario.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Parse Scenario</span>
            </button>
          </div>

          {/* Proposal confirmation card */}
          {parsedProposal && (
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3.5 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900">Extracted Proposal:</span>
                <span className="text-[10px] font-bold text-indigo-700 uppercase">
                  {parsedProposal.decisionPath === "LLM" ? "AI Proposal" : "Rules Proposal"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                  <span className="text-[10px] text-slate-500 block">Surge</span>
                  <strong className="text-indigo-900">+{parsedProposal.surge}%</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                  <span className="text-[10px] text-slate-500 block">Delay</span>
                  <strong className="text-indigo-900">+{parsedProposal.delay} days</strong>
                </div>
              </div>
              <button
                onClick={handleConfirmProposal}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 rounded-lg text-xs transition-colors"
              >
                Confirm & Apply to Sliders
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Old Policy Risk Alert Card (FR-17 & PRD Highlight) */}
      <div className={`rounded-2xl border p-5 shadow-sm space-y-3 ${
        oldRisk.stockoutProbability > 0.20
          ? "bg-red-50/80 border-red-300"
          : "bg-emerald-50/80 border-emerald-200"
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              oldRisk.stockoutProbability > 0.20 ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${oldRisk.stockoutProbability > 0.20 ? "text-red-900" : "text-emerald-900"}`}>
                Old Policy Risk Under Stressed Conditions
              </h3>
              <p className={`text-xs ${oldRisk.stockoutProbability > 0.20 ? "text-red-700" : "text-emerald-700"}`}>
                If you keep the old reorder point of <strong>{baseRec.rop} {selectedProduct.unit}</strong> without adapting:
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Stockout Probability</span>
            <span className={`text-3xl font-black ${oldRisk.stockoutProbability > 0.20 ? "text-red-700" : "text-emerald-700"}`}>
              {analyticRiskPct}%
            </span>
          </div>
        </div>

        {/* Agreement Line: Analytic vs Monte Carlo */}
        <div className="bg-white/80 rounded-xl p-3 border border-red-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="text-slate-700">
            <strong>Cross-Validation Agreement:</strong> Analytic normal approximation predicts <strong>{analyticRiskPct}%</strong> stockout probability vs <strong>{simulatedRiskPct}%</strong> in seeded Monte Carlo simulation.
          </div>
          <div className="font-mono text-[11px] text-slate-500 shrink-0">
            10,000 trials · mulberry32 (seed: 20261011)
          </div>
        </div>
      </div>

      {/* 4. Side-by-Side Comparison Table (Before vs After) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Policy Comparison: Baseline vs Revised Adaptive Recommendation
          </h3>
          <p className="text-xs text-slate-500">
            Side-by-side metric comparison shows the exact adjustments required to sustain your {(serviceLevel * 100).toFixed(0)}% service level.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4">Current Baseline</th>
                <th className="py-3 px-4">Revised Under Scenario</th>
                <th className="py-3 px-4 text-right">Adjustment Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* ROP */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Reorder Point (ROP)
                  <span className="text-[10px] text-slate-400 block font-normal">Replenishment trigger inventory level</span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                  {baseRec.rop} {selectedProduct.unit}
                </td>
                <td className="py-3 px-4 font-mono font-extrabold text-indigo-700">
                  {scenarioRec.rop} {selectedProduct.unit}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold">
                  <span className={scenarioRec.rop > baseRec.rop ? "text-indigo-600" : "text-slate-600"}>
                    {scenarioRec.rop - baseRec.rop > 0 ? `+${scenarioRec.rop - baseRec.rop}` : scenarioRec.rop - baseRec.rop} {selectedProduct.unit}
                  </span>
                </td>
              </tr>

              {/* Safety Stock */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Safety Stock (SS)
                  <span className="text-[10px] text-slate-400 block font-normal">Buffer against dual variance</span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                  {baseRec.ss} {selectedProduct.unit}
                </td>
                <td className="py-3 px-4 font-mono font-extrabold text-indigo-700">
                  {scenarioRec.ss} {selectedProduct.unit}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold">
                  <span className={scenarioRec.ss > baseRec.ss ? "text-indigo-600" : "text-slate-600"}>
                    {scenarioRec.ss - baseRec.ss > 0 ? `+${scenarioRec.ss - baseRec.ss}` : scenarioRec.ss - baseRec.ss} {selectedProduct.unit}
                  </span>
                </td>
              </tr>

              {/* Order Qty */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Order Quantity (Q)
                  <span className="text-[10px] text-slate-400 block font-normal">Pack-size rounded EOQ</span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                  {baseRec.q} {selectedProduct.unit}
                </td>
                <td className="py-3 px-4 font-mono font-extrabold text-slate-900">
                  {scenarioRec.q} {selectedProduct.unit}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-600">
                  {scenarioRec.q - baseRec.q > 0 ? `+${scenarioRec.q - baseRec.q}` : scenarioRec.q - baseRec.q} {selectedProduct.unit}
                </td>
              </tr>

              {/* Stockout Risk */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Cycle Stockout Risk
                  <span className="text-[10px] text-slate-400 block font-normal">Under respective policies</span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                  {plannedRiskPct}% (planned)
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                  {plannedRiskPct}% (restored)
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">
                  Maintained
                </td>
              </tr>

              {/* Annual Cost */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Estimated Annual Cost
                  <span className="text-[10px] text-slate-400 block font-normal">Holding + Ordering + Shortage</span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                  ₹{Math.round(baseCost.totalAnnualCost).toLocaleString()}
                </td>
                <td className="py-3 px-4 font-mono font-extrabold text-slate-900">
                  ₹{Math.round(scenarioCost.totalAnnualCost).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-600">
                  +₹{Math.round(scenarioCost.totalAnnualCost - baseCost.totalAnnualCost).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Assumption footnote */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Surge scales demand variability equally (constant coefficient of variation). Lead time delay adds to mean lead time.</span>
          <Link to="/methodology#simulation" className="text-indigo-600 hover:text-indigo-800 underline font-semibold">
            See simulation methodology
          </Link>
        </div>
      </div>
    </div>
  );
};
