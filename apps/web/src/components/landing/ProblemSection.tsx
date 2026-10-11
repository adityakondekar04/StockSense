// apps/web/src/components/landing/ProblemSection.tsx
// Section A: The inventory problem — compact horizontal layout with fine dividers

import React from "react";
import { TrendingDown, Clock, Banknote } from "lucide-react";

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      num: "01",
      icon: TrendingDown,
      title: "Demand anomalies distort baseline forecasts",
      description:
        "One-off bulk orders and promotional surges inflate raw sales averages. Without outlier cleaning, forecasting algorithms over-react and trigger persistent over-ordering cycles.",
      stat: "+42% forecast distortion from uncleaned spikes",
    },
    {
      num: "02",
      icon: Clock,
      title: "Supplier delays increase stockout risk",
      description:
        "Static reorder points assume vendor shipments arrive exactly on schedule. Real-world transit variance and supplier backlogs deplete buffers before new stock lands.",
      stat: "3.2× stockout rate when lead-time variance is unbuffered",
    },
    {
      num: "03",
      icon: Banknote,
      title: "Excess inventory ties up working capital",
      description:
        "Defensive hoarding ties up scarce working capital in stagnant stock, compounding carrying costs and accelerating product spoilage, expiration, and dead-weight write-downs.",
      stat: "28% capital locked in uncalibrated buffer inventory",
    },
  ];

  return (
    <section id="problem" className="py-12 lg:py-16 border-b border-[#ebebeb] dark:border-[#262626]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-10">
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-2">
            THE INVENTORY PROBLEM
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] text-[#171717] dark:text-[#f5f5f5] leading-tight">
            Inventory decisions shouldn't depend on guesswork.
          </h2>
          <p className="mt-3 text-sm sm:text-[15px] text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
            Storekeepers, community pharmacies, and distribution managers struggle with three systemic
            breakdowns when relying on static spreadsheets or blunt heuristics.
          </p>
        </div>

        {/* 3 Problems in a Compact Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#ebebeb] dark:divide-[#262626]">
          {problems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`py-6 md:py-0 ${
                  idx === 0
                    ? "md:pr-8"
                    : idx === 1
                    ? "md:px-8"
                    : "md:pl-8"
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold text-[#737373] dark:text-[#a3a3a3]">
                      {item.num}
                    </span>
                    <Icon className="w-4 h-4 text-[#171717] dark:text-[#f5f5f5] stroke-[1.8]" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-[#171717] dark:text-[#f5f5f5] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#f0f0f0] dark:border-[#1f1f1f] text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                  {item.stat}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
