// apps/web/src/components/dashboard/DashboardLayout.tsx
// Minimalist SaaS layout: Sidebar + TopBar + Main workspace matching Landing Page theme

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { selectedProduct } = useInventory();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Only show SKU-specific statistical warnings on SKU-specific analysis pages
  const isProductSpecificView =
    location.pathname.includes("/cleaning") ||
    location.pathname.includes("/forecast") ||
    location.pathname.includes("/scenario") ||
    location.pathname.startsWith("/products/");

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-[#171717] dark:text-[#f5f5f5] font-sans antialiased overflow-hidden selection:bg-[#171717] selection:text-white dark:selection:bg-[#f5f5f5] dark:selection:text-[#0a0a0a] transition-colors duration-150">
      {/* Persistent / Responsive Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main app panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a]">
        {/* Top bar */}
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable workspace */}
        <main className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Minimalist Contextual Notices (only when inspecting a specific SKU with <28 days or intermittent demand) */}
            {isProductSpecificView &&
              selectedProduct &&
              (selectedProduct.historyDays < 28 || selectedProduct.isIntermittent) && (
                <div className="space-y-2 mb-6">
                  {selectedProduct.historyDays < 28 && (
                    <div className="rounded-md bg-[#fffbeb] dark:bg-[#291d0a] border border-[#fef3c7] dark:border-[#452f0d] px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-[#b45309] dark:text-[#fcd34d]">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        <strong className="font-mono font-semibold">Limited history:</strong>{" "}
                        {selectedProduct.sku} has {selectedProduct.historyDays} days of sales data
                        (28+ days recommended). Treat recommendation as indicative.
                      </span>
                    </div>
                  )}

                  {selectedProduct.isIntermittent && (
                    <div className="rounded-md bg-[#fffbeb] dark:bg-[#291d0a] border border-[#fef3c7] dark:border-[#452f0d] px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-[#b45309] dark:text-[#fcd34d]">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>
                        <strong className="font-mono font-semibold">Intermittent demand:</strong>{" "}
                        {selectedProduct.sku} has frequent zero-demand days. Review safety stock
                        before placing large batch orders.
                      </span>
                    </div>
                  )}
                </div>
              )}
            {/* Page Content Body */}
            {children}
          </div>

          {/* Minimalist SaaS Footer */}
          <footer className="border-t border-[#ebebeb] dark:border-[#262626] bg-[#fafafa] dark:bg-[#0a0a0a] mt-12 py-4 text-xs text-[#737373] dark:text-[#8e8e8e]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/"
                  className="font-heading font-semibold text-[#171717] dark:text-[#f5f5f5] hover:underline"
                >
                  StockSense
                </Link>
                <span className="text-[#d4d4d4] dark:text-[#404040]">·</span>
                <Link
                  to="/audit"
                  className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors"
                >
                  Decision Log
                </Link>
                <span className="text-[#d4d4d4] dark:text-[#404040]">·</span>
                <Link
                  to="/methodology"
                  className="hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors"
                >
                  Methodology
                </Link>
              </div>
              <div className="font-mono text-[11px] text-[#737373] dark:text-[#8e8e8e]">
                Rules decide, AI advises · Decision support using fictional demo data
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
