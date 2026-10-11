// apps/web/src/components/landing/ScenarioLabPreview.tsx
import React, { useState, useMemo } from "react";
import { inverseNormalCDF } from "@stocksense/core";

export const ScenarioLabPreview: React.FC = () => {
  // Interactive Simulation State
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
    <section id="scenario-lab" className="py-16 sm:py-24 bg-[#fafafa] border-b border-[#ebebeb] scroll-mt-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl text-left space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8f8f8f]">
            Scenario Lab Simulator
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#171717] tracking-[-0.03em] leading-tight">
            What happens when your supplier runs late?
          </h2>
          <p className="text-base text-[#4d4d4d] leading-relaxed">
            Test how supplier delays change your replenishment threshold. Adjust the parameters below
            to see instant recalculations using StockSense's statistical model.
          </p>
        </div>

        {/* Interactive Playground Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 bg-white border border-[#ebebeb] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb]">
              <span className="text-xs font-mono font-semibold text-[#171717]">
                Simulation Controls
              </span>
              <span className="text-[11px] font-mono text-[#8f8f8f]">
                Deterministic Math
              </span>
            </div>

            {/* Service Level Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#4d4d4d]">Target Service Level</span>
                <span className="font-mono text-xs text-[#171717] font-semibold bg-[#fafafa] px-2 py-0.5 rounded border border-[#ebebeb]">
                  {(serviceLevel * 100).toFixed(1)}% · z = {calculations.z.toFixed(3)}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {serviceLevelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setServiceLevel(opt.value)}
                    className={`py-1.5 text-xs font-mono font-medium rounded-lg border transition-all ${
                      serviceLevel === opt.value
                        ? "bg-[#171717] text-white border-[#171717]"
                        : "bg-white text-[#4d4d4d] border-[#ebebeb] hover:bg-[#fafafa]"
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
                <label htmlFor="baseline-lt" className="font-medium text-[#4d4d4d]">
                  Baseline Lead Time
                </label>
                <span className="font-mono font-semibold text-[#171717] bg-[#fafafa] px-2 py-0.5 rounded border border-[#ebebeb]">
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
                className="w-full accent-[#171717] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8f8f8f]">
                <span>1d</span>
                <span>10d</span>
                <span>20d</span>
              </div>
            </div>

            {/* Supplier Delay Slider */}
            <div className="space-y-2 bg-[#fafafa] border border-[#ebebeb] rounded-xl p-3.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="supplier-delay" className="font-medium text-[#171717]">
                  Simulated Supplier Delay
                </label>
                <span className="font-mono font-bold text-[#ab570a] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
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
                className="w-full accent-[#ab570a] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8f8f8f]">
                <span>On time (+0d)</span>
                <span>+7d</span>
                <span>+14d</span>
              </div>
            </div>

            {/* Demand Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="mean-demand" className="block text-xs font-medium text-[#4d4d4d]">
                  Daily Demand Mean (D̄)
                </label>
                <input
                  id="mean-demand"
                  type="number"
                  min="1"
                  max="500"
                  value={meanDemand}
                  onChange={(e) => setMeanDemand(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-[#ebebeb] rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sd-demand" className="block text-xs font-medium text-[#4d4d4d]">
                  Demand Std Dev (σD)
                </label>
                <input
                  id="sd-demand"
                  type="number"
                  min="0"
                  max="100"
                  value={sdDemand}
                  onChange={(e) => setSdDemand(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-white border border-[#ebebeb] rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]"
                />
              </div>
            </div>

            {/* Note */}
            <div className="text-[11px] text-[#8f8f8f] bg-[#fafafa] border border-[#ebebeb] rounded-lg p-2.5 font-mono">
              Note: This interactive demonstration assumes constant lead time (σL = 0). Full StockSense
              also models lead-time variance: σLT = √(L̄·σD² + D̄²·σL²).
            </div>
          </div>

          {/* Results Comparison Column (Right) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Baseline Policy Card */}
              <div className="bg-white border border-[#ebebeb] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8f8f8f]">
                      Baseline Policy
                    </span>
                    <h3 className="text-base font-semibold text-[#171717]">
                      {baselineLeadTime}-Day Lead Time
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#4d4d4d] bg-[#f2f2f2] px-2 py-0.5 rounded">
                    On Schedule
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8f8f8f]">Expected Lead Demand:</span>
                    <strong className="text-[#171717]">{calculations.baselineExpectedDemand} units</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8f8f8f]">Safety Stock (SS):</span>
                    <strong className="text-[#171717]">≈ {calculations.baselineSS} units</strong>
                  </div>
                  <div className="pt-2 border-t border-[#f2f2f2] flex items-center justify-between">
                    <span className="text-xs uppercase text-[#8f8f8f]">Reorder Point (ROP)</span>
                    <div className="text-2xl font-bold text-[#171717]">
                      {calculations.baselineROP} <span className="text-xs font-normal text-[#8f8f8f]">units</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delayed Policy Card */}
              <div className="bg-white border border-amber-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#ab570a]">
                      With Simulated Delay
                    </span>
                    <h3 className="text-base font-semibold text-[#171717]">
                      {calculations.delayedLeadTime}-Day Lead Time
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#ab570a] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    +{supplierDelay}d Delay
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8f8f8f]">Expected Lead Demand:</span>
                    <strong className="text-[#171717]">{calculations.delayedExpectedDemand} units</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8f8f8f]">Safety Stock (SS):</span>
                    <strong className="text-[#171717]">≈ {calculations.delayedSS} units</strong>
                  </div>
                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                    <span className="text-xs uppercase text-[#ab570a]">Revised ROP</span>
                    <div className="text-2xl font-bold text-[#171717]">
                      {calculations.delayedROP} <span className="text-xs font-normal text-[#8f8f8f]">units</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Summary Panel */}
            <div className="bg-[#171717] text-white rounded-2xl p-5 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs text-[#a1a1a1] pb-2 border-b border-neutral-800">
                <span className="uppercase tracking-wider">Replenishment Adjustment</span>
                <span>Target SL: {(serviceLevel * 100).toFixed(1)}%</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <div className="text-[10px] text-[#8f8f8f]">Extra Lead Demand</div>
                  <div className="text-lg font-bold text-white mt-1">
                    +{calculations.deltaDemand} <span className="text-xs font-normal text-[#8f8f8f]">units</span>
                  </div>
                </div>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <div className="text-[10px] text-[#8f8f8f]">Extra Safety Buffer</div>
                  <div className="text-lg font-bold text-white mt-1">
                    +{calculations.deltaSS} <span className="text-xs font-normal text-[#8f8f8f]">units</span>
                  </div>
                </div>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <div className="text-[10px] text-[#8f8f8f]">Total ROP Increase</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    +{calculations.deltaROP} <span className="text-xs font-normal text-[#8f8f8f]">units</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#a1a1a1] pt-1 leading-relaxed font-sans">
                {calculations.deltaROP > 0 ? (
                  <>
                    A <strong>{supplierDelay}-day supplier delay</strong> requires raising the reorder
                    point from <strong>{calculations.baselineROP}</strong> to{" "}
                    <strong>{calculations.delayedROP} units</strong> to avoid stockouts during the shipment window.
                  </>
                ) : (
                  <>On-schedule delivery. Baseline replenishment threshold provides planned coverage.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScenarioLabPreview;
