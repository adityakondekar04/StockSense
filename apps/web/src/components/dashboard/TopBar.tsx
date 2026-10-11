// apps/web/src/components/dashboard/TopBar.tsx
// Minimalist SaaS TopBar matching the Landing Page Navbar and design.md tokens

import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Menu,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Printer,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { useAuth, UserRole } from "../../context/AuthContext";

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

  const { user, role, switchRole, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Derive current page name from route (matching simplified Sidebar names)
  const getPageTitle = (): { section: string; title: string } => {
    const path = location.pathname;
    if (path === "/recommendations" || path === "/dashboard") {
      return { section: "Inventory", title: "Recommendations" };
    }
    if (path === "/products") {
      return { section: "Inventory", title: "All Products" };
    }
    if (
      path.startsWith("/products/") &&
      !path.includes("/cleaning") &&
      !path.includes("/forecast") &&
      !path.includes("/scenario")
    ) {
      return {
        section: "Inventory",
        title: selectedProduct ? `${selectedProduct.sku} Details` : "Product Details",
      };
    }
    if (path.includes("/cleaning")) {
      return { section: "Analysis", title: "Sales & Anomalies" };
    }
    if (path.includes("/forecast")) {
      return { section: "Analysis", title: "Demand Forecast" };
    }
    if (path.includes("/scenario")) {
      return { section: "Analysis", title: "Scenario Lab" };
    }
    if (path === "/setup" || path === "/setup/manual") {
      return { section: "System", title: "Import Data" };
    }
    if (path === "/audit") {
      return { section: "System", title: "Decision Log" };
    }
    if (path.startsWith("/report/")) {
      return { section: "System", title: "Print Report" };
    }
    return { section: "Console", title: "Recommendations" };
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
      } else if (
        location.pathname.startsWith("/products/") &&
        !location.pathname.includes("/cleaning") &&
        !location.pathname.includes("/forecast") &&
        !location.pathname.includes("/scenario")
      ) {
        navigate(`/products/${found.sku}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#fafafa]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#ebebeb] dark:border-[#262626] transition-colors shrink-0">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left: Mobile trigger & Breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onMenuToggle}
            className="p-1.5 rounded-md text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <nav
            className="flex items-center gap-1.5 text-xs font-sans truncate"
            aria-label="Breadcrumb"
          >
            <span className="text-[#737373] hidden sm:inline">
              {section}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#d4d4d4] dark:text-[#333333] hidden sm:inline shrink-0" />
            <span className="font-heading font-semibold text-sm text-[#171717] dark:text-[#f5f5f5] truncate">
              {title}
            </span>
          </nav>
        </div>

        {/* Right: Global Controls (SKU, Service Level + z, AI Toggle, Print, User Profile) */}
        <div className="flex items-center gap-2">
          {/* Active SKU Switcher */}
          <div className="flex items-center rounded-md border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] px-2.5 py-1 text-xs">
            <span className="text-[#737373] text-[11px] font-mono mr-1.5 hidden sm:inline">
              Product:
            </span>
            <select
              value={selectedProduct?.sku || ""}
              onChange={(e) => handleProductChange(e.target.value)}
              className="bg-transparent font-mono font-medium text-[#171717] dark:text-[#f5f5f5] text-xs focus:outline-none cursor-pointer"
              aria-label="Active Product SKU"
              disabled={products.length === 0}
            >
              {products.length === 0 ? (
                <option value="" className="bg-white dark:bg-[#141414] text-[#171717] dark:text-[#f5f5f5]">
                  No products
                </option>
              ) : (
                products.map((p) => (
                  <option
                    key={p.sku}
                    value={p.sku}
                    className="bg-white dark:bg-[#141414] text-[#171717] dark:text-[#f5f5f5]"
                  >
                    {p.sku} · {p.name.length > 16 ? p.name.substring(0, 16) + "…" : p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Service Level & Z Factor Selector */}
          <div className="hidden md:flex items-center rounded-md border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] px-2.5 py-1 text-xs">
            <span className="text-[#737373] text-[11px] font-mono mr-1.5">
              SL:
            </span>
            <select
              value={serviceLevel}
              onChange={(e) => setServiceLevel(Number(e.target.value))}
              className="bg-transparent font-mono font-medium text-[#171717] dark:text-[#f5f5f5] text-xs focus:outline-none cursor-pointer"
              aria-label="Service Level Target"
            >
              <option value={0.8} className="bg-white dark:bg-[#141414]">80%</option>
              <option value={0.9} className="bg-white dark:bg-[#141414]">90%</option>
              <option value={0.95} className="bg-white dark:bg-[#141414]">95%</option>
              <option value={0.975} className="bg-white dark:bg-[#141414]">97.5%</option>
              <option value={0.99} className="bg-white dark:bg-[#141414]">99%</option>
              <option value={0.999} className="bg-white dark:bg-[#141414]">99.9%</option>
            </select>
            <span
              className="ml-2 font-mono text-[11px] text-[#737373] border-l border-[#ebebeb] dark:border-[#262626] pl-2"
              title="Standard normal inverse factor z"
            >
              z={zValue.toFixed(3)}
            </span>
          </div>

          {/* AI Mode Toggle */}
          <button
            type="button"
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors select-none ${
              aiEnabled
                ? "bg-[#171717] dark:bg-[#f5f5f5] text-white dark:text-[#0a0a0a] border-[#171717] dark:border-[#f5f5f5]"
                : "bg-white dark:bg-[#141414] text-[#525252] dark:text-[#a3a3a3] border-[#ebebeb] dark:border-[#262626] hover:text-[#171717] dark:hover:text-[#f5f5f5]"
            }`}
            title={
              aiEnabled
                ? "AI suggestions enabled. Click to run with deterministic rules only."
                : "Rules-only mode active. Click to enable AI suggestions."
            }
          >
            {aiEnabled ? (
              <>
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">AI: On</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden sm:inline">Rules Only</span>
              </>
            )}
          </button>

          {/* Quick Print Report shortcut */}
          {selectedProduct && (
            <Link
              to={`/report/${selectedProduct.sku}`}
              className="hidden sm:inline-flex p-1.5 rounded-md border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors"
              title="Print 1-Page Summary"
              aria-label="Print 1-Page Summary"
            >
              <Printer className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] text-xs hover:border-[#171717] dark:hover:border-[#f5f5f5] transition-colors cursor-pointer select-none"
              title="Current Account & Role"
            >
              <div className="w-4 h-4 rounded-full bg-[#171717] dark:bg-[#f5f5f5] text-white dark:text-[#0a0a0a] flex items-center justify-center text-[10px] font-bold">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <span className="hidden md:inline text-[11px] font-mono font-semibold text-[#171717] dark:text-[#f5f5f5] max-w-[100px] truncate">
                {user?.name || "User"}
              </span>
              <span className="font-mono text-[9px] uppercase px-1 py-0.2 rounded bg-[#f5f5f5] dark:bg-[#262626] text-[#525252] dark:text-[#d4d4d4] border border-[#ebebeb] dark:border-[#333333]">
                {role}
              </span>
              <ChevronDown className="w-3 h-3 text-[#737373]" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#262626] rounded-lg shadow-lg p-3 z-50 text-xs space-y-3">
                <div className="border-b border-[#ebebeb] dark:border-[#262626] pb-2">
                  <div className="font-semibold text-[#171717] dark:text-[#f5f5f5] truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-[#737373] truncate">
                    {user?.email}
                  </div>
                  <div className="text-[10px] font-mono text-[#737373] mt-0.5 truncate">
                    {user?.facilityName}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#737373] font-bold">
                    Switch Active Role (RBAC):
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-1">
                    {(["STOREKEEPER", "ADMIN", "ANALYST", "VIEWER"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          switchRole(r);
                          setUserMenuOpen(false);
                        }}
                        className={`px-2 py-1 text-[10px] font-mono text-left rounded border cursor-pointer ${
                          role === r
                            ? "bg-[#171717] dark:bg-[#f5f5f5] text-white dark:text-[#0a0a0a] border-[#171717] dark:border-[#f5f5f5] font-bold"
                            : "bg-[#fafafa] dark:bg-[#0a0a0a] text-[#525252] dark:text-[#a3a3a3] border-[#ebebeb] dark:border-[#262626] hover:border-[#d4d4d4] dark:hover:border-[#404040]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#ebebeb] dark:border-[#262626] pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#737373]">
                    {role === "STOREKEEPER" || role === "ADMIN"
                      ? "Full order authority"
                      : "Read-only access"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
