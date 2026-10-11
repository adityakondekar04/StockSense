// apps/web/src/components/landing/ProblemSolutionSection.tsx
import React from "react";
import { PROBLEM_SOLUTION_ITEMS } from "../../data/landingData";

export const ProblemSolutionSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#ebebeb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl text-left space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8f8f8f]">
            The Storekeeper's Problem
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#171717] tracking-[-0.03em] leading-tight">
            Inventory decisions shouldn't depend on guesswork.
          </h2>
          <p className="text-base text-[#4d4d4d] leading-relaxed">
            In community pharmacies and primary health clinics, a stockout isn't a lost conversion—it's
            a patient walking away without antibiotics. Traditional spreadsheets can't protect against
            both demand surges and supplier delays.
          </p>
        </div>

        {/* Structured Comparison Rows */}
        <div className="mt-12 divide-y divide-[#ebebeb] border-y border-[#ebebeb]">
          {PROBLEM_SOLUTION_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
            >
              {/* Problem Statement (Left Column) */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#ee0000] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    The Problem
                  </span>
                  <h3 className="text-base font-semibold text-[#171717]">
                    {item.problemTitle}
                  </h3>
                </div>
                <p className="text-sm text-[#4d4d4d] leading-relaxed">
                  {item.problemText}
                </p>
              </div>

              {/* Solution & Impact (Right Column) */}
              <div className="lg:col-span-7 bg-[#fafafa] border border-[#ebebeb] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717] bg-white px-2 py-0.5 rounded border border-[#ebebeb]">
                    The StockSense Approach
                  </span>
                  <span className="text-xs font-mono text-[#8f8f8f]">
                    Formula Traced
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-[#171717]">
                  {item.solutionTitle}
                </h4>
                <p className="text-sm text-[#4d4d4d] leading-relaxed">
                  {item.solutionText}
                </p>
                <div className="pt-2 border-t border-[#ebebeb] text-xs font-mono text-[#171717] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#171717]" />
                  <span>{item.metricHighlight}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;
