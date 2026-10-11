// apps/web/src/components/dashboard/Sidebar.tsx
// Professional ThoughtStream Minimalist SaaS Sidebar Navigation

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Package,
  LayoutDashboard,
  BarChart3,
  LineChart,
  FileSpreadsheet,
  Sliders,
  Printer,
  History,
  BookOpen,
  X,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";

interface NavItem {
  label: string;
  path: string;
  altPath?: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { selectedProduct } = useInventory();
  const location = useLocation();

  const navSections: NavSection[] = [
    {
      label: "INVENTORY CORE",
      items: [
        {
          label: "Recommendations",
          path: "/recommendations",
          altPath: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Products Directory",
          path: "/products",
          icon: Package,
        },
      ],
    },
    {
      label: "DATA INTELLIGENCE",
      items: [
        {
          label: "Data Cleaning",
          path: `/products/${selectedProduct.sku}/cleaning`,
          altPath: "/cleaning",
          icon: BarChart3,
        },
        {
          label: "Forecast Check",
          path: `/products/${selectedProduct.sku}/forecast`,
          altPath: "/forecast",
          icon: LineChart,
        },
      ],
    },
    {
      label: "OPERATIONS & STRESS",
      items: [
        {
          label: "Scenario Lab",
          path: `/products/${selectedProduct.sku}/scenario`,
          altPath: "/scenario",
          icon: Sliders,
        },
        {
          label: "Setup & Ingestion",
          path: "/setup",
          altPath: "/setup/manual",
          icon: FileSpreadsheet,
        },
        {
          label: "Print Report",
          path: `/report/${selectedProduct.sku}`,
          icon: Printer,
        },
      ],
    },
    {
      label: "GOVERNANCE & AUDIT",
      items: [
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
      ],
    },
  ];

  const isActive = (item: NavItem): boolean => {
    const current = location.pathname;
    if (current === item.path) return true;
    if (item.altPath && current.startsWith(item.altPath)) return true;
    if (item.path === "/recommendations" && (current === "/dashboard" || current === "/recommendations")) {
      return true;
    }
    if (item.path.includes("/products/") && item.path.includes("/cleaning") && current.includes("/cleaning")) {
      return true;
    }
    if (item.path.includes("/products/") && item.path.includes("/forecast") && current.includes("/forecast")) {
      return true;
    }
    if (item.path.includes("/products/") && item.path.includes("/scenario") && current.includes("/scenario")) {
      return true;
    }
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#1C1917]/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#FAFAF9] dark:bg-[#12100E] border-r border-[#E7E5E4] dark:border-[#292524]
          flex flex-col h-screen shrink-0
          transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7E5E4] dark:border-[#292524]">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-none bg-[#1C1917] dark:bg-[#FAFAF9] flex items-center justify-center text-[#FAFAF9] dark:text-[#1C1917] transition-colors">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-[17px] text-[#1C1917] dark:text-[#FAFAF9] tracking-tight leading-tight">
                StockSense
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#78716C] dark:text-[#A8A29E]">
                Enterprise S-02
              </span>
            </div>
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-none text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#FAFAF9] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1.5">
              <h4 className="px-3 text-[10px] font-semibold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-widest font-sans">
                {section.label}
              </h4>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item);
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className={`
                          flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-all duration-150 rounded-none border-l-2
                          ${
                            active
                              ? "bg-[#EFEDEB] dark:bg-[#1C1917] text-[#1C1917] dark:text-[#FAFAF9] border-[#1C1917] dark:border-[#FAFAF9] font-semibold"
                              : "text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] hover:bg-[#F5F5F4] dark:hover:bg-[#1C1917]/50 border-transparent"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              active
                                ? "text-[#1C1917] dark:text-[#FAFAF9]"
                                : "text-[#78716C] dark:text-[#78716C]"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {active && (
                          <span className="w-1.5 h-1.5 bg-[#1C1917] dark:bg-[#FAFAF9] shrink-0" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Active Product Quick Info */}
        <div className="p-4 mx-4 mb-3 bg-[#F5F5F4] dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] rounded-none">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#57534E] dark:text-[#A8A29E] mb-1">
            <span>SELECTED SKU</span>
            <span className="font-semibold text-[#1C1917] dark:text-[#FAFAF9]">{selectedProduct.sku}</span>
          </div>
          <div className="text-[12px] font-sans font-medium text-[#1C1917] dark:text-[#FAFAF9] truncate">
            {selectedProduct.name}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#78716C] dark:text-[#A8A29E] border-t border-[#E7E5E4] dark:border-[#292524] pt-1.5">
            <span>Stock on hand</span>
            <span className="font-mono font-semibold text-[#1C1917] dark:text-[#FAFAF9]">{selectedProduct.onHand} units</span>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="px-5 py-4 border-t border-[#E7E5E4] dark:border-[#292524] bg-[#FAFAF9] dark:bg-[#12100E] flex items-center justify-between text-[11px] text-[#78716C] dark:text-[#78716C]">
          <div>
            <span className="font-semibold text-[#1C1917] dark:text-[#FAFAF9]">StockSense</span> · VORTEXA 3.0
          </div>
          <Link
            to="/methodology"
            className="hover:text-[#1C1917] dark:hover:text-[#FAFAF9] flex items-center gap-0.5"
            title="Read documentation"
          >
            Docs <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </aside>
    </>
  );
};
