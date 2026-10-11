// apps/web/src/components/landing/HeroSection.tsx
// Minimalist, editorial hero section with custom InventorySignalAnimation

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { InventorySignalAnimation } from "./InventorySignalAnimation";

export const HeroSection: React.FC = () => {
  const handleScrollToWorkflow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#how-it-works");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-10 pb-16 lg:pt-14 lg:pb-20 border-b border-[#ebebeb] dark:border-[#262626]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Content */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#525252] dark:text-[#a3a3a3] text-[11px] font-mono font-medium tracking-wider uppercase border border-[#ebebeb] dark:border-[#262626]">
              <span>AI-POWERED INVENTORY INTELLIGENCE</span>
              <span className="w-1 h-1 rounded-full bg-[#a3a3a3]" />
              <span>S-02</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-[38px] sm:text-[48px] lg:text-[58px] font-semibold tracking-[-0.035em] text-[#171717] dark:text-[#f5f5f5] leading-[1.05]">
              Know what to restock.{" "}
              <span className="text-[#737373] dark:text-[#8e8e8e] block sm:inline">
                Before it becomes a problem.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-[15px] sm:text-[16px] text-[#525252] dark:text-[#a3a3a3] leading-relaxed max-w-xl font-normal">
              StockSense identifies unusual sales patterns, refines baseline forecasts without distortion,
              and supports evidence-based replenishment before stockouts occur.
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                to="/recommendations"
                className="inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#2b2b2b] text-white dark:bg-[#f5f5f5] dark:hover:bg-white dark:text-[#0a0a0a] text-sm font-medium px-5 py-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] focus:ring-offset-2 active:scale-[0.99]"
              >
                <span>Explore the approach</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                onClick={handleScrollToWorkflow}
                className="inline-flex items-center justify-center gap-1.5 bg-white dark:bg-[#141414] hover:bg-[#f5f5f5] dark:hover:bg-[#1c1c1c] text-[#171717] dark:text-[#f5f5f5] text-sm font-medium px-4 py-2.5 rounded-full border border-[#ebebeb] dark:border-[#262626] transition-all focus:outline-none focus:ring-1 focus:ring-[#171717]"
              >
                <span>See how it works</span>
                <ChevronRight className="w-4 h-4 text-[#737373]" />
              </a>
            </div>

            {/* Trust statement & constraints row */}
            <div className="pt-3 border-t border-[#ebebeb] dark:border-[#262626] grid grid-cols-3 gap-2 text-left">
              <div>
                <div className="text-xs font-mono font-semibold text-[#171717] dark:text-[#f5f5f5]">
                  0%
                </div>
                <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3] leading-tight">
                  Blind Guesswork
                </div>
              </div>
              <div>
                <div className="text-xs font-mono font-semibold text-[#171717] dark:text-[#f5f5f5]">
                  100%
                </div>
                <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3] leading-tight">
                  Deterministic Core
                </div>
              </div>
              <div>
                <div className="text-xs font-mono font-semibold text-[#171717] dark:text-[#f5f5f5]">
                  Zod-Clamped
                </div>
                <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3] leading-tight">
                  Bounded AI Output
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Lightweight Abstract Animation */}
          <div className="lg:col-span-7 w-full">
            <InventorySignalAnimation />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
