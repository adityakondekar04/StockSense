// apps/web/src/components/landing/CapabilityStrip.tsx
import React from "react";

export const CapabilityStrip: React.FC = () => {
  const capabilities = [
    { title: "Demand Forecasting", detail: "Holdout validation with MAE & WAPE" },
    { title: "Statistical Safety Stock", detail: "Demand & lead-time variance modeling" },
    { title: "Reorder Planning", detail: "Continuous-review (s, Q) replenishment" },
    { title: "Scenario Simulation", detail: "Seeded Monte Carlo cross-checks" },
    { title: "Deterministic Calculations", detail: "Pure TypeScript math engine" },
  ];

  return (
    <section className="border-b border-[#ebebeb] bg-[#fafafa] py-5" aria-label="Core Capabilities">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {capabilities.map((item, idx) => (
            <div
              key={idx}
              className="border-l border-[#ebebeb] pl-3 py-1 flex flex-col justify-center"
            >
              <span className="text-xs font-semibold text-[#171717] leading-tight">
                {item.title}
              </span>
              <span className="text-[11px] text-[#8f8f8f] mt-0.5 leading-tight">
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilityStrip;
