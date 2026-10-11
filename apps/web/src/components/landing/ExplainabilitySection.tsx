// apps/web/src/components/landing/ExplainabilitySection.tsx
import React from "react";

export const ExplainabilitySection: React.FC = () => {
  return (
    <section id="explainability" className="py-16 sm:py-24 bg-white border-b border-[#ebebeb] scroll-mt-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl text-left space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8f8f8f]">
            Transparent Logic
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#171717] tracking-[-0.03em] leading-tight">
            Every recommendation should have a reason.
          </h2>
          <p className="text-base text-[#4d4d4d] leading-relaxed">
            No black-box recommendations. Every number on StockSense connects back to standard
            supply-chain formulas, historical demand, and chosen safety thresholds.
          </p>
        </div>

        {/* Worked Derivation Card */}
        <div className="bg-[#fafafa] border border-[#ebebeb] rounded-2xl p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ebebeb] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#171717]">
                  WORKED EXAMPLE · PCM-02
                </span>
                <span className="text-[11px] font-mono text-[#ee0000] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  Action: Order now
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#171717] mt-1">
                Paracetamol 500 mg Strips — Mathematical Derivation
              </h3>
            </div>
            <div className="text-xs font-mono text-[#171717] bg-white border border-[#ebebeb] px-3 py-1.5 rounded-lg">
              Service Level 95% · z = 1.645
            </div>
          </div>

          {/* 4 Derivation Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8f8f8f]">
                Step 1 · Lead Demand
              </div>
              <div className="text-2xl font-bold font-mono text-[#171717]">
                500 <span className="text-xs font-normal text-[#8f8f8f]">units</span>
              </div>
              <p className="text-xs text-[#4d4d4d] leading-relaxed">
                Expected sales while awaiting delivery: <strong>50 units/day × 10 days</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8f8f8f]">
                Step 2 · Safety Stock (SS)
              </div>
              <div className="text-2xl font-bold font-mono text-[#171717]">
                181 <span className="text-xs font-normal text-[#8f8f8f]">units</span>
              </div>
              <p className="text-xs text-[#4d4d4d] leading-relaxed">
                Buffer protecting against demand & lead variability: <strong>1.645 × 109.5</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#171717] rounded-xl p-5 space-y-2 ring-1 ring-[#171717]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#171717]">
                Step 3 · Reorder Point
              </div>
              <div className="text-2xl font-bold font-mono text-[#171717]">
                681 <span className="text-xs font-normal text-[#8f8f8f]">units</span>
              </div>
              <p className="text-xs text-[#4d4d4d] leading-relaxed">
                Threshold: 500 + 181 = <strong>681</strong>. Stock is 300, so reorder triggers today.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8f8f8f]">
                Step 4 · Order Qty (EOQ)
              </div>
              <div className="text-2xl font-bold font-mono text-[#171717]">
                1,250 <span className="text-xs font-normal text-[#8f8f8f]">units</span>
              </div>
              <p className="text-xs text-[#4d4d4d] leading-relaxed">
                EOQ = 1,208.3 units, rounded up to the nearest supplier pack size of <strong>50</strong>.
              </p>
            </div>
          </div>

          {/* Core Distinction Note */}
          <div className="p-4 bg-white border border-[#ebebeb] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#4d4d4d]">
            <div>
              <strong className="text-[#171717]">Core Principle:</strong> Reorder Point (ROP) decides{" "}
              <em>when</em> to trigger an order. Order Quantity (EOQ) decides <em>how much</em> to order.
            </div>
            <span className="font-mono text-[#8f8f8f] shrink-0">Pure TypeScript · No AI Guesswork</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExplainabilitySection;
