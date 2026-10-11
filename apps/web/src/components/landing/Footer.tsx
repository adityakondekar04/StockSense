// apps/web/src/components/landing/Footer.tsx
// Minimalist, editorial footer matching monochrome design tokens

import React from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#fafafa] dark:bg-[#0a0a0a] text-[#525252] dark:text-[#a3a3a3] py-12 border-t border-[#ebebeb] dark:border-[#262626] transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="StockSense" className="w-6 h-6 rounded" />
              <span className="font-heading text-sm font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-tight">
                StockSense
              </span>
            </div>
            <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed max-w-sm">
              Adaptive inventory replenishment intelligence for community pharmacies, rural health centres,
              and retail storekeepers.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#737373] dark:text-[#8e8e8e] pt-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Rules decide · AI advises. Demo uses synthetic fictional datasets.</span>
            </div>
          </div>

          {/* Architecture Links */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-[11px] font-semibold text-[#171717] dark:text-[#f5f5f5] uppercase tracking-wider font-mono">
              Architecture
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#problem" className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors">
                  The Problem
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors">
                  Core Capabilities
                </a>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors">
                  Mathematical Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Console Links */}
          <div className="md:col-span-4 space-y-2.5">
            <h4 className="text-[11px] font-semibold text-[#171717] dark:text-[#f5f5f5] uppercase tracking-wider font-mono">
              Operational Console
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  to="/recommendations"
                  className="text-[#171717] dark:text-[#f5f5f5] font-medium hover:underline transition-colors"
                >
                  Recommendations →
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/cleaning" className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors">
                  Sales &amp; Anomalies
                </Link>
              </li>
              <li>
                <Link to="/forecast" className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors">
                  Demand Forecast
                </Link>
              </li>
              <li>
                <Link to="/scenario" className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors">
                  Scenario Lab
                </Link>
              </li>
              <li>
                <Link to="/audit" className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors">
                  Decision Log
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#ebebeb] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between text-xs text-[#737373] dark:text-[#8e8e8e] gap-3">
          <p>© 2026 StockSense</p>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Deterministic Math Engine</span>
            <span>·</span>
            <span>Seeded Mulberry32 PRNG</span>
            <span>·</span>
            <span>Fictional Data Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
