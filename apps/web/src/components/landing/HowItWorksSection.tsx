// apps/web/src/components/landing/HowItWorksSection.tsx
import React from "react";
import { UploadCloud, Calculator, Sliders } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "../../data/landingData";
import { InventorySimulation } from "./InventorySimulation";

export const HowItWorksSection: React.FC = () => {
  const stepIcons = [UploadCloud, Calculator, Sliders];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-[#fafafa] border-b border-[#ebebeb] scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* The Interactive Shelf Simulation */}
        <InventorySimulation />

        {/* Supporting Architectural Steps */}
        <div className="pt-4">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-700 bg-white border border-[#ebebeb] px-3 py-1 rounded-full font-mono">
              Three Simple Steps
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              How StockSense Computes Every Order
            </h3>
            <p className="text-base text-[#4d4d4d] font-normal leading-relaxed">
              From raw historical records to mathematically validated replenishment orders, with explainable
              steps every storekeeper can verify.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 relative">
            {HOW_IT_WORKS_STEPS.map((step, idx) => {
              const Icon = stepIcons[idx];
              return (
                <div
                  key={idx}
                  className="relative bg-white border border-[#ebebeb] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-400 hover:shadow-sm transition-all group"
                >
                  <div>
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-2xl font-black text-slate-300 group-hover:text-[#171717] transition-colors font-mono">
                        {step.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#fafafa] border border-[#ebebeb] flex items-center justify-center text-[#171717] shadow-xs group-hover:border-slate-300 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h4 className="text-lg font-bold text-[#171717] transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-sm text-[#4d4d4d] mt-2.5 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="pt-6 mt-6 border-t border-[#ebebeb] flex flex-wrap gap-1.5">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-[#4d4d4d] bg-[#fafafa] border border-[#ebebeb] px-2 py-0.5 rounded-md font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
