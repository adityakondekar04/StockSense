// apps/web/src/components/landing/CapabilitiesSection.tsx
// Section C: Core capabilities — 6 purposeful capabilities in a compact, dense grid

import React from "react";
import {
  SlidersHorizontal,
  TrendingUp,
  ShieldCheck,
  PackageCheck,
  Activity,
  FileCheck2,
} from "lucide-react";

export const CapabilitiesSection: React.FC = () => {
  const capabilities = [
    {
      icon: SlidersHorizontal,
      title: "Anomaly detection & cleaning",
      description:
        "Detects unusual sales spikes, promotional runs, and data gaps. Clamps distortive outliers using IQR and Z-score bounds before model fitting.",
      spec: "IQR 1.5× threshold · Winsorized median replacement",
    },
    {
      icon: TrendingUp,
      title: "Baseline forecast modeling",
      description:
        "Generates clean expected daily demand by combining weighted moving averages with weekday seasonality indices.",
      spec: "Day-of-week indices · Zero holdout leakage",
    },
    {
      icon: ShieldCheck,
      title: "Dynamic safety stock calculation",
      description:
        "Buffers against both demand variance and supplier lead-time fluctuations using the rigorous double-variance inventory formula.",
      spec: "z · √(L · σ_d² + d² · σ_L²) · SL 80% to 99.9%",
    },
    {
      icon: PackageCheck,
      title: "Reorder point & EOQ sizing",
      description:
        "Calculates exact threshold triggers and economic order quantities that mathematically balance procurement and holding costs.",
      spec: "ROP = d · L + SS · EOQ = √(2DS / H)",
    },
    {
      icon: Activity,
      title: "Scenario stress testing",
      description:
        "Simulate 7-day inventory performance under sudden demand surges, vendor shipping delays, or lead-time shockwaves using seeded PRNG.",
      spec: "Deterministic mulberry32 PRNG · 7-day run",
    },
    {
      icon: FileCheck2,
      title: "Audit trail & explainability",
      description:
        "Every recommendation logs an immutable provenance path with exact inputs, formula outputs, and deterministic fallback reasons.",
      spec: "Trace: rules | llm | llm_failed_rules",
    },
  ];

  return (
    <section id="capabilities" className="py-12 lg:py-16 border-b border-[#ebebeb] dark:border-[#262626]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-10">
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-2">
            CORE CAPABILITIES
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] text-[#171717] dark:text-[#f5f5f5] leading-tight">
            Everything needed to make a better stock decision.
          </h2>
          <p className="mt-3 text-sm sm:text-[15px] text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
            Six mathematical and operational modules running in pure TypeScript, without opaque AI hallucinations
            or black-box approximations.
          </p>
        </div>

        {/* 6 Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] p-5 flex flex-col justify-between transition-all hover:border-[#d4d4d4] dark:hover:border-[#383838]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-7 h-7 rounded bg-[#f5f5f5] dark:bg-[#1f1f1f] flex items-center justify-center text-[#171717] dark:text-[#f5f5f5]">
                      <Icon className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                  </div>
                  <h3 className="font-heading text-[15px] font-semibold text-[#171717] dark:text-[#f5f5f5] mb-1.5 leading-snug">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0f0f0] dark:border-[#1f1f1f] font-mono text-[10px] text-[#737373] dark:text-[#a3a3a3] truncate">
                  {cap.spec}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
