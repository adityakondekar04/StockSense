// apps/web/src/components/landing/ScenarioLabPreview.tsx
import React, { useState, useMemo } from "react";
import {
  FlaskConical,
  Clock,
  Info,
} from "lucide-react";
import { inverseNormalCDF } from "@stocksense/core";

export const ScenarioLabPreview: React.FC = () => {
  // Interactive State
  const [baselineLeadTime, setBaselineLeadTime] = useState<number>(4);
  const [supplierDelay, setSupplierDelay] = useState<number>(3);
  const [meanDemand, setMeanDemand] = useState<number>(20);
  const [sdDemand, setSdDemand] = useState<number>(5);
  const [serviceLevel, setServiceLevel] = useState<number>(0.95);

  const serviceLevelOptions = [
    { label: "80%", value: 0.80 },
    { label: "90%", value: 0.90 },
    { label: "95%", value: 0.95 },
    { label: "98%", value: 0.98 },
    { label: "99%", value: 0.99 },
    { label: "99.9%", value: 0.999 },
  ];

  // Dynamic calculations based on core formulas
  const calculations = useMemo(() => {
    // Normal z-factor for one-sided cycle service level
    let z = 1.6449;
    try {
      z = inverseNormalCDF(serviceLevel);
    } catch {
      z = 1.6449;
    }

    const delayedLeadTime = baselineLeadTime + supplierDelay;

    // 1. Baseline Calculations (Constant Lead Time)
    const baselineExpectedDemand = meanDemand * baselineLeadTime;
    const baselineRawSS = z * sdDemand * Math.sqrt(Math.max(0, baselineLeadTime));
    const baselineSS = Math.ceil(baselineRawSS);
    const baselineROP = Math.ceil(baselineExpectedDemand + baselineRawSS);

    // 2. Delayed Calculations (With Supplier Delay)
    const delayedExpectedDemand = meanDemand * delayedLeadTime;
    const delayedRawSS = z * sdDemand * Math.sqrt(Math.max(0, delayedLeadTime));
    const delayedSS = Math.ceil(delayedRawSS);
    const delayedROP = Math.ceil(delayedExpectedDemand + delayedRawSS);

    // Deltas
    const deltaDemand = delayedExpectedDemand - baselineExpectedDemand;
    const deltaSS = delayedSS - baselineSS;
    const deltaROP = delayedROP - baselineROP;

    return {
      z,
      delayedLeadTime,
      baselineExpectedDemand,
      baselineSS,
      baselineROP,
      delayedExpectedDemand,
      delayedSS,
      delayedROP,
      deltaDemand,
      deltaSS,
      deltaROP,
    };
  }, [baselineLeadTime, supplierDelay, meanDemand, sdDemand, serviceLevel]);

  return (
    <section id="scenario-lab" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase font-semibold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Scenario Lab: What If Your Supplier Runs Late?
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Test how supplier delays change your replenishment threshold. Adjust the sliders below to
            see real-time recalculation using StockSense's deterministic statistical model.
          </p>
        </div>

        {/* Interactive Playground Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                Scenario Parameters
              </span>
              <span className="text-xs font-semibold text-indigo-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                Live Recalculation
              </span>
            </div>

            {/* Service Level Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="service-level" className="font-semibold text-slate-700">
                  Target Service Level
                </label>
                <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold border border-indigo-100">
                  {(serviceLevel * 100).toFixed(1)}% → z = {calculations.z.toFixed(3)}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {serviceLevelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setServiceLevel(opt.value)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      serviceLevel === opt.value
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Baseline Lead Time Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="baseline-lt" className="font-semibold text-slate-700">
                  Baseline Supplier Lead Time
                </label>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {baselineLeadTime} days
                </span>
              </div>
              <input
                id="baseline-lt"
                type="range"
                min="1"
                max="20"
                step="1"
                value={baselineLeadTime}
                onChange={(e) => setBaselineLeadTime(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 day</span>
                <span>10 days</span>
                <span>20 days</span>
              </div>
            </div>

            {/* Supplier Delay Slider */}
            <div className="space-y-2 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="supplier-delay" className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Simulated Supplier Delay (+days)
                </label>
                <span className="font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                  +{supplierDelay} days
                </span>
              </div>
              <input
                id="supplier-delay"
                type="range"
                min="0"
                max="14"
                step="1"
                value={supplierDelay}
                onChange={(e) => setSupplierDelay(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-amber-700">
                <span>On time (+0)</span>
                <span>+7 days</span>
                <span>+14 days</span>
              </div>
            </div>

            {/* Demand Inputs (Demand & SD) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="mean-demand" className="block text-xs font-semibold text-slate-700">
                  Daily Demand Mean (D̄)
                </label>
                <div className="relative">
                  <input
                    id="mean-demand"
                    type="number"
                    min="1"
                    max="500"
                    value={meanDemand}
                    onChange={(e) => setMeanDemand(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">units/d</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sd-demand" className="block text-xs font-semibold text-slate-700">
                  Demand Std Dev (σD)
                </label>
                <div className="relative">
                  <input
                    id="sd-demand"
                    type="number"
                    min="0"
                    max="100"
                    value={sdDemand}
                    onChange={(e) => setSdDemand(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">units/d</span>
                </div>
              </div>
            </div>

            {/* Mathematical Assumption Note */}
            <div className="text-[11px] text-slate-500 bg-white border border-slate-200 rounded-lg p-2.5 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Model Note:</strong> This demonstration assumes constant lead time (σL = 0).
                In full StockSense, lead-time variance is also evaluated:
                σLT = √(L·σD² + D̄²·σL²).
              </span>
            </div>
          </div>

          {/* Results Comparison Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Before vs After Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Baseline Policy Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                      Baseline Policy
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {baselineLeadTime}-Day Lead Time
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    On Schedule
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Expected Lead-Time Demand:</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      {calculations.baselineExpectedDemand} units
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Safety Stock (SS):</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      ≈ {calculations.baselineSS} units
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-500">
                        Reorder Point (ROP)
                      </span>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {calculations.baselineROP}{" "}
                        <span className="text-xs font-normal text-slate-500">units</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Formula: {meanDemand}×{baselineLeadTime} + ⌈{calculations.z.toFixed(2)}×{sdDemand}×√{baselineLeadTime}⌉
                </div>
              </div>

              {/* Delayed Policy Card */}
              <div className="bg-amber-50/40 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700">
                      With Simulated Delay
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {calculations.delayedLeadTime}-Day Lead Time
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                    +{supplierDelay}d Delay
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Expected Lead-Time Demand:</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      {calculations.delayedExpectedDemand} units
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Safety Stock (SS):</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      ≈ {calculations.delayedSS} units
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-amber-900">
                        Revised Reorder Point (ROP)
                      </span>
                      <div className="text-2xl font-extrabold text-indigo-700">
                        {calculations.delayedROP}{" "}
                        <span className="text-xs font-normal text-slate-500">units</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Formula: {meanDemand}×{calculations.delayedLeadTime} + ⌈{calculations.z.toFixed(2)}×{sdDemand}×√{calculations.delayedLeadTime}⌉
                </div>
              </div>
            </div>

            {/* Impact & Difference Summary Panel */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
                <span className="font-semibold uppercase tracking-wider text-indigo-300">
                  Replenishment Impact Analysis
                </span>
                <span>Target SL: {(serviceLevel * 100).toFixed(1)}%</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80">
                  <div className="text-[11px] text-slate-400">Additional Lead Demand</div>
                  <div className="text-lg font-bold text-white mt-1">
                    +{calculations.deltaDemand}{" "}
                    <span className="text-xs font-normal text-slate-400">units</span>
                  </div>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80">
                  <div className="text-[11px] text-slate-400">Required Extra Buffer</div>
                  <div className="text-lg font-bold text-indigo-400 mt-1">
                    +{calculations.deltaSS}{" "}
                    <span className="text-xs font-normal text-slate-400">units</span>
                  </div>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80">
                  <div className="text-[11px] text-slate-400">Total ROP Adjustment</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    +{calculations.deltaROP}{" "}
                    <span className="text-xs font-normal text-slate-400">units</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                {calculations.deltaROP > 0 ? (
                  <>
                    If the supplier is delayed by <strong>{supplierDelay} days</strong>, the reorder point
                    must increase from <strong>{calculations.baselineROP}</strong> to{" "}
                    <strong>{calculations.delayedROP} units</strong>. If you kept the old policy, stockout
                    exposure during replenishment would rise significantly.
                  </>
                ) : (
                  <>No delay simulated. Baseline policy provides full protection at the chosen service level.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function SlidersHorizontal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="21" x2="14" y1="4" y2="4" />
      <line x1="10" x2="3" y1="4" y2="4" />
      <line x1="21" x2="12" y1="12" y2="12" />
      <line x1="8" x2="3" y1="12" y2="12" />
      <line x1="21" x2="16" y1="20" y2="20" />
      <line x1="12" x2="3" y1="20" y2="20" />
      <line x1="14" x2="14" y1="2" y2="6" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="16" x2="16" y1="18" y2="22" />
    </svg>
  );
}
