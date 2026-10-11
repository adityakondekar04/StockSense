// apps/web/src/components/landing/Navbar.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, Menu, X, ArrowRight, Activity } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Product", href: "#overview" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Scenario Lab", href: "#scenario-lab" },
    { label: "Explainability", href: "#explainability" },
  ];

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setMobileMenuOpen(false);
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                <Boxes className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">StockSense</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    S-02
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:inline leading-none font-medium">
                  Adaptive Inventory Engine
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollClick(e, link.href)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1 py-0.5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Mode</span>
            </Link>
            <Link
              to="/recommendations"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-indigo-800"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/recommendations"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-md"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollClick(e, link.href)}
                className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/recommendations"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm"
            >
              <span>Open Full Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
