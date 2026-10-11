// apps/web/src/components/dashboard/Sidebar.tsx
// Minimalist SaaS Sidebar matching the Landing Page monochrome design system

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  LineChart,
  Sliders,
  Upload,
  History,
  Printer,
  X,
  UserCheck,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
  label: string;
  subtitle?: string;
  path: string;
  altPath?: string;
  icon: React.FC<{ className?: string }>;
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
  const { user, role } = useAuth();
  const location = useLocation();

  const productSku = selectedProduct?.sku;

  const navSections: NavSection[] = [
    {
      label: "Inventory",
      items: [
        {
          label: "Recommendations",
          path: "/recommendations",
          altPath: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "All Products",
          path: "/products",
          icon: Package,
        },
      ],
    },
    {
      label: "Analysis",
      items: [
        {
          label: "Sales & Anomalies",
          path: productSku ? `/products/${productSku}/cleaning` : "/cleaning",
          altPath: "/cleaning",
          icon: BarChart3,
        },
        {
          label: "Demand Forecast",
          path: productSku ? `/products/${productSku}/forecast` : "/forecast",
          altPath: "/forecast",
          icon: LineChart,
        },
        {
          label: "Scenario Lab",
          path: productSku ? `/products/${productSku}/scenario` : "/scenario",
          altPath: "/scenario",
          icon: Sliders,
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          label: "Import Data",
          path: "/setup",
          altPath: "/setup/manual",
          icon: Upload,
        },
        {
          label: "Decision Log",
          path: "/audit",
          icon: History,
        },
        {
          label: "Print Report",
          path: productSku ? `/report/${productSku}` : "/products",
          icon: Printer,
        },
      ],
    },
  ];

  const isActive = (item: NavItem): boolean => {
    const current = location.pathname;
    if (current === item.path) return true;
    if (item.altPath && current.startsWith(item.altPath)) return true;
    if (
      item.path === "/recommendations" &&
      (current === "/dashboard" || current === "/recommendations")
    ) {
      return true;
    }
    if (
      item.path === "/products" &&
      current.startsWith("/products/") &&
      !current.includes("/cleaning") &&
      !current.includes("/forecast") &&
      !current.includes("/scenario")
    ) {
      return true;
    }
    if (item.path.includes("/cleaning") && current.includes("/cleaning")) {
      return true;
    }
    if (item.path.includes("/forecast") && current.includes("/forecast")) {
      return true;
    }
    if (item.path.includes("/scenario") && current.includes("/scenario")) {
      return true;
    }
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-60 bg-[#fafafa] dark:bg-[#0a0a0a] border-r border-[#ebebeb] dark:border-[#262626]
          flex flex-col h-screen shrink-0
          transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Brand header — matches Landing Page Navbar height (h-14) and logo */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-[#ebebeb] dark:border-[#262626] shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            aria-label="StockSense home"
          >
            <img src="/logo.svg" alt="StockSense" className="w-6 h-6 rounded" />
            <span className="font-heading text-sm font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-tight">
              StockSense
            </span>
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#525252] hover:text-[#171717] dark:text-[#a3a3a3] dark:hover:text-[#f5f5f5] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <h4 className="px-2.5 text-[10px] font-mono font-medium text-[#737373] dark:text-[#8e8e8e] uppercase tracking-wider">
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
                          flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-md transition-colors duration-150
                          ${
                            active
                              ? "bg-[#171717] text-white dark:bg-[#f5f5f5] dark:text-[#0a0a0a]"
                              : "text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f0f0f0]/80 dark:hover:bg-[#141414]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              active
                                ? "text-white dark:text-[#0a0a0a]"
                                : "text-[#737373] dark:text-[#8e8e8e]"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Active Product Quick Summary */}
        {selectedProduct ? (
          <div className="p-3 mx-3 mb-3 rounded-lg bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#262626]">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#737373] dark:text-[#a3a3a3] mb-1">
              <span>ACTIVE SKU</span>
              <span className="font-semibold text-[#171717] dark:text-[#f5f5f5]">
                {selectedProduct.sku}
              </span>
            </div>
            <div className="text-xs font-medium text-[#171717] dark:text-[#f5f5f5] truncate">
              {selectedProduct.name}
            </div>
            <div className="mt-2 pt-1.5 border-t border-[#f0f0f0] dark:border-[#1f1f1f] flex items-center justify-between text-[11px] text-[#525252] dark:text-[#a3a3a3]">
              <span>On hand</span>
              <span className="font-mono font-semibold text-[#171717] dark:text-[#f5f5f5]">
                {selectedProduct.onHand.toLocaleString()} {selectedProduct.unit}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 mx-3 mb-3 rounded-lg bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#262626] text-[11px] text-[#737373] dark:text-[#a3a3a3] text-center font-mono">
            No products loaded
          </div>
        )}

        {/* User / Role Footer */}
        <div className="px-4 py-3 border-t border-[#ebebeb] dark:border-[#262626] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#f0f0f0] dark:bg-[#1f1f1f] border border-[#ebebeb] dark:border-[#262626] flex items-center justify-center text-[#171717] dark:text-[#f5f5f5] shrink-0">
              <UserCheck className="w-3 h-3" />
            </div>
            <div className="truncate">
              <div className="text-[11px] font-medium text-[#171717] dark:text-[#f5f5f5] truncate">
                {user?.name || "Storekeeper"}
              </div>
              <div className="text-[10px] font-mono text-[#737373] dark:text-[#8e8e8e]">
                {role}
              </div>
            </div>
          </div>
          <Link
            to="/login"
            className="text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors shrink-0"
            title="Switch account or role"
          >
            Switch
          </Link>
        </div>
      </aside>
    </>
  );
};
