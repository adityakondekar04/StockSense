// apps/web/src/components/landing/HeroSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Play } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

export const HeroSection: React.FC = () => {
  const handleScrollToHowItWorks = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#how-it-works");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="overview" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50/60 via-slate-50/40 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
              <span>INVENTORY INTELLIGENCE</span>
              <span className="w-1 h-1 rounded-full bg-indigo-400" />
              <span className="font-medium lowercase">vortexa 3.0 · s-02</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Know what to reorder.{" "}
              <span className="text-indigo-600 block sm:inline">Before it runs out.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
              Turn sales history, stock levels, and supplier lead times into clear replenishment
              recommendations—with explainable safety stock calculations, demand insights, and what-if
              simulations.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                to="/recommendations"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-indigo-800 text-base"
              >
                <span>Explore the Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                onClick={handleScrollToHowItWorks}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium px-5 py-3.5 rounded-xl border border-slate-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-slate-100 text-base"
              >
                <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Three key benefits */}
            <div className="pt-4 border-t border-slate-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Explainable reorders</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Demand-aware safety stock</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Supplier-delay simulations</span>
                </div>
              </div>
            </div>

            {/* Target user note */}
            <p className="text-xs text-slate-500">
              Built specifically for small healthcare clinics, community pharmacies, and storekeepers
              navigating volatile supplier timelines.
            </p>
          </div>

          {/* Right Column: Live Interactive Dashboard Preview */}
          <div className="lg:col-span-6 w-full">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
};
