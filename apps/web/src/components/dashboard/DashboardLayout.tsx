// apps/web/src/components/dashboard/DashboardLayout.tsx
// Professional ThoughtStream SaaS layout: Sidebar + TopBar + Main container

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ShieldAlert, Info } from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const {
    selectedProduct,
    aiEnabled,
    setAiEnabled,
  } = useInventory();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#FAFAF9] dark:bg-[#0C0A09] text-[#1C1917] dark:text-[#FAFAF9] font-sans antialiased overflow-hidden">
      {/* Persistent / Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main app panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAFAF9] dark:bg-[#0C0A09]">
        {/* Top bar */}
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable workspace */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Contextual Warning & Guardrail Banners */}
            <div className="space-y-2 mb-6">
              {/* Limited history warning (<28 days) */}
              {selectedProduct.historyDays < 28 && (
                <div className="bg-[#FEFCE8] dark:bg-[#713F12]/20 border border-[#FEF08A] dark:border-[#A16207]/40 p-3.5 flex items-start gap-3 text-xs text-[#CA8A04] dark:text-[#FDE047]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold uppercase tracking-wider font-mono">Limited History Warning:</strong>{" "}
                    {selectedProduct.sku} has recorded only {selectedProduct.historyDays} days of observations. Standard statistical parameters require at least 28 days. Replenishment metrics should be verified manually.
                  </div>
                </div>
              )}

              {/* Intermittent demand alert */}
              {selectedProduct.isIntermittent && (
                <div className="bg-[#FEFCE8] dark:bg-[#713F12]/20 border border-[#FEF08A] dark:border-[#A16207]/40 p-3.5 flex items-start gap-3 text-xs text-[#CA8A04] dark:text-[#FDE047]">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold uppercase tracking-wider font-mono">Intermittent Demand Detected:</strong>{" "}
                    {selectedProduct.sku} exhibits &gt;40% zero-demand days. Normal distribution assumptions may overestimate safety buffer. Review order-to-order procurement.
                  </div>
                </div>
              )}

              {/* Rules-only mode active banner */}
              {!aiEnabled && (
                <div className="bg-[#F5F5F4] dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] p-3 flex items-center justify-between text-xs text-[#57534E] dark:text-[#D6D3D1]">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#78716C] shrink-0" />
                    <span>
                      <strong className="font-medium text-[#1C1917] dark:text-[#FAFAF9]">Rules-Only Mode:</strong> Deterministic inventory mathematics active. AI text suggestions disabled.
                    </span>
                  </div>
                  <button
                    onClick={() => setAiEnabled(true)}
                    className="font-mono text-xs font-semibold text-[#1C1917] dark:text-[#FAFAF9] underline underline-offset-2 hover:text-[#78716C] ml-3 shrink-0"
                  >
                    Enable AI
                  </button>
                </div>
              )}
            </div>

            {/* Page Content Body */}
            {children}
          </div>

          {/* Minimalist SaaS Footer */}
          <footer className="border-t border-[#E7E5E4] dark:border-[#292524] bg-[#FAFAF9] dark:bg-[#12100E] mt-12 py-6 text-xs text-[#78716C] dark:text-[#A8A29E]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-serif font-bold text-[#1C1917] dark:text-[#FAFAF9]">StockSense Enterprise</span>
                <span className="text-[#D6D3D1] dark:text-[#44403C]">/</span>
                <Link to="/products" className="hover:text-[#1C1917] dark:hover:text-[#FAFAF9] transition-colors">
                  Products Directory
                </Link>
                <span className="text-[#D6D3D1] dark:text-[#44403C]">/</span>
                <Link to="/methodology" className="hover:text-[#1C1917] dark:hover:text-[#FAFAF9] transition-colors">
                  Mathematical Methodology
                </Link>
                <span className="text-[#D6D3D1] dark:text-[#44403C]">/</span>
                <Link to="/audit" className="hover:text-[#1C1917] dark:hover:text-[#FAFAF9] transition-colors">
                  Audit Ledger
                </Link>
              </div>
              <div className="font-mono text-[11px] text-[#A8A29E] dark:text-[#78716C]">
                Deterministic Math via <code className="bg-[#EFEDEB] dark:bg-[#292524] px-1 py-0.5 text-[#1C1917] dark:text-[#FAFAF9]">@stocksense/core</code> · Fictional Data
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
