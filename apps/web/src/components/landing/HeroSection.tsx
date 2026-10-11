// apps/web/src/components/landing/HeroSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

export const HeroSection: React.FC = () => {
  const handleScrollToSimulation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#simulation");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="overview" className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#ebebeb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f2f2f2] text-[#4d4d4d] text-xs font-mono font-medium">
              <span>INVENTORY INTELLIGENCE</span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span>VORTEXA 3.0 · S-02</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold text-[#171717] tracking-[-0.035em] leading-[1.08]">
              Know what to reorder.{" "}
              <span className="text-[#8f8f8f] block sm:inline">Before it runs out.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#4d4d4d] leading-relaxed font-normal max-w-xl">
              Turn sales history, stock levels, and supplier lead times into clear replenishment
              recommendations—with explainable safety stock calculations, demand insights, and what-if
              simulations.
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                to="/recommendations"
                className="inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#2b2b2b] text-white text-sm font-medium px-6 py-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2 active:bg-[#000000]"
              >
                <span>Explore the Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#simulation"
                onClick={handleScrollToSimulation}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f5f5f5] text-[#171717] text-sm font-medium px-5 py-3 rounded-full border border-[#ebebeb] transition-all focus:outline-none focus:ring-1 focus:ring-[#171717]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch 7-Day Simulation</span>
              </a>
            </div>

            {/* Benefit statements row */}
            <div className="pt-4 border-t border-[#f2f2f2] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#4d4d4d]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171717]" />
                Explainable reorder recommendations
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171717]" />
                Demand-aware safety stock
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171717]" />
                Supplier-delay simulations
              </span>
            </div>

            {/* Target user note */}
            <p className="text-xs text-[#8f8f8f] pt-1">
              Decision support designed for community pharmacies, primary health centres, and small
              retail storekeepers.
            </p>
          </div>

          {/* Right Column: Console Preview */}
          <div className="lg:col-span-6 w-full">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
