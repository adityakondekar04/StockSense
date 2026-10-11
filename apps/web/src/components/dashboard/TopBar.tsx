// apps/web/src/components/dashboard/TopBar.tsx
// Top navigation bar adhering to ThoughtStream minimalist design system

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Menu,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Printer,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";

interface TopBarProps {
  onMenuToggle: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const {
    products,
    selectedProduct,
    setSelectedProductId,
    serviceLevel,
    setServiceLevel,
    zValue,
    aiEnabled,
    setAiEnabled,
  } = useInventory();

  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("stocksense_theme");
      if (saved === "dark") return "dark";
      if (saved === "light") return "light";
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("stocksense_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Derive current page name from route
  const getPageTitle = (): { section: string; title: string } => {
    const path = location.pathname;
    if (path === "/recommendations" || path === "/dashboard") {
      return { section: "Core", title: "Inventory Recommendations" };
    }
    if (path === "/products") {
      return { section: "Core", title: "Products Directory" };
    }
    if (path.startsWith("/products/") && !path.includes("/cleaning") && !path.includes("/forecast") && !path.includes("/scenario")) {
      return { section: "Products", title: selectedProduct ? `${selectedProduct.sku} Details` : "Product Details" };
    }
    if (path.includes("/cleaning")) {
      return { section: "Intelligence", title: "Data Cleaning & Anomalies" };
    }
    if (path.includes("/forecast")) {
      return { section: "Intelligence", title: "Forecast Validation" };
    }
    if (path.includes("/scenario")) {
      return { section: "Operations", title: "Scenario Stress Lab" };
    }
    if (path === "/setup" || path === "/setup/manual") {
      return { section: "Operations", title: "Setup & CSV Ingestion" };
    }
    if (path === "/audit") {
      return { section: "Governance", title: "Audit Trail & Decision Log" };
    }
    if (path === "/methodology") {
      return { section: "Governance", title: "Mathematical Methodology" };
    }
    if (path.startsWith("/report/")) {
      return { section: "Reports", title: "Printable Dispatch Sheet" };
    }
    return { section: "Console", title: "Dashboard" };
  };

  const { section, title } = getPageTitle();

  const handleProductChange = (newSku: string) => {
    const found = products.find((p) => p.sku === newSku);
    if (found) {
      setSelectedProductId(found.id);
      if (location.pathname.includes("/cleaning")) {
        navigate(`/products/${found.sku}/cleaning`);
      } else if (location.pathname.includes("/forecast")) {
        navigate(`/products/${found.sku}/forecast`);
      } else if (location.pathname.includes("/scenario")) {
        navigate(`/products/${found.sku}/scenario`);
      } else if (location.pathname.startsWith("/products/") && !location.pathname.includes("/cleaning") && !location.pathname.includes("/forecast") && !location.pathname.includes("/scenario")) {
        navigate(`/products/${found.sku}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF9] dark:bg-[#12100E] border-b border-[#E7E5E4] dark:border-[#292524] transition-colors">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left: Mobile trigger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="p-1.5 rounded-none text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#FAFAF9] hover:bg-[#F5F5F4] dark:hover:bg-[#1C1917] lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-sans" aria-label="Breadcrumb">
            <span className="text-[#A8A29E] dark:text-[#78716C] font-mono uppercase tracking-wider text-[11px] hidden sm:inline">
              StockSense
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D6D3D1] dark:text-[#44403C] hidden sm:inline" />
            <span className="text-[#78716C] dark:text-[#A8A29E] hidden md:inline">
              {section}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D6D3D1] dark:text-[#44403C] hidden md:inline" />
            <span className="text-[#1C1917] dark:text-[#FAFAF9] font-medium font-serif">
              {title}
            </span>
          </nav>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active SKU Switcher */}
          <div className="flex items-center border border-[#D6D3D1] dark:border-[#44403C] bg-white dark:bg-[#1C1917] px-2 py-1 text-xs">
            <span className="text-[#78716C] dark:text-[#A8A29E] text-[11px] font-mono uppercase mr-1 hidden sm:inline">
              SKU:
            </span>
            <select
              value={selectedProduct?.sku || ""}
              onChange={(e) => handleProductChange(e.target.value)}
              className="bg-transparent font-mono font-semibold text-[#1C1917] dark:text-[#FAFAF9] text-xs focus:outline-none cursor-pointer"
              aria-label="Active Product SKU"
              disabled={products.length === 0}
            >
              {products.length === 0 ? (
                <option value="" className="bg-white dark:bg-[#1C1917] text-[#1C1917] dark:text-[#FAFAF9]">
                  No products
                </option>
              ) : (
                products.map((p) => (
                  <option key={p.sku} value={p.sku} className="bg-white dark:bg-[#1C1917] text-[#1C1917] dark:text-[#FAFAF9]">
                    {p.sku} · {p.name.length > 15 ? p.name.substring(0, 15) + "…" : p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Service Level & Z Factor Selector */}
          <div className="hidden lg:flex items-center border border-[#D6D3D1] dark:border-[#44403C] bg-white dark:bg-[#1C1917] px-2 py-1 text-xs">
            <span className="text-[#78716C] dark:text-[#A8A29E] text-[11px] font-mono mr-1">SL:</span>
            <select
              value={serviceLevel}
              onChange={(e) => setServiceLevel(Number(e.target.value))}
              className="bg-transparent font-sans font-semibold text-[#1C1917] dark:text-[#FAFAF9] text-xs focus:outline-none cursor-pointer"
              aria-label="Service Level Target"
            >
              <option value={0.80} className="bg-white dark:bg-[#1C1917]">80%</option>
              <option value={0.90} className="bg-white dark:bg-[#1C1917]">90%</option>
              <option value={0.95} className="bg-white dark:bg-[#1C1917]">95%</option>
              <option value={0.975} className="bg-white dark:bg-[#1C1917]">97.5%</option>
              <option value={0.99} className="bg-white dark:bg-[#1C1917]">99%</option>
              <option value={0.999} className="bg-white dark:bg-[#1C1917]">99.9%</option>
            </select>
            <span
              className="ml-2 font-mono text-[11px] text-[#57534E] dark:text-[#A8A29E] border-l border-[#E7E5E4] dark:border-[#292524] pl-2"
              title="Standard normal inverse factor z"
            >
              z={zValue.toFixed(2)}
            </span>
          </div>

          {/* AI Mode Toggle */}
          <button
            type="button"
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium border transition-colors select-none ${
              aiEnabled
                ? "bg-[#78716C] text-[#FAFAF9] border-[#78716C]"
                : "bg-transparent text-[#57534E] dark:text-[#A8A29E] border-[#D6D3D1] dark:border-[#44403C] hover:bg-[#F5F5F4] dark:hover:bg-[#1C1917]"
            }`}
            title={aiEnabled ? "AI Advisory enabled. Click for rules only." : "Rules-only mode. Click to enable AI suggestions."}
          >
            {aiEnabled ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Advisory</span>
                <span className="sm:hidden">AI</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rules Mode</span>
                <span className="sm:hidden">Rules</span>
              </>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 border border-[#D6D3D1] dark:border-[#44403C] bg-white dark:bg-[#1C1917] text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#FAFAF9]" />
            ) : (
              <Moon className="w-4 h-4 text-[#1C1917]" />
            )}
          </button>

          {/* Quick Print Report shortcut */}
          {selectedProduct && (
            <Link
              to={`/report/${selectedProduct.sku}`}
              className="hidden sm:inline-flex p-1.5 border border-[#D6D3D1] dark:border-[#44403C] bg-white dark:bg-[#1C1917] text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] transition-colors"
              title="Print 1-Page Report"
            >
              <Printer className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
