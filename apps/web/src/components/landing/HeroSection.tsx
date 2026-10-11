// apps/web/src/components/landing/HeroSection.tsx
// Minimalist editorial hero section with interactive 3D Stock Depletion & Replenishment background

import React from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Box } from "lucide-react";
import { Hero3DBackground } from "./Hero3DBackground";

export const HeroSection: React.FC = () => {
  const handleScrollToWorkflow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#how-it-works");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[580px] lg:min-h-[650px] flex items-center py-16 lg:py-24 border-b border-[#ebebeb] dark:border-[#262626] overflow-hidden">
      {/* Interactive 3D Isometric Stock Depletion & EOQ Replenishment Background */}
      <Hero3DBackground />

      <div className="relative z-10 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl space-y-6 text-left">
          {/* Small Eyebrow */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/90 dark:bg-[#141414]/90 backdrop-blur-sm text-[#525252] dark:text-[#a3a3a3] text-[11px] font-mono font-medium tracking-wider uppercase border border-[#ebebeb] dark:border-[#262626]">
            <span>AI-POWERED INVENTORY INTELLIGENCE</span>
            <span className="w-1 h-1 rounded-full bg-[#e11d48] animate-pulse" />
            <span>S-02</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-[40px] sm:text-[52px] lg:text-[62px] font-semibold tracking-[-0.035em] text-[#171717] dark:text-[#f5f5f5] leading-[1.04]">
            Know what to restock.{" "}
            <span className="text-[#737373] dark:text-[#8e8e8e] block">
              Before stock runs out.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-[15px] sm:text-[16px] text-[#525252] dark:text-[#a3a3a3] leading-relaxed max-w-lg font-normal">
            StockSense detects unusual sales spikes, refines baseline demand without distortion,
            and triggers deterministic replenishment orders the moment stock crosses your Reorder Point.
          </p>

          {/* Primary & Secondary Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a
              href="#how-it-works"
              onClick={handleScrollToWorkflow}
              className="inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#2b2b2b] text-white dark:bg-[#f5f5f5] dark:hover:bg-white dark:text-[#0a0a0a] text-sm font-medium px-5 py-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#171717] dark:focus:ring-[#f5f5f5] focus:ring-offset-2 active:scale-[0.99]"
            >
              <span>Explore StockSense</span>
              <ArrowDown className="w-4 h-4" />
            </a>
            <Link
              to="/recommendations"
              className="inline-flex items-center justify-center gap-1.5 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-sm hover:bg-[#f5f5f5] dark:hover:bg-[#1c1c1c] text-[#171717] dark:text-[#f5f5f5] text-sm font-medium px-4 py-2.5 rounded-full border border-[#ebebeb] dark:border-[#262626] transition-all focus:outline-none focus:ring-1 focus:ring-[#171717]"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#737373]" />
            </Link>
          </div>

          {/* Trust statement & constraints row */}
          <div className="pt-4 border-t border-[#ebebeb] dark:border-[#262626] grid grid-cols-3 gap-3 text-left max-w-md">
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
      </div>

      {/* Subtle 3D Scene Telemetry Badge (Bottom Right) */}
      <div className="hidden lg:flex items-center gap-3 absolute bottom-5 right-8 z-10 px-3 py-1.5 rounded-full bg-white/85 dark:bg-[#141414]/85 backdrop-blur-md border border-[#ebebeb] dark:border-[#262626] text-[10px] font-mono text-[#525252] dark:text-[#a3a3a3]">
        <Box className="w-3.5 h-3.5 text-[#171717] dark:text-[#f5f5f5]" />
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-[#d4d4d4] dark:bg-[#525252]" />
          Active Stock
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-[#e11d48]" />
          Depleting ≤ ROP
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-[#171717] dark:bg-[#f5f5f5]" />
          +EOQ Drop
        </span>
      </div>
    </section>
  );
};

export default HeroSection;
