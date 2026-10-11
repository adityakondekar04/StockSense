// apps/web/src/components/landing/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Boxes, Info } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Boxes className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">StockSense</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Adaptive inventory replenishment engine for small retailers, community pharmacies, and
              healthcare facilities. Developed for VORTEXA 3.0 · Problem S-02.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <Info className="w-3.5 h-3.5" />
              <span>Decision support using fictional demo data. Not a clinical guarantee.</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#overview" className="hover:text-white transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Six Pillars
                </a>
              </li>
              <li>
                <a href="#scenario-lab" className="hover:text-white transition-colors">
                  Scenario Lab Simulator
                </a>
              </li>
              <li>
                <a href="#explainability" className="hover:text-white transition-colors">
                  Explainability
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Console Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Console</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/recommendations" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Replenishment Recommendations
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Service Level: 80% to 99.9% (Continuous Review)</span>
              </li>
              <li>
                <span className="text-slate-500">Engine: Pure TypeScript Math (@stocksense/core)</span>
              </li>
              <li>
                <span className="text-slate-500">Architecture: Rules Decide · AI Advises</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 StockSense · Problem S-02. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Deterministic Math Engine</span>
            <span>·</span>
            <span>Seeded Monte Carlo Verification</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
