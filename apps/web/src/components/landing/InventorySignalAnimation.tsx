// apps/web/src/components/landing/InventorySignalAnimation.tsx
// Lightweight, purpose-built SVG & CSS inventory intelligence animation
// Visualizes: Raw demand bars -> Anomaly detection -> Baseline forecast -> Threshold depletion -> Replenishment order

import React, { useState, useEffect } from "react";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export const InventorySignalAnimation: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Gentle 4-stage progression:
  // 0: Raw historical demand with uncleaned spikes
  // 1: Anomaly detection & IQR clamping
  // 2: Clean baseline forecast projection
  // 3: Reorder threshold breach & replenishment trigger
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused]);

  // 14 historical days data
  const historicalDays = [
    { day: "D1", raw: 22, clean: 22, isSpike: false },
    { day: "D2", raw: 26, clean: 26, isSpike: false },
    { day: "D3", raw: 20, clean: 20, isSpike: false },
    { day: "D4", raw: 24, clean: 24, isSpike: false },
    { day: "D5", raw: 28, clean: 28, isSpike: false },
    { day: "D6", raw: 76, clean: 25, isSpike: true, note: "Bulk Run (+280%)" },
    { day: "D7", raw: 23, clean: 23, isSpike: false },
    { day: "D8", raw: 25, clean: 25, isSpike: false },
    { day: "D9", raw: 21, clean: 21, isSpike: false },
    { day: "D10", raw: 27, clean: 27, isSpike: false },
    { day: "D11", raw: 64, clean: 26, isSpike: true, note: "Outlier (+210%)" },
    { day: "D12", raw: 24, clean: 24, isSpike: false },
    { day: "D13", raw: 23, clean: 23, isSpike: false },
    { day: "D14", raw: 25, clean: 25, isSpike: false },
  ];

  const maxVal = 85;
  const chartHeight = 110;

  return (
    <div
      className="relative w-full rounded-xl border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="StockSense inventory anomaly detection and replenishment animation"
    >
      {/* Header bar: SKU, status indicator, and stage stepper */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#ebebeb] dark:border-[#262626]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#171717] dark:bg-[#f5f5f5] animate-pulse" />
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#171717] dark:text-[#f5f5f5]">
            SIGNAL INSPECTION · SKU-MED-042
          </span>
          <span className="hidden sm:inline text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
            (Amoxicillin 500mg)
          </span>
        </div>

        {/* Phase selector buttons */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          {[
            { id: 0, label: "Raw" },
            { id: 1, label: "Detect" },
            { id: 2, label: "Forecast" },
            { id: 3, label: "Restock" },
          ].map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStep(stage.id)}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeStep === stage.id
                  ? "bg-[#171717] text-white dark:bg-[#f5f5f5] dark:text-[#0a0a0a] font-semibold"
                  : "text-[#737373] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5]"
              }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Signal Display */}
      <div className="space-y-4">
        {/* Top Chart Area: 14-day Demand Signal with Anomaly Highlighting */}
        <div className="relative">
          <div className="flex items-center justify-between text-[11px] text-[#737373] dark:text-[#a3a3a3] mb-2 font-mono">
            <span>Historical Daily Demand (14 Days)</span>
            <span className="tabular-nums">
              {activeStep === 0
                ? "Raw Mean: 34.1 units/d"
                : "Cleaned Baseline: 24.0 units/d (Winsorized)"}
            </span>
          </div>

          {/* SVG Demand Canvas */}
          <div className="w-full h-36 relative border border-[#f0f0f0] dark:border-[#222222] rounded bg-[#fafafa]/60 dark:bg-[#0f0f0f]/60 p-2 overflow-hidden">
            {/* Clamped Baseline Reference Line (visible on steps 1, 2, 3) */}
            <div
              className={`absolute left-0 right-0 border-b border-dashed border-[#737373] dark:border-[#8e8e8e] transition-opacity duration-500 z-10 pointer-events-none ${
                activeStep >= 1 ? "opacity-90" : "opacity-0"
              }`}
              style={{ bottom: `${(24 / maxVal) * 100}%` }}
            >
              <span className="absolute right-2 -top-4 font-mono text-[10px] text-[#525252] dark:text-[#a3a3a3] bg-white dark:bg-[#141414] px-1 border border-[#ebebeb] dark:border-[#262626] rounded">
                Refined Baseline (24.0 u/d)
              </span>
            </div>

            {/* Demand Bars Grid */}
            <div className="h-full flex items-end justify-between gap-1 pt-6 pb-2 px-1">
              {historicalDays.map((item, idx) => {
                const isClamped = activeStep >= 1 && item.isSpike;
                const displayHeight = isClamped
                  ? (item.clean / maxVal) * chartHeight
                  : (item.raw / maxVal) * chartHeight;

                return (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group"
                  >
                    {/* Anomaly Badge above spike */}
                    {item.isSpike && activeStep >= 1 && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-[#171717] dark:bg-[#f5f5f5] text-white dark:text-[#0a0a0a] text-[9px] font-mono px-1 py-0.2 rounded shadow-sm whitespace-nowrap z-20">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Clamped</span>
                      </div>
                    )}

                    {/* Ghost Bar for Original Spike if Clamped */}
                    {item.isSpike && activeStep >= 1 && (
                      <div
                        className="w-full border border-dashed border-[#a3a3a3] dark:border-[#525252] bg-transparent absolute bottom-0 rounded-t-sm transition-opacity duration-300 pointer-events-none"
                        style={{ height: `${(item.raw / maxVal) * chartHeight}px` }}
                      />
                    )}

                    {/* Active Bar */}
                    <div
                      className={`w-full transition-all duration-500 rounded-t-sm ${
                        item.isSpike
                          ? activeStep === 0
                            ? "bg-[#171717] dark:bg-[#f5f5f5]"
                            : "bg-[#737373] dark:bg-[#8e8e8e]"
                          : "bg-[#d4d4d4] dark:bg-[#383838] hover:bg-[#171717] dark:hover:bg-[#f5f5f5]"
                      }`}
                      style={{ height: `${displayHeight}px` }}
                    />

                    {/* Day Label */}
                    <span className="text-[9px] font-mono text-[#737373] dark:text-[#a3a3a3] mt-1.5 hidden sm:block">
                      {idx % 2 === 0 ? item.day : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Projection & Replenishment Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Inventory Depletion & Reorder Threshold */}
          <div className="md:col-span-8 border border-[#f0f0f0] dark:border-[#222222] rounded bg-[#fafafa]/60 dark:bg-[#0f0f0f]/60 p-3">
            <div className="flex items-center justify-between text-[11px] font-mono mb-2">
              <span className="text-[#171717] dark:text-[#f5f5f5] font-medium">
                7-Day Stock Depletion vs ROP
              </span>
              <span className="text-[#737373] dark:text-[#a3a3a3]">
                Service Level: 95.0% · z=1.645
              </span>
            </div>

            {/* Stepped Stock Trajectory */}
            <div className="relative h-16 w-full flex items-end">
              {/* Safety Stock buffer band */}
              <div className="absolute left-0 right-0 bottom-0 h-6 bg-[#ebebeb]/50 dark:bg-[#262626]/50 border-t border-[#d4d4d4] dark:border-[#404040]">
                <span className="absolute left-2 top-1 text-[9px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                  Safety Stock Buffer (SS = 38 units)
                </span>
              </div>

              {/* Reorder Point (ROP) line */}
              <div className="absolute left-0 right-0 bottom-10 border-b border-dashed border-[#171717] dark:border-[#f5f5f5] z-10">
                <span className="absolute right-2 -top-3.5 text-[9px] font-mono text-[#171717] dark:text-[#f5f5f5] bg-white dark:bg-[#141414] px-1 border border-[#ebebeb] dark:border-[#262626] rounded">
                  Reorder Point (ROP = 96 units)
                </span>
              </div>

              {/* Trajectory Simulation Curve */}
              <svg className="w-full h-full overflow-visible z-20" preserveAspectRatio="none">
                {/* Projected path */}
                <path
                  d="M 10,12 L 80,24 L 160,36 L 240,48 L 320,54 L 400,60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#171717] dark:text-[#f5f5f5]"
                />
                {/* Stockout threshold breach node */}
                <circle
                  cx="240"
                  cy="48"
                  r={activeStep >= 2 ? "4" : "2"}
                  className="fill-[#171717] dark:fill-[#f5f5f5] stroke-white dark:stroke-[#141414] stroke-2"
                />
              </svg>

              {/* Trigger Indicator */}
              {activeStep >= 2 && (
                <div className="absolute left-[50%] -translate-x-1/2 bottom-12 flex items-center gap-1 bg-[#171717] dark:bg-[#f5f5f5] text-white dark:text-[#0a0a0a] text-[10px] font-mono px-2 py-0.5 rounded shadow-sm z-30 animate-in fade-in duration-300">
                  <ArrowRight className="w-3 h-3" />
                  <span>Threshold crossed (Day 4)</span>
                </div>
              )}
            </div>
          </div>

          {/* Replenishment Guidance Output */}
          <div className="md:col-span-4 border border-[#f0f0f0] dark:border-[#222222] rounded bg-white dark:bg-[#141414] p-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                <span>Order Decision</span>
                <span className="text-[10px] uppercase font-bold text-[#171717] dark:text-[#f5f5f5]">
                  {activeStep === 3 ? "Order Ready" : "Evaluating"}
                </span>
              </div>

              <div className="text-xl font-bold font-mono tracking-tight text-[#171717] dark:text-[#f5f5f5]">
                {activeStep >= 2 ? "+240 units" : "0 units"}
              </div>

              <p className="text-[11px] text-[#737373] dark:text-[#a3a3a3] leading-snug">
                {activeStep >= 2
                  ? "EOQ batch size based on 3.0d lead time & holding cost."
                  : "Awaiting anomaly filtering and baseline consensus."}
              </p>
            </div>

            <div className="pt-2 border-t border-[#f0f0f0] dark:border-[#222222] flex items-center justify-between text-[10px] font-mono text-[#525252] dark:text-[#a3a3a3]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#171717] dark:text-[#f5f5f5]" />
                Deterministic
              </span>
              <span>Stockout Risk: 0.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Footnote */}
      <div className="mt-4 pt-3 border-t border-[#ebebeb] dark:border-[#262626] flex flex-wrap items-center justify-between gap-y-2 text-[11px] text-[#737373] dark:text-[#a3a3a3]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#d4d4d4] dark:bg-[#383838]" />
            Historical demand
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#171717] dark:bg-[#f5f5f5]" />
            Detected anomaly
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 border-b-2 border-dashed border-[#737373]" />
            Adjusted forecast
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 border-b-2 border-dashed border-[#171717] dark:border-[#f5f5f5]" />
            Reorder threshold
          </span>
        </div>

        <div className="font-mono text-[10px]">
          <span>Pure mathematical model · No black box</span>
        </div>
      </div>
    </div>
  );
};

export default InventorySignalAnimation;
