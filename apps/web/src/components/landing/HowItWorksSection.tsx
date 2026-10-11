// apps/web/src/components/landing/HowItWorksSection.tsx
import React from "react";
import { HOW_IT_WORKS_STEPS } from "../../data/landingData";

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-[#fafafa] border-b border-[#ebebeb] scroll-mt-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl text-left space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8f8f8f]">
            Three-Step Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#171717] tracking-[-0.03em] leading-tight">
            How StockSense computes replenishment
          </h2>
          <p className="text-base text-[#4d4d4d] leading-relaxed">
            From raw sales history to audited reorder points, with deterministic calculations every
            storekeeper can inspect.
          </p>
        </div>

        {/* Lightweight 3-Step Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#ebebeb] rounded-xl p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                  <span className="text-xs font-mono font-semibold text-[#171717] bg-[#f2f2f2] px-2 py-0.5 rounded">
                    Step {step.step}
                  </span>
                  <span className="text-[11px] font-mono text-[#8f8f8f]">
                    Phase {idx + 1}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#171717] leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-[#4d4d4d] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Tags */}
              <div className="pt-6 mt-4 border-t border-[#f2f2f2] flex flex-wrap gap-1.5">
                {step.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono text-[#4d4d4d] bg-[#fafafa] border border-[#ebebeb] px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
