// apps/web/src/components/landing/HowItWorksSection.tsx
import React from "react";
import { UploadCloud, Calculator, Sliders } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "../../data/landingData";

export const HowItWorksSection: React.FC = () => {
  const stepIcons = [UploadCloud, Calculator, Sliders];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
            Three Simple Steps
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How StockSense Works
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            From raw historical records to actionable replenishment orders, with explainable steps every
            storekeeper can verify.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 relative">
          {HOW_IT_WORKS_STEPS.map((step, idx) => {
            const Icon = stepIcons[idx];
            return (
              <div
                key={idx}
                className="relative bg-slate-50/70 border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-indigo-600/40 group-hover:text-indigo-600 transition-colors font-mono">
                      {step.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm group-hover:border-indigo-300 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2.5 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="pt-6 mt-6 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md"
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
    </section>
  );
};
