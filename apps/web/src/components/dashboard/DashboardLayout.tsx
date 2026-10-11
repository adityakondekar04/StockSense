// apps/web/src/components/dashboard/DashboardLayout.tsx
// Consistent header, global controls (Product, Service Level, AI Toggle), banners, and footer

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Printer,
  AlertTriangle,
  ShieldAlert,
  FileSpreadsheet,
  LineChart,
  Sliders,
  History,
  BookOpen,
  LayoutDashboard,
  CheckCircle2,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("stocksense_theme");
    return saved === "dark" ? "dark" : "light";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("stocksense_theme", nextTheme);
  };

  const navItems = [
    {
      label: "Recommendations",
      path: "/recommendations",
      icon: LayoutDashboard,
      badge: `${products.filter((p) => p.onHand + p.onOrder < 600).length} alerts`,
    },
    {
      label: "Data Cleaning",
      path: `/products/${selectedProduct.sku}/cleaning`,
      altPath: "/cleaning",
      icon: AlertTriangle,
    },
    {
      label: "Forecast Check",
      path: `/products/${selectedProduct.sku}/forecast`,
      altPath: "/forecast",
      icon: LineChart,
    },
    {
      label: "Scenario Lab",
      path: `/products/${selectedProduct.sku}/scenario`,
      altPath: "/scenario",
      icon: Sliders,
    },
    {
      label: "Setup & Data",
      path: "/setup",
      icon: FileSpreadsheet,
    },
    {
      label: "Decision Log",
      path: "/audit",
      icon: History,
    },
    {
      label: "Methodology",
      path: "/methodology",
      icon: BookOpen,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (location.pathname === item.path) return true;
    if (item.altPath && location.pathname.startsWith(item.altPath)) return true;
    if (location.pathname.startsWith("/products/") && location.pathname.includes(item.label.toLowerCase().replace(" ", ""))) return true;
    return false;
  };

  const handleProductChange = (newSku: string) => {
    const found = products.find((p) => p.sku === newSku);
    if (found) {
      setSelectedProductId(found.id);
      // If we are currently on a product-specific route, update the URL
      if (location.pathname.includes("/cleaning")) {
        navigate(`/products/${found.sku}/cleaning`);
      } else if (location.pathname.includes("/forecast")) {
        navigate(`/products/${found.sku}/forecast`);
      } else if (location.pathname.includes("/scenario")) {
        navigate(`/products/${found.sku}/scenario`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Console Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        {/* Upper Row: Brand & Global Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Branding & Back link */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                title="Return to StockSense Landing Overview"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>

              <Link to="/recommendations" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 tracking-tight">StockSense</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      S-02
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 hidden md:block leading-none">
                    Adaptive Replenishment Console
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Global Selectors & Switches */}
            <div className="flex items-center gap-2.5">
              {/* Product Selector */}
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-500 pl-1.5">SKU:</span>
                <select
                  value={selectedProduct.sku}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="bg-white border border-slate-300 rounded font-mono font-semibold text-slate-900 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Active Product SKU"
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} · {p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Level & z-score */}
              <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-500 pl-1.5 hidden sm:inline">Service Level:</span>
                <select
                  value={serviceLevel}
                  onChange={(e) => setServiceLevel(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded font-semibold text-slate-900 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Target Cycle Service Level"
                >
                  <option value={0.80}>80%</option>
                  <option value={0.90}>90%</option>
                  <option value={0.95}>95%</option>
                  <option value={0.975}>97.5%</option>
                  <option value={0.99}>99%</option>
                  <option value={0.999}>99.9%</option>
                </select>
                <span
                  className="font-mono text-indigo-700 font-bold px-1.5 text-xs bg-indigo-50 rounded py-0.5 border border-indigo-100"
                  title="Normal distribution inverse CDF factor z"
                >
                  z = {zValue.toFixed(3)}
                </span>
              </div>

              {/* AI Toggle */}
              <button
                type="button"
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                  aiEnabled
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                    : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                }`}
                title={aiEnabled ? "AI Advisory is active. Click to run in pure deterministic rules mode." : "Running with AI off (rules only). Click to enable AI."}
              >
                {aiEnabled ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="hidden sm:inline">AI Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="hidden sm:inline">Rules Only</span>
                  </>
                )}
              </button>

              {/* Print Report */}
              <Link
                to={`/report/${selectedProduct.sku}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg shadow-sm transition-colors"
                title="Open Printable 1-Page Summary"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden md:inline">Print</span>
              </Link>

              {/* Theme Toggle (Light / Dark) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Lower Row: Navigation Bar Tabs */}
        <div className="bg-slate-50/80 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none" aria-label="Dashboard views">
              {navItems.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? "bg-white text-indigo-700 shadow-sm border border-slate-200 ring-1 ring-indigo-500/10"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-indigo-600" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Select Active Product:</label>
              <select
                value={selectedProduct.sku}
                onChange={(e) => {
                  handleProductChange(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
              >
                {products.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </header>

      {/* Global Status Notification Banners */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-2">
        {/* 1. Limited Information Banner if < 28 days */}
        {selectedProduct.historyDays < 28 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Limited history notice:</strong> {selectedProduct.sku} has only {selectedProduct.historyDays} days of sales history (under the 28-day standard). Reorder points and safety stock should be treated as indicative.
            </span>
          </div>
        )}

        {/* 2. Intermittent Demand Warning for ANT-06 */}
        {selectedProduct.isIntermittent && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Intermittent demand detected:</strong> {selectedProduct.sku} exhibits &gt;40% zero-demand days. The continuous normal distribution assumption may overestimate buffer stock. Consider order-to-order procurement.
            </span>
          </div>
        )}

        {/* 3. Rules-Only Mode Banner if AI is toggled off */}
        {!aiEnabled && (
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />
              <span>
                <strong>Rules-only mode active:</strong> AI advisory is disabled. All safety stock, reorder levels, anomaly treatments, and scenarios run strictly through deterministic TypeScript math.
              </span>
            </div>
            <button
              onClick={() => setAiEnabled(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline ml-2"
            >
              Enable AI
            </button>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">StockSense Console</span>
            <span>·</span>
            <Link to="/methodology" className="hover:text-indigo-600 transition-colors">
              Methodology & Formulas
            </Link>
            <span>·</span>
            <Link to="/audit" className="hover:text-indigo-600 transition-colors">
              Decision Log
            </Link>
            <span>·</span>
            <Link to={`/report/${selectedProduct.sku}`} className="hover:text-indigo-600 transition-colors">
              Print Report
            </Link>
          </div>
          <div className="text-center sm:text-right">
            <span>Decision support using fictional demo data. Not a replacement for storekeeper clinical judgement.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
