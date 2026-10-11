// apps/web/src/components/landing/FeaturesSection.tsx
import React from "react";
import {
  PackageCheck,
  ShieldCheck,
  Search,
  LineChart,
  FlaskConical,
  Bot,
} from "lucide-react";
import { CORE_FEATURES } from "../../data/landingData";

export const FeaturesSection: React.FC = () => {
  const icons = [
    PackageCheck,
    ShieldCheck,
    Search,
    LineChart,
    FlaskConical,
    Bot,
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
            Engineering Rigor
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Six Pillars of Reliable Inventory Control
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Every feature is designed with zero black-box numbers, strict mathematical validation, and
            deterministic fallbacks.
          </p>
        </div>

        {/* 6 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-14">
          {CORE_FEATURES.map((feature, idx) => {
            const Icon = icons[idx];
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {feature.badge}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {feature.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-500 font-medium">
                  <span>Traced to PRD specification</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
