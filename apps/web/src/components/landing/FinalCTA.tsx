// apps/web/src/components/landing/FinalCTA.tsx
// Section D: Final CTA — high-contrast monochrome section with clear actions

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";

export const FinalCTA: React.FC = () => {
  const handleScrollToWorkflow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#how-it-works");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-14 sm:py-20 border-b border-[#ebebeb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[#ebebeb] bg-[#171717] p-8 sm:p-12 lg:p-14 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-5">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#262626] text-[#d4d4d4] text-[11px] font-mono tracking-wider uppercase border border-[#383838]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4d4d4]" />
              <span>DETERMINISTIC INVENTORY INTELLIGENCE</span>
            </div>

            {/* Heading */}
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-[-0.03em] leading-tight">
              Make your next replenishment decision with greater confidence.
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-[15px] text-[#a3a3a3] leading-relaxed font-normal">
              Eliminate stockout surprises and buffer waste. Calculate empirical safety stocks,
              inspect cleaned sales anomalies, and trace every recommendation down to the underlying formula.
            </p>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/recommendations"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f5f5f5] text-[#171717] font-medium px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#171717]"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                onClick={handleScrollToWorkflow}
                className="inline-flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#262626] text-[#d4d4d4] hover:text-white font-medium px-4 py-2.5 rounded-full text-xs sm:text-sm border border-[#383838] transition-all"
              >
                <span>Explore StockSense</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#a3a3a3]" />
              </a>
              <Link
                to="/methodology"
                className="inline-flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#262626] text-[#d4d4d4] hover:text-white font-medium px-4 py-2.5 rounded-full text-xs sm:text-sm border border-[#383838] transition-all"
              >
                <span>Review Methodology</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#a3a3a3]" />
              </Link>
            </div>

            {/* Footnote */}
            <div className="pt-4 border-t border-[#262626] flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono text-[#a3a3a3]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Pure math in packages/core
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Deterministic fallbacks
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
