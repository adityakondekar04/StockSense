// apps/web/src/components/landing/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Boxes, Info } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#fafafa] text-[#4d4d4d] py-12 border-t border-[#ebebeb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#171717] flex items-center justify-center text-white">
                <Boxes className="w-4 h-4" />
              </div>
              <span className="text-base font-semibold text-[#171717] tracking-tight">StockSense</span>
            </div>
            <p className="text-xs text-[#4d4d4d] leading-relaxed max-w-sm">
              Adaptive inventory replenishment engine for small retailers, community pharmacies, and
              healthcare facilities. Developed for VORTEXA 3.0 · Problem S-02.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#8f8f8f] pt-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Decision support using fictional demo data. Rules decide · AI advises.</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#overview" className="text-[#4d4d4d] hover:text-[#171717] transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#simulation" className="text-[#4d4d4d] hover:text-[#171717] transition-colors">
                  7-Day Simulation
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-[#4d4d4d] hover:text-[#171717] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="text-[#4d4d4d] hover:text-[#171717] transition-colors">
                  Core Foundations
                </a>
              </li>
              <li>
                <a href="#scenario-lab" className="text-[#4d4d4d] hover:text-[#171717] transition-colors">
                  Scenario Lab Simulator
                </a>
              </li>
              <li>
                <a href="#explainability" className="text-[#4d4d4d] hover:text-[#171717] transition-colors">
                  Math Derivation
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Console Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono">Operational Console</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/recommendations" className="text-[#171717] font-medium hover:text-[#0070f3] transition-colors">
                  Replenishment Recommendations →
                </Link>
              </li>
              <li>
                <Link to="/simulations" className="text-[#4d4d4d] hover:text-[#171717] transition-colors">
                  Monte Carlo Lead Time Lab
                </Link>
              </li>
              <li>
                <span className="text-[#8f8f8f]">Engine: Pure TypeScript Math (@stocksense/core)</span>
              </li>
              <li>
                <span className="text-[#8f8f8f]">Continuous Review: Dual-variance (Demand + Lead Time)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#ebebeb] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8f8f8f] gap-4">
          <p>© 2026 StockSense · Problem S-02 · VORTEXA 3.0</p>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Deterministic Math Engine</span>
            <span>·</span>
            <span>Seeded Mulberry32 Verification</span>
            <span>·</span>
            <span>Fictional Data Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
