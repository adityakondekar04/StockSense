// apps/web/src/components/landing/FinalCTA.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, ShieldCheck, Play } from "lucide-react";

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden text-center sm:text-left">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto sm:mx-0 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-white/10">
              <Boxes className="w-3.5 h-3.5" />
              <span>Ready for Evaluation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Make your next replenishment decision with confidence.
            </h2>

            <p className="text-base text-slate-300 leading-relaxed font-normal">
              Start with sample inventory data, explore the calculations, and see how changing demand or
              lead time affects your recommendations.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3.5">
              <Link
                to="/recommendations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3.5 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <span>Explore StockSense</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#scenario-lab"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-3.5 rounded-xl border border-white/10 transition-all"
              >
                <Play className="w-4 h-4 text-indigo-300 fill-indigo-300" />
                <span>Try Simulator</span>
              </a>
            </div>

            <p className="text-xs text-slate-400 pt-2 flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Fully functional with AI disabled · Deterministic fallback by design</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
