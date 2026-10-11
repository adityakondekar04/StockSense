// apps/web/src/components/landing/HeroSection.tsx
// Minimalist editorial hero section with simplistic 3D monochrome stock background

import React from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";
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
    <section className="relative min-h-[540px] lg:min-h-[600px] flex items-center py-16 lg:py-24 border-b border-[#ebebeb] overflow-hidden">
      {/* Simplistic 3D Isometric Stock Depletion & Replenishment Background */}
      <Hero3DBackground />

      <div className="relative z-10 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl space-y-6 text-left">
          {/* Headline */}
          <h1 className="font-heading text-[40px] sm:text-[52px] lg:text-[62px] font-semibold tracking-[-0.035em] text-[#171717] leading-[1.04]">
            Know what to restock.{" "}
            <span className="text-[#737373] block">
              Before stock runs out.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-[15px] sm:text-[16px] text-[#525252] leading-relaxed max-w-lg font-normal">
            StockSense detects unusual sales spikes, refines baseline demand without distortion,
            and triggers deterministic replenishment orders the moment stock crosses your Reorder Point.
          </p>

          {/* Primary & Secondary Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a
              href="#how-it-works"
              onClick={handleScrollToWorkflow}
              className="inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#2b2b2b] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2 active:scale-[0.99]"
            >
              <span>Explore StockSense</span>
              <ArrowDown className="w-4 h-4" />
            </a>
            <Link
              to="/recommendations"
              className="inline-flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-sm hover:bg-[#f5f5f5] text-[#171717] text-sm font-medium px-4 py-2.5 rounded-full border border-[#ebebeb] transition-all focus:outline-none focus:ring-1 focus:ring-[#171717]"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#737373]" />
            </Link>
          </div>

          {/* Trust statement & constraints row */}
          <div className="pt-4 border-t border-[#ebebeb] grid grid-cols-3 gap-3 text-left max-w-md">
            <div>
              <div className="text-xs font-mono font-semibold text-[#171717]">
                0%
              </div>
              <div className="text-[11px] text-[#737373] leading-tight">
                Blind Guesswork
              </div>
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-[#171717]">
                100%
              </div>
              <div className="text-[11px] text-[#737373] leading-tight">
                Deterministic Core
              </div>
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-[#171717]">
                Zod-Clamped
              </div>
              <div className="text-[11px] text-[#737373] leading-tight">
                Bounded AI Output
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
