// apps/web/src/components/landing/FinalCTA.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, ShieldCheck, Play } from "lucide-react";

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#fafafa] border-t border-[#ebebeb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#171717] rounded-2xl border border-neutral-800 p-8 sm:p-12 lg:p-14 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 text-neutral-300 text-xs font-mono font-medium border border-neutral-700">
              <Boxes className="w-3.5 h-3.5 text-neutral-300" />
              <span>DETERMINISTIC EVALUATION</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight">
              Make your next replenishment decision with empirical certainty.
            </h2>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-normal">
              Explore mathematical reorder points, calibrate safety stock against supplier variance,
              and run what-if stress tests before committing capital to orders.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/recommendations"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-[#171717] font-medium px-6 py-3 rounded-full text-sm transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#171717]"
              >
                <span>Explore StockSense</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#simulation"
                className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-neutral-800 text-neutral-200 font-medium px-5 py-3 rounded-full text-sm border border-neutral-700 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current text-neutral-300" />
                <span>Watch 7-Day Simulation</span>
              </a>
            </div>

            <div className="pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
                Pure math in @stocksense/core
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                Deterministic fallback guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                Continuous review (s, Q)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
