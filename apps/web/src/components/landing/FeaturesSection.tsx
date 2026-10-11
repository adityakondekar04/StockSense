// apps/web/src/components/landing/FeaturesSection.tsx
import React from "react";

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white border-b border-[#ebebeb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl text-left space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8f8f8f]">
            Engineering Rigor
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#171717] tracking-[-0.03em] leading-tight">
            Six pillars of reliable replenishment
          </h2>
          <p className="text-base text-[#4d4d4d] leading-relaxed">
            Every calculation traces back to standard inventory formulas in a pure TypeScript package.
            No unexplainable recommendations or black-box predictions.
          </p>
        </div>

        {/* 2 Primary Core Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pillar 1: Reorder Planning */}
          <div className="bg-[#fafafa] border border-[#ebebeb] rounded-2xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[#171717] bg-white border border-[#ebebeb] px-2.5 py-0.5 rounded">
                  Core Policy (s, Q)
                </span>
                <span className="text-[11px] font-mono text-[#8f8f8f]">When vs How Much</span>
              </div>
              <h3 className="text-xl font-semibold text-[#171717]">
                Adaptive Reorder Planning
              </h3>
              <p className="text-sm text-[#4d4d4d] leading-relaxed">
                StockSense strictly distinguishes the Reorder Point (when inventory position triggers a
                replenishment purchase) from the Order Quantity (how much to purchase based on EOQ, pack
                sizes, and supplier MOQ).
              </p>
            </div>
            <div className="bg-white border border-[#ebebeb] rounded-xl p-3.5 font-mono text-xs text-[#171717] space-y-1">
              <div className="text-[10px] text-[#8f8f8f] uppercase">Replenishment Formula</div>
              <div className="font-semibold">ROP = D̄ · L̄ + Safety Stock</div>
              <div className="text-[11px] text-[#4d4d4d]">EOQ = √(2·D·S / H) · Pack-Size Ceiled</div>
            </div>
          </div>

          {/* Pillar 2: Dual Variance Safety Stock */}
          <div className="bg-[#fafafa] border border-[#ebebeb] rounded-2xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[#171717] bg-white border border-[#ebebeb] px-2.5 py-0.5 rounded">
                  Statistical Buffer
                </span>
                <span className="text-[11px] font-mono text-[#8f8f8f]">Cycle Service Level</span>
              </div>
              <h3 className="text-xl font-semibold text-[#171717]">
                Explainable Dual-Variability Safety Stock
              </h3>
              <p className="text-sm text-[#4d4d4d] leading-relaxed">
                Static buffers fail because they ignore supplier delay variance. StockSense combines daily
                demand variability (σD) and supplier lead-time standard deviation (σL) into a single combined
                metric, scaled by your target service-level z-factor.
              </p>
            </div>
            <div className="bg-white border border-[#ebebeb] rounded-xl p-3.5 font-mono text-xs text-[#171717] space-y-1">
              <div className="text-[10px] text-[#8f8f8f] uppercase">Combined Variance Formula</div>
              <div className="font-semibold">σLT = √(L̄·σD² + D̄²·σL²)</div>
              <div className="text-[11px] text-[#4d4d4d]">Safety Stock = z · σLT · Service Level 95% → z = 1.645</div>
            </div>
          </div>
        </div>

        {/* 4 Supporting Capabilities Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-[#ebebeb] bg-white space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8f8f8f] block">
              Data Integrity
            </span>
            <h4 className="text-sm font-semibold text-[#171717]">Demand Anomaly Review</h4>
            <p className="text-xs text-[#4d4d4d] leading-relaxed">
              Weekday medians and modified z-scores identify unusual spikes. Classified into promotions, errors,
              or unknowns while preserving raw records.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#ebebeb] bg-white space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8f8f8f] block">
              Model Evaluation
            </span>
            <h4 className="text-sm font-semibold text-[#171717]">Leakage-Safe Holdout Testing</h4>
            <p className="text-xs text-[#4d4d4d] leading-relaxed">
              Chronological 80/20 train/holdout split. Compares models with a simple naive baseline on MAE,
              WAPE, and bias with honest reporting when baseline wins.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#ebebeb] bg-white space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8f8f8f] block">
              Decision Support
            </span>
            <h4 className="text-sm font-semibold text-[#171717]">Interactive Scenario Lab</h4>
            <p className="text-xs text-[#4d4d4d] leading-relaxed">
              Simulates demand surges and delivery delays before ordering. Old policy risk verified
              analytically and via seeded Monte Carlo simulation.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#ebebeb] bg-white space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8f8f8f] block">
              Safety Architecture
            </span>
            <h4 className="text-sm font-semibold text-[#171717]">Bounded AI Assistance</h4>
            <p className="text-xs text-[#4d4d4d] leading-relaxed">
              Rules decide, AI advises. AI suggestions are clamped to ±30% with an automatic deterministic
              local fallback when offline.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
