// apps/web/src/components/landing/HeroSection.tsx
// Clean, modern, compact Hero section featuring the provided SVG logo as a subtle, minimalist animated visual

import React from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";

export const HeroSection: React.FC = () => {
  const handleScrollToWorkflow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#how-it-works");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-12 lg:py-16 border-b border-[#ebebeb] dark:border-[#262626] overflow-hidden">
      <style>{`
        @keyframes ssLogoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes ssBarTop {
          0%, 100% { transform: scaleX(1); opacity: 1; }
          50% { transform: scaleX(0.94); opacity: 0.9; }
        }
        @keyframes ssBarUpperMid {
          0%, 100% { transform: translateX(0px) scaleX(1); opacity: 1; }
          50% { transform: translateX(6px) scaleX(1.06); opacity: 0.88; }
        }
        @keyframes ssBarLowerMid {
          0%, 100% { transform: translateX(0px) scaleX(1); opacity: 1; }
          50% { transform: translateX(-6px) scaleX(1.06); opacity: 0.88; }
        }
        @keyframes ssBarBottom {
          0%, 100% { transform: scaleX(1); opacity: 1; }
          50% { transform: scaleX(0.96); opacity: 0.85; }
        }
        @keyframes ssRingPulse {
          0%, 100% { opacity: 0.22; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.03); }
        }
        .ss-logo-card {
          animation: ssLogoFloat 6s ease-in-out infinite;
        }
        .ss-bar-1 {
          transform-origin: 25px 33px;
          animation: ssBarTop 4.5s ease-in-out infinite;
        }
        .ss-bar-2 {
          transform-origin: 25px 71px;
          animation: ssBarUpperMid 4.5s ease-in-out 0.6s infinite;
        }
        .ss-bar-3 {
          transform-origin: 135px 109px;
          animation: ssBarLowerMid 4.5s ease-in-out 1.2s infinite;
        }
        .ss-bar-4 {
          transform-origin: 80px 147px;
          animation: ssBarBottom 4.5s ease-in-out 1.8s infinite;
        }
        .ss-ring {
          animation: ssRingPulse 6s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Compact Editorial Content */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Headline */}
            <h1 className="font-heading text-[36px] sm:text-[46px] lg:text-[54px] font-semibold tracking-[-0.035em] text-[#171717] dark:text-[#f5f5f5] leading-[1.06]">
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
                className="inline-flex items-center justify-center gap-1.5 bg-white dark:bg-[#141414] hover:bg-[#f5f5f5] dark:hover:bg-[#1c1c1c] text-[#171717] dark:text-[#f5f5f5] text-sm font-medium px-4 py-2.5 rounded-full border border-[#ebebeb] dark:border-[#262626] transition-all focus:outline-none focus:ring-1 focus:ring-[#171717]"
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

          {/* Right Column: Subtle, Minimalist Animated SVG Logo Visual */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative flex items-center justify-center p-8 sm:p-10">
              {/* Subtle monochrome outer frame */}
              <div
                className="ss-ring absolute w-56 h-56 sm:w-64 sm:h-64 rounded-[36px] border border-[#e5e5e5] dark:border-[#222222] pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-[48px] border border-[#f0f0f0] dark:border-[#171717] pointer-events-none"
                aria-hidden="true"
              />

              {/* Original Provided SVG Logo with Preserved Design, Colors, Proportions & Rounded Corners */}
              <div className="ss-logo-card relative z-10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.65)] ring-1 ring-black/5 dark:ring-white/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="192"
                  height="192"
                  viewBox="0 0 160 160"
                  className="w-40 h-40 sm:w-48 sm:h-48 block"
                  role="img"
                  aria-label="StockSense logo"
                >
                  <rect width="160" height="160" rx="24" fill="#080808" />
                  <rect
                    className="ss-bar-1"
                    x="25"
                    y="20"
                    width="110"
                    height="26"
                    rx="6"
                    fill="#FFFFFF"
                  />
                  <rect
                    className="ss-bar-2"
                    x="25"
                    y="58"
                    width="65"
                    height="26"
                    rx="5"
                    fill="#D3D3D3"
                  />
                  <rect
                    className="ss-bar-3"
                    x="70"
                    y="96"
                    width="65"
                    height="26"
                    rx="5"
                    fill="#777777"
                  />
                  <rect
                    className="ss-bar-4"
                    x="25"
                    y="134"
                    width="110"
                    height="26"
                    rx="5"
                    fill="#222222"
                    stroke="#414141"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
