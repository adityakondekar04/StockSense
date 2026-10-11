// apps/web/src/components/landing/ProblemSolutionSection.tsx
import React from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { PROBLEM_SOLUTION_ITEMS } from "../../data/landingData";

export const ProblemSolutionSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
            The Storekeeper's Reality
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Inventory decisions shouldn't depend on guesswork.
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            A stockout in a pharmacy or primary health clinic isn't just a lost sale—it's a patient
            traveling 15 kilometers for essential medication. Traditional spreadsheets can't handle
            volatility.
          </p>
        </div>

        {/* 3 Problem & Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12">
          {PROBLEM_SOLUTION_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              {/* Problem Block */}
              <div className="p-6 bg-slate-50/70 border-b border-slate-100">
                <div className="flex items-center gap-2 text-red-600 font-semibold text-xs uppercase tracking-wider mb-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>The Problem</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{item.problemTitle}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {item.problemText}
                </p>
              </div>

              {/* Solution Block */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>The StockSense Approach</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{item.solutionTitle}</h4>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.solutionText}
                  </p>
                </div>

                {/* Highlight Pill */}
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 font-medium">
                  {item.metricHighlight}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
