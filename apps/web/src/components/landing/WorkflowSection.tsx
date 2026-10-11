// apps/web/src/components/landing/WorkflowSection.tsx
// Section B: How StockSense works — 3-stage process (Detect -> Refine -> Recommend)

import React from "react";
import { Search, Sliders, CheckSquare, ArrowRight } from "lucide-react";

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      num: "01",
      name: "Detect",
      icon: Search,
      tagline: "Outlier identification",
      description:
        "Investigate historical sales and identify unusual observations that could distort the baseline forecast. Statistical IQR thresholds and level-shift checks separate organic demand from one-off bulk anomalies.",
      detail: "Fit on training window only · Never on holdout",
    },
    {
      num: "02",
      name: "Refine",
      icon: Sliders,
      tagline: "Robust baseline calculation",
      description:
        "Handle identified anomalies according to the forecasting methodology and calculate a more representative baseline. Distorted observations are winsorized or clamped to protect downstream safety stock formulas.",
      detail: "Day-of-week indexing · Seasonality preservation",
    },
    {
      num: "03",
      name: "Recommend",
      icon: CheckSquare,
      tagline: "Explainable decision support",
      description:
        "Translate the refined forecast, inventory position, and relevant supply constraints into explainable replenishment guidance. Outputs exact Reorder Point, Safety Stock buffer, and EOQ batch quantity.",
      detail: "Service level basis (z = 1.645) · Zero black-box",
    },
  ];

  return (
    <section id="how-it-works" className="py-12 lg:py-16 border-b border-[#ebebeb] dark:border-[#262626]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-10">
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-2">
            THREE-STAGE ARCHITECTURE
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] text-[#171717] dark:text-[#f5f5f5] leading-tight">
            From historical sales to confident replenishment.
          </h2>
          <p className="mt-3 text-sm sm:text-[15px] text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
            A deterministic, closed-loop pipeline that transforms raw point-of-sale data into verified
            procurement orders without mathematical distortion.
          </p>
        </div>

        {/* 3-Stage Process Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.name}
                className="relative rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] p-6 flex flex-col justify-between transition-all hover:border-[#d4d4d4] dark:hover:border-[#383838]"
              >
                <div>
                  {/* Step header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f0f0f0] dark:border-[#1f1f1f]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#171717] dark:text-[#f5f5f5]">
                        {step.num}
                      </span>
                      <span className="text-[11px] font-mono uppercase text-[#737373] dark:text-[#a3a3a3]">
                        {step.tagline}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded bg-[#f5f5f5] dark:bg-[#1f1f1f] flex items-center justify-center text-[#171717] dark:text-[#f5f5f5]">
                      <Icon className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                  </div>

                  <h3 className="font-heading text-lg font-semibold text-[#171717] dark:text-[#f5f5f5] mb-2">
                    {step.name}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#f0f0f0] dark:border-[#1f1f1f] flex items-center justify-between text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                  <span>{step.detail}</span>
                  {idx < 2 && (
                    <ArrowRight className="w-3.5 h-3.5 hidden md:block text-[#a3a3a3] dark:text-[#525252]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
