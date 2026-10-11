// apps/web/src/components/landing/CapabilityStrip.tsx
import React from "react";
import {
  TrendingUp,
  ShieldCheck,
  PackageCheck,
  SlidersHorizontal,
  Binary,
} from "lucide-react";

export const CapabilityStrip: React.FC = () => {
  const capabilities = [
    {
      icon: TrendingUp,
      title: "Demand Forecasting",
      detail: "Holdout evaluation with MAE & WAPE",
    },
    {
      icon: ShieldCheck,
      title: "Statistical Safety Stock",
      detail: "Demand & lead-time variance modeling",
    },
    {
      icon: PackageCheck,
      title: "Reorder Recommendations",
      detail: "Continuous-review (s, Q) policy",
    },
    {
      icon: SlidersHorizontal,
      title: "Scenario Simulation",
      detail: "Seeded Monte Carlo cross-checks",
    },
    {
      icon: Binary,
      title: "Transparent Calculations",
      detail: "Pure TypeScript math engine",
    },
  ];

  return (
    <section className="border-y border-slate-200 bg-white py-6" aria-label="Core Capabilities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
