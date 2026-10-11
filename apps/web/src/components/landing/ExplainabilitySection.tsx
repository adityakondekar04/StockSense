// apps/web/src/components/landing/ExplainabilitySection.tsx
import React from "react";
import {
  Sparkles,
  Calculator,
} from "lucide-react";

export const ExplainabilitySection: React.FC = () => {
  return (
    <section id="explainability" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
            Complete Traceability
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Every recommendation should have a reason.
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            No unexplainable recommendations. Every figure on StockSense connects back to standard
            supply-chain formulas, historical demand, and chosen safety thresholds.
          </p>
        </div>

        {/* Worked Example Card */}
        <div className="mt-12 max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Header of the card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">SAMPLE SKU: PCM-02</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                  Action: Order now
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Paracetamol 500 mg Strips — Worked Replenishment Breakdown
              </h3>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Service Level: 95% → z = 1.645</span>
            </div>
          </div>

          {/* Stepped Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Step 1: Lead-Time Demand */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Step 1 · Lead-Time Demand
                </span>
                <span className="text-xs text-slate-400">D̄ × L̄</span>
              </div>
              <div className="text-xl font-bold text-slate-900">
                500 <span className="text-xs font-normal text-slate-500">units</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Expected sales while waiting for the supplier: <strong>50 units/day</strong> over a{" "}
                <strong>10-day</strong> lead time.
              </p>
            </div>

            {/* Step 2: Safety Stock */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Step 2 · Safety Stock (SS)
                </span>
                <span className="text-xs text-slate-400">z × σLT</span>
              </div>
              <div className="text-xl font-bold text-slate-900">
                181 <span className="text-xs font-normal text-slate-500">units</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buffer protecting against both demand surges (σD) and lead-time delays (σL):{" "}
                <strong>1.645 × 109.5</strong>.
              </p>
            </div>

            {/* Step 3: Reorder Point */}
            <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  Step 3 · Reorder Point (ROP)
                </span>
                <span className="text-xs text-indigo-500 font-semibold">When to order</span>
              </div>
              <div className="text-2xl font-extrabold text-indigo-900">
                681 <span className="text-xs font-normal text-slate-500">units</span>
              </div>
              <p className="text-xs text-indigo-900/80 leading-relaxed">
                500 (lead demand) + 181 (safety stock) = <strong>681 units</strong>. Current stock is{" "}
                <strong>300</strong>, so replenishment must trigger immediately.
              </p>
            </div>

            {/* Step 4: Order Quantity */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Step 4 · Order Quantity (EOQ)
                </span>
                <span className="text-xs text-slate-400 font-semibold">How much to order</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                1,250 <span className="text-xs font-normal text-slate-500">units</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Minimizes holding vs ordering costs (EOQ ≈ 1,208.3), rounded up to the nearest pack size of{" "}
                <strong>50 units</strong>.
              </p>
            </div>
          </div>

          {/* Key Distinction Callout */}
          <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Core Distinction
              </div>
              <p className="text-sm text-slate-200">
                <strong>Reorder Point (ROP)</strong> defines <em>when</em> to trigger an order.{" "}
                <strong>Order Quantity (EOQ)</strong> defines <em>how much</em> to purchase.
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg">
                <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                Pure Math · No AI Guesswork
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
