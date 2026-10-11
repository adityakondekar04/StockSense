// apps/web/src/components/landing/Navbar.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, Menu, X, ArrowRight } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Overview", href: "#overview" },
    { label: "7-Day Simulation", href: "#simulation" },
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
    <header className="sticky top-0 z-50 bg-[#fafafa]/90 backdrop-blur-md border-b border-[#ebebeb] transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#171717] rounded-md p-0.5"
          >
            <div className="w-7 h-7 rounded-md bg-[#171717] flex items-center justify-center text-white">
              <Boxes className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#171717] tracking-tight">StockSense</span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#f2f2f2] text-[#4d4d4d] border border-[#ebebeb]">
                S-02
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollClick(e, link.href)}
                className="text-xs font-medium text-[#4d4d4d] hover:text-[#171717] transition-colors focus:outline-none focus:ring-1 focus:ring-[#171717] rounded px-1 py-0.5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-[#4d4d4d] hover:text-[#171717] px-3 py-1.5 rounded-full hover:bg-[#f2f2f2] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1.5 bg-[#171717] hover:bg-[#2b2b2b] text-white text-xs font-medium px-4 py-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2 active:bg-[#000000]"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/recommendations"
              className="bg-[#171717] text-white text-xs font-medium px-3 py-1.5 rounded-full"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[#4d4d4d] hover:text-[#171717] hover:bg-[#f2f2f2] focus:outline-none focus:ring-1 focus:ring-[#171717]"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#ebebeb] bg-[#fafafa] px-4 pt-3 pb-6 space-y-3 shadow-sm">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollClick(e, link.href)}
                className="px-3 py-2 text-sm font-medium text-[#4d4d4d] hover:text-[#171717] hover:bg-[#f2f2f2] rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-[#ebebeb] flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-medium text-[#171717] bg-white border border-[#ebebeb] rounded-full"
            >
              Sign In
            </Link>
            <Link
              to="/recommendations"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#171717] text-white py-2 rounded-full text-xs font-medium"
            >
              <span>Open Full Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
